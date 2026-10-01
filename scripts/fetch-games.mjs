#!/usr/bin/env node
// Fetches PlayStation Plus games data and writes it to stable JSON files.
//
// Each category is fetched from the public PlayStation "imagic" gameslist
// endpoint and written to data/<category>.json. Object keys are sorted
// recursively so that the committed files produce clean, meaningful diffs
// even if the upstream API reorders keys between requests.
//
// It also refreshes the "This month's games" table in the README, between the
// MONTHLY_GAMES markers, so the listing tracks the monthly catalog. No
// timestamp is written, so the README only changes when the line-up changes.
//
// Run with: node scripts/fetch-games.mjs

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");
const README_PATH = join(ROOT_DIR, "README.md");

const LOCALE = process.env.PS_LOCALE ?? "de-at";
const BASE_URL = "https://www.playstation.com/bin/imagic/gameslist";

// The categories we track. The key is used as the output filename.
const CATEGORIES = [
  "plus-monthly-games-list",
  "plus-classics-list",
  "plus-games-list",
];

// The category whose games are rendered into the README table.
const MONTHLY_CATEGORY = "plus-monthly-games-list";

// Categories to announce on Discord when their line-up changes, in the order
// they appear in the message. Classics are intentionally excluded.
const NOTIFY_CATEGORIES = [
  ["plus-monthly-games-list", "Monthly games"],
  ["plus-games-list", "Games catalog"],
];
const NOTIFY_LABELS = new Map(NOTIFY_CATEGORIES);

// Where the Discord payload is written for the workflow to post.
const MESSAGE_FILE =
  process.env.DISCORD_MESSAGE_FILE ?? join(ROOT_DIR, "discord-payload.json");

const EMBED_LIMIT = 10; // Discord allows at most 10 embeds per message.
const PS_BLUE = 0x0070d1; // Embed accent colour.

const MONTHLY_MARKER_START = "<!-- BEGIN MONTHLY GAMES -->";
const MONTHLY_MARKER_END = "<!-- END MONTHLY GAMES -->";

const MAX_RETRIES = 4;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Recursively sort object keys so serialization is deterministic. Arrays keep
// their order (upstream ordering may be meaningful, e.g. featured first).
function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])]),
    );
  }
  return value;
}

async function fetchCategory(category) {
  const url = `${BASE_URL}?locale=${encodeURIComponent(LOCALE)}&categoryList=${encodeURIComponent(category)}`;

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          // A browser-like UA avoids the endpoint rejecting the request.
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Response was not valid JSON (first 200 chars): ${text.slice(0, 200)}`,
        );
      }
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        const backoff = 2 ** attempt * 1000;
        console.warn(
          `  attempt ${attempt} for ${category} failed: ${error.message} — retrying in ${backoff}ms`,
        );
        await sleep(backoff);
      }
    }
  }

  throw new Error(
    `Failed to fetch ${category} after ${MAX_RETRIES} attempts: ${lastError?.message}`,
  );
}

// Turn "ACTION" / "ROLE_PLAYING_GAMES" into "Action" / "Role Playing Games".
function titleCase(value) {
  return value
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeCell(value) {
  return value.replace(/\|/g, "\\|");
}

// Escape a value for use inside an HTML attribute within a Markdown table cell.
function htmlAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\|/g, "&#124;");
}

// The payload is an array of alphabetical buckets, each with a `games` array.
// Flatten it into the games that are actually available.
function flattenGames(data) {
  if (!Array.isArray(data)) return [];
  return data.flatMap((bucket) => bucket?.games ?? []);
}

// A stable identity for a game. The upstream API flip-flops a game's
// productId between its PS4 and PS5 SKUs, so productId alone is too
// SKU-specific. conceptId is stable but shared across editions (e.g. a
// remaster and the original), so pair it with the display name.
function gameKey(game) {
  if (game.conceptId != null) {
    return `${game.conceptId}|${gameName(game)}`;
  }
  return game.productId ?? game.name;
}

function indexGames(data) {
  const map = new Map();
  for (const game of flattenGames(data)) {
    map.set(gameKey(game), game.name ?? game.nameEn ?? "Unknown");
  }
  return map;
}

const gameName = (game) => game.name ?? game.nameEn ?? "Unknown";

// Compare two payloads: `added` keeps the new game objects (so we can show
// cover art), `removed` keeps display names of games no longer listed.
function diffGames(previous, next) {
  const beforeKeys = new Set(indexGames(previous).keys());
  const nextGames = flattenGames(next);
  const afterKeys = new Set(nextGames.map(gameKey));

  const added = nextGames
    .filter((game) => !beforeKeys.has(gameKey(game)))
    .sort((a, b) => gameName(a).localeCompare(gameName(b)));
  const removed = [...indexGames(previous)]
    .filter(([key]) => !afterKeys.has(key))
    .map(([, name]) => name)
    .sort();

  return { added, removed };
}

function formatList(names, cap = 20) {
  if (names.length <= cap) return names.join(", ");
  return `${names.slice(0, cap).join(", ")}, …and ${names.length - cap} more`;
}

// A Discord embed for a single game, with cover thumbnail and store link.
function gameEmbed(game, label) {
  const platforms = Array.isArray(game.device) ? game.device.join(", ") : "";
  const genres = Array.isArray(game.genre)
    ? [...new Set(game.genre)].map(titleCase).join(", ")
    : "";
  const embed = {
    title: gameName(game),
    color: PS_BLUE,
    description: [label, platforms, genres].filter(Boolean).join(" · "),
  };
  if (game.conceptUrl) embed.url = game.conceptUrl;
  if (game.imageUrl) embed.thumbnail = { url: game.imageUrl };
  return embed;
}

// Build a Discord payload (summary text + an embed per added game) from the
// collected changes and write it to MESSAGE_FILE. Writes nothing when there
// are no changes to announce.
async function writeNotification(changes) {
  if (changes.size === 0) return;

  const lines = ["📅 **PlayStation Plus catalog updated**"];
  const embeds = [];
  for (const [category, label] of NOTIFY_CATEGORIES) {
    const diff = changes.get(category);
    if (!diff) continue;
    lines.push("", `**${label}**`);
    if (diff.added.length) {
      lines.push(
        `➕ Added (${diff.added.length}): ${formatList(diff.added.map(gameName))}`,
      );
    }
    if (diff.removed.length) {
      lines.push(
        `➖ Removed (${diff.removed.length}): ${formatList(diff.removed)}`,
      );
    }
    for (const game of diff.added) {
      if (embeds.length >= EMBED_LIMIT) break;
      embeds.push(gameEmbed(game, label));
    }
  }

  let content = lines.join("\n");
  const LIMIT = 1900; // Discord hard-caps message content at 2000 characters.
  if (content.length > LIMIT) {
    content = `${content.slice(0, LIMIT - 1)}…`;
  }

  const payload = { content };
  if (embeds.length) payload.embeds = embeds;

  await writeFile(MESSAGE_FILE, JSON.stringify(payload), "utf8");
  console.log(`  wrote Discord payload to ${MESSAGE_FILE}`);
}

function renderMonthlyTable(data) {
  const games = flattenGames(data);

  if (games.length === 0) {
    return "_No monthly games are currently listed._";
  }

  const rows = games.map((game) => {
    const rawName = game.name ?? game.nameEn ?? "Unknown";
    const name = escapeCell(rawName);
    const link = game.conceptUrl ? `[${name}](${game.conceptUrl})` : name;
    const platforms = Array.isArray(game.device) ? game.device.join(", ") : "";
    const genres = Array.isArray(game.genre)
      ? [...new Set(game.genre)].map(titleCase).join(", ")
      : "";

    let cover = "";
    if (game.imageUrl) {
      const img = `<img src="${game.imageUrl}" width="120" alt="${htmlAttr(rawName)}">`;
      cover = game.conceptUrl ? `<a href="${game.conceptUrl}">${img}</a>` : img;
    }

    return `| ${cover} | ${link} | ${escapeCell(platforms)} | ${escapeCell(genres)} |`;
  });

  return [
    "| Cover | Game | Platforms | Genre |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

async function updateReadme(monthlyData) {
  let readme;
  try {
    readme = await readFile(README_PATH, "utf8");
  } catch (error) {
    console.warn(`  skipping README update: ${error.message}`);
    return;
  }

  const startIdx = readme.indexOf(MONTHLY_MARKER_START);
  const endIdx = readme.indexOf(MONTHLY_MARKER_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.warn("  skipping README update: monthly-games markers not found");
    return;
  }

  const table = renderMonthlyTable(monthlyData);
  const before = readme.slice(0, startIdx + MONTHLY_MARKER_START.length);
  const after = readme.slice(endIdx);
  const updated = `${before}\n\n${table}\n\n${after}`;

  if (updated !== readme) {
    await writeFile(README_PATH, updated, "utf8");
    console.log("  updated README monthly games table");
  }
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });

  let failures = 0;
  let monthlyData;
  const changes = new Map(); // category -> { added, removed }
  for (const category of CATEGORIES) {
    console.log(`Fetching ${category}...`);
    const outPath = join(DATA_DIR, `${category}.json`);
    try {
      // Read the previously-committed data before overwriting, so we can
      // report what changed for the categories we announce.
      let previous = null;
      if (NOTIFY_LABELS.has(category)) {
        try {
          previous = JSON.parse(await readFile(outPath, "utf8"));
        } catch {
          previous = null;
        }
      }

      const data = await fetchCategory(category);
      const sorted = sortKeys(data);
      await writeFile(outPath, JSON.stringify(sorted, null, 2) + "\n", "utf8");
      console.log(`  wrote ${outPath}`);

      if (category === MONTHLY_CATEGORY) {
        monthlyData = data;
      }
      // Only diff when there was a prior file, so the first population of a
      // category stays silent instead of announcing the entire catalog.
      if (NOTIFY_LABELS.has(category) && previous !== null) {
        const diff = diffGames(previous, data);
        if (diff.added.length || diff.removed.length) {
          changes.set(category, diff);
        }
      }
    } catch (error) {
      failures++;
      console.error(`  ${error.message}`);
    }
  }

  if (monthlyData !== undefined) {
    await updateReadme(monthlyData);
  }

  await writeNotification(changes);

  if (failures > 0) {
    console.error(`\n${failures} categor(y/ies) failed to update.`);
    process.exit(1);
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

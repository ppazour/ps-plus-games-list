# ps-plus-games-list

Daily-synced snapshots of the [PlayStation Plus](https://www.playstation.com/en-us/ps-plus/) games catalog.

A scheduled GitHub Actions job fetches the public PlayStation "gameslist"
endpoints once a day and commits the results to [`data/`](./data). Because the
job only commits when something actually changed, the git history becomes a
log of catalog additions and removals over time.

## This month's games

The table below is regenerated from `data/plus-monthly-games-list.json` on each
sync, so it always reflects the current monthly line-up.

<!-- BEGIN MONTHLY GAMES -->

| Cover | Game | Platforms | Genre |
| --- | --- | --- | --- |
| <a href="https://store.playstation.com/de-at/concept/201061"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202208/1012/V6WJkRhfNIQ3ePfAmrLSfGng.png" width="120" alt="Dead Island 2"></a> | [Dead Island 2](https://store.playstation.com/de-at/concept/201061) | PS5, PS4 | Action |
| <a href="https://store.playstation.com/de-at/concept/10012399"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202502/1815/3ea7456f6925d14bd479d7b9bd251be1575e0e5fc37ad88d.png" width="120" alt="Monster Train 2"></a> | [Monster Train 2](https://store.playstation.com/de-at/concept/10012399) | PS5 | Strategy |
| <a href="https://store.playstation.com/de-at/concept/10009064"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202409/1221/c785b0366d8f84a18dd17a0d046fdee92ccd6195d79c81a1.png" width="120" alt="Tomb Raider IV-VI Remastered PS4 &amp; PS5"></a> | [Tomb Raider IV-VI Remastered PS4 & PS5](https://store.playstation.com/de-at/concept/10009064) | PS4, PS5 | Action |

<!-- END MONTHLY GAMES -->

## Tracked categories

| File | Category | Source |
| --- | --- | --- |
| `data/plus-monthly-games-list.json` | Monthly games | [`plus-monthly-games-list`](https://www.playstation.com/bin/imagic/gameslist?locale=en-us&categoryList=plus-monthly-games-list) |
| `data/plus-classics-list.json` | Classics catalog | [`plus-classics-list`](https://www.playstation.com/bin/imagic/gameslist?locale=en-us&categoryList=plus-classics-list) |
| `data/plus-games-list.json` | Games catalog | [`plus-games-list`](https://www.playstation.com/bin/imagic/gameslist?locale=en-us&categoryList=plus-games-list) |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how the sync works and how to run
it locally.

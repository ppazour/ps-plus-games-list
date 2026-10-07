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
| <a href="https://store.playstation.com/de-at/concept/10008165"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202402/0803/e9b205a3007e3dab6c7e35d9a18a580393450c7abf15d048.png" width="120" alt="EARTH DEFENSE FORCE: WORLD BROTHERS 2　PS4 &amp; PS5"></a> | [EARTH DEFENSE FORCE: WORLD BROTHERS 2　PS4 & PS5](https://store.playstation.com/de-at/concept/10008165) | PS4, PS5 | Action |
| <a href="https://store.playstation.com/de-at/concept/10011830"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202505/1521/44c15449fbe9485987e27e2fa2c86008a7b4a89d9ab7e0a8.png" width="120" alt="F1® 25"></a> | [F1® 25](https://store.playstation.com/de-at/concept/10011830) | PS5 | Racing |
| <a href="https://store.playstation.com/de-at/concept/234014"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202609/0209/7a53b60fb9c5f332d91ccfcf29d12bc769875aa8e6b8f4ed.png" width="120" alt="Hunt: Showdown 1896"></a> | [Hunt: Showdown 1896](https://store.playstation.com/de-at/concept/234014) | PS5 | Shooter, Action |
| <a href="https://store.playstation.com/de-at/concept/234014"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202608/0612/f0d1886b7061d7ab5e084580a3e29cc3910e2644f357fbb5.png" width="120" alt="Hunt: Showdown 1896 – Starter Pack for PlayStation®Plus – Among Crimson Shadows"></a> | [Hunt: Showdown 1896 – Starter Pack for PlayStation®Plus – Among Crimson Shadows](https://store.playstation.com/de-at/concept/234014) | PS5 | Shooter, Action |

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

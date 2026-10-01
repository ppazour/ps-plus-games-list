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
| <a href="https://store.playstation.com/de-at/concept/10003362"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202211/1611/6O2jAYhTUqhcJYYJeNex5oKJ.png" width="120" alt="Chained Echoes"></a> | [Chained Echoes](https://store.playstation.com/de-at/concept/10003362) | PS4 | Role Playing Games |
| <a href="https://store.playstation.com/de-at/concept/232248"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202608/1214/4240708e955c460e92bcaa1f453f1e50567f29fce6636431.png" width="120" alt="Fallout 76 PS4 &amp; PS5"></a> | [Fallout 76 PS4 & PS5](https://store.playstation.com/de-at/concept/232248) | PS4, PS5 | Role Playing Games |
| <a href="https://store.playstation.com/de-at/concept/10015430"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202607/0816/791b0f1880e27c1d8f52187daea36abfe5fd3b0ff1144007.png" width="120" alt="MLB® The Show™ 26"></a> | [MLB® The Show™ 26](https://store.playstation.com/de-at/concept/10015430) | PS5 | Sports |
| <a href="https://store.playstation.com/de-at/concept/10015430"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202608/2100/035494835cd93a14cb0ecdc160adcf2c6cbce92fff15c738.png" width="120" alt="MLB® The Show™ 26 Jump Start Bundle"></a> | [MLB® The Show™ 26 Jump Start Bundle](https://store.playstation.com/de-at/concept/10015430) |  | Sports |
| <a href="https://store.playstation.com/de-at/concept/10008716"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202408/1309/05d041f5216b1cd55a4587729534ce8ac8c557877b4d1483.png" width="120" alt="Sniper Elite: Resistance PS4™ &amp; PS5™"></a> | [Sniper Elite: Resistance PS4™ & PS5™](https://store.playstation.com/de-at/concept/10008716) | PS4, PS5 | Shooter, Action |
| <a href="https://store.playstation.com/de-at/concept/10004896"><img src="https://image.api.playstation.com/vulcan/ap/rnd/202212/0810/iCrnQDLqgGBSnHkTFbOzQX2Q.png" width="120" alt="Wobbly Life"></a> | [Wobbly Life](https://store.playstation.com/de-at/concept/10004896) | PS4, PS5 | Casual, Family, Adventure |

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

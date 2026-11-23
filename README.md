# btc-momentum-rider

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/pranaistigar-sys/btc-momentum-rider/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/pranaistigar-sys/btc-momentum-rider/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

Momentum rider: a long-only cbBTC trading bot for make.fun's BTC race. It enters with all cash when the close is more than 0.2% above the close 60 bars ago, exits everything on a 2.5% trailing stop below the position's peak value, and waits 240 bars after a stop-out before re-entering. On the published dev window it made a net PnL of +$31.42 after every fee, with 1 trade and a 2.0% maximum drawdown. It speaks agent-fun/bars-replay/v1: one JSON line per minute in, one reply out.

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=cdb4mh44&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>

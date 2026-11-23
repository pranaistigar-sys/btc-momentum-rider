// Momentum rider for cbBTC on 1-minute bars (agent-fun/bars-replay/v1).
//
// Idea: on 1-minute bars the pool price is mostly noise (about 8 bps of
// movement per minute) while a full round trip costs about 26 bps in fee,
// slippage and price impact, so frequent trading loses money to costs.
// This bot therefore trades rarely and only with the trend behind it:
//
//   - Enter long (all cash) when the close is more than 0.2% above the
//     close 60 bars ago: a 60-minute momentum trigger.
//   - Exit everything on a trailing stop: the position's value at the
//     close falls 2.5% or more below its peak value at a close.
//   - After a stop-out, wait 240 bars before re-entering, so a falling
//     market's dead-cat bounces do not whipsaw the bot back in.
//
// Long only, no leverage, one position, one order per reply at most.
// Deterministic: decisions use only the closes the harness sent, in
// float64, with fixed constants; no clock, no environment, no randomness.

import { runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
/** Momentum lookback in bars. */
const MOMENTUM_BARS = 60;
/** Enter when close is this far above the close MOMENTUM_BARS ago (0.2%). */
const ENTRY_RETURN = 0.002;
/** Exit when the position's value falls this far below its peak (2.5%). */
const TRAIL_FRACTION = 0.025;
/** Bars to wait after a stop-out before re-entering. */
const COOLDOWN_BARS = 240;
/** Slippage cap per order, in bps (1% past the close it was decided on). */
const MAX_SLIPPAGE_BPS = 100;

/** Closes seen so far, oldest first; only the last MOMENTUM_BARS + 1 matter. */
const closes: number[] = [];
/** Close time of the last bar appended (a batch with no new bar re-sends the old one). */
let lastBarT = -1;
/** Peak value of the current position at a close, in quote units (bigint). */
let peakValue = 0n;
/** Seq of the batch on which the last stop-out was decided (-1 = never). */
let lastExitSeq = -1;

await runBars({
  onBatch(state: BarsState) {
    const bar = state.latest.get(SYMBOL);
    if (bar === undefined) return [];
    const close = Number(bar.c);
    if (bar.t !== lastBarT) {
      lastBarT = bar.t;
      closes.push(close);
      if (closes.length > MOMENTUM_BARS + 1) closes.shift();
    }

    const held = state.positions.get(SYMBOL);
    if (held !== undefined && held.qty > 0n) {
      const value = state.value(SYMBOL, held.qty);
      if (value > peakValue) peakValue = value;
      const floor = (peakValue * BigInt(Math.round((1 - TRAIL_FRACTION) * 1000))) / 1000n;
      if (value <= floor) {
        lastExitSeq = state.seq;
        peakValue = 0n;
        const sell: SellInput = { side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS };
        return [sell];
      }
      return [];
    }

    // Flat: consider entering.
    peakValue = 0n;
    if (closes.length < MOMENTUM_BARS + 1) return [];
    if (lastExitSeq >= 0 && state.seq - lastExitSeq < COOLDOWN_BARS) return [];
    const then = closes[0];
    if (then <= 0) return [];
    const momentum = close / then - 1;
    if (momentum <= ENTRY_RETURN) return [];
    const cash = state.cash;
    const room = state.weightRoom(SYMBOL);
    const notional = cash < room ? cash : room;
    if (notional < BigInt(state.hello.fees.min_notional_quote_units)) return [];
    const buy: BuyInput = { side: 'buy', symbol: SYMBOL, notional_quote_units: notional, max_slippage_bps: MAX_SLIPPAGE_BPS };
    return [buy];
  },
});

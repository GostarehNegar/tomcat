import utils from "./Domain.Utils";

import { CandleStickCollection, CandleStickData, Intervals } from ".";

export class CandleStickCollectionScaler {
    public oneMinuteCandles: CandleStickCollection = new CandleStickCollection([]);
    public candles: CandleStickCollection = new CandleStickCollection([]);
    private _interval: number;
    constructor(public interval: Intervals, public maxCount = 200) {
        this._interval = utils.toMinutes(interval) * 60 * 1000;
    }
    push(candle: CandleStickData, cb: (onMinutes: CandleStickCollection, lastCandle: CandleStickData) => void = null) {
        if (this.interval != '1m') {
            if (this.oneMinuteCandles.firstCandle && (candle.openTime - this.oneMinuteCandles.firstCandle.openTime >= this._interval)) {
                if (cb) {
                    cb(this.oneMinuteCandles, this.candles.items[this.candles.length - 1]);
                }
                this.oneMinuteCandles.clear();
            }
            this.oneMinuteCandles.push(candle);
            this.candles.push(this.oneMinuteCandles.merge());
        } else {
            this.candles.push(candle);
        }
        if (this.candles.length > this.maxCount) {
            this.candles.items.splice(0, 1);
        }
        return this.candles;
    }
}

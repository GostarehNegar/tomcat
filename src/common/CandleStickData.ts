import { baseUtils, Ticks } from '../infrastructure/base';

import utils from './Domain.Utils';
import { ICandleStickData, ISignalValues } from "./ICandleStickData";
import { IndicatorValueCollection } from "./IndicatorValueCollection";


export class CandleStickData implements ICandleStickData {

    constructor(public openTime: number,
        public open: number,
        public high: number,
        public low: number,
        public close: number,
        public closeTime: number,
        public volume?: number,
        public amount?: number,
        public V1?: number,
        public V2?: number,
        public V3?: number,
        public V4?: number,
        public candleType?: string,
        public indicators?: IndicatorValueCollection,
        public signals?: ISignalValues) {
        this.indicators = indicators || new IndicatorValueCollection();
        this.signals = signals || {}
    }

    public equals(other: ICandleStickData): boolean {
        return other != null && other.openTime == this.openTime && other.open == this.open && other.high == this.high && other.low == this.low && other.close == this.close && other.closeTime == this.closeTime;
    }
    public sameTime(other: ICandleStickData) {
        return other != null && other.openTime == this.openTime;
    }
    public static fromMissing(openTime: Ticks, closeTime: Ticks) {
        return new CandleStickData(baseUtils.ticks(openTime), -1, -1, -1, -1, baseUtils.ticks(closeTime) - 1)
    }
    public static from(data: ICandleStickData): CandleStickData {
        if (data instanceof CandleStickData) {
            return data;
        }
        // return new CandleStickData(data.openTime, data.open, data.high, data.low, data.close, data.closeTime, data.volume, data.amount, data.V1, data.V2, data.V3, data.V4, "", data.indicators);
        return new CandleStickData(data.openTime, data.open, data.high, data.low, data.close, data.closeTime, data.volume, data.amount, data.V1, data.V2, data.V3, data.V4, "",
            data.indicators == null ?
                new IndicatorValueCollection() :
                data.indicators instanceof IndicatorValueCollection ?
                    data.indicators :
                    new IndicatorValueCollection((data.indicators as IndicatorValueCollection).values));
    }
    public clone(): CandleStickData {
        return new CandleStickData(this.openTime, this.open, this.high, this.low, this.close, this.closeTime, this.volume, this.amount, this.V1, this.V2, this.V3, this.V4, this.candleType);
    }
    public getSignals() {
        if (this.signals == null) {
            this.signals = {}
        }
        return this.signals
    }
    public get isMissing() {
        return this.open == -1
    }
    public interval() {
        return utils.toInterval(this.closeTime - this.openTime);
    }
    public openDate() {
        return new Date(this.openTime).toISOString();
    }

}

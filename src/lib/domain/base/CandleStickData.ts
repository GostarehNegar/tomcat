import { ICandleStickData } from "./ICandleStickData";
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
        public indicators?: IndicatorValueCollection) {

        this.indicators = indicators || new IndicatorValueCollection();

    }
    public equals(other: ICandleStickData): boolean {
        return other != null && other.openTime == this.openTime && other.open == this.open && other.high == this.high && other.low == this.low && other.close == this.close && other.closeTime == this.closeTime;
    }
    public sameTime(other: ICandleStickData) {
        return other != null && other.openTime == this.openTime;
    }
    public static from(data: ICandleStickData): CandleStickData {
        if (data instanceof CandleStickData) {
            return data;
        }
        return new CandleStickData(data.openTime, data.open, data.high, data.low, data.close, data.closeTime, data.volume, data.amount, data.V1, data.V2, data.V3, data.V4, "", data.indicators);
    }
}

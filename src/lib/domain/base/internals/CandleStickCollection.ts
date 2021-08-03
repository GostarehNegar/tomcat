import { Exchanges, ICandelStickData, Intervals, Markets, Symbols } from "../interfaces";

export class CandleStickCollection {

    constructor(public items: ICandelStickData[], public exchange?: Exchanges, public symbol?: Symbols, public interval?: Intervals, public market?: Markets, public sourceName?: string) {
    }
    get startTime(): number {
        return this.items.length > 0 ? this.items[0].openTime : undefined;
    }
    get endTime(): number {
        return this.items.length > 0 ? this.items[this.items.length - 1].openTime : undefined;
    }
    get length(): number {
        return this.items.length
    }

}
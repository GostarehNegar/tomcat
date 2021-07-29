import { ICandelStickData, Exchanges, Symbols, Intervals } from "../interfaces";

export class CandleStickCollection {
    constructor(public items: ICandelStickData[], public exchange?: Exchanges, public symbol?: Symbols, public interval?: Intervals) {
    }
    get openTime(): number {
        return this.items.length > 0 ? this.items[0].openTime : undefined;
    }
    get closeTime(): number {
        return this.items.length > 0 ? this.items[this.items.length - 1].closeTime : undefined;
    }
}
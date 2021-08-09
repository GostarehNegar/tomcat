import {
  Exchanges,
  ICandelStickData,
  Intervals,
  Markets,
  Symbols,
} from '../_interfaces';

export class CandleStickCollection {
  constructor(
    public items: ICandelStickData[],
    public exchange?: Exchanges,
    public symbol?: Symbols,
    public interval?: Intervals,
    public market?: Markets,
    public sourceName?: string
  ) { }
  get startTime(): number {
    return this.items.length > 0 ? this.items[0].openTime : undefined;
  }
  get endTime(): number {
    return this.items.length > 0
      ? this.items[this.items.length - 1].openTime
      : undefined;
  }
  get length(): number {
    return this.items.length;
  }
  setIndicatorValue(index: number, id: string, value: number) {
    this.items[index].indicators = this.items[index].indicators || {};
    this.items[index].indicators[id] = value;
  }
  getSingleOHLCV(ohlcv: string) {
    const result: number[] = [];
    this.items.map((item) => {
      result.push(item[ohlcv]);
    });
    return result;
  }
  addIndicator(id: string, data) {
    let idx = 1;
    data.reverse().map((x) => {
      this.items[this.items.length - idx].indicators =
        this.items[this.items.length - idx].indicators || {};
      this.items[this.items.length - idx].indicators[id] = x;
      idx++;
    });
  }
}

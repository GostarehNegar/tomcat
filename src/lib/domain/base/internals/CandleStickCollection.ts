import { IIndicator } from '../../data';
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
  get closeTime(): number {
    return this.items.length > 0
      ? this.items[this.items.length - 1].closeTime
      : undefined;
  }
  get length(): number {
    return this.items.length;
  }
  setIndicatorValue(index: number, id: string, value: number) {
    this.items[index].indicators_deprecated = this.items[index].indicators_deprecated || {};
    this.items[index].indicators_deprecated[id] = value;
  }
  getSingleOHLCV(ohlcv: string) {
    const result: number[] = [];
    this.items.map((item) => {
      result.push(item[ohlcv]);
    });
    return result;
  }
  addIndicator(indicator: IIndicator, data) {
    let idx = 1;
    data.reverse().map((x) => {
      this.items[this.items.length - idx].indicators_deprecated = this.items[this.items.length - idx].indicators_deprecated || {};
      this.items[this.items.length - idx].indicators_deprecated[indicator.id] = x;
      this.items[this.items.length - idx].indicators.setValue(indicator, x)
      idx++;
    });
  }
}

import { CandleStickData } from '..';
import { IIndicator } from '../../data';
import {
  Exchanges,
  ICandleStickData,
  Intervals,
  Markets,
  Symbols,
} from '../_interfaces';

export class CandleStickCollection {
  public items: CandleStickData[]
  constructor(
    items: ICandleStickData[] | CandleStickData[],
    public exchange?: Exchanges,
    public symbol?: Symbols,
    public interval?: Intervals,
    public market?: Markets,
    public sourceName?: string
  ) {
    this.items = items.map(x => {
      if (x instanceof CandleStickData) {
        return x
      }
      return CandleStickData.from(x)
    })
  }
  get startTime(): number {
    return this.items.length > 0 ? this.items[0].openTime : undefined;
  }
  get lastCandle(): CandleStickData {
    return this.length == 0 ? null : this.items[this.length - 1]
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
  get firstCandle(): CandleStickData {
    return this.length == 0 ? null : this.items[0]
  }
  // setIndicatorValue(index: number, id: string, value: number) {
  //   this.items[index].indicators = this.items[index].indicators || new IndicatorValueCollection();
  //   this.items[index].indicators[id] = value;
  // }
  getSingleOHLCV(ohlcv: string) {
    const result: number[] = [];
    this.items.map((item) => {
      result.push(item[ohlcv]);
    });
    return result;
  }
  merge(): CandleStickData {
    let high = -10000 * 10000
    let low = 10000 * 10000
    this.items.map((x) => {
      high = x.high > high ? x.high : high
      low = x.low < low ? x.low : low
    })
    return this.length == 0 ? null : new CandleStickData(this.firstCandle.openTime, this.firstCandle.open, high, low, this.lastCandle.close, this.lastCandle.closeTime)

  }
  push(candle: CandleStickData | ICandleStickData) {
    if (candle != null) {
      const _candle = CandleStickData.from(candle)
      const index = this.items.findIndex(x => x.sameTime(_candle))
      if (index == -1) {
        this.items.push(_candle)
      } else {
        this.items[index] = _candle
      }
    }
  }
  clear() {
    this.items = []
  }
  addIndicator(indicator: IIndicator, data) {
    let idx = 1;
    data.reverse().map((x) => {
      this.items[this.items.length - idx].indicators.setValue(indicator, x)
      idx++;
    });
  }
}

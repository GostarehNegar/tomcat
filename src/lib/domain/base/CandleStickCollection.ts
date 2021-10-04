import { Ticks, utils } from "../../base";
import { dep_IIndicator } from "../data";

import { CandleStickData } from "./CandleStickData";
import domainUtils from "./Domain.Utils";
import { Exchanges } from "./Exchanges";
import { ICandleStickData } from "./ICandleStickData";
import { Intervals } from "./Intervals";
import { Markets } from "./Markets";
import { Symbols } from "./Symbols";




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
  get minutesInInterval(): number {
    return domainUtils.toMinutes(this.interval)
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
      if (!item.isMissing)
        result.push(item[ohlcv]);
    });
    return result;
  }
  getLast(index: number) {
    return new CandleStickCollection(this.items.filter((candle, i) => {
      (candle)
      return i >= this.items.length - index
    }))
  }
  merge(): CandleStickData {
    let high = -10000 * 10000
    let low = 10000 * 10000
    this.items.filter(x => !x.isMissing).map((x) => {
      high = x.high > high ? x.high : high
      low = x.low < low ? x.low : low
    })
    const first = this.items.find(x => !x.isMissing)
    const last = this.items.reverse().find(x => !x.isMissing)
    this.items.reverse()
    return first != null
      ? new CandleStickData(this.firstCandle.openTime, first.open, high, low, last.close, this.lastCandle.closeTime, last.volume, last.amount, last.V1, last.V2, last.V3, last.V4, '', last.indicators)
      : null


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
  addIndicator(indicator: dep_IIndicator, data) {
    const items = this.items.filter(x => !x.isMissing)
    let idx = 1;
    data.reverse().map((x) => {
      items[items.length - idx].indicators.setValue_depricated(indicator, x)
      idx++;
    });
  }
  find(openTime) {
    return this.items.find((x) => x.openTime == openTime)
  }
  getMissingCandles(expectedStart: Ticks, expectedEnd: Ticks) {
    expectedStart = utils.toTimeEx(expectedStart).ceilToMinutes(this.minutesInInterval).ticks
    expectedEnd = utils.toTimeEx(expectedEnd).floorToMinutes(this.minutesInInterval).ticks
    const miliInterval = this.minutesInInterval * 60 * 1000
    const res: CandleStickData[] = []
    for (let i = expectedStart; i <= expectedEnd; i += miliInterval) {
      if (this.find(i) == null) {
        const candle = CandleStickData.fromMissing(i, i + miliInterval)
        res.push(candle)
      }
    }
    return res
  }
  add(candle: CandleStickData) {
    const index = this.items.findIndex((x) => x.openTime >= candle.openTime)
    if (index < 0) {
      this.items.push(candle)
    }
    else {
      if (this.items[index].openTime == candle.openTime) {
        this.items[index] = candle
      }
      else {
        this.items.splice(index, 0, candle)
      }
    }
  }
  populate(expectedStart: Ticks, expectedEnd: Ticks) {
    this.getMissingCandles(expectedStart, expectedEnd).map(x => this.add(x))
  }
  clone(deep = true): CandleStickCollection {
    return new CandleStickCollection(this.items.map(x => deep ? x.clone() : x), this.exchange, this.symbol, this.interval, this.market, this.sourceName)
  }
}

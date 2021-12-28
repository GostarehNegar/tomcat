import tomcat from '@gostarehnegar/tomcat'

type CandleStickData = tomcat.Domain.Base.CandleStickData
type Intervals = tomcat.Domain.Base.Intervals
type IIndicator = tomcat.Domain.Indicators.IIndicator
type IFilter = tomcat.Domain.Pipes.IFilter


import { TalibWrapperEx } from "./talibWrapper"

export const ADX = (period = 14, maxCount = 200, interval: Intervals = '4h'): IIndicator => {
  const id = `ADX-${period}-${maxCount}-${interval}`
  return {
    handler: async (candle: CandleStickData, THIS: IFilter) => {
      const candles = THIS.getScaler(interval, maxCount).push(candle)
      const ADXArray = await TalibWrapperEx.execute({
        name: "ADX",
        high: candles.getLast(maxCount).getSingleOHLCV('high'),
        low: candles.getLast(maxCount).getSingleOHLCV('low'),
        close: candles.getLast(maxCount).getSingleOHLCV('close'),
        startIdx: 0,
        endIdx: candles.getLast(maxCount).length - 1,
        optInTimePeriod: period,
      }) as number[]
      candle.indicators.setValue(id, ADXArray[ADXArray.length - 1])
    },
    id: id
  }
}
export class CandleStickCollectionScaler {
  public oneMinuteCandles = new tomcat.Domain.Base.CandleStickCollection([])
  public candles = new tomcat.Domain.Base.CandleStickCollection([])
  private _interval: number
  constructor(public interval: Intervals, public maxCount = 200) {
    this._interval = tomcat.utils.toMinutes(interval) * 60 * 1000
  }
  push(candle: CandleStickData, cb: (onMinutes: tomcat.Domain.Base.CandleStickCollection, lastCandle: CandleStickData) => void = null) {
    if (this.interval != '1m') {
      if (this.oneMinuteCandles.firstCandle && (candle.openTime - this.oneMinuteCandles.firstCandle.openTime >= this._interval)) {
        if (cb) {
          cb(this.oneMinuteCandles, this.candles.items[this.candles.length - 1])
        }
        this.oneMinuteCandles.clear()
      }
      this.oneMinuteCandles.push(candle)
      this.candles.push(this.oneMinuteCandles.merge())
    } else {
      this.candles.push(candle)
    }
    if (this.candles.length > this.maxCount) {
      this.candles.items.splice(0, 1)
    }
    return this.candles
  }
}


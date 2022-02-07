import { CandleStickData, Intervals } from "../common"
import { IFilter } from "../pipes"

import { IIndicator } from "./IIndicator"
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


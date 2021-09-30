import { CandleStickCollection, CandleStickData } from "../base"
import { PipelineContext } from "../strategy"

import { IIndicator } from "./IIndicator"
import { TalibWrapperEx } from "./talibWrapper"

export const ATR = (period = 14, maxCount = 200): IIndicator => {
  return {
    handler: async (candle: CandleStickData, ctx: PipelineContext) => {
      ctx.myContext.candles = ctx.myContext.candles || new CandleStickCollection([])
      const candles = ctx.myContext.candles as CandleStickCollection
      if (candles.length > maxCount) {
        candles.items.splice(0, 1)
      }
      candles.push(candle)
      const ATRArray = await TalibWrapperEx.execute({
        name: "ATR",
        high: candles.getLast(maxCount).getSingleOHLCV('high'),
        low: candles.getLast(maxCount).getSingleOHLCV('low'),
        close: candles.getLast(maxCount).getSingleOHLCV('close'),
        startIdx: 0,
        endIdx: candles.getLast(maxCount).length - 1,
        optInTimePeriod: period,
      }) as number[]
      candle.indicators.setValueEX(`ATR-${period}-${maxCount}`, ATRArray[ATRArray.length - 1]);
    },
    id: `ATR-${period}-${maxCount}`
  }
}
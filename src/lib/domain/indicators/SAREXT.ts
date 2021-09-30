import { CandleStickCollection, CandleStickData } from "../base"
import { PipelineContext } from "../strategy"

import { IIndicator } from "./IIndicator"
import { TalibWrapperEx } from "./talibWrapper"


export const SAR = (startValue = 0.02, acceleration = 0.005, maxAcceleration = 0.2, maxCount = 200): IIndicator => {
  return {
    handler: async (candle: CandleStickData, ctx: PipelineContext) => {
      ctx.myContext.candles = ctx.myContext.candles || new CandleStickCollection([])
      const candles = ctx.myContext.candles as CandleStickCollection
      if (candles.length > maxCount) {
        candles.items.splice(0, 1)
      }
      candles.push(candle)
      const SARArray = await TalibWrapperEx.execute({
        name: "SAREXT",
        high: candles.getLast(maxCount).getSingleOHLCV('high'),
        low: candles.getLast(maxCount).getSingleOHLCV('low'),
        startIdx: 0,
        endIdx: candles.getLast(maxCount).length - 1,
        optInStartValue: startValue,
        optInAcceleration: acceleration,
        optInMaximum: maxAcceleration,
        optInOffsetOnReverse: 0,
        optInAccelerationInitShort: startValue,
        optInAccelerationShort: acceleration,
        optInAccelerationMaxShort: maxAcceleration,
        optInAccelerationInitLong: startValue,
        optInAccelerationLong: acceleration,
        optInAccelerationMaxLong: maxAcceleration,
      }) as number[]

      candle.indicators.setValueEX(`SAREXT-${startValue}-${acceleration}-${maxAcceleration}-${maxCount}`, Math.abs(SARArray[SARArray.length - 1]));
    },
    id: `SAREXT-${startValue}-${acceleration}-${maxAcceleration}-${maxCount}`
  }
}

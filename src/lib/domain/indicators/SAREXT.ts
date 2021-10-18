import { CandleStickData, Intervals } from "../base"
import { IFilter } from "../strategy"

import { IIndicator } from "./IIndicator"
import { TalibWrapperEx } from "./talibWrapper"


export const SAR = (startValue = 0.02, acceleration = 0.005, maxAcceleration = 0.2, maxCount = 200, interval: Intervals = "4h"): IIndicator => {
  const id = `SAREXT-${startValue}-${acceleration}-${maxAcceleration}-${maxCount}-${interval}`
  return {
    handler: async (candle: CandleStickData, THIS: IFilter) => {
      const candles = THIS.getScaler(interval, maxCount).push(candle)
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

      candle.indicators.setValue(id, Math.abs(SARArray[SARArray.length - 1]));
    },
    id: id
  }
}

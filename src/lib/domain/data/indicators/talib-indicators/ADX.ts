import { CandleStickCollection, CandleStickData } from '../../../base';
import { IIndicator } from '../IIndicator';
import { IIndicatorCalculationContext } from '../IIndicatorCalculationContext';
import { Indicator } from '../Indicator';

import { TalibWrapperEx } from './talibWrapper';

export class ADX extends Indicator implements IIndicator {
  constructor(public period: number, public maxCount: number = 200) {
    super("ADX", `ADX-${period}-${maxCount}`);
  }
  async calculate1(context: IIndicatorCalculationContext) {
    const ADXArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getSingleOHLCV('high'),
      low: context.candleSticks.getSingleOHLCV('low'),
      close: context.candleSticks.getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.items.length - 1,
      optInTimePeriod: this.period,
    });
    context.candleSticks.addIndicator(this, ADXArray);
  }
  async calculate2(context: IIndicatorCalculationContext) {
    const ADXArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('high'),
      low: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('low'),
      close: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.getLast(this.maxCount).length - 1,
      optInTimePeriod: this.period,
    }) as number[]
    context.candleSticks.lastCandle.indicators.setValue(this, ADXArray[ADXArray.length - 1])
  }
  calculate(context: IIndicatorCalculationContext) {
    return context.lastCandle ? this.calculate2(context) : this.calculate1(context)
  }

}
const context = { candles: new CandleStickCollection([]) }

export const ADXHandler = (period = 14, maxCount = 200) => {
  const handler = async (candle: CandleStickData) => {
    context.candles.push(candle)
    const ADXArray = await TalibWrapperEx.execute({
      name: "ADX",
      high: context.candles.getLast(maxCount).getSingleOHLCV('high'),
      low: context.candles.getLast(maxCount).getSingleOHLCV('low'),
      close: context.candles.getLast(maxCount).getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candles.getLast(maxCount).length - 1,
      optInTimePeriod: period,
    }) as number[]
    candle.indicators.setValue({ id: `ADX-${period}-${maxCount}` } as IIndicator, ADXArray[ADXArray.length - 1])
  }
  return handler
}

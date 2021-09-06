import { IIndicator } from '../IIndicator';
import { IIndicatorCalculationContext } from '../IIndicatorCalculationContext';
import { Indicator } from '../Indicator';

import { TalibWrapperEx } from './talibWrapper';

export class PlusDi extends Indicator implements IIndicator {
  constructor(public period: number, public maxCount: number = 200) {
    super("PLUS_DI", `PlusDi-${period}-${maxCount}`);
  }
  async calculate1(context: IIndicatorCalculationContext) {
    const PDIArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getSingleOHLCV('high'),
      low: context.candleSticks.getSingleOHLCV('low'),
      close: context.candleSticks.getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.items.length - 1,
      optInTimePeriod: this.period,
    });
    context.candleSticks.addIndicator(this, PDIArray);
  }
  async calculate2(context: IIndicatorCalculationContext) {
    const PDIArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('high'),
      low: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('low'),
      close: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.getLast(this.maxCount).length - 1,
      optInTimePeriod: this.period,
    }) as number[]
    context.candleSticks.lastCandle.indicators.setValue(this, PDIArray[PDIArray.length - 1]);
  }
  calculate(context: IIndicatorCalculationContext) {
    return context.lastCandle ? this.calculate2(context) : this.calculate1(context)
  }
}
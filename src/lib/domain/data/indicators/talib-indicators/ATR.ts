import { dep_IIndicator } from '../IIndicator';
import { IIndicatorCalculationContext } from '../IIndicatorCalculationContext';
import { Indicator } from '../Indicator';

import { TalibWrapperEx } from './talibWrapper';

export class ATR extends Indicator implements dep_IIndicator {
  constructor(public period: number, public maxCount = 200) {
    super("ATR", `ATR-${period}-${maxCount}`);
  }
  async calculate1(context: IIndicatorCalculationContext) {
    const ATRArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getSingleOHLCV('high'),
      low: context.candleSticks.getSingleOHLCV('low'),
      close: context.candleSticks.getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.items.length - 1,
      optInTimePeriod: this.period,
    });
    context.candleSticks.addIndicator(this, ATRArray);
  }
  async calculate2(context: IIndicatorCalculationContext) {
    const ATRArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('high'),
      low: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('low'),
      close: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.getLast(this.maxCount).length - 1,
      optInTimePeriod: this.period,
    }) as number[]
    context.candleSticks.lastCandle.indicators.setValue_depricated(this, ATRArray[ATRArray.length - 1]);
  }
  calculate(context: IIndicatorCalculationContext) {
    return context.lastCandle ? this.calculate2(context) : this.calculate1(context)
  }

}


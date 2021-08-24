import { IIndicator } from '../../interfaces/IIndicator';
import { IIndicatorCalculationContext } from '../../interfaces/IIndicatorCalculationContext';
import { Indicator } from '../Indicator';

import { TalibWrapperEx } from './talibWrapper';

export class MinusDi extends Indicator implements IIndicator {
  constructor(public period: number) {
    super("MINUS_DI", `MinusDi-${period}`);
  }
  async calculate(context: IIndicatorCalculationContext) {
    const MDIArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getSingleOHLCV('high'),
      low: context.candleSticks.getSingleOHLCV('low'),
      close: context.candleSticks.getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.items.length - 1,
      optInTimePeriod: this.period,
    });
    context.candleSticks.addIndicator(this, MDIArray);
  }
}

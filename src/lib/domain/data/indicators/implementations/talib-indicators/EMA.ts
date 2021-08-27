import { IIndicator } from '../../interfaces/IIndicator';
import { IIndicatorCalculationContext } from '../../interfaces/IIndicatorCalculationContext';
import { Indicator } from '../Indicator';

import { TalibWrapperEx } from './talibWrapper';

export class EMA extends Indicator implements IIndicator {
  constructor(public period: number) {
    super("EMA", `EMA-${period}`);
  }

  async calculate(context: IIndicatorCalculationContext) {
    const EMAArray = await TalibWrapperEx.execute({
      name: this.name,
      inReal: context.candleSticks.getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.items.length - 1,
      optInTimePeriod: this.period,
    });
    context.candleSticks.addIndicator(this, EMAArray);
  }
}

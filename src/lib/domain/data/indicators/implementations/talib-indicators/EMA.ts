import { IIndicator } from '../../interfaces/IIndicator';
import { IIndicatorCalculationContext } from '../../interfaces/IIndicatorCalculationContext';
import { Indicator } from '../Indicator';
import { IndicatorConfig } from '../../interfaces/IndicatorConfig';

import { TalibWrapperEx } from './talibWrapper';

export class EMA extends Indicator implements IIndicator {
  constructor(cfg: IndicatorConfig, public period: number) {
    super(cfg);
  }

  async calculate(context: IIndicatorCalculationContext) {
    const EMAArray = await TalibWrapperEx.execute({
      name: this.cfg.name,
      inReal: context.candleSticks.getSingleOHLCV('close'),
      startIdx: 0,
      endIdx: context.candleSticks.items.length - 1,
      optInTimePeriod: this.period,
    });
    context.candleSticks.addIndicator(this.cfg.id, EMAArray);
  }
}

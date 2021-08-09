import { CandleStickCollection } from '../../../base/internals/CandleStickCollection';

import { IIndicatorCalculationContext } from '../interfaces/IIndicatorCalculationContext';

export class IndicatorCalculationContext
  implements IIndicatorCalculationContext
{
  public pass = 0;
  constructor(public candleSticks: CandleStickCollection) {}
}

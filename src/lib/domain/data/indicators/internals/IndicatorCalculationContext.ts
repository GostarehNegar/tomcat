import { CandleStickCollection } from '../../../base/internals/CandleStickCollection';

import { IIndicatorCalculationContext } from './IIndicatorCalculationContext';

export class IndicatorCalculationContext
  implements IIndicatorCalculationContext
{
  public pass = 0;
  constructor(public candleSticks: CandleStickCollection) {}
}

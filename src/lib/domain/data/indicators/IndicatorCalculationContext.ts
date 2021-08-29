import { CandleStickCollection } from '../../base';

import { IIndicatorCalculationContext } from './IIndicatorCalculationContext';


export class IndicatorCalculationContext
  implements IIndicatorCalculationContext {
  public pass = 0;
  constructor(public candleSticks: CandleStickCollection) { }
}

import { CandleStickCollection } from '../../base';

import { IIndicatorCalculationContext } from './IIndicatorCalculationContext';


export class IndicatorCalculationContext
  implements IIndicatorCalculationContext {
  public pass = 0;
  public time = 0;
  constructor(public candleSticks: CandleStickCollection) { }
  public lastCandle: boolean
}

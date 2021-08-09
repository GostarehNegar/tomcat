import { CandleStickCollection } from '../../../base/index';

export interface IIndicatorCalculationContext {
  get candleSticks(): CandleStickCollection;
  get pass(): number;
}

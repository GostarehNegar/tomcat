import { CandleStickCollection } from "../../base";

export interface IIndicatorCalculationContext {
  get candleSticks(): CandleStickCollection;
  get lastCandle(): boolean;
  get pass(): number;
}

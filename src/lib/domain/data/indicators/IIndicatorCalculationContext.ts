import { CandleStickCollection } from "../../base";

export interface IIndicatorCalculationContext {
  get candleSticks(): CandleStickCollection;
  get pass(): number;
}

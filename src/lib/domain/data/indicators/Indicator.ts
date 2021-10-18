import { dep_IIndicator } from "./IIndicator";
import { IIndicatorCalculationContext } from "./IIndicatorCalculationContext";

export abstract class Indicator implements dep_IIndicator {
  constructor(public name: string, public id: string) { }
  abstract calculate(context: IIndicatorCalculationContext): Promise<unknown>;
  pass?: number;
}

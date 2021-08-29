import { IIndicator } from "./IIndicator";
import { IIndicatorCalculationContext } from "./IIndicatorCalculationContext";

export abstract class Indicator implements IIndicator {
  constructor(public name: string, public id: string) { }
  abstract calculate(context: IIndicatorCalculationContext): Promise<unknown>;
  pass?: number;
}

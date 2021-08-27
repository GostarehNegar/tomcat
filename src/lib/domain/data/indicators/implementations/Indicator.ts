import { IIndicator, IIndicatorCalculationContext } from '../interfaces';

export abstract class Indicator implements IIndicator {
  constructor(public name: string, public id: string) { }
  abstract calculate(context: IIndicatorCalculationContext): Promise<unknown>;
  pass?: number;
}

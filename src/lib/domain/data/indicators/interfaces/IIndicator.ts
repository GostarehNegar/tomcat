import { IIndicatorCalculationContext } from './IIndicatorCalculationContext';

export interface IIndicator {
  calculate(context: IIndicatorCalculationContext): Promise<unknown>;
  pass?: number;
}

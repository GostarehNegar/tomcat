import { IIndicatorCalculationContext } from './IIndicatorCalculationContext';

export interface dep_IIndicator {
  calculate(context: IIndicatorCalculationContext): Promise<unknown>;
  pass?: number;
  get name(): string;
  get id(): string
}

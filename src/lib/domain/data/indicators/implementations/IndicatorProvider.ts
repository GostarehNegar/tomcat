import { CandleStickCollection } from '../../../base/internals/CandleStickCollection';

import { IIndicator } from '../interfaces/IIndicator';
import { IndicatorCalculationContext } from './IndicatorCalculationContext';
import {
  ADX,
  ATR,
  EMA,
  MinusDi,
  PlusDi,
  SAREXT,
} from './talib-indicators';

export class IndicatorProvider {
  constructor(public indicators?: IIndicator[]) {
    this.indicators = indicators || [];
  }
  async calculate(candles: CandleStickCollection) {
    const context = new IndicatorCalculationContext(candles);
    context.pass = 0;
    for (let pass = 0; pass < 5; pass++) {
      context.pass = pass;
      for (let i = 0; i < this.indicators.length; i++) {
        if ((this.indicators[i].pass || 0) == context.pass) {
          await this.indicators[i].calculate(context);
        }
      }
    }
  }

  addCustomIndicator(i: IIndicator): IndicatorProvider {
    this.indicators.push(i);
    return this;
  }
  addEMA(id: string, period: number): IndicatorProvider {
    this.indicators.push(new EMA({ name: 'EMA', id: id }, period));
    return this;
  }
  addADX(id: string, period: number): IndicatorProvider {
    this.indicators.push(new ADX({ name: 'ADX', id: id }, period));
    return this;
  }
  addPlusDi(id: string, period: number): IndicatorProvider {
    this.indicators.push(new PlusDi({ name: 'PLUS_DI', id: id }, period));
    return this;
  }
  addMinusDi(id: string, period: number): IndicatorProvider {
    this.indicators.push(new MinusDi({ name: 'MINUS_DI', id: id }, period));
    return this;
  }
  addATR(id: string, period: number): IndicatorProvider {
    this.indicators.push(new ATR({ name: 'ATR', id: id }, period));
    return this;
  }
  addSAREXT(
    id: string,
    startValue: number,
    acceleration: number,
    maxAcceleration: number
  ): IndicatorProvider {
    this.indicators.push(
      new SAREXT(
        { name: 'SAREXT', id: id },
        startValue,
        acceleration,
        maxAcceleration
      )
    );
    return this;
  }
}

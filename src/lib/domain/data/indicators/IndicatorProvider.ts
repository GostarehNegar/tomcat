
import { CandleStickCollection } from '../../base';

import { IIndicator } from './IIndicator';
import { IndicatorCalculationContext } from './IndicatorCalculationContext';
import { IndicatorDB } from './indicatorsDB';
(CandleStickCollection)
export class IndicatorProvider {
  public isCacheEnabled: boolean;
  constructor(public indicators?: IIndicator[], cacheEnable?: boolean) {
    this.indicators = indicators || [];
    this.isCacheEnabled = cacheEnable
  }


  async calculate(context: IndicatorCalculationContext) {

    // const context = new IndicatorCalculationContext(candles);
    const DB = this.isCacheEnabled ? new IndicatorDB() : null;

    context.pass = 0;
    for (let pass = 0; pass < 5; pass++) {
      context.pass = pass;
      for (let i = 0; i < this.indicators.length; i++) {
        if (!context.candleSticks.lastCandle.indicators.has(this.indicators[i])) {
          const value = await DB?.getIndicatorValue(context.time, this.indicators[i].id)
          if (value != null) {
            context.candleSticks.lastCandle.indicators.setValue(this.indicators[i], value.value)

          } else {
            if ((this.indicators[i].pass || 0) == context.pass) {
              await this.indicators[i].calculate(context);
              await DB?.setIndicatorValue(context.time, this.indicators[i].id, context.candleSticks.lastCandle.indicators.getValue(this.indicators[i]))
            }
          }
        }
      }
    }
  }

  // addCustomIndicator(i: IIndicator): IndicatorProvider {
  //   this.indicators.push(i);
  //   return this;
  // }
  // addEMA(id: string, period: number): IndicatorProvider {
  //   this.indicators.push(new EMA({ name: 'EMA', id: id }, period));
  //   return this;
  // }
  // addADX(id: string, period: number): IndicatorProvider {
  //   this.indicators.push(new ADX({ name: 'ADX', id: id }, period));
  //   return this;
  // }
  // addPlusDi(id: string, period: number): IndicatorProvider {
  //   this.indicators.push(new PlusDi({ name: 'PLUS_DI', id: id }, period));
  //   return this;
  // }
  // addMinusDi(id: string, period: number): IndicatorProvider {
  //   this.indicators.push(new MinusDi({ name: 'MINUS_DI', id: id }, period));
  //   return this;
  // }
  // addATR(period: number): IndicatorProvider {
  //   this.indicators.push(new ATR(period));
  //   return this;
  // }
  // addSAREXT(
  //   startValue: number,
  //   acceleration: number,
  //   maxAcceleration: number
  // ): IndicatorProvider {
  //   this.indicators.push(
  //     new SAREXT(
  //       startValue,
  //       acceleration,
  //       maxAcceleration
  //     )
  //   );
  //   return this;
  // }
  add(indicator: IIndicator) {
    this.indicators.push(indicator)
    return this
  }
}

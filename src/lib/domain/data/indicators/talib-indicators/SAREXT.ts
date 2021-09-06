import { IIndicator } from '../IIndicator';
import { IIndicatorCalculationContext } from '../IIndicatorCalculationContext';
import { Indicator } from '../Indicator';

import { TalibWrapperEx } from './talibWrapper';

export class SAREXT extends Indicator implements IIndicator {
  constructor(
    public startValue: number,
    public acceleration: number,
    public maxAcceleration: number,
    public maxCount: number = 400
  ) {
    super("SAREXT", `SAREXT-${startValue}-${acceleration}-${maxAcceleration}-${maxCount}`);
  }
  async calculate1(context: IIndicatorCalculationContext) {
    const SARArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getSingleOHLCV('high'),
      low: context.candleSticks.getSingleOHLCV('low'),
      startIdx: 0,
      endIdx: context.candleSticks.items.length - 1,
      optInStartValue: this.startValue,
      optInAcceleration: this.acceleration,
      optInMaximum: this.maxAcceleration,
      optInOffsetOnReverse: 0,
      optInAccelerationInitShort: this.startValue,
      optInAccelerationShort: this.acceleration,
      optInAccelerationMaxShort: this.maxAcceleration,
      optInAccelerationInitLong: this.startValue,
      optInAccelerationLong: this.acceleration,
      optInAccelerationMaxLong: this.maxAcceleration,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context.candleSticks.addIndicator(this, (SARArray as any).map(x => Math.abs(x)));
  }
  async calculate2(context: IIndicatorCalculationContext) {
    const SARArray = await TalibWrapperEx.execute({
      name: this.name,
      high: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('high'),
      low: context.candleSticks.getLast(this.maxCount).getSingleOHLCV('low'),
      startIdx: 0,
      endIdx: context.candleSticks.getLast(this.maxCount).length - 1,
      optInStartValue: this.startValue,
      optInAcceleration: this.acceleration,
      optInMaximum: this.maxAcceleration,
      optInOffsetOnReverse: 0,
      optInAccelerationInitShort: this.startValue,
      optInAccelerationShort: this.acceleration,
      optInAccelerationMaxShort: this.maxAcceleration,
      optInAccelerationInitLong: this.startValue,
      optInAccelerationLong: this.acceleration,
      optInAccelerationMaxLong: this.maxAcceleration,
    }) as number[]

    context.candleSticks.lastCandle.indicators.setValue(this, Math.abs(SARArray[SARArray.length - 1]));
  }
  calculate(context: IIndicatorCalculationContext) {
    return context.lastCandle ? this.calculate2(context) : this.calculate1(context)
  }
}

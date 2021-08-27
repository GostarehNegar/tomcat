/* eslint-disable @typescript-eslint/no-explicit-any */
import { IIndicator } from '../../interfaces/IIndicator';
import { IIndicatorCalculationContext } from '../../interfaces/IIndicatorCalculationContext';
import { Indicator } from '../Indicator';

import { TalibWrapperEx } from './talibWrapper';

export class SAREXT extends Indicator implements IIndicator {
  constructor(
    public startValue: number,
    public acceleration: number,
    public maxAcceleration: number
  ) {
    super("SAREXT", `SAREXT-${startValue}-${acceleration}-${maxAcceleration}`);
  }
  async calculate(context: IIndicatorCalculationContext) {
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

    context.candleSticks.addIndicator(this, (SARArray as any).map(x => Math.abs(x)));
  }
}

import { IMessageBus } from '../../bus';
import { IStrategySignal } from '../base';
import { IStrategyContext } from '../bot';
import { IDataProvider } from '../data/_interfaces';
import { IndicatorProvider } from '../data/indicators/implementations/IndicatorProvider';
import { Indicators } from '../data/indicators/implementations/indicatorFactory';
import { IIndicator } from '../data/indicators/interfaces/IIndicator';
import { IIndicatorCalculationContext } from '../data/indicators/interfaces/IIndicatorCalculationContext';
import { DataProvider } from '../data/sources/DataProvider';

import { IStrategy } from './IStrategy';




export class Strategy {
  public indicators = { ema: Indicators.EMA(8) }
  constructor(public bus: IMessageBus) { }
  async run(startTime, endTime): Promise<unknown> {
    const provider = new IndicatorProvider().add(Indicators.EMA(8));

    const data = new DataProvider('binance', 'future', 'BTCUSDT', '1m');
    const candleSticks = await data.getData(startTime, endTime);
    await provider.calculate(candleSticks);
    for (let i = 0; i < candleSticks.items.length; i++) {
      const candle = candleSticks.items[i];
      if (
        candle.indicators &&
        candle.indicators.has(this.indicators.ema) &&
        candle.indicators.getValue(this.indicators.ema) > 0.5
      ) {
        await this.bus.createMessage('signals/myStrategy/buy', {}).publish();
      }
    }
    return true;
  }
}


export class BaseStrategy implements IStrategy {
  public data;
  public stream: string;
  public indicators = { ADX: Indicators.ADX(14), ATR: Indicators.ATR(14), SAR: Indicators.SAREXT(0.02, 0.005, 0.2), minusDi: Indicators.MinusDi(14), plusDi: Indicators.PlusDi(14), isSarAbove: isSarAbove, adxSlope: adxSlope }
  constructor(public bus: IMessageBus, public dataProvider: IDataProvider) {
    this.stream = "signals/BaseStrategy"
  }
  async run(cxt: IStrategyContext): Promise<unknown> {
    const candleSticks = await this.dataProvider.getData(cxt.startTime, cxt.endTime);
    const provider = new IndicatorProvider()
      .add(this.indicators.ADX)
      .add(this.indicators.ATR)
      .add(this.indicators.SAR)
      .add(this.indicators.minusDi)
      .add(this.indicators.plusDi)
      .add(isSarAbove)
      .add(stopLossAtr)
      .add(adxSlope);
    await provider.calculate(candleSticks);
    for (let i = 0; i < candleSticks.items.length; i++) {
      if (candleSticks.items[i].indicators && candleSticks.items[i].indicators.has(this.indicators.plusDi, this.indicators.minusDi, this.indicators.isSarAbove, this.indicators.adxSlope)) {
        const indicator = candleSticks.items[i].indicators;
        if (
          indicator.getBoolValue(this.indicators.isSarAbove) == true &&
          indicator.getValue(this.indicators.plusDi) > indicator.getValue(this.indicators.minusDi) &&
          indicator.getValue(this.indicators.adxSlope) > 1
        ) {
          const buyOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/openLong`, buyOrder).publish();
        } else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == false &&
          indicator.getValue(this.indicators.plusDi) < indicator.getValue(this.indicators.minusDi) &&
          indicator.getValue(this.indicators.adxSlope) > 1
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/openShort`, sellOrder).publish();
        }
        else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == false ||
          indicator.getValue(this.indicators.plusDi) < indicator.getValue(this.indicators.minusDi) ||
          indicator.getValue(this.indicators.adxSlope) < -5
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/closeLong`, sellOrder).publish();
        }
        else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == true ||
          indicator.getValue(this.indicators.plusDi) > indicator.getValue(this.indicators.minusDi) ||
          indicator.getValue(this.indicators.adxSlope) < -5
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/closeShort`, sellOrder).publish();
        }
      }
    }
    return true;
  }
}

export class BaseStrategyEX implements IStrategy {
  public data;
  public stream: string;
  public indicators = { ADX: Indicators.ADX(14), ATR: Indicators.ATR(14), SAR: Indicators.SAREXT(0.02, 0.005, 0.2), minusDi: Indicators.MinusDi(14), plusDi: Indicators.PlusDi(14), isSarAbove: isSarAbove, adxSlope: adxSlope, stopLossAtr: stopLossAtr }
  constructor(public bus: IMessageBus, public dataProvider: IDataProvider) {
    this.stream = "signals/BaseStrategyEX"
  }
  async run(cxt: IStrategyContext): Promise<unknown> {
    const candleSticks = await this.dataProvider.getData(cxt.startTime, cxt.endTime);
    const provider = new IndicatorProvider()
      .add(this.indicators.ADX)
      .add(this.indicators.ATR)
      .add(this.indicators.SAR)
      .add(this.indicators.minusDi)
      .add(this.indicators.plusDi)
      .add(this.indicators.isSarAbove)
      .add(this.indicators.stopLossAtr)
      .add(this.indicators.adxSlope);
    await provider.calculate(candleSticks);
    for (let i = 0; i < candleSticks.items.length; i++) {
      if (
        candleSticks.items[i].indicators &&
        candleSticks.items[i].indicators.has(this.indicators.plusDi, this.indicators.minusDi, this.indicators.adxSlope, this.indicators.isSarAbove)
      ) {
        const indicator = candleSticks.items[i].indicators;
        if (
          indicator.getBoolValue(this.indicators.isSarAbove) == false &&
          indicator.getValue(this.indicators.plusDi) > (indicator.getNumberValue(this.indicators.minusDi) + 5) &&
          indicator.getValue(this.indicators.adxSlope) >= 5
        ) {
          const buyOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/openLong`, buyOrder).publish();
        } else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == true &&
          indicator.getValue(this.indicators.plusDi) < (indicator.getNumberValue(this.indicators.minusDi) - 5) &&
          indicator.getValue(this.indicators.adxSlope) >= 5
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/openShort`, sellOrder).publish();
        }
        else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == true ||
          indicator.getValue(this.indicators.plusDi) < (indicator.getNumberValue(this.indicators.minusDi) - 5)
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/closeLong`, sellOrder).publish();
        }
        else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == false ||
          indicator.getValue(this.indicators.plusDi) > (indicator.getNumberValue(this.indicators.minusDi) + 5)
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/closeShort`, sellOrder).publish();
        }
      }
    }
    return true;
  }
}

export class BaseStrategyExtended implements IStrategy {
  public data;
  public stream: string;
  public indicators = { ADX: Indicators.ADX(14), ATR: Indicators.ATR(14), SAR: Indicators.SAREXT(0.02, 0.005, 0.2), minusDi: Indicators.MinusDi(14), plusDi: Indicators.PlusDi(14), isSarAbove: isSarAbove, adxSlope: adxSlope, stopLossAtr: stopLossAtr }
  constructor(public bus: IMessageBus, public dataProvider: IDataProvider) {
    this.stream = "signals/BaseStrategyExtended"
  }
  async run(cxt: IStrategyContext): Promise<unknown> {
    const candleSticks = await this.dataProvider.getData(cxt.startTime, cxt.endTime);
    const provider = new IndicatorProvider()
      .add(this.indicators.ADX)
      .add(this.indicators.ATR)
      .add(this.indicators.SAR)
      .add(this.indicators.minusDi)
      .add(this.indicators.plusDi)
      .add(this.indicators.isSarAbove)
      .add(this.indicators.stopLossAtr)
      .add(this.indicators.adxSlope)
    await provider.calculate(candleSticks);
    for (let i = 0; i < candleSticks.items.length; i++) {
      if (i == 28) {
        console.log("hi");

      }
      if (
        candleSticks.items[i].indicators &&
        candleSticks.items[i].indicators.has(this.indicators.plusDi, this.indicators.minusDi, this.indicators.adxSlope, this.indicators.isSarAbove)
      ) {
        const indicator = candleSticks.items[i].indicators;
        if (
          indicator.getBoolValue(this.indicators.isSarAbove) == false &&
          indicator.getValue(this.indicators.plusDi) > (indicator.getNumberValue(this.indicators.minusDi) + 5) &&
          indicator.getValue(this.indicators.adxSlope) > 1
        ) {
          const buyOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/openLong`, buyOrder).publish();
        } else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == true &&
          indicator.getValue(this.indicators.plusDi) < (indicator.getNumberValue(this.indicators.minusDi) - 5) &&
          indicator.getValue(this.indicators.adxSlope) > 1
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/openShort`, sellOrder).publish();
        }
        else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == true ||
          indicator.getValue(this.indicators.plusDi) < (indicator.getNumberValue(this.indicators.minusDi) - 5) ||
          indicator.getValue(this.indicators.adxSlope) < -5
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/closeLong`, sellOrder).publish();
        }
        else if (
          indicator.getBoolValue(this.indicators.isSarAbove) == false ||
          indicator.getValue(this.indicators.plusDi) > (indicator.getNumberValue(this.indicators.minusDi) + 5) ||
          indicator.getValue(this.indicators.adxSlope) < -5
        ) {
          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/closeShort`, sellOrder).publish();
        }
      }
    }
    return true;
  }
}


export class TestStrategy extends BaseStrategy {
  public indicators = { ADX: Indicators.ADX(14), ATR: Indicators.ATR(14), SAR: Indicators.SAREXT(0.02, 0.005, 0.2), minusDi: Indicators.MinusDi(14), plusDi: Indicators.PlusDi(14), isSarAbove: isSarAbove, adxSlope: adxSlope, stopLossAtr: stopLossAtr }
  constructor(public bus: IMessageBus, public dataProvider: IDataProvider) {
    super(bus, dataProvider);
    this.stream = "signals/TestStrategy"
  }
  async run(cxt: IStrategyContext): Promise<unknown> {
    const candleSticks = await this.dataProvider.getData(cxt.startTime, cxt.endTime);
    const provider = new IndicatorProvider()
      .add(this.indicators.ADX)
      .add(this.indicators.ATR)
      .add(this.indicators.SAR)
      .add(this.indicators.minusDi)
      .add(this.indicators.plusDi)
      .add(this.indicators.isSarAbove)
      .add(this.indicators.stopLossAtr)
      .add(this.indicators.adxSlope)
    await provider.calculate(candleSticks);
    for (let i = 0; i < candleSticks.items.length; i++) {
      if (candleSticks.items[i].indicators && candleSticks.items[i].indicators.has(this.indicators.plusDi, this.indicators.minusDi, this.indicators.adxSlope, this.indicators.isSarAbove)) {
        const indicator = candleSticks.items[i].indicators;
        if (indicator.getBoolValue(this.indicators.isSarAbove) == false && indicator.getValue(this.indicators.plusDi) > (indicator.getNumberValue(this.indicators.minusDi) + 5) && indicator.getValue(this.indicators.adxSlope) > 1) {

          const buyOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/openLong`, buyOrder).publish();
        }
        else if (indicator.getBoolValue(this.indicators.isSarAbove) == true || indicator.getValue(this.indicators.plusDi) < (indicator.getNumberValue(this.indicators.minusDi) - 5) || indicator.getValue(this.indicators.adxSlope) < -5) {

          const sellOrder: IStrategySignal = { candle: candleSticks.items[i] }
          await this.bus.createMessage(`${this.stream}/openShort`, sellOrder).publish();
        }
      }
    }
    return true;
  }
}
const isSarAboveName = "isSarAbove"
const isSarAbove: IIndicator = {
  pass: 1,
  name: isSarAboveName,
  id: isSarAboveName,
  calculate: async (context: IIndicatorCalculationContext) => {
    context.candleSticks.items.map((candle) => {
      const median = (candle.high + candle.low) / 2;
      if (
        candle.indicators &&
        candle.indicators.has(Indicators.SAREXT(0.02, 0.005, 0.2)) &&
        candle.indicators.getValue(Indicators.SAREXT(0.02, 0.005, 0.2)) < median
      ) {
        candle.indicators.setValue(isSarAbove, false)
      } else if (
        candle.indicators &&
        candle.indicators.has(Indicators.SAREXT(0.02, 0.005, 0.2)) &&
        candle.indicators.getValue(Indicators.SAREXT(0.02, 0.005, 0.2)) > median
      ) {
        candle.indicators.setValue(isSarAbove, true)
      }
    });
  },
};
const stopLossAtrName = "stopLossAtr"
export const stopLossAtr: IIndicator = {
  pass: 1,
  name: stopLossAtrName,
  id: stopLossAtrName,
  calculate: async (context: IIndicatorCalculationContext) => {
    context.candleSticks.items.map((candle) => {
      if (candle.indicators && candle.indicators.has(Indicators.ATR(14))) {
        candle.indicators.setValue(stopLossAtr, 1.25 * candle.indicators.getNumberValue(Indicators.ATR(14)))
      }
    });
  },
};
const adxSlopeName = "adxSlope"
const adxSlope: IIndicator = {
  pass: 1,
  name: adxSlopeName,
  id: adxSlopeName,
  calculate: async (context: IIndicatorCalculationContext) => {
    for (let i = 0; i < context.candleSticks.items.length; i++) {
      const candle = context.candleSticks.items[i];
      const previousCandle = context.candleSticks.items[i - 1];
      if (
        candle.indicators &&
        candle.indicators.has(Indicators.ADX(14)) &&
        previousCandle.indicators &&
        previousCandle.indicators.has(Indicators.ADX(14))
      ) {
        const res = ((candle.indicators.getNumberValue(Indicators.ADX(14)) - previousCandle.indicators.getNumberValue(Indicators.ADX(14))) / previousCandle.indicators.getNumberValue(Indicators.ADX(14))) * 100
        candle.indicators.setValue(adxSlope, res)

      }
    }
  },
};

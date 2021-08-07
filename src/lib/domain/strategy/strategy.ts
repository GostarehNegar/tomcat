import { DataProvider } from '../data/sources/DataProvider';
import { IMessageBus } from '../../MessageBus';
import { IIndicator, IIndicatorCalculationContext, IndicatorProvider } from '../data/indicators/IndicatorProvider';

export class Strategy {
    constructor(public bus: IMessageBus) {

    }
    async run(startTime, endTime): Promise<unknown> {
        const provider = new IndicatorProvider().addEMA("EMA8", 8)
        provider.addCustomIndicator({
            pass: 1,
            calculate: async (context) => {
                context.candleSticks.setIndicatorValue(0, "paria", 2)
            }
        })
        const data = new DataProvider("binance", "future", "BTCUSDT", "1m")
        const candleSticks = await data.getData(startTime, endTime)
        await provider.calculate(candleSticks)
        for (let i = 0; i < candleSticks.items.length; i++) {
            const candle = candleSticks.items[i]
            if (candle.indicators && candle.indicators.EMA8 && candle.indicators.EMA8 > 0.5) {
                await this.bus.createMessage("signals/myStrategy/buy", {}).publish()
            }
        }
        return true;
    }


}
export class BaseStrategy {
    constructor(public bus: IMessageBus) {

    }
    async run(startTime, endTime): Promise<unknown> {
        const data = new DataProvider("binance", "future", "BTCUSDT", "1m")
        const candleSticks = await data.getData(startTime, endTime)
        const provider = new IndicatorProvider().addADX("ADX14", 14).addATR("ATR14", 14).addSAREXT("SAR", 0.02, 0.005, 0.2).addMinusDi("MDI", 14).addPlusDi("PDI", 14).addCustomIndicator(isSarAbove).addCustomIndicator(stopLossAtr).addCustomIndicator(adxSlope)
        await provider.calculate(candleSticks)
        for (let i = 0; i < candleSticks.items.length; i++) {
            if (candleSticks.items[i].indicators && candleSticks.items[i].indicators.PDI && candleSticks.items[i].indicators.MDI && candleSticks.items[i].indicators.isSarAbove && candleSticks.items[i].indicators.adxSlope) {
                const indicator = candleSticks.items[i].indicators
                if (indicator.isSarAbove == -1 && indicator.PDI > indicator.MDI && indicator.adxSlope < 1) {
                    await this.bus.createMessage("signals/myStrategy/buy", {}).publish()

                }
                else if (indicator.isSarAbove == 1 || indicator.PDI < indicator.MDI || indicator.adxSlope < -5) {
                    await this.bus.createMessage("signals/myStrategy/sell", {}).publish()

                }
            }
        }
        return true
    }

}
const isSarAbove: IIndicator = {
    pass: 1,
    calculate: async (context: IIndicatorCalculationContext) => {
        context.candleSticks.items.map((candle) => {
            const median = (candle.high + candle.low) / 2
            if (candle.indicators && candle.indicators.SAR && candle.indicators.SAR < median) {
                candle.indicators.isSarAbove = -1
            }
            else if (candle.indicators && candle.indicators.SAR && candle.indicators.SAR > median) {
                candle.indicators.isSarAbove = +1
            }
        })
    }
}
const stopLossAtr: IIndicator = {
    pass: 1,
    calculate: async (context: IIndicatorCalculationContext) => {
        context.candleSticks.items.map((candle) => {
            if (candle.indicators && candle.indicators.ATR14) {
                candle.indicators.stopLossAtr = 1.25 * candle.indicators.ATR14
            }
        })
    }
}
const adxSlope: IIndicator = {
    pass: 1,
    calculate: async (context: IIndicatorCalculationContext) => {
        for (let i = 0; i < context.candleSticks.items.length; i++) {
            const candle = context.candleSticks.items[i]
            const previousCandle = context.candleSticks.items[i - 1]
            if (candle.indicators && candle.indicators.ADX14 && previousCandle.indicators && previousCandle.indicators.ADX14) {
                candle.indicators.adxSlope = (candle.indicators.ADX14 - previousCandle.indicators.ADX14) / previousCandle.indicators.ADX14
            }
        }

    }
}
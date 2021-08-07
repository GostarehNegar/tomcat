import { IMessageBus } from '../../../MessageBus';
import { CandleStickCollection } from '../../base/internals/CandleStickCollection'
import { DataProvider } from '../sources/DataProvider';

export interface IIndicatorCalculationContext {
    get candleSticks(): CandleStickCollection
    get pass(): number;
}
export class IndicatorCalculationContext implements IIndicatorCalculationContext {
    public pass = 0
    constructor(public candleSticks: CandleStickCollection) {

    }


}

export interface IIndicator {
    calculate(context: IIndicatorCalculationContext): Promise<unknown>;
}
export type IndicatorConfig = {
    name: string,
    id: string
}
export class Indicator {
    constructor(public cfg: IndicatorConfig) {

        this.cfg.id
    }
}



export class EMA extends Indicator implements IIndicator {
    constructor(cfg: IndicatorConfig, public period: number) {
        super(cfg);


    }

    async calculate(context: IIndicatorCalculationContext) {
        for (let i = 0; i < context.candleSticks.items.length; i++) {
            context.candleSticks.setIndicatorValue(i, this.cfg.id, Math.random())

        }

    }
}
export class ADX extends Indicator implements IIndicator {

    async calculate(context: IIndicatorCalculationContext) {
        (context)
        throw new Error('Method not implemented.')
    }
}
export class IndicatorProvider {

    constructor(public indicators?: IIndicator[]) {
        this.indicators = indicators || []
    }
    async calculate(candles: CandleStickCollection) {
        const context = new IndicatorCalculationContext(candles)

        for (let i = 0; i < this.indicators.length; i++) {
            await this.indicators[i].calculate(context)
        }
        context.pass = 1
        for (let i = 0; i < this.indicators.length; i++) {
            await this.indicators[i].calculate(context)
        }


    }
    addEMA(id: string, period: number) {

        this.indicators.push(new EMA({ name: "EMA", id: id }, period))
        return this
    }
    addADX() {
        return this
    }

}
export class Strategy {
    constructor(public bus: IMessageBus) {

    }
    async run(startTime, endTime): Promise<unknown> {
        const provider = new IndicatorProvider().addEMA("EMA8", 8)
        const data = new DataProvider("binance", "future", "BTCUSDT", "1m")
        const candleSticks = await data.getData(startTime, endTime)
        await provider.calculate(candleSticks)
        for (let i = 0; i < candleSticks.items.length; i++) {
            const candle = candleSticks.items[i]
            if (candle.indicators.EMA8 > 0.5) {
                await this.bus.createMessage("signals/myStrategy/buy", {}).publish()
            }
        }
        return true;
    }

}
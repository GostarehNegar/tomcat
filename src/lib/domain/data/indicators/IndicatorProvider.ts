import { CandleStickCollection } from '../../base/internals/CandleStickCollection'
import { TalibWrapperEx } from './talibWrapper';

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
    pass?: number;
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
        const EMAArray = await TalibWrapperEx.execute({
            name: this.cfg.name,
            inReal: context.candleSticks.getSingleOHLCV("close"),
            startIdx: 0,
            endIdx: context.candleSticks.items.length - 1,
            optInTimePeriod: this.period,
        })
        context.candleSticks.addIndicator(this.cfg.id, EMAArray)
    }
}
export class ADX extends Indicator implements IIndicator {
    constructor(cfg: IndicatorConfig, public period: number) {
        super(cfg);
    }
    async calculate(context: IIndicatorCalculationContext) {
        const ADXArray = await TalibWrapperEx.execute({
            name: this.cfg.name,
            high: context.candleSticks.getSingleOHLCV("high"),
            low: context.candleSticks.getSingleOHLCV("low"),
            close: context.candleSticks.getSingleOHLCV("close"),
            startIdx: 0,
            endIdx: context.candleSticks.items.length - 1,
            optInTimePeriod: this.period

        })
        context.candleSticks.addIndicator(this.cfg.id, ADXArray)
    }
}

export class PlusDi extends Indicator implements IIndicator {
    constructor(cfg: IndicatorConfig, public period: number) {
        super(cfg);
    }
    async calculate(context: IIndicatorCalculationContext) {
        const PDIArray = await TalibWrapperEx.execute({
            name: this.cfg.name,
            high: context.candleSticks.getSingleOHLCV("high"),
            low: context.candleSticks.getSingleOHLCV("low"),
            close: context.candleSticks.getSingleOHLCV("close"),
            startIdx: 0,
            endIdx: context.candleSticks.items.length - 1,
            optInTimePeriod: this.period

        })
        context.candleSticks.addIndicator(this.cfg.id, PDIArray)
    }
}
export class MinusDi extends Indicator implements IIndicator {
    constructor(cfg: IndicatorConfig, public period: number) {
        super(cfg);
    }
    async calculate(context: IIndicatorCalculationContext) {
        const MDIArray = await TalibWrapperEx.execute({
            name: this.cfg.name,
            high: context.candleSticks.getSingleOHLCV("high"),
            low: context.candleSticks.getSingleOHLCV("low"),
            close: context.candleSticks.getSingleOHLCV("close"),
            startIdx: 0,
            endIdx: context.candleSticks.items.length - 1,
            optInTimePeriod: this.period

        })
        context.candleSticks.addIndicator(this.cfg.id, MDIArray)
    }
}

export class ATR extends Indicator implements IIndicator {
    constructor(cfg: IndicatorConfig, public period: number) {
        super(cfg);
    }
    async calculate(context: IIndicatorCalculationContext) {
        const ATRArray = await TalibWrapperEx.execute({
            name: this.cfg.name,
            high: context.candleSticks.getSingleOHLCV("high"),
            low: context.candleSticks.getSingleOHLCV("low"),
            close: context.candleSticks.getSingleOHLCV("close"),
            startIdx: 0,
            endIdx: context.candleSticks.items.length - 1,
            optInTimePeriod: this.period

        })
        context.candleSticks.addIndicator(this.cfg.id, ATRArray)
    }
}

export class SAREXT extends Indicator implements IIndicator {
    constructor(cfg: IndicatorConfig, public startValue: number, public acceleration: number, public maxAcceleration: number) {
        super(cfg);
    }
    async calculate(context: IIndicatorCalculationContext) {
        const SARArray = await TalibWrapperEx.execute({
            name: this.cfg.name,
            high: context.candleSticks.getSingleOHLCV("high"),
            low: context.candleSticks.getSingleOHLCV("low"),
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

        })
        context.candleSticks.addIndicator(this.cfg.id, SARArray)
    }
}
export class IndicatorProvider {

    constructor(public indicators?: IIndicator[]) {
        this.indicators = indicators || []
    }
    async calculate(candles: CandleStickCollection) {
        const context = new IndicatorCalculationContext(candles)
        context.pass = 0
        for (let pass = 0; pass < 5; pass++) {
            context.pass = pass
            for (let i = 0; i < this.indicators.length; i++) {
                if ((this.indicators[i].pass || 0) == context.pass) {
                    await this.indicators[i].calculate(context)
                }
            }
        }
    }

    addCustomIndicator(i: IIndicator): IndicatorProvider {
        this.indicators.push(i)
        return this
    }
    addEMA(id: string, period: number): IndicatorProvider {
        this.indicators.push(new EMA({ name: "EMA", id: id }, period))
        return this
    }
    addADX(id: string, period: number): IndicatorProvider {
        this.indicators.push(new ADX({ name: "ADX", id: id }, period))
        return this
    }
    addPlusDi(id: string, period: number): IndicatorProvider {
        this.indicators.push(new PlusDi({ name: "PLUS_DI", id: id }, period))
        return this
    }
    addMinusDi(id: string, period: number): IndicatorProvider {
        this.indicators.push(new MinusDi({ name: "MINUS_DI", id: id }, period))
        return this
    }
    addATR(id: string, period: number): IndicatorProvider {
        this.indicators.push(new ATR({ name: "ATR", id: id }, period))
        return this
    }
    addSAREXT(id: string, startValue: number, acceleration: number, maxAcceleration: number): IndicatorProvider {
        this.indicators.push(new SAREXT({ name: "SAREXT", id: id }, startValue, acceleration, maxAcceleration))
        return this
    }

}



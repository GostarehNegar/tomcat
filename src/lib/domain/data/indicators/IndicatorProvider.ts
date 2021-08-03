import { CandleStickCollection } from '../../base/internals/CandleStickCollection'
export type IIndicator = {
    name: string,
    param1: number | string,

}
export interface IIndicatorEx {
    calculate(data: CandleStickCollection);
}
export class Indicator {

}
export class IndicatorFactory {
    create(indicator: IIndicator): IIndicatorEx {
        switch (indicator.name) {
            case "EMA":
                return new EMA(indicator)
            case "ADX":
                return new ADX(indicator)
            default:
                return null;
        }
    }
}
export class EMA implements IIndicatorEx {
    constructor(public d: IIndicator) {

    }
    calculate(data: CandleStickCollection) {
        (data)
        data.items[0].indicators.EMA = 10
        throw new Error('Method not implemented.')
    }
}
export class ADX implements IIndicatorEx {
    constructor(public d: IIndicator) {

    }
    calculate(data: CandleStickCollection) {
        (data)
        throw new Error('Method not implemented.')
    }
}
export class IndicatorProvider {
    constructor(public indicators: IIndicator[]) {

    }
    calculate(candles: CandleStickCollection) {

        const factory = new IndicatorFactory()
        this.indicators.map((i) => {
            factory.create(i).calculate(candles)
        })
    }
}
const a = new IndicatorProvider([{ name: "EMA", param1: 5 }])
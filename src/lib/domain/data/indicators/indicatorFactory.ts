import { IIndicator } from "./IIndicator";
import { ADX, ATR, EMA, MinusDi, PlusDi, SAREXT } from "./talib-indicators";
// import { IIndicator } from "./IIndicator";

// export class IndicatorFactory {
//     public static getIndicatorProvider(cxt: IStrategyContext): IndicatorProvider {

//         const indicatorProvider = new IndicatorProvider()
//             .addADX(cxt.adx.id || "ADX14", cxt.adx.period || 14)
//             .addATR(cxt.atr.id || "ATR14", cxt.atr.period || 14)
//             .addPlusDi(cxt.plusDi.id || "PDI14", cxt.minusDi.period || 14)
//             .addMinusDi(cxt.minusDi.id || "MDI14", cxt.minusDi.period || 14)
//             .addSAREXT(cxt.sar.id || "SAR", cxt.sar.startIndex || 0.02, cxt.sar.acceleration || 0.005, cxt.sar.maxAcceleration || 0.2)
//         console.log(indicatorProvider);

//         return indicatorProvider
//     }
// }
export class Indicators {
    public static ADX(period: number): IIndicator {
        return new ADX(period)
    }
    public static ATR(period: number): IIndicator {
        return new ATR(period)
    }
    public static MinusDi(period: number): IIndicator {
        return new MinusDi(period)
    }
    public static PlusDi(period: number): IIndicator {
        return new PlusDi(period)
    }
    public static SAREXT(startIndex: number, acceleration: number, maxAcceleration: number): IIndicator {
        return new SAREXT(startIndex, acceleration, maxAcceleration)
    }
    public static EMA(period: number): IIndicator {
        return new EMA(period)
    }
}
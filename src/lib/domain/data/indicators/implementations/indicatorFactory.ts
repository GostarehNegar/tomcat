import { IStrategyContext } from "../../../bot";

import { IndicatorProvider } from "./IndicatorProvider";

export class IndicatorFactory {
    public static getIndicatorProvider(cxt: IStrategyContext): IndicatorProvider {
        const indicatorProvider = new IndicatorProvider()
            .addADX(cxt.adx.id || "ADX14", cxt.adx.period || 14)
            .addATR(cxt.atr.id || "ATR14", cxt.atr.period || 14)
            .addPlusDi(cxt.plusDi.id || "PDI14", cxt.minusDi.period || 14)
            .addMinusDi(cxt.minusDi.id || "MDI14", cxt.minusDi.period || 14)
            .addSAREXT(cxt.sar.id || "SAR", cxt.sar.startIndex || 0.02, cxt.sar.acceleration || 0.005, cxt.sar.maxAcceleration || 0.2)
        return indicatorProvider
    }
}
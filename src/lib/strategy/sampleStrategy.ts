import { CandleStickData } from "../common"

export const sampleStrategy = (candle: CandleStickData) => {
    (candle);
    // const indicator = candle.indicators
    // let result = ''
    // if (
    //     candle && !candle.isMissing &&
    //     indicator &&
    //     indicator.has(indicators.plusDi, indicators.minusDi, indicators.adxSlope, indicators.isSarAbove)
    // ) {
    //     if (
    //         indicator.getBoolValue(indicators.isSarAbove) == false &&
    //         indicator.getNumberValue(indicators.plusDi) > (indicator.getNumberValue(indicators.minusDi) + 5) &&
    //         indicator.getValue(indicators.adxSlope) > 1
    //     ) {
    //         // const buyOrder: IStrategySignal = { candle: candle }
    //         result = "openLong"
    //         // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.openLongSignal}`, buyOrder).publish();
    //     } else if (
    //         indicator.getBoolValue(indicators.isSarAbove) == true &&
    //         indicator.getNumberValue(indicators.plusDi) < (indicator.getNumberValue(indicators.minusDi) - 5) &&
    //         indicator.getNumberValue(indicators.adxSlope) > 1
    //     ) {
    //         // const sellOrder: IStrategySignal = { candle: candle }
    //         result = 'openShort'
    //         // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.openShortSignal}`, sellOrder).publish();
    //     }
    //     else if (
    //         indicator.getBoolValue(indicators.isSarAbove) == true ||
    //         indicator.getNumberValue(indicators.plusDi) < (indicator.getNumberValue(indicators.minusDi) - 5) ||
    //         // > -5
    //         indicator.getNumberValue(indicators.adxSlope) < -5
    //     ) {
    //         // const sellOrder: IStrategySignal = { candle: candle }
    //         result = 'closeLong'
    //         // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.closeLongSignal}`, sellOrder).publish();
    //     }
    //     else if (
    //         indicator.getBoolValue(indicators.isSarAbove) == false ||
    //         indicator.getNumberValue(indicators.plusDi) > (indicator.getNumberValue(indicators.minusDi) + 5) ||
    //         // > -5
    //         indicator.getNumberValue(indicators.adxSlope) < -5
    //     ) {
    //         // const sellOrder: IStrategySignal = { candle: candle }
    //         result = 'closeShort'
    //         // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.closeShortSignal}`, sellOrder).publish();
    //     }
    // }
    // return result
}

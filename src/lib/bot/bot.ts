
import { CandleStickData, Signals } from "../common";
import { Signal } from "../common/Signal";
import * as Indicators from "../indicators";
import { baseUtils, Ticks } from "../infrastructure/base";
import { IFilter, Pipeline } from "../pipes";
import { Stream } from "../streams";
import { Wallet } from "../wallet";

const isSarAbove: Indicators.IIndicator = {

import { CandleStickData, States, Symbols } from "../common";
import * as _Indicators from "../indicators";
import { baseUtils, Ticks } from "../infrastructure/base";
import { IFilter, Pipeline } from "../pipes";
import { Stream } from "../streams";
import { Order, Wallet } from "../wallet";
// _Indicators.ADX()
const isSarAbove: _Indicators.IIndicator = {

    id: "isSARAbove",
    handler: async (candle: CandleStickData) => {
        const median = (candle.high + candle.low) / 2;
        if (
            candle.indicators &&
            candle.indicators.has(_Indicators.SAR()) &&
            candle.indicators.getNumberValue(_Indicators.SAR()) < median
        ) {
            candle.indicators.setValue(isSarAbove, false)
        } else if (
            candle.indicators &&
            candle.indicators.has(_Indicators.SAR()) &&
            candle.indicators.getValue(_Indicators.SAR()) > median
        ) {
            candle.indicators.setValue(isSarAbove, true)
        }

    },
};

const stopLossAtr: _Indicators.IIndicator = {
    id: "stopLossAtr",
    handler: async (candle: CandleStickData) => {
        if (candle.indicators && candle.indicators.has(_Indicators.ATR())) {
            candle.indicators.setValue(stopLossAtr, 1.25 * candle.indicators.getNumberValue(_Indicators.ATR()))
        }
    },
};

const adxSlope: _Indicators.IIndicator = {
    id: "adxSlope",
    handler: async (candle: CandleStickData, THIS: IFilter) => {
        const candles = THIS.getScaler('4h').push(candle)
        const previousCandle = candles.length > 1 ? candles.items[candles.length - 2] : null
        if (previousCandle &&
            candle.indicators &&
            candle.indicators.has(_Indicators.ADX()) &&
            previousCandle.indicators &&
            previousCandle.indicators.has(_Indicators.ADX())
        ) {
            const res = ((candle.indicators.getNumberValue(_Indicators.ADX()) - previousCandle.indicators.getNumberValue(_Indicators.ADX())) / previousCandle.indicators.getNumberValue(_Indicators.ADX())) * 100
            candle.indicators.setValue(adxSlope, res)
        }
    },
};



const indicators = { ADX: Indicators.ADX(), ATR: Indicators.ATR(), SAR: Indicators.SAR(), minusDi: Indicators.MDI(), plusDi: Indicators.PDI(), isSarAbove: isSarAbove, adxSlope: adxSlope, stopLossAtr: stopLossAtr }

const strategy = (candle: CandleStickData): Signal => {

const indicatorsEX = { ADX: _Indicators.ADX(), ATR: _Indicators.ATR(), SAR: _Indicators.SAR(), minusDi: _Indicators.MDI(), plusDi: _Indicators.PDI(), isSarAbove: isSarAbove, adxSlope: adxSlope, stopLossAtr: stopLossAtr }
const strategy = (candle: CandleStickData) => {

    const indicator = candle.indicators
    let result: Signals = ''
    let reason = ''
    if (
        candle && !candle.isMissing &&
        indicator &&
        indicator.has(indicatorsEX.plusDi, indicatorsEX.minusDi, indicatorsEX.adxSlope, indicatorsEX.isSarAbove)
    ) {
        if (
            indicator.getBoolValue(indicatorsEX.isSarAbove) == false &&
            indicator.getNumberValue(indicatorsEX.plusDi) > (indicator.getNumberValue(indicatorsEX.minusDi) + 5) &&
            indicator.getValue(indicatorsEX.adxSlope) > 1
        ) {
            // const buyOrder: IStrategySignal = { candle: candle }
            result = "openLong"
            // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.openLongSignal}`, buyOrder).publish();
        } else if (
            indicator.getBoolValue(indicatorsEX.isSarAbove) == true &&
            indicator.getNumberValue(indicatorsEX.plusDi) < (indicator.getNumberValue(indicatorsEX.minusDi) - 5) &&
            indicator.getNumberValue(indicatorsEX.adxSlope) > 1
        ) {
            // const sellOrder: IStrategySignal = { candle: candle }
            result = 'openShort'
            // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.openShortSignal}`, sellOrder).publish();
        }
        else if (
            indicator.getBoolValue(indicatorsEX.isSarAbove) == true ||
            indicator.getNumberValue(indicatorsEX.plusDi) < (indicator.getNumberValue(indicatorsEX.minusDi) - 5) ||
            // > -5
            indicator.getNumberValue(indicatorsEX.adxSlope) < -5
        ) {
            // const sellOrder: IStrategySignal = { candle: candle }
            result = 'closeLong'
            reason = indicator.getBoolValue(indicators.isSarAbove) == true
                ? 'sarAbove' :
                indicator.getNumberValue(indicators.plusDi) < (indicator.getNumberValue(indicators.minusDi) - 5)
                    ? 'plusDi in greater than minusDi' :
                    indicator.getNumberValue(indicators.adxSlope) < -5
                        ? 'adxSlope less than -5' :
                        ''
            // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.closeLongSignal}`, sellOrder).publish();
        }
        else if (
            indicator.getBoolValue(indicatorsEX.isSarAbove) == false ||
            indicator.getNumberValue(indicatorsEX.plusDi) > (indicator.getNumberValue(indicatorsEX.minusDi) + 5) ||
            // > -5
            indicator.getNumberValue(indicatorsEX.adxSlope) < -5
        ) {
            // const sellOrder: IStrategySignal = { candle: candle }
            result = 'closeShort'
            reason = indicator.getBoolValue(indicators.isSarAbove) == false
                ? 'sarBelow'
                : indicator.getNumberValue(indicators.plusDi) > (indicator.getNumberValue(indicators.minusDi) + 5)
                    ? "plusDi in greater than minusDi"
                    : indicator.getNumberValue(indicators.adxSlope) < -5
                        ? 'adxSlope is less than -5'
                        : ''
            // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.closeShortSignal}`, sellOrder).publish();
        }
    }
    const signal = new Signal(result, candle, candle.indicators.getNumberValue(indicators.stopLossAtr))
    signal.reason = reason
    return signal
}
export class Strategy {
    name: string
    candle: CandleStickData
}

export class Bot {
    public wallet: Wallet
    constructor() {
        this.wallet = new Wallet(1000, null, 'BTCUSDT')
    }
    public get indicators() {
        return { ADX: _Indicators.ADX(), ATR: _Indicators.ATR(), SAR: _Indicators.SAR(), minusDi: _Indicators.MDI(), plusDi: _Indicators.PDI(), isSarAbove: isSarAbove, adxSlope: adxSlope, stopLossAtr: stopLossAtr }
    }
    run(startTime: Ticks, endTime: Ticks) {
        (endTime);
        const pipeline = new Pipeline()
        // const time = 1633174260000

        pipeline.from('binance', 'spot', 'BTCUSDT', '1m')
            .add(this.indicators.ADX)
            .add(this.indicators.minusDi)
            .add(this.indicators.ATR)
            .add(this.indicators.SAR)
            .add(this.indicators.plusDi)
            .add(isSarAbove)
            .add(adxSlope)
            .add(stopLossAtr, { stream: true, name: "Indicators" })
            .add(async (candle, THIS) => {

                THIS.context.stream = THIS.context.stream || new Stream<Strategy>("strategy-BT-01")

                THIS.services.getService("gdyuf")
                THIS.context.stream = THIS.context.stream || new Stream<Strategy>("strategy-BT-20")

                const stream = THIS.context.stream as Stream<Strategy>
                const res = await strategy(candle)
                await stream.write(baseUtils.toTimeEx(candle.openTime), { name: res.signal, candle: candle })
                if (res.signal && candle.openTime >= baseUtils.toTimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0)).ticks) {
                    await this.wallet.onSignal(res)
                }
            })
            .add(async (candle) => {
                if (candle.openTime == endTime) {
                    pipeline.stop()
                }
            })
        pipeline.start(startTime)
    }
}

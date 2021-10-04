import { Ticks, utils } from "../../base";
import { CandleStickData, States, Symbols } from "../base";
import { Stream } from "../data";
import * as Indicators from "../indicators";
import { IFilter, Pipeline } from "../strategy";
import { Order, Wallet } from "../wallet";

const isSarAbove: Indicators.IIndicator = {
    id: "isSARAbove",
    handler: async (candle: CandleStickData) => {
        const median = (candle.high + candle.low) / 2;
        if (
            candle.indicators &&
            candle.indicators.has(Indicators.SAR()) &&
            candle.indicators.getNumberValue(Indicators.SAR()) < median
        ) {
            candle.indicators.setValue(isSarAbove, false)
        } else if (
            candle.indicators &&
            candle.indicators.has(Indicators.SAR()) &&
            candle.indicators.getValue(Indicators.SAR()) > median
        ) {
            candle.indicators.setValue(isSarAbove, true)
        }

    },
};

const stopLossAtr: Indicators.IIndicator = {
    id: "stopLossAtr",
    handler: async (candle: CandleStickData) => {
        if (candle.indicators && candle.indicators.has(Indicators.ATR())) {
            candle.indicators.setValue(stopLossAtr, 1.25 * candle.indicators.getNumberValue(Indicators.ATR()))
        }
    },
};

const adxSlope: Indicators.IIndicator = {
    id: "adxSlope",
    handler: async (candle: CandleStickData, THIS: IFilter) => {
        const candles = THIS.getScaler('4h').push(candle)
        const previousCandle = candles.length > 1 ? candles.items[candles.length - 2] : null
        if (previousCandle &&
            candle.indicators &&
            candle.indicators.has(Indicators.ADX()) &&
            previousCandle.indicators &&
            previousCandle.indicators.has(Indicators.ADX())
        ) {
            const res = ((candle.indicators.getNumberValue(Indicators.ADX()) - previousCandle.indicators.getNumberValue(Indicators.ADX())) / previousCandle.indicators.getNumberValue(Indicators.ADX())) * 100
            candle.indicators.setValue(adxSlope, res)
        }
    },
};

const indicators = { ADX: Indicators.ADX(), ATR: Indicators.ATR(), SAR: Indicators.SAR(), minusDi: Indicators.MDI(), plusDi: Indicators.PDI(), isSarAbove: isSarAbove, adxSlope: adxSlope, stopLossAtr: stopLossAtr }

const strategy = async (candle: CandleStickData) => {
    const indicator = candle.indicators
    let result = ''
    if (
        indicator &&
        indicator.has(indicators.plusDi, indicators.minusDi, indicators.adxSlope, indicators.isSarAbove)
    ) {
        if (
            indicator.getBoolValue(indicators.isSarAbove) == false &&
            indicator.getNumberValue(indicators.plusDi) > (indicator.getNumberValue(indicators.minusDi) + 5) &&
            indicator.getValue(indicators.adxSlope) > 1
        ) {
            // const buyOrder: IStrategySignal = { candle: candle }
            result = "openLong"
            // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.openLongSignal}`, buyOrder).publish();
        } else if (
            indicator.getBoolValue(indicators.isSarAbove) == true &&
            indicator.getNumberValue(indicators.plusDi) < (indicator.getNumberValue(indicators.minusDi) - 5) &&
            indicator.getNumberValue(indicators.adxSlope) > 1
        ) {
            // const sellOrder: IStrategySignal = { candle: candle }
            result = 'openShort'
            // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.openShortSignal}`, sellOrder).publish();
        }
        else if (
            indicator.getBoolValue(indicators.isSarAbove) == true ||
            indicator.getNumberValue(indicators.plusDi) < (indicator.getNumberValue(indicators.minusDi) - 5) ||
            // > -5
            indicator.getNumberValue(indicators.adxSlope) < -5
        ) {
            // const sellOrder: IStrategySignal = { candle: candle }
            result = 'closeLong'
            // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.closeLongSignal}`, sellOrder).publish();
        }
        else if (
            indicator.getBoolValue(indicators.isSarAbove) == false ||
            indicator.getNumberValue(indicators.plusDi) > (indicator.getNumberValue(indicators.minusDi) + 5) ||
            // > -5
            indicator.getNumberValue(indicators.adxSlope) < -5
        ) {
            // const sellOrder: IStrategySignal = { candle: candle }
            result = 'closeShort'
            // await this.bus.createMessage(`${jobContext.streamID}/${MessageNames.closeShortSignal}`, sellOrder).publish();
        }
    }
    return result
}

export type Strategy = {
    name: string;
    candle: CandleStickData
}


export class MyBot {
    public state: States
    public wallet: Wallet
    public symbol: Symbols;
    constructor() {
        this.wallet = new Wallet(1000, null)
        this.state = 'open'
        this.symbol = 'BTCUSDT'
    }
    public get indicators() {
        return { ADX: Indicators.ADX(), ATR: Indicators.ATR(), SAR: Indicators.SAR(), minusDi: Indicators.MDI(), plusDi: Indicators.PDI(), isSarAbove: isSarAbove, adxSlope: adxSlope, stopLossAtr: stopLossAtr }
    }
    run(startTime: Ticks, endTime: Ticks) {
        const pipeline = new Pipeline()
        // const time = 1633174260000

        pipeline.from('binance', 'spot', 'BTCUSDT', '1m', 'Bot-184')
            .add(this.indicators.ADX)
            .add(this.indicators.minusDi)
            .add(this.indicators.ATR)
            .add(this.indicators.SAR)
            .add(this.indicators.plusDi)
            .add(isSarAbove)
            .add(adxSlope)
            .add(stopLossAtr, { stream: true, name: "Indicators" })
            .add(async (candle, THIS) => {
                THIS.context.stream = THIS.context.stream || new Stream<Strategy>("strategy")
                const stream = THIS.context.stream as Stream<Strategy>
                const res = await strategy(candle)
                await stream.write(utils.toTimeEx(candle.openTime), { name: res, candle: candle })
                if (res) {
                    await this.onData(res, candle)
                }
            })
            .add(async (candle) => {
                if (candle.openTime == endTime) {
                    pipeline.stop()
                }
            })
        pipeline.start(startTime)
    }
    async onData(res: string, targetCandle: CandleStickData) {
        // const res = await this.strategy.exec(jobContext)
        // const targetCandle = jobContext.candles.lastCandle
        switch (res) {
            case "openShort":
                this.openShort(targetCandle)
                break;
            case "openLong":
                this.openLong(targetCandle)
                break;
            case "closeShort":
                this.closeShort(targetCandle)
                break;
            case "closeLong":
                this.closeLong(targetCandle)
                break;
            default:
                break;
        }
    }
    async openLong(candle: CandleStickData) {
        if (this.state == 'open') {
            const price = candle.close
            //better calculation
            //stopLoss implementation
            const amount = ((0.03 * this.wallet.balance) * candle.indicators.getNumberValue(this.indicators.stopLossAtr) / candle.close)
            this.wallet.leverage = candle.indicators.getNumberValue(this.indicators.stopLossAtr)
            const orderEX = new Order(this.symbol, 'buy', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            // const report: IReportContext = { order: orderEX, candle: candle, state: 'openLong' }
            // await this.bus.publish(Messages.openLongReportMessage(jobContext.streamID, report));
            // await this.bus.createMessage("Bot/Report", report).publish()
            this.state = 'openLong'
        }
        else if (this.state == 'openShort') {
            await this.closeShort(candle, true)
            this.state = 'open'
        }
    }
    async openShort(candle: CandleStickData) {
        if (this.state == 'open') {
            const price = candle.close
            const amount = ((0.03 * this.wallet.balance) * candle.indicators.getNumberValue(this.indicators.stopLossAtr)) / candle.close
            this.wallet.leverage = candle.indicators.getNumberValue(this.indicators.stopLossAtr)
            const orderEX = new Order(this.symbol, 'sell', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            // const report: IReportContext = { order: orderEX, candle: candle, state: 'openShort' }
            // await this.bus.publish(Messages.openShortReportMessage(jobContext.streamID, report));
            // await this.bus.createMessage("Bot/Report", report).publish()
            this.state = 'openShort'
        }
        else if (this.state == 'openLong') {
            await this.closeLong(candle, true)
            this.state = 'open'
        }
    }
    async closeLong(candle: CandleStickData, closingOpenposition = false) {
        if (this.state == 'openLong') {
            const price = candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'sell', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            if (!closingOpenposition) {
                // const report: IReportContext = { order: orderEX, candle: candle, state: "closeLong" }
                // await this.bus.publish(Messages.closeLongReportMessage(jobContext.streamID, report));
                // await this.bus.createMessage("Bot/Report", report).publish()
            } else {
                // const report: IReportContext = { order: orderEX, candle: candle, state: "openShort" }
                // await this.bus.publish(Messages.openShortReportMessage(jobContext.streamID, report));
                // await this.bus.createMessage("Bot/Report", report).publish()
            }
            this.state = 'open'
        }
    }
    async closeShort(candle: CandleStickData, closingOpenposition = false) {
        if (this.state == 'openShort') {
            const price = candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'buy', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)

            if (!closingOpenposition) {
                // const report: IReportContext = { order: orderEX, candle: candle, state: "closeShort" }
                // await this.bus.publish(Messages.closeShortReportMessage(jobContext.streamID, report));
                // await this.bus.createMessage("Bot/Report", report).publish()
            }
            else {
                // const report: IReportContext = { order: orderEX, candle: candle, state: "openLong" }
                // await this.bus.publish(Messages.openLongReportMessage(jobContext.streamID, report));
                // await this.bus.createMessage("Bot/Report", report).publish()
            }
            this.state = 'open'
        }
    }
}

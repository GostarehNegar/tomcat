

import { utils } from "../../base";
import { IMessageBus } from "../../bus";
import { CandleStickCollection, CandleStickData } from "../base";
import { States } from "../base/States";
import { Symbols } from "../base/Symbols";
import { IIndicator } from "../data";
import { DataProvider } from "../data/sources/DataProvider";
import { BaseStrategy } from "../strategy/strategy";
import { Order, Wallet } from "../wallet/wallet";

import { Messages } from "./messages";

import { JobContext, JobOrder } from ".";



export interface IStrategyContext {
    startTime: number,
    endTime: number,
    adx?: { id: string, period: number },
    atr?: { id: string, period: number },
    minusDi?: { id: string, period: number },
    plusDi?: { id: string, period: number },
    sar?: { id: string, startIndex: number, acceleration: number, maxAcceleration: number }
    customIndicators?: IIndicator[],
}

export interface IReportContext {
    candle: CandleStickData,
    order: Order,
    state: string
}
export class Bot {
    public logger = utils.getLogger("Bot")
    private _stop = false;
    public symbol: Symbols;
    public state: States
    public wallet: Wallet
    public strategy: BaseStrategy
    constructor(public bus: IMessageBus) {
        this.strategy = new BaseStrategy(this.bus, null)
        this.wallet = new Wallet(10000, this.bus)
        this.symbol = "BTCUSDT"
        this.state = 'open'

    }
    stop() {
        this._stop = true
    }
    async start(jobOrder: JobOrder) {

        let now = utils.toTimeEx(jobOrder.startTime).roundToMinutes(1)
        const endTime = utils.ticks(jobOrder.endTime)
        const jobContext = new JobContext(this.bus)
        const candles = new CandleStickCollection([])
        const dataProvider = new DataProvider("binance", "spot", "BTCUSDT", "1m")
        let targetStart = now.floorToMinutes(4 * 60)
        let targetEnd = targetStart.addMinutes(4 * 60)
        const runner = async () => {
            if (now.addMinutes(1).ticks > Date.now()) { return }
            const lastCandle = candles.length == 0 ? null : candles.items[candles.length - 1]

            if (lastCandle && lastCandle.openTime == targetEnd.addMinutes(-1).ticks) {
                candles.clear()
                targetStart = targetEnd
                targetEnd = targetStart.addMinutes(4 * 60)
                const date = utils.toTimeEx(jobContext.candles.lastCandle.closeTime).asUTCDate

                this.logger.log(`4 hour candle has been pushed ${date}`)
            }
            const candle = await dataProvider.getExactCandle(now.ticks)
            if (candle !== null) {
                candles.push(candle)
                const didMerge = candles.merge()
                if (didMerge) {
                    jobContext.candles.push(didMerge)
                    jobContext.indicatorCalculationContext.lastCandle = true
                    jobContext.indicatorCalculationContext.time = now.ticks
                    await this.onData(jobContext)
                }
                // this.logger.log(`pushed a candle at ${now.toString()}`)

            }
            now = now.addMinutes(1)

        }
        let finish = false
        await this.bus.publish(Messages.startMessage(jobContext.streamID, Date.now()));
        while (!finish) {
            try {

                await runner()
                await utils.delay(10)
            } catch (err) {
                console.error(err);
                if (err.code == "internetConnection") {
                    console.warn("Waiting for internet connection...");
                    await utils.waitForInternetConnection()
                }
            }
            finish = this._stop || (endTime && now.ticks > endTime)
        }
        return jobContext
    }

    async onData(jobContext: JobContext) {
        const res = await this.strategy.exec(jobContext)
        const targetCandle = jobContext.candles.lastCandle
        switch (res) {
            case "openShort":
                this.openShort(targetCandle, jobContext)
                break;
            case "openLong":
                this.openLong(targetCandle, jobContext)
                break;
            case "closeShort":
                this.closeShort(targetCandle, jobContext)
                break;
            case "closeLong":
                this.closeLong(targetCandle, jobContext)
                break;
            default:
                break;
        }
    }
    async openLong(candle: CandleStickData, jobContext: JobContext) {
        if (this.state == 'open') {
            const price = candle.close
            const amount = ((0.03 * this.wallet.balance) * candle.indicators.getNumberValue(this.strategy.indicators.stopLossAtr) / candle.close)
            this.wallet.leverage = candle.indicators.getNumberValue(this.strategy.indicators.stopLossAtr)
            const orderEX = new Order(this.symbol, 'buy', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            const report: IReportContext = { order: orderEX, candle: candle, state: 'openLong' }
            await this.bus.publish(Messages.openLongMessage(jobContext.streamID, report));
            // await this.bus.createMessage("Bot/Report", report).publish()
            this.state = 'openLong'
        }
        else if (this.state == 'openShort') {
            await this.closeShort(candle, jobContext, true)
            this.state = 'open'
        }
    }
    async openShort(candle: CandleStickData, jobContext: JobContext) {
        if (this.state == 'open') {
            const price = candle.close
            const amount = ((0.03 * this.wallet.balance) * candle.indicators.getNumberValue(this.strategy.indicators.stopLossAtr)) / candle.close
            this.wallet.leverage = candle.indicators.getNumberValue(this.strategy.indicators.stopLossAtr)
            const orderEX = new Order(this.symbol, 'sell', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            const report: IReportContext = { order: orderEX, candle: candle, state: 'openShort' }
            await this.bus.publish(Messages.openShortMessage(jobContext.streamID, report));
            // await this.bus.createMessage("Bot/Report", report).publish()
            this.state = 'openShort'
        }
        else if (this.state == 'openLong') {
            await this.closeLong(candle, jobContext, true)
            this.state = 'open'
        }
    }
    async closeLong(candle: CandleStickData, jobContext: JobContext, closingOpenposition = false) {
        if (this.state == 'openLong') {
            const price = candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'sell', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            if (!closingOpenposition) {
                const report: IReportContext = { order: orderEX, candle: candle, state: "closeLong" }
                await this.bus.publish(Messages.closeLongMessage(jobContext.streamID, report));
                // await this.bus.createMessage("Bot/Report", report).publish()
            } else {
                const report: IReportContext = { order: orderEX, candle: candle, state: "openShort" }
                await this.bus.publish(Messages.openShortMessage(jobContext.streamID, report));
                // await this.bus.createMessage("Bot/Report", report).publish()
            }
            this.state = 'open'
        }
    }
    async closeShort(candle: CandleStickData, jobContext: JobContext, closingOpenposition = false) {
        if (this.state == 'openShort') {
            const price = candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'buy', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)

            if (!closingOpenposition) {
                const report: IReportContext = { order: orderEX, candle: candle, state: "closeShort" }
                await this.bus.publish(Messages.closeShortMessage(jobContext.streamID, report));
                // await this.bus.createMessage("Bot/Report", report).publish()
            }
            else {
                const report: IReportContext = { order: orderEX, candle: candle, state: "openLong" }
                await this.bus.publish(Messages.openLongMessage(jobContext.streamID, report));
                // await this.bus.createMessage("Bot/Report", report).publish()
            }
            this.state = 'open'
        }
    }
}

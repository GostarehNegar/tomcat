
import { IndicatorCalculationContext } from "..";
import { IIndicator, Ticks, utils } from "../..";
import { IMessageBus } from "../../bus";
import { CandleStickCollection } from "../base";
import { ICandleStickData } from "../base/ICandleStickData";
import { States } from "../base/States";
import { Symbols } from "../base/Symbols";
import { DataProvider } from "../data/sources/DataProvider";
import { BaseStrategy } from "../strategy/strategy";
import { Order, Wallet } from "../wallet/wallet";


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

// export class Bot_deprecated {
//     public state: States
//     public wallet: Wallet;
//     public dataProvider: IDataProvider
//     public strategy: IStrategy;
//     public market: Markets;
//     public symbol: Symbols;
//     constructor(public bus: IMessageBus) {
//         this.state = 'open'
//         this.wallet = new Wallet(10000, this.bus)
//     }
//     addDataProvider(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals) {
//         this.symbol = symbol
//         this.market = market
//         this.dataProvider = new DataProvider(exchange, market, symbol, interval)
//         return this
//     }
//     addStrategy(name) {
//         this.strategy = StrategyFactory.getStrategy(name, this.bus, this.dataProvider)
//         this.bus.subscribe(this.strategy.stream + "/openLong", async (cxt) => {
//             await this.openLong(cxt.message.payload as IStrategySignal)
//         })
//         this.bus.subscribe(this.strategy.stream + "/openShort", async (cxt) => {
//             await this.openShort(cxt.message.payload as IStrategySignal)

//         })
//         this.bus.subscribe(this.strategy.stream + "/closeLong", async (cxt) => {
//             await this.closeLong(cxt.message.payload as IStrategySignal)

//         })
//         this.bus.subscribe(this.strategy.stream + "/closeShort", async (cxt) => {
//             await this.closeShort(cxt.message.payload as IStrategySignal)

//         })
//         return this
//     }
//     async execute(cxt: IStrategyContext) {
//         await this.strategy.run(cxt)
//     }
//     get Strategy() {
//         return this.strategy as BaseStrategyExtended
//     }
//     async openLong(message: IStrategySignal) {
//         if (this.state == 'open') {
//             const price = message.candle.close
//             const amount = ((0.03 * this.wallet.balance) * message.candle.indicators.getNumberValue(this.Strategy.indicators.stopLossAtr) / message.candle.close)
//             this.wallet.leverage = message.candle.indicators.getNumberValue(this.Strategy.indicators.stopLossAtr)
//             // message.candle.indicators_deprecated.stopLossAtr
//             const orderEX = new Order(this.symbol, 'buy', price, amount, message.candle.closeTime)
//             await this.wallet.processOrder(orderEX)
//             await this.emitOrderCreated(message.candle, orderEX, 'openLong')
//             this.state = 'openLong'
//         }
//         else if (this.state == 'openShort') {
//             await this.closeShort(message)
//             this.state = 'open'
//         }
//     }
//     async openShort(message: IStrategySignal) {
//         if (this.state == 'open') {
//             const price = message.candle.close
//             const amount = ((0.03 * this.wallet.balance) * message.candle.indicators.getNumberValue(this.Strategy.indicators.stopLossAtr)) / message.candle.close
//             this.wallet.leverage = message.candle.indicators.getNumberValue(this.Strategy.indicators.stopLossAtr)
//             const orderEX = new Order(this.symbol, 'sell', price, amount, message.candle.closeTime)
//             await this.wallet.processOrder(orderEX)
//             await this.emitOrderCreated(message.candle, orderEX, 'openShort')
//             this.state = 'openShort'
//         }
//         else if (this.state == 'openLong') {
//             await this.closeLong(message, true)
//             this.state = 'open'
//         }
//     }
//     async closeLong(message: IStrategySignal, closingOpenposition = false) {
//         if (this.state == 'openLong') {
//             const price = message.candle.close
//             const latestTrade = this.wallet.getLatestOpenTrade()
//             const amount = latestTrade.quantity
//             const orderEX = new Order(this.symbol, 'sell', price, amount, message.candle.closeTime)
//             await this.wallet.processOrder(orderEX)
//             if (!closingOpenposition) {
//                 await this.emitOrderCreated(message.candle, orderEX, 'closeLong')
//             } else {
//                 await this.emitOrderCreated(message.candle, orderEX, 'openShort')

//             }


//             this.state = 'open'
//         }
//     }
//     async closeShort(message: IStrategySignal, closingOpenposition = false) {
//         if (this.state == 'openShort') {
//             const price = message.candle.close
//             const latestTrade = this.wallet.getLatestOpenTrade()
//             const amount = latestTrade.quantity
//             const orderEX = new Order(this.symbol, 'buy', price, amount, message.candle.closeTime)
//             await this.wallet.processOrder(orderEX)
//             if (!closingOpenposition) {
//                 await this.emitOrderCreated(message.candle, orderEX, 'closeShort')
//             } else {
//                 await this.emitOrderCreated(message.candle, orderEX, 'openLong')
//             }

//             this.state = 'open'
//         }
//     }
//     async emitOrderCreated(candle: ICandleStickData, order: Order, state: string) {
//         await this.bus.createMessage("Bot/stateChange", { candle, order, state }).publish()
//     }

// }
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
    async start(startTime: Ticks, endTime?: Ticks) {
        let now = utils.toTimeEx(startTime).roundToMinutes(1)
        endTime = utils.ticks(endTime)
        const allCandles = new CandleStickCollection([])
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
                const date = utils.toTimeEx(allCandles.lastCandle.closeTime).asUTCDate

                this.logger.log(`4 hour candle has been pushed ${date}`)
            }
            const candle = await dataProvider.getExactCandle(now.ticks)
            if (candle !== null) {
                candles.push(candle)
                const didMerge = candles.merge()
                if (didMerge) {
                    allCandles.push(didMerge)
                    const context = new IndicatorCalculationContext(allCandles)
                    context.lastCandle = true
                    context.time = now.ticks
                    await this.onData(context)
                }

                // this.logger.log(`pushed a candle at ${now.toString()}`)

            }
            now = now.addMinutes(1)

        }
        // setIntervalAsync(runner, 1)
        let finish = false
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
    }
    async onData(context: IndicatorCalculationContext) {
        const res = await this.strategy.exec(context)
        const targetCandle = context.candleSticks.lastCandle
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
    async openLong(candle: ICandleStickData) {
        if (this.state == 'open') {
            const price = candle.close
            const amount = ((0.03 * this.wallet.balance) * candle.indicators.getNumberValue(this.strategy.indicators.stopLossAtr) / candle.close)
            this.wallet.leverage = candle.indicators.getNumberValue(this.strategy.indicators.stopLossAtr)
            const orderEX = new Order(this.symbol, 'buy', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            // await this.emitOrderCreated(candle, orderEX, 'openLong')
            this.state = 'openLong'
        }
        else if (this.state == 'openShort') {
            await this.closeShort(candle)
            this.state = 'open'
        }
    }
    async openShort(candle: ICandleStickData) {
        if (this.state == 'open') {
            const price = candle.close
            const amount = ((0.03 * this.wallet.balance) * candle.indicators.getNumberValue(this.strategy.indicators.stopLossAtr)) / candle.close
            this.wallet.leverage = candle.indicators.getNumberValue(this.strategy.indicators.stopLossAtr)
            const orderEX = new Order(this.symbol, 'sell', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            // await this.emitOrderCreated(candle, orderEX, 'openShort')
            this.state = 'openShort'
        }
        else if (this.state == 'openLong') {
            await this.closeLong(candle, true)
            this.state = 'open'
        }
    }
    async closeLong(candle: ICandleStickData, closingOpenposition = false) {
        (closingOpenposition)
        if (this.state == 'openLong') {
            const price = candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'sell', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            // if (!closingOpenposition) {
            //     await this.emitOrderCreated(candle, orderEX, 'closeLong')
            // } else {
            //     await this.emitOrderCreated(candle, orderEX, 'openShort')

            // }


            this.state = 'open'
        }
    }
    async closeShort(candle: ICandleStickData, closingOpenposition = false) {
        (closingOpenposition)
        if (this.state == 'openShort') {
            const price = candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'buy', price, amount, candle.closeTime)
            await this.wallet.processOrder(orderEX)
            // if (!closingOpenposition) {
            //     await this.emitOrderCreated(candle, orderEX, 'closeShort')
            // } else {
            //     await this.emitOrderCreated(candle, orderEX, 'openLong')
            // }

            this.state = 'open'
        }
    }
}

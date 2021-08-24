import { IMessageBus } from "../../bus";
import { Exchanges, ICandelStickData, Intervals, IStrategySignal, Markets, States, Symbols } from "../base/_interfaces"
import { IDataProvider } from "../data/_interfaces";
import { IIndicator } from "../data/indicators/_interfaces";
import { DataProvider } from "../data/sources/DataProvider";
import { IStrategy } from "../strategy/IStrategy";
import { StrategyFactory } from "../strategy/StrategyFactory";
import { BaseStrategyExtended } from "../strategy/strategy";
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

export class Bot {
    public state: States
    public wallet: Wallet;
    public dataProvider: IDataProvider
    public strategy: IStrategy;
    public market: Markets;
    public symbol: Symbols;
    constructor(public bus: IMessageBus) {
        this.state = 'open'
        this.wallet = new Wallet(10000, this.bus)
    }
    addDataProvider(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals) {
        this.symbol = symbol
        this.market = market
        this.dataProvider = new DataProvider(exchange, market, symbol, interval)
        return this
    }
    addStrategy(name) {
        this.strategy = StrategyFactory.getStrategy(name, this.bus, this.dataProvider)
        this.bus.subscribe(this.strategy.stream + "/openLong", async (cxt) => {
            await this.openLong(cxt.message.payload as IStrategySignal)
        })
        this.bus.subscribe(this.strategy.stream + "/openShort", async (cxt) => {
            await this.openShort(cxt.message.payload as IStrategySignal)

        })
        this.bus.subscribe(this.strategy.stream + "/closeLong", async (cxt) => {
            await this.closeLong(cxt.message.payload as IStrategySignal)

        })
        this.bus.subscribe(this.strategy.stream + "/closeShort", async (cxt) => {
            await this.closeShort(cxt.message.payload as IStrategySignal)

        })
        return this
    }
    async execute(cxt: IStrategyContext) {
        await this.strategy.run(cxt)
    }
    get Strategy() {
        return this.strategy as BaseStrategyExtended
    }
    async openLong(message: IStrategySignal) {
        if (this.state == 'open') {
            const price = message.candle.close
            const amount = ((0.03 * this.wallet.balance) * message.candle.indicators.getNumberValue(this.Strategy.indicators.stopLossAtr) / message.candle.close)
            this.wallet.leverage = message.candle.indicators_deprecated.stopLossAtr
            const orderEX = new Order(this.symbol, 'buy', price, amount, message.candle.closeTime)
            await this.wallet.processOrder(orderEX)
            await this.emitOrderCreated(message.candle, orderEX, 'openLong')
            this.state = 'openLong'
        }
        else if (this.state == 'openShort') {
            await this.closeShort(message)
            this.state = 'open'
        }
    }
    async openShort(message: IStrategySignal) {
        if (this.state == 'open') {
            const price = message.candle.close
            const amount = ((0.03 * this.wallet.balance) * message.candle.indicators.getNumberValue(this.Strategy.indicators.stopLossAtr)) / message.candle.close
            this.wallet.leverage = message.candle.indicators.getNumberValue(this.Strategy.indicators.stopLossAtr)
            const orderEX = new Order(this.symbol, 'sell', price, amount, message.candle.closeTime)
            await this.wallet.processOrder(orderEX)
            await this.emitOrderCreated(message.candle, orderEX, 'openShort')
            this.state = 'openShort'
        }
        else if (this.state == 'openLong') {
            await this.closeLong(message, true)
            this.state = 'open'
        }
    }
    async closeLong(message: IStrategySignal, closingOpenposition = false) {
        if (this.state == 'openLong') {
            const price = message.candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'sell', price, amount, message.candle.closeTime)
            await this.wallet.processOrder(orderEX)
            if (!closingOpenposition) {
                await this.emitOrderCreated(message.candle, orderEX, 'closeLong')
            } else {
                await this.emitOrderCreated(message.candle, orderEX, 'openShort')

            }


            this.state = 'open'
        }
    }
    async closeShort(message: IStrategySignal, closingOpenposition = false) {
        if (this.state == 'openShort') {
            const price = message.candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'buy', price, amount, message.candle.closeTime)
            await this.wallet.processOrder(orderEX)
            if (!closingOpenposition) {
                await this.emitOrderCreated(message.candle, orderEX, 'closeShort')
            } else {
                await this.emitOrderCreated(message.candle, orderEX, 'openLong')
            }

            this.state = 'open'
        }
    }
    async emitOrderCreated(candle: ICandelStickData, order: Order, state: string) {
        await this.bus.createMessage("Bot/stateChange", { candle, order, state }).publish()
    }

}
import { IMessageBus } from "../../bus";
import { Exchanges, Intervals, IStrategySignal, Markets, States, Symbols } from "../base/_interfaces"
import { IDataProvider } from "../data/_interfaces";
import { DataProvider } from "../data/sources/DataProvider";
import { IStrategy } from "../strategy/IStrategy";
import { StrategyFactory } from "../strategy/StrategyFactory";
import { Order, Wallet } from "../wallet/wallet";

export class Bot {
    public state: States
    public wallet: Wallet;
    public dataProvider: IDataProvider
    public strategy: IStrategy;
    public market: Markets;
    public symbol: Symbols;
    constructor(public bus: IMessageBus) {
        this.state = 'open'
        this.wallet = new Wallet(100, this.bus)
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
    async execute(startTime, endTime) {
        await this.strategy.run(startTime, endTime)
    }
    async openLong(message: IStrategySignal) {
        if (this.state == 'open') {
            const price = message.candle.close
            const amount = ((0.03 * this.wallet.balance) * message.candle.indicators.stopLossAtr) / message.candle.close
            this.wallet.leverage = message.candle.indicators.stopLossAtr
            const orderEX = new Order(this.symbol, 'buy', price, amount)
            await this.wallet.processOrder(orderEX)
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
            const amount = ((0.03 * this.wallet.balance) * message.candle.indicators.stopLossAtr) / message.candle.close
            this.wallet.leverage = message.candle.indicators.stopLossAtr
            const orderEX = new Order(this.symbol, 'sell', price, amount)
            await this.wallet.processOrder(orderEX)
            this.state = 'openShort'
        }
        else if (this.state == 'openLong') {
            await this.closeLong(message)
            this.state = 'open'
        }
    }
    async closeLong(message: IStrategySignal) {
        (message)
        if (this.state == 'openLong') {
            const price = message.candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'sell', price, amount)
            await this.wallet.processOrder(orderEX)
            this.state = 'open'
        }
    }
    async closeShort(message: IStrategySignal) {
        (message)

        if (this.state == 'openShort') {
            const price = message.candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new Order(this.symbol, 'buy', price, amount)
            await this.wallet.processOrder(orderEX)
            this.state = 'open'
        }
    }

}
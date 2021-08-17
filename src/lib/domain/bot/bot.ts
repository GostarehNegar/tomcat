import { TimeEx } from "../../base";
import { IMessageBus } from "../../bus";
import { Exchanges, ICandelStickData, Intervals, IStrategySignal, Markets, Positions, Sides, States, Symbols, Types } from "../base/_interfaces"
import { IDataProvider } from "../data/_interfaces";
import { DataProvider } from "../data/sources/DataProvider";
import { TestStrategy } from "../strategy/strategy";
import { OrderEX, WalletEx } from "../wallet/wallet";

export class Order {
    constructor(public candle: ICandelStickData, public market: Markets, public leverage: number, public symbol: Symbols, public position: Positions, public type: Types, public side?: Sides) {
    }
}


export class Bot {
    public state: States
    public wallet: WalletEx;
    public dataProvider: IDataProvider
    public strategy: TestStrategy;
    public market: Markets;
    public symbol: Symbols;
    constructor(public bus: IMessageBus) {
        this.state = 'open'
        this.wallet = new WalletEx(100)
    }
    addDataProvider(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals) {
        this.symbol = symbol
        this.market = market
        this.dataProvider = new DataProvider(exchange, market, symbol, interval)
        return this
    }
    addStrategy() {
        this.strategy = new TestStrategy(this.bus, this.dataProvider);
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
    async run(order: Order) {
        if (this.state == "open" && order.position == 'short' && order.type == 'open') {
            await this.bus.createMessage('signals/bot/openShort', order).publish();
            this.state = 'openShort'
        }

        else if (this.state == "open" && order.position == 'long' && order.type == 'open') {
            await this.bus.createMessage('signals/bot/openLong', order).publish();
            this.state = 'openLong'
        }
        else if (this.state == 'openShort' && order.position == 'short' && order.type == 'close') {
            await this.bus.createMessage('signals/bot/closeShort', order).publish();
            this.state = 'open'
        }
        else if (this.state == 'openLong' && order.position == 'long' && order.type == 'close') {
            await this.bus.createMessage('signals/bot/openLong', order).publish();
            this.state = 'open'
        }
    }
    async execute(startTime, endTime) {
        await this.strategy.run(startTime, endTime)
    }
    async openLong(message: IStrategySignal) {
        if (this.state == 'open') {
            const price = message.candle.close
            const amount = ((0.03 * this.wallet.balance) * message.candle.indicators.stopLossAtr) / message.candle.close
            this.wallet.leverage = message.candle.indicators.stopLossAtr
            const orderEX = new OrderEX(this.symbol, 'buy', price, amount)
            this.wallet.processOrder(orderEX)
            this.state = 'openLong'
        }
        else if (this.state == 'openShort') {
            this.closeShort(message)
            this.state = 'open'
        }
    }
    async openShort(message: IStrategySignal) {
        if (this.state == 'open') {
            const price = message.candle.close
            const amount = ((0.03 * this.wallet.balance) * message.candle.indicators.stopLossAtr) / message.candle.close
            this.wallet.leverage = message.candle.indicators.stopLossAtr
            const orderEX = new OrderEX(this.symbol, 'sell', price, amount)
            this.wallet.processOrder(orderEX)
            this.state = 'openShort'
        }
        else if (this.state == 'openLong') {
            this.closeLong(message)
            this.state = 'open'
        }
    }
    async closeLong(message: IStrategySignal) {
        (message)
        if (this.state == 'openLong') {
            const price = message.candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new OrderEX(this.symbol, 'sell', price, amount)
            this.wallet.processOrder(orderEX)
            this.state = 'open'
        }
    }
    async closeShort(message: IStrategySignal) {
        (message)

        if (this.state == 'openShort') {
            const price = message.candle.close
            const latestTrade = this.wallet.getLatestOpenTrade()
            const amount = latestTrade.quantity
            const orderEX = new OrderEX(this.symbol, 'buy', price, amount)
            this.wallet.processOrder(orderEX)
            this.state = 'open'
        }
    }

}
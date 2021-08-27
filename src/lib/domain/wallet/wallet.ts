import { IMessageBus } from "../../bus"
import { Sides, Symbols } from "../base/_interfaces"

export class Trade {
    constructor(symbol: Symbols, side: Sides, price: number, quantity: number, time: number) {
        this.time = time
        this.symbol = symbol
        this.side = side
        this.price = price
        this.quantity = quantity
    }
    public time;
    public symbol: Symbols;
    public side: Sides;
    public price;
    public quantity;
    public fee;
    public realizedProfit;
    recalculate(prevTrade: Trade) {
        if (prevTrade == null) {
            this.realizedProfit = 0
            return null
        }
        if (this.side == 'buy') {
            this.realizedProfit = ((this.price - prevTrade.price) * this.quantity) * -1
        } else if (this.side == 'sell') {
            this.realizedProfit = (this.price - prevTrade.price) * this.quantity
        }
    }
    public static createFromOrder(order: Order) {
        return new Trade(order.symbol, order.side, order.price, order.amount, order.time)
    }
}
export class Order {
    constructor(symbol: Symbols, side: Sides, price, amount, time) {
        this.time = time
        this.symbol = symbol
        this.side = side
        this.price = price
        this.amount = amount
    }
    public time;
    public symbol: Symbols;
    /**
     * market , limit, take profit.
     */
    public type;
    /**
     * buy or sell
     */
    public side: Sides;
    /**
     * ?
     */
    public average;
    /**
     * close price of candle
     */
    public price;
    /**
     * in BTC
     */
    public executed;
    /**
     * actual BTC
     */
    public amount;
}

export class Wallet {
    public leverage: number;
    public tradeList: Trade[] = []
    constructor(public balance: number, public bus: IMessageBus) { }
    async processOrder(order: Order) {
        if (order == null) {
            throw "order cannot be null"
        }
        if (order.side == 'buy') {
            const trade = Trade.createFromOrder(order)
            this.addTrade(trade)

        }
        if (order.side == 'sell') {
            const trade = Trade.createFromOrder(order)
            this.addTrade(trade)
        }

    }
    addTrade(trade: Trade) {
        const latestTrade = this.getLatestOpenTrade()
        const isValid = latestTrade == null || latestTrade.side != trade.side
        if (isValid) {
            trade.recalculate(latestTrade)
            this.balance += trade.realizedProfit
            this.tradeList.push(trade)
            this.bus.createMessage("Wallet/tradesRegistered", trade).publish()
        } else {
            console.log('mano nabayad bebini')
        }
        return trade

    }
    getLatestOpenTrade() {
        if (this.tradeList.length % 2 == 0) {
            return null
        } else {
            return this.tradeList[this.tradeList.length - 1]
        }
    }
    getCoinBalance() {
        const latestOpen = this.getLatestOpenTrade()
        if (latestOpen) {
            return latestOpen.quantity
        } else {
            return 0
        }
    }
    setLeverage(leverage: number) {
        this.leverage = leverage
    }
    getMargin() {
        const latestTarde = this.getLatestOpenTrade()
        if (latestTarde) {
            return (latestTarde.quantity * latestTarde.price) / this.leverage
        }
        return 0
    }
    toString() {
        return `current balance is ${this.balance} , current coin balance is ${this.getCoinBalance()}\n last position is ${this.getLatestOpenTrade()?.quantity} ${this.getLatestOpenTrade()?.side}`
    }
}

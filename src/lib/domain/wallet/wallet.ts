import { utils } from "../.."
import { ILogger } from "../../base"
import { IMessageBus } from "../../bus"
import { Positions, Sides, Symbols, Types } from "../base/_interfaces"
import { Order } from "../bot/bot"

export class Trade {
    public PNL: number
    constructor(public symbol: Symbols, public position: Positions, public positionSize: number, public price: number, public type: Types, public margin?: number, public leverage?: number, public coin?: number, public fiat?: number, public coinBalance?: number, public fiatBalance?: number) {
    }
}
export class TradeEX {
    public time;
    public symbol: Symbols;
    public side: Sides;
    public price;
    public quantity;
    public fee;
    public realizedProfit;
    recalculate(prevTrade: TradeEX) {
        if (prevTrade == null) {
            return null
        }
        if (this.side == 'buy') {
            this.realizedProfit = ((this.price - prevTrade.price) * this.quantity) * -1
        } else if (this.side == 'sell') {
            this.realizedProfit = (this.price - prevTrade.price) * this.quantity
        }
    }
}
export class OrderEX {
    constructor(symbol: Symbols, side: Sides, price, amount) {
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
    private logger: ILogger
    public tradeList?: TradeCollection
    constructor(public startingBalance: number, public bus: IMessageBus) {
        this.tradeList = new TradeCollection()
        bus.subscribe("signals/bot/*", async (cxt) => {
            this.processOrder(cxt.message.payload as Order)
        })
        this.logger = utils.getLogger("Wallet")
    }
    toString() {
        return `${this.Balance}`
    }
    processOrder(order: Order) {
        if (order.market == "future" && order.position == "long" && order.type == 'open') {
            this.logger.info("A long position was taken")
            const leverage: number = order.leverage
            const margin: number = 0.03 * this.Balance //risk * balance
            const positionSize: number = (leverage * margin) / order.candle.close
            const trade = new Trade(order.symbol, order.position, positionSize, order.candle.close, order.type, margin, leverage, positionSize / order.candle.close)
            trade.fiat = - margin
            this.tradeList.push(trade)
            this.bus.createMessage("wallet/tradesRegistered/openLong", {}).publish()
        }

        else if (order.market == "future" && order.position == "short" && order.type == 'open') {
            this.logger.info("A short position was taken")
            const leverage: number = order.leverage
            const margin: number = 0.03 * this.Balance //risk * balance
            const positionSize: number = (leverage * margin) / order.candle.close
            this.tradeList.push(new Trade(order.symbol, order.position, positionSize, order.candle.close, order.type, margin, leverage))
            this.bus.createMessage("wallet/tradesRegistered/openShort", {}).publish()

        }
        else if (order.market == "future" && order.position == "short" && order.type == 'close') {
            this.logger.info("short position was closed")
            this.tradeList.push(new Trade(order.symbol, order.position, this.tradeList.items[this.tradeList.items.length - 1].positionSize, order.candle.close, order.type))
            this.bus.createMessage("wallet/tradesRegistered/closeShort", {}).publish()

        }
        else if (order.market == "future" && order.position == "long" && order.type == 'close') {
            this.logger.info("long position was closed")
            const trade = new Trade(order.symbol, order.position, this.tradeList.items[this.tradeList.items.length - 1].positionSize, order.candle.close, order.type)
            this.tradeList.push(trade)
            this.bus.createMessage("wallet/tradesRegistered/closeLong", {}).publish()

        }

    }
    get Balance() {

        const balance: number = this.startingBalance + this.tradeList.getPNL()
        return balance

    }
}
export class WalletEx {
    public leverage: number;
    public tradeList: TradeEX[] = []
    constructor(public balance: number) { }
    processOrder(order: OrderEX) {
        if (order == null) {
            throw "order cannot be null"
        }
        if (order.side == 'buy') {
            const trade = new TradeEX()
            trade.price = order.price
            trade.quantity = order.amount
            trade.side = "buy"
            trade.symbol = order.symbol
            this.addTrade(trade)
        }
    }
    addTrade(trade: TradeEX) {
        const latestTrade = this.getLatestOpenTrade()
        const isValid = latestTrade == null || latestTrade.side != trade.side
        if (isValid) {
            trade.recalculate(latestTrade)
            this.balance += trade.realizedProfit
            this.tradeList.push(trade)
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
}

export class TradeCollection {
    constructor(
        public items?: Trade[],
    ) {
        this.items = this.items || []
    }

    getPNL() {
        let PNLSum = 0
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].PNL) {
                PNLSum += this.items[i].PNL
            }
        }
        return PNLSum
    }
    push(trade: Trade) {
        if (trade.type == 'close') {
            if (trade.position == 'long') {
                trade.PNL = (trade.price - this.items[this.items.length - 1].price) * trade.positionSize

            }
            else if (trade.position == 'short') {
                trade.PNL = (trade.price - this.items[this.items.length - 1].price) * trade.positionSize * -1
            }
        }
        this.items.push(trade)
    }
}


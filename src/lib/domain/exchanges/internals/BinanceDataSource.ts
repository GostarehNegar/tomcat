import { CandleStickCollection, ICandelStickData, Intervals, Markets, Symbols } from "../../base";
import { IDataSource } from "../../data/interfaces";
import { BinanceExchange } from "./Binance.Exchange";


export class BinanceDataSource implements IDataSource {
    constructor(public market: Markets, public symbol: Symbols, public interval: Intervals) {

    }
    async getData(startTime: number, endTime: number): Promise<CandleStickCollection> {
        const a = new BinanceExchange()
        return await a.getData(this.market, this.symbol, this.interval, startTime, endTime)
    }
    async getExactCandle(time: number): Promise<ICandelStickData> {
        const a = new BinanceExchange()
        return await a.getExactCandle(this.market, this.symbol, this.interval, time)
    }
    async getLatestCandle(): Promise<ICandelStickData> {
        const a = new BinanceExchange()
        return await a.getLatestCandle(this.market, this.symbol, this.interval)
    }

}
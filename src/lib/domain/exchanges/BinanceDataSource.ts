

import { Ticks, utils } from '../../base';
import { CandleStickCollection, Exchanges, ICandleStickData, Intervals, Markets, Symbols } from '../base';
import { IDataSource } from '../data/base';

import { BinanceExchange } from './Binance.Exchange';

export class BinanceDataSource implements IDataSource {
  public exchange: Exchanges = 'binance';
  constructor(
    public market: Markets,
    public symbol: Symbols,
    public interval: Intervals
  ) { }
  async getData(
    startTime: Ticks,
    endTime: Ticks
  ): Promise<CandleStickCollection> {
    const a = new BinanceExchange();
    startTime = utils.ticks(startTime)
    endTime = utils.ticks(endTime)
    return await a.getData(
      this.market,
      this.symbol,
      this.interval,
      startTime,
      endTime
    );
  }
  async getExactCandle(time: Ticks): Promise<ICandleStickData> {
    time = utils.ticks(time)
    const a = new BinanceExchange();
    return await a.getExactCandle(
      this.market,
      this.symbol,
      this.interval,
      time
    );
  }
  async getLatestCandle(): Promise<ICandleStickData> {
    const a = new BinanceExchange();
    return await a.getLatestCandle(this.market, this.symbol, this.interval);
  }
}

import {
  CandleStickCollection,
  Exchanges,
  ICandelStickData,
  Intervals,
  Markets,
  Symbols,
} from '../../base/index';
import { BinanceDataSource } from '../../exchanges/BinanceDataSource';
import { CandleStickLiteDb } from '../stores/CandleSticksLiteDb';

import { IDataSource } from './_interfaces';

export class DataProvider implements IDataSource {
  public db: CandleStickLiteDb;
  public exchange: IDataSource;
  constructor(
    exchange: Exchanges,
    market: Markets,
    symbol: Symbols,
    interval: Intervals
  ) {
    this.db = new CandleStickLiteDb(exchange, market, symbol, interval);
    this.exchange = new BinanceDataSource(market, symbol, interval);
  }
  async getData(
    startTime: number,
    endTime: number
  ): Promise<CandleStickCollection> {
    let result = await this.db.getData(startTime, endTime);
    if (
      result.length === 0 ||
      result.endTime === endTime ||
      result.startTime === startTime
    ) {
      result = await this.exchange.getData(startTime, endTime);
      await this.db.push(result.items);
    }
    return result;
  }
  async getExactCandle(time: number): Promise<ICandelStickData> {
    let result = await this.db.getExactCandle(time);
    if (result == null) {
      result = await this.exchange.getExactCandle(time);
      if (result) await this.db.push(result);
    }
    return result;
  }
  async getLatestCandle(): Promise<ICandelStickData> {
    let result = await this.db.getLatestCandle();
    if (result == null) {
      result = await this.exchange.getLatestCandle();
      if (result) await this.db.push(result);
    }
    return result;
  }
}

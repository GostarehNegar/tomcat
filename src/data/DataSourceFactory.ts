import { Exchanges, Intervals, Markets, Symbols } from '../common/index';
import { CCXTDataStream } from '../exchanges';
import { BinanceDataSource } from '../exchanges/BinanceDataSource';

import { IDataSource } from './IDataSource';


export class DataSourceFactory {
  static createDataSource(
    exchange: Exchanges,
    market: Markets,
    symbol: Symbols,
    interval: Intervals
  ): IDataSource {
    switch (exchange) {
      // case 'binance':
      //   return new BinanceDataSource(market, symbol, interval);
      default:
        return new CCXTDataStream(exchange, symbol, market, interval);
    }
  }
  createdataSourceEx(
    exchange: Exchanges,
    market: Markets,
    symbol: Symbols,
    interval: Intervals
  ): IDataSource {
    switch (exchange) {
      case 'binance':
        return new BinanceDataSource(market, symbol, interval);
      default:
        return new CCXTDataStream(exchange, symbol, market, interval);
    }
  }
}

import { Exchanges, Intervals, Markets, Symbols } from '../../base/index';
import { BinanceDataSource } from '../../exchanges/BinanceDataSource';
import { IDataSource } from '../base';
import { CandleStickLiteDb } from '../stores/CandleSticksLiteDb';


export class DataSourceFactory {
  deprecated_creatDataSource(
    exchange: Exchanges,
    market: Markets,
    symbol: Symbols,
    interval: Intervals,
    name
  ): IDataSource {
    switch (name) {
      case 'Binance':
        return new BinanceDataSource(market, symbol, interval);
      case 'db':
        return new CandleStickLiteDb(exchange, market, symbol, interval);
      default:
        return null;
    }
  }
  static createDataSource(
    exchange: Exchanges,
    market: Markets,
    symbol: Symbols,
    interval: Intervals
  ): IDataSource {
    switch (exchange) {
      case 'binance':
        return new BinanceDataSource(market, symbol, interval);
      default:
        return new BinanceDataSource(market, symbol, interval);
    }
  }
}

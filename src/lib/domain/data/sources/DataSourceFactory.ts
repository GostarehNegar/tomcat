import { Exchanges, Intervals, Markets, Symbols } from '../../base/index';
import { BinanceDataSource } from '../../exchanges/BinanceDataSource';
import { IDataSource } from './_interfaces';
import { CandleStickLiteDb } from '../stores/CandleSticksLiteDb';
//import { Binance } from "./Binance";

export class DataSourceFactory {
  creatDataSource(
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
}

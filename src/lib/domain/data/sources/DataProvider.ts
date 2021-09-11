import { Ticks, utils } from '../../../base';
import {
  CandleStickCollection,
  CandleStickData,
  Exchanges,
  ICandleStickData,
  Intervals,
  Markets,
  Symbols,
} from '../../base';
import domainUtils from '../../base/Domain.Utils';
import { BinanceDataSource } from '../../exchanges/BinanceDataSource';
import { IDataProvider } from '../IDataProvider';
import { IDataSource } from '../base';
import { CandleStickLiteDb } from '../stores/CandleSticksLiteDb';


// import { TimeEx, utils } from '../../../base';

export class DataProvider implements IDataProvider {
  public logger = utils.getLogger("DataProvider")
  public db: CandleStickLiteDb;
  public exchange: IDataSource;
  public interval: Intervals;
  constructor(
    exchange: Exchanges,
    market: Markets,
    symbol: Symbols,
    interval: Intervals,
  ) {
    this.db = new CandleStickLiteDb(exchange, market, symbol, interval);
    this.exchange = new BinanceDataSource(market, symbol, interval);
    this.interval = interval;
  }
  temp() {
    throw new Error('Method not implemented.');
  }

  async getData(
    startTime: Ticks,
    endTime: Ticks
  ): Promise<CandleStickCollection> {
    startTime = utils.ticks(startTime)
    endTime = utils.ticks(endTime)
    let result = await this.db.getData(startTime, endTime);

    if (
      result.length === 0 ||
      result.endTime != endTime ||
      result.startTime != startTime
    ) {
      result = await this.exchange.getData(startTime, endTime);
      result.populate(startTime, endTime)
      await this.db.push(result.items);
    }
    return result;
  }
  async getExactCandle(time: Ticks): Promise<ICandleStickData> {
    time = utils.ticks(time)
    let result = await this.db.getExactCandle(time);

    if (result) {
      this.logger.info(`Candlestick data from ${time} was fetched from Database`)
    }
    if (result == null) {
      result = await this.exchange.getExactCandle(time);
      if (result) {
        this.logger.info(`Candlestick data from ${time} was fetched from Binance`)
      } else {
        result = CandleStickData.fromMissing(time, time + domainUtils.toMinutes(this.interval) * 60 * 1000)
        this.logger.info(`Missing candlestick was generated for ${time}`)
      }

      if (result) await this.db.push(result);
    }
    return result;
  }
  async getLatestCandle(): Promise<ICandleStickData> {
    let result = await this.db.getLatestCandle();
    if (result == null) {
      result = await this.exchange.getLatestCandle();
      if (result) await this.db.push(result);
    }
    return result;
  }
}

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
  public exchangeDataSource: IDataSource;
  public exchange: Exchanges;
  public interval: Intervals;
  public symbol: Symbols;
  public market: Markets;
  private cacheDisabled = false;
  constructor(
    exchange: Exchanges,
    market: Markets,
    symbol: Symbols,
    interval: Intervals,
  ) {
    this.db = new CandleStickLiteDb(exchange, market, symbol, interval);
    this.exchangeDataSource = new BinanceDataSource(market, symbol, interval);
    this.exchange = exchange;
    this.interval = interval;
    this.market = market;
    this.symbol = symbol;
  }
  temp() {
    throw new Error('Method not implemented.');
  }
  disableCache() {
    this.cacheDisabled = true;
  }
  async getData(
    startTime: Ticks,
    endTime: Ticks
  ): Promise<CandleStickCollection> {
    startTime = utils.ticks(startTime)
    endTime = utils.ticks(endTime)

    let result = this.cacheDisabled ? new CandleStickCollection([]) : await this.db.getData(startTime, endTime);

    if (
      result.length === 0 ||
      result.endTime != endTime ||
      result.startTime != startTime
    ) {
      result = await this.exchangeDataSource.getData(startTime, endTime);
      // result.populate(startTime, endTime)
      await this.db.push(result.items);
    }
    return result;
  }
  async getExactCandle(time: Ticks): Promise<ICandleStickData> {
    time = utils.ticks(time)
    let result = this.cacheDisabled ? null : await this.db.getExactCandle(time);

    if (result) {
      this.logger.info(`Candlestick data from ${time} was fetched from Database`)
    }
    if (result == null) {
      result = await this.exchangeDataSource.getExactCandle(time);
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
    let result = this.cacheDisabled ? null : await this.db.getLatestCandle();
    if (result == null) {
      result = await this.exchangeDataSource.getLatestCandle();
      if (result) await this.db.push(result);
    }
    return result;
  }
}

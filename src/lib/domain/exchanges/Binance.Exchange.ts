import fetch from 'node-fetch';

import { TimeEx, utils } from '../../base';
import { IHttpContext } from '../../hosting';
import { CandleStickCollection, CandleStickData, ICandleStickData, Intervals, Markets, Symbols } from '../base';

import { IExchange } from "./IExchange";
const api = (_api: string) => 'https://api.binance.com/api/v3/' + _api;

export class BinanceExchange implements IExchange {
  private logger = utils.getLogger("BinanceExchange")

  private _currenTime: TimeEx = null;
  get CurrenTime(): TimeEx {
    return this._currenTime;
  }
  async fetchData(
    market: Markets,
    symbol: Symbols,
    interval: Intervals,
    limit?,
    startTime?,
    endTime?
  ): Promise<ICandleStickData[]> {
    market;
    let url = `https://api1.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`;
    if (startTime) {
      url += `&startTime=${startTime}`;
    }
    if (endTime) {
      url += `&endTime=${endTime}`;
    }
    if (limit) {
      url += `&limit=${limit}`;
    }
    // const proxyAgent = new HttpsProxyAgent.HttpsProxyAgent("http://172.16.6.158:8118")
    const result = await fetch(url)
      .then((res) => res.json())
      .then((json: []) => {
        const result: ICandleStickData[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        json.map((candle: any[]) => {
          result.push(new CandleStickData
            (candle[0], parseFloat(candle[1]), parseFloat(candle[2]), parseFloat(candle[3]), parseFloat(candle[4]), candle[6], parseFloat(candle[5]))
          );
        });
        return result;
      })
      .catch((err) => {

        err = err.code == "EAI_AGAIN" ?
          {
            message: "failed to fetch data from binance. Probably internet connection or vpn has been disconnected",
            code: "InternetConnection"
          }
          : err
        console.log(err);
        throw err
      });
    this.logger.debug(`${result.length} items fetched from binance`)
    return result;
  }

  async getServerTime(): Promise<TimeEx> {
    const response = await fetch(api('time'));
    const json = await response.json();
    let result: TimeEx = null;
    if (json.serverTime) {
      result = new TimeEx(json.serverTime);
      this._currenTime = result;
    }
    return result;
  }
  async getData(
    market: Markets,
    symbol: Symbols,
    interval: Intervals,
    startTime,
    endTime
  ): Promise<CandleStickCollection> {
    const res = await this._getData(market, symbol, interval, startTime, endTime)
    while (res.closeTime <= endTime) {
      const a = await this._getData(market, symbol, interval, res.closeTime, endTime)
      if (a.length < 1) {
        this.logger.warn(`_getdata fetched empty`)

        break
      }
      a.items.map((item) => {
        res.items.push(item)
      })
    }
    this.logger.info(`_getData was called, ${res.length} items were fetched from binance from ${res.startTime} to ${res.endTime}`)
    return res
  }

  async _getData(
    market: Markets,
    symbol: Symbols,
    interval: Intervals,
    startTime,
    endTime
  ): Promise<CandleStickCollection> {
    const result = (
      await this.fetchData(market, symbol, interval, 500, startTime, endTime)
    ).filter((x) => x.openTime >= startTime && x.openTime <= endTime);
    return new CandleStickCollection(result, 'binance', symbol, interval);
  }
  async getExactCandle(
    market: Markets,
    symbol: Symbols,
    interval: Intervals,
    time
  ): Promise<ICandleStickData> {
    const result = (
      await this.fetchData(market, symbol, interval, 1, time)
    ).filter((x) => x.openTime == time);
    return result.length == 0 ? null : result[0];
  }
  async getLatestCandle(
    market: Markets,
    symbol: Symbols,
    interval: Intervals
  ): Promise<ICandleStickData> {
    const result = (await this.fetchData(market, symbol, interval, 2)).filter(
      (_v, i) => i == 0
    );
    return result.length == 0 ? null : result[0];
  }
}
type params = { symbol; interval };
export const api2 = async (ctx: IHttpContext) => {
  const uri = ctx.request.uri;
  if (uri.pathname == '/data/binance/future') {
    const params = ctx.request.getParams<params>();
    const symbol = params.symbol;
    const interval = params.interval as Intervals;
    const binance = new BinanceExchange();
    const res = await binance.getData(
      'future',
      symbol,
      interval,
      Date.now() - 1000 * 60 * 5,
      Date.now()
    );
    ctx.response.write(JSON.stringify(res));
    ctx.response.end();
  }
  if (ctx.request.url == '/data/binance/spot') {
    ctx.response.write('not implemented');
    ctx.response.end();
  }
  return Promise.resolve();
};

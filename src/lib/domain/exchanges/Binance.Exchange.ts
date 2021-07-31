import fetch from 'node-fetch';
import { TimeEx } from '../../base/TimeEx';
import { IHttpContext } from '../../hosting';
import { CandleStickCollection, ICandelStickData, Intervals, Markets, Symbols } from '../base';


import { IExchange } from './IExchange';
const api = (_api: string) => 'https://api.binance.com/api/v3/' + _api;

export class BinanceExchange implements IExchange {
  private _currenTime: TimeEx = null;
  get CurrenTime(): TimeEx {
    return this._currenTime;
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
  async getData(market: Markets, symbol: Symbols, interval: Intervals, startTime, endTime): Promise<CandleStickCollection> {
    (market);
    (startTime);
    const limit = 500
    let result = await fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}&endtime=${endTime}`)
      .then((res) => res.json())
      .then((json) => {
        const result: ICandelStickData[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        json.map((candle: any[]) => {
          result.push(
            {
              openTime: candle[0],
              open: parseFloat(candle[1]),
              high: parseFloat(candle[2]),
              low: parseFloat(candle[3]),
              close: parseFloat(candle[4]),
              volume: parseFloat(candle[5]),
              closeTime: candle[6]
            })
        })
        return result
      })
    result = result.filter(x => x.openTime >= startTime)
    return new CandleStickCollection(result, "binance", symbol, interval)

  }
}
type params = { symbol, interval }
export const api2 = async (ctx: IHttpContext) => {
  const uri = ctx.request.uri
  if (uri.pathname == '/data/binance/future') {
    const params = ctx.request.getParams<params>()
    const symbol = params.symbol
    const interval = params.interval as Intervals
    const binance = new BinanceExchange()
    const res = await binance.getData('future', symbol, interval, Date.now() - 1000 * 60 * 5, Date.now())
    ctx.response.write(JSON.stringify(res));
    ctx.response.end();
  }
  if (ctx.request.url == '/data/binance/spot') {
    ctx.response.write("not implemented");
    ctx.response.end();
  }
  return Promise.resolve();
};
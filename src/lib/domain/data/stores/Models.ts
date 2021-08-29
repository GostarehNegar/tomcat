/// Refernces :https://www.sqlitetutorial.net/sqlite-create-table/
///           :https://www.sqlite.org/datatype3.html#affinity
/**
 * binance kline/candlestick data
 * https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data
 [
  [
    1499040000000,      // Open time
    "0.01634790",       // Open
    "0.80000000",       // High
    "0.01575800",       // Low
    "0.01577100",       // Close
    "148976.11427815",  // Volume
    1499644799999,      // Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base asset volume
    "28.46694368",      // Taker buy quote asset volume
    "17928899.62484339" // Ignore.
  ]
]
 CoineEx:
 # Request
GET https://api.coinex.com/v1/market/kline?market=bchbtc&type=1min
# Response
{
  "code": 0,
  "data": [
    [
      1492358400, # Time
      "10.0",   # Opening
      "10.0",   # Closing
      "10.0",   # Highest
      "10.0",   # Lowest
      "10",     # Volume
      "100",    # amount
      "BCHBTC", # market
    ]
  ],
  "message": "Ok"
}
 */

import { ICandleStickData, IHaveCandleStickData } from '../../base/_interfaces';

/**
 *
 */
// export type CandleStickType = {
//   openTime: number,
//   open: number,
//   high: number,
//   low: number,
//   close: number,
//   closeTime: number,
//   volume?: number,
//   amount?: number,
//   V1?: number,
//   V2?: number,
//   V3?: number,
//   V4?: number,
// }

/**
 *
 */
export class CandleStick implements IHaveCandleStickData {
  public data: ICandleStickData;
  constructor(data: ICandleStickData | IHaveCandleStickData) {
    const _data: ICandleStickData =
      data == null
        ? null
        : typeof (data as IHaveCandleStickData).getCandle === 'function'
          ? (data as IHaveCandleStickData).getCandle()
          : (data as ICandleStickData);
    this.setCandle(_data);
  }
  getCandle(): ICandleStickData {
    return this.data;
  }
  setCandle(value: ICandleStickData) {
    this.data = value;
  }
}

import { IIndicator } from "../data";

export type Exchanges = 'binance' | 'coinex';
export type Symbols = 'BTCUSDT' | 'ETHUSDT';
export type Positions = 'short' | 'long';
export type States = 'open' | 'openShort' | 'openLong';
export type Sides = 'sell' | 'buy';
export type Types = 'open' | 'close';
export type Markets = 'future' | 'spot';
export type Intervals =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '45m'
  | '1h'
  | '4h'
  | '8h'
  | '12h'
  | '1d'
  | '7d'
  | '15d'
  | '30d';

export const toMinutes = (interval: Intervals): number => {
  if (interval == null) return null;
  const _interval = interval.trim().toLowerCase();
  if (_interval.length == 0) return null;
  if (_interval.endsWith('m')) return Number.parseInt(_interval);
  if (_interval.endsWith('h')) return Number.parseInt(_interval) * 60;
  if (_interval.endsWith('d')) return Number.parseInt(_interval) * 60 * 24;
  return null;
};

export interface IIndicatorValueCollection {
  [key: string]: number | boolean
}
export class IndicatorValueCollection {
  // [key: string]: number | boolean;
  public values: { [index: string]: number | boolean } = {}

  getValue<T>(indicator: IIndicator): T {
    return this.values[indicator.id] == null || this.values[indicator.id] == undefined ? null : this.values[indicator.id] as unknown as T
  }
  setValue(indicator: IIndicator, value: number | boolean) {
    this.values[indicator.id] = value
  }
  getNumberValue(indicator: IIndicator) {
    return this.getValue<number>(indicator)
  }
  getBoolValue(indicator: IIndicator) {
    return this.getValue<boolean>(indicator)
  }
  has(...indicators: IIndicator[]) {
    for (const i in indicators) {
      if (this.values[indicators[i].id] == null || this.values[indicators[i].id] == undefined) {
        return false
      }
    }
    return true
  }

}

export interface ICandleStickData {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  closeTime: number;
  volume?: number;
  amount?: number;
  V1?: number;
  V2?: number;
  V3?: number;
  V4?: number;
  // indicators_deprecated?: { [index: string]: number };
  indicators?: IndicatorValueCollection
};
export class CandleStickData implements ICandleStickData {

  constructor(public openTime: number,
    public open: number,
    public high: number,
    public low: number,
    public close: number,
    public closeTime: number,
    public volume?: number,
    public amount?: number,
    public V1?: number,
    public V2?: number,
    public V3?: number,
    public V4?: number,
    public candleType?: string,
    public indicators?: IndicatorValueCollection) {

    this.indicators = indicators || new IndicatorValueCollection()

  }
  public equals(other: ICandleStickData): boolean {
    return other != null && other.openTime == this.openTime && other.open == this.open && other.high == this.high && other.low == this.low && other.close == this.close && other.closeTime == this.closeTime
  }
  public sameTime(other: ICandleStickData) {
    return other != null && other.openTime == this.openTime
  }
  public static from(data: ICandleStickData): CandleStickData {
    if (data instanceof CandleStickData) {
      return data
    }
    return new CandleStickData(data.openTime, data.open, data.high, data.low, data.close, data.closeTime, data.volume, data.amount, data.V1, data.V2, data.V3, data.V4, "", data.indicators)
  }
}


export interface IHaveCandleStickData {
  getCandle(): ICandleStickData;
  setCandle(value: ICandleStickData);
}
export interface IStrategySignal {
  candle: ICandleStickData
}

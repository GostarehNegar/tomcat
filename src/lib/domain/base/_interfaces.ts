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

export type ICandelStickData = {
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
  indicators?: { [index: string]: number };
};

export type ICandleStickDataEx = {
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
  indicators: { [index: string]: number };
};

export interface IHaveCandleStickData {
  getCandle(): ICandelStickData;
  setCandle(value: ICandelStickData);
}
export interface IStrategySignal {
  candle: ICandelStickData
}

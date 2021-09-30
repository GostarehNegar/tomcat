import { Ticks } from '../../../base';
import { CandleStickCollection, Exchanges, ICandleStickData, Intervals, Markets, Symbols } from '../../base/index';

export interface IDataSource {
  getData(startTime: Ticks, endTime: Ticks): Promise<CandleStickCollection>;
  getExactCandle(time: Ticks): Promise<ICandleStickData>;
  getLatestCandle(): Promise<ICandleStickData>;
  get exchange(): Exchanges;
  get interval(): Intervals;
  get market(): Markets;
  get symbol(): Symbols;
}

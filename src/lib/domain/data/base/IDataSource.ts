import { Ticks } from '../../../base';
import { CandleStickCollection, ICandleStickData } from '../../base/index';

export interface IDataSource {
  getData(startTime: Ticks, endTime: Ticks): Promise<CandleStickCollection>;
  getExactCandle(time: Ticks): Promise<ICandleStickData>;
  getLatestCandle(): Promise<ICandleStickData>;
}

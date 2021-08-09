import { CandleStickCollection, ICandelStickData } from '../../../base/index';

export interface IDataSource {
  getData(startTime: number, endTime: number): Promise<CandleStickCollection>;
  getExactCandle(time: number): Promise<ICandelStickData>;
  getLatestCandle(): Promise<ICandelStickData>;
}

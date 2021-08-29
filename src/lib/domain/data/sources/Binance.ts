import { CandleStickCollection, ICandleStickData } from '../../base/';
import { IDataSource } from './_interfaces';

export class Binance implements IDataSource {
  getData(startTime: number, endTime: number): Promise<CandleStickCollection> {
    startTime;
    endTime;
    throw new Error('Method not implemented.');
  }
  getExactCandle(time: number): Promise<ICandleStickData> {
    time;
    throw new Error('Method not implemented.');
  }
  getLatestCandle(): Promise<ICandleStickData> {
    throw new Error('Method not implemented.');
  }
}

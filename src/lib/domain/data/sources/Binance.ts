import { CandleStickCollection, ICandelStickData } from '../../base';
import { IDataSource } from '../interfaces';

export class Binance implements IDataSource {
    getData(startTime: number, endTime: number): Promise<CandleStickCollection> {
        (startTime);
        (endTime);
        throw new Error('Method not implemented.');
    }
    getExactCandle(time: number): Promise<ICandelStickData> {
        (time);
        throw new Error('Method not implemented.');
    }
    getLatestCandle(): Promise<ICandelStickData> {
        throw new Error('Method not implemented.');
    }
}

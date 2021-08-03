import { CandleStickCollection, ICandelStickData } from "../base";

export interface IDataSource {
    getData(startTime: number, endTime: number): Promise<CandleStickCollection>
    getExactCandle(time: number): Promise<ICandelStickData>
    getLatestCandle(): Promise<ICandelStickData>
}

export abstract class IDataStore { }

export abstract class IDataProvider { }



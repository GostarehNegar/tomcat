import { Intervals } from "../common";
import { CandleStickCollectionScaler } from "../indicators";
import { IServiceProvider } from "../infrastructure/base";



export interface IFilter {
    context: { [key: string]: unknown; };
    getScaler(interval: Intervals, maxCount?: number): CandleStickCollectionScaler;
    get services(): IServiceProvider
}

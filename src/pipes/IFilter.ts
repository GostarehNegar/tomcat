import { CandleStickCollectionScaler, Intervals } from "../common";
import { IServiceProvider } from "../infrastructure/base";

export interface IFilter {
    context: { [key: string]: unknown; };
    getScaler(interval: Intervals, maxCount?: number): CandleStickCollectionScaler;
    get services(): IServiceProvider
}

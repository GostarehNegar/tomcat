import { Intervals } from "../common";
import { CandleStickCollectionScaler } from "../indicators";




export interface IFilter {
    context: { [key: string]: unknown; };
    getScaler(interval: Intervals, maxCount?: number): CandleStickCollectionScaler;
}

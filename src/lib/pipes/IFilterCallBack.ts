import { CandleStickData } from "../common";

import { IFilter } from './IFilter';

// import { PipelineContext } from "./pipelineContext";

export interface IFilterCallBack {
    (candle: CandleStickData, ctx?: IFilter): Promise<void>

}
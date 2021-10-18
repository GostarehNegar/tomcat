import { CandleStickData } from "../base";

import { IFilter } from ".";

// import { PipelineContext } from "./pipelineContext";

export interface IFilterCallBack {
    (candle: CandleStickData, ctx?: IFilter): Promise<void>

}
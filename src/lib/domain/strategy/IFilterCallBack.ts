import { CandleStickData } from "../base";

import { PipelineContext } from "./pipelineContext";

export interface IFilterCallBack {
    (candle: CandleStickData, ctx?: PipelineContext): Promise<void>

}
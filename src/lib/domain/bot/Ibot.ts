import { States } from "../base";
import { BaseStrategy } from "../strategy";
import { Wallet } from "../wallet";

import { JobContext, JobOrder } from ".";

export interface IBot {
    state: States;
    strategy: BaseStrategy;
    wallet: Wallet;
    get name(): string;
    start(jobOrder: JobOrder): Promise<JobContext>;
    stop();
    // _stop
    // logger;
    // symbol: Symbols;
    // onData(jobContext: JobContext)
    // openLong(candle: CandleStickData, jobContext: JobContext)
    // openShort(candle: CandleStickData, jobContext: JobContext)
    // closeLong(candle: CandleStickData, jobContext: JobContext)
    // closeShort(candle: CandleStickData, jobContext: JobContext)
}
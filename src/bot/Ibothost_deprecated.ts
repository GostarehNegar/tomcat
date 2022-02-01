import { States } from "../common";
// import { BaseStrategy } from "../strategy";
import { Wallet } from "../wallet";


export interface IBotHost_ {
    state: States;
    // strategy: BaseStrategy;
    wallet: Wallet;
    get name(): string;
    start(): Promise<void>;
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

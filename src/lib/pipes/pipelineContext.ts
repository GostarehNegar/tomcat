import { CandleStickData } from "../common";
import utils from "../common/Domain.Utils";
import { IStopCallBack } from "../common/IStopCallBack";
import { Ticks } from "../infrastructure/base"

export class PipelineContext {
    timeOut = 1000;
    myContext: { [key: string]: unknown }
    startTime?: Ticks;
    stop: IStopCallBack;
    currentCandle: CandleStickData;
    shouldStop(candle: CandleStickData, err: any = null, failures = 0) {
        return this.stop && this.stop({
            err: err,
            failures: failures,
            lastCandle: candle,
            time: utils.toTimeEx(candle ? candle.openTime : 0)
        });
    }
}
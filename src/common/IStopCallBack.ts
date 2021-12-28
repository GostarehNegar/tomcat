import { TimeEx } from "../infrastructure/base";

import { CandleStickData } from ".";


export interface IStopCallBack {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (context: { err?: any; time?: TimeEx; failures?: number; lastCandle?: CandleStickData; }): boolean;
}

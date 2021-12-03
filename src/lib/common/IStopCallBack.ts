import { CandleStickData } from ".";
import { TimeEx } from "../infrastructure/base";


export interface IStopCallBack {
    (context: { err?: any; time?: TimeEx; failures?: number; lastCandle?: CandleStickData; }): boolean;
}

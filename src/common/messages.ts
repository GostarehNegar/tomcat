import { Ticks } from "../infrastructure/base";
import { Message } from "../infrastructure/bus";
import { Order } from "../wallet";

import { MessageNames } from "./MessageNames";

import { CandleStickData } from ".";

export interface IReportContext {
    candle: CandleStickData,
    order: Order,
    state: string
}
export class Messages {
    public static startMessage(streamID: string, dateTime: Ticks) {
        return new Message(`${streamID}/${MessageNames.started}`, null, null, dateTime)
    }
    public static endMessage(streamID: string, dateTime: Ticks) {
        return new Message(`${streamID}/${MessageNames.ended}`, null, null, dateTime)
    }
    public static openLongReportMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/${MessageNames.openLongReport}}`, null, null, payload)
    }
    public static openShortReportMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/${MessageNames.openShortReport}`, null, null, payload)
    }
    public static closeLongReportMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/${MessageNames.closeLongReport}`, null, null, payload)
    }
    public static closeShortReportMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/${MessageNames.closeShortReport}`, null, null, payload)
    }
}
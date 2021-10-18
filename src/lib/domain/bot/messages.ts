import { Ticks } from "../../base";
import { Message } from "../../bus";

import { MessageNames } from "./MessageNames";

import { IReportContext } from ".";
export class Messages {
    public static startMessage(streamID: string, dateTime: Ticks) {
        return new Message(`${streamID}/${MessageNames.started}`, null, null, null, dateTime)
    }
    public static endMessage(streamID: string, dateTime: Ticks) {
        return new Message(`${streamID}/${MessageNames.ended}`, null, null, null, dateTime)
    }
    public static openLongReportMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/${MessageNames.openLongReport}}`, null, null, null, payload)
    }
    public static openShortReportMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/${MessageNames.openShortReport}`, null, null, null, payload)
    }
    public static closeLongReportMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/${MessageNames.closeLongReport}`, null, null, null, payload)
    }
    public static closeShortReportMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/${MessageNames.closeShortReport}`, null, null, null, payload)
    }
}
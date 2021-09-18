import { Ticks } from "../../base";
import { Message } from "../../bus";

import { IReportContext } from ".";
export class MessageNames {
    public static started = "Started"
    public static ended = "Ended"
}

export class Messages {
    public static startMessage(streamID: string, dateTime: Ticks) {
        return new Message(`${streamID}/${MessageNames.started}`, null, null, null, dateTime)
    }
    public static endMessage(streamID: string, dateTime: Ticks) {
        return new Message(`${streamID}/${MessageNames.ended}`, null, null, null, dateTime)
    }
    public static openLongMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/Report/openLong`, null, null, null, payload)
    }
    public static openShortMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/Report/openShort`, null, null, null, payload)
    }
    public static closeLongMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/Report/closeLong`, null, null, null, payload)
    }
    public static closeShortMessage(streamID: string, payload: IReportContext) {
        return new Message(`${streamID}/Report/closeShort`, null, null, null, payload)
    }
}
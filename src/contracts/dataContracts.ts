
import { Exchanges, Intervals, Markets, Symbols } from "../common"
import { Ticks } from "../infrastructure/base"
import { Contract } from "../infrastructure/contracts"

export function ServiceCommandContract(command: string) {
    return `$services/data/commands/${command}`
}
export type queryDataStreamNamePayload = {
    exchange: Exchanges,
    symbol: Symbols,
    interval: Intervals,
    market: Markets,
    startTime?: number,
    endTime?: number
}
export type queryDataStreamNameReply = {
    streamName: string,
    redis: string,

}
export type playDataStreamRequest = {
    exchange: Exchanges,
    symbol: Symbols,
    interval: Intervals,
    market: Markets,
    channel?: string,
    'start': Ticks

}


export function queryDataStreamName(payload: queryDataStreamNamePayload): Contract<queryDataStreamNamePayload> {
    return {
        topic: ServiceCommandContract("querydatastreamname"),
        payload: payload
    }
}
export function requestDataStreamPlay(payload: playDataStreamRequest): Contract<playDataStreamRequest> {
    return {
        topic: ServiceCommandContract("playdatastream"),
        payload: payload
    }
}



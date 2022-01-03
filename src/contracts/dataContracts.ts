
import { Exchanges, Intervals, Markets, Symbols } from "../common"
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

export function queryDataStreamName(payload: queryDataStreamNamePayload): Contract<queryDataStreamNamePayload> {
    return {
        topic: ServiceCommandContract("querydatastreamname"),
        payload: payload
    }
}

export type orderRedisServicePayload = {
    containerId: string
    dataDrirectory?: string,
    portNumber?: string,
}
export type queryRedisContainerPayload = {
    containerName: string
    id: string
}

export function orderRedisService(payload: orderRedisServicePayload): Contract<orderRedisServicePayload> {
    return {
        topic: ServiceCommandContract("orderredisservice"),
        payload: payload
    }
}
export function queryRedisContainer(payload: queryRedisContainerPayload): Contract<queryRedisContainerPayload> {
    return {
        topic: ServiceCommandContract("queryrediscontainer"),
        payload: payload
    }
}

export type getRedisConnectionReplyPayload = {
    id: string
}


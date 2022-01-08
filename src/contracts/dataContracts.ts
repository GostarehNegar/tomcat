
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



import { Exchanges, Intervals, Markets, Symbols } from "../common"
import { Contract } from "../infrastructure/contracts"

export type dataRequestPayload = {
    exchange: Exchanges,
    symbol: Symbols,
    interval: Intervals,
    market: Markets,
    count: number,
    time: number
}

function dataRequest() {
    return `$data/candles`
}

export function requestData(request: dataRequestPayload): Contract<dataRequestPayload> {
    return {
        topic: dataRequest(),
        payload: request
    }
}


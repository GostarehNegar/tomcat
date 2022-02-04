import { Exchanges, Intervals, Markets, Symbols } from "../common"
import { IMessageBus } from "../infrastructure/bus"
import { serviceOrder } from "../infrastructure/contracts"
import { ServiceCategories, ServiceDefinitionBase } from "../infrastructure/mesh"

export interface IDataServiceParameters {
    [key: string]: unknown
    "exchange": Exchanges
    "symbol": Symbols
    "market": Markets
    "interval": Intervals
    "startTime"?: number
    "endTime"?: number
}
export function getStreamName(exchange: Exchanges, symbol: Symbols, market: Markets, interval: Intervals) {
    return `${exchange}-${symbol}-${market}-${interval}`;
}
export class DataServiceDefinition extends ServiceDefinitionBase<IDataServiceParameters>{
    readonly category: ServiceCategories = 'data'
    constructor(params: IDataServiceParameters) {
        super()
        this.parameters = params
    }
}


export const requireDataStream = async (bus: IMessageBus, exchange, interval, market, symbol, startTime, endTime?) => {
    const service = new DataServiceDefinition({ exchange: exchange, interval: interval, market: market, symbol: symbol, startTime: startTime, endTime: endTime })
    await bus.createMessage(serviceOrder(service)).execute()
}

export class RPC {
    static async requireDataStream(bus: IMessageBus, exchange, interval, market, symbol, startTime, endTime?) {
        const service = new DataServiceDefinition({ exchange: exchange, interval: interval, market: market, symbol: symbol, startTime: startTime, endTime: endTime })
        await bus.createMessage(serviceOrder(service)).execute()
    }
}
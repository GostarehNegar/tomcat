

// tomcat.Infrastructure.Base.Logger.level = 'debug'

import { Exchanges, Intervals, Markets, Symbols } from "../common"
import { Contracts } from "../domain"
import { CCXTDataStream } from "../exchanges"
import { baseUtils } from "../infrastructure/base"
import baseconfig from "../infrastructure/base/baseconfig"
import { BaseConstants } from "../infrastructure/base/baseconstants"
import { HostBuilder } from "../infrastructure/hosting"
import { IMeshService, matchService, MeshNode, ServiceCategories, ServiceDefinition, ServiceInformation, ServiceStatus } from "../infrastructure/mesh"
import { DataSourceStreamEx } from "../streams"

// tomcat.config.infrastructure.data.redis.url = "redis://localhost:6379"
export class DataService implements IMeshService {
    public exchange
    public symbol
    public market
    public interval
    public startTime
    public endTime
    public streamName;
    public status: ServiceStatus = 'start'
    public Id: string = baseUtils.UUID()
    constructor(public def: ServiceDefinition) {
        this.exchange = this.def.parameters["exchange"] as Exchanges
        this.symbol = this.def.parameters["symbol"] as Symbols
        this.market = this.def.parameters["market"] as Markets
        this.interval = this.def.parameters["interval"] as Intervals
        // this.startTime = tomcat.utils.toTimeEx(new Date(this.def.parameters["startTime"] as string))
        // this.startTime = typeof (this.def.parameters["startTime"]) == "string" ? tomcat.utils.toTimeEx(new Date(this.def.parameters["startTime"] as string)) : tomcat.utils.toTimeEx(this.def.parameters["startTime"]["ticks"])
        // this.endTime = this.def.parameters["endTime"] ?
        //     typeof (this.def.parameters["endTime"]) == "string" ?
        //         tomcat.utils.toTimeEx(new Date(this.def.parameters["endTime"] as string))
        //         : this.def.parameters["endTime"]["ticks"]
        //     : null
    }
    getInformation(): ServiceInformation {
        return { category: 'data', parameters: { streamName: this.streamName, exchange: this.exchange, symbol: this.symbol, market: this.market, interval: this.interval, startTime: new Date(this.startTime).toISOString(), endTime: this.endTime ? new Date(this.endTime).toISOString() : null }, status: this.status }
    }
    start(): Promise<unknown> {
        const data = new CCXTDataStream(this.exchange, this.symbol, this.market, this.interval)
        const stream = new DataSourceStreamEx(data);
        this.streamName = stream.name
        this.startTime = baseUtils.toTimeEx(Date.UTC(2021, 0, 1, 0, 0, 0, 0))
        stream.startEx(this.startTime
            //     ,(ctx)=>{
            //     if(ctx.err){
            //         console.error(ctx.err);
            //     }
            //     return false
            // }
        )
        return Promise.resolve()
    }
}

const dataServices: DataService[] = [];

(async () => {
    const client1 = new HostBuilder('dataservice',null)
        .addMessageBus(cfg => {
            cfg.endpoint = "dataservice";
            cfg.transports.websocket.url
        })
        .addMeshService({ category: 'data' as ServiceCategories, parameters: {} }, (def) => {
            let service = dataServices.find(x => matchService(x.getInformation(), def))
            if (!service) {
                service = new DataService(def)
                dataServices.push(service)
            }
            return service
        })
        .build();

    client1.bus.subscribe(Contracts.queryDataStreamName(null).topic, async (ctx) => {
        const meshNode = client1.services.getService<MeshNode>(BaseConstants.ServiceNames.MeshNode)
        const payload = ctx.message.cast<Contracts.queryDataStreamNamePayload>()
        const service = (meshNode.runningServices as DataService[]).find(x => x.exchange == payload.exchange && x.symbol == payload.symbol && x.interval == payload.interval && x.market == payload.market)
        if (service) {
            await ctx.reply({ connectionString: baseconfig.data.redis.url + `/${service.streamName}` })
        } else {
            await ctx.reply({ err: "no streams found" })
        }
    })

    await client1.start()
    await baseUtils.delay(15000);

})()
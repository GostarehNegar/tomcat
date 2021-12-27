import { baseUtils, CancellationToken, IServiceProvider } from "../base";
import { BaseConstants } from "../base/baseconstants";
import { IMessageBus } from "../bus";
import * as contracts from '../contracts';
import { queryServiceCapabilityReply, queryServicePayload, serviceOrderPayload } from "../contracts";
import { BackgroundService } from "../hosting";

import { ServiceDefinition, ServiceDescriptor } from "./ServiceDefinition";

import { IMeshService, matchService, ServiceInformation } from ".";


export interface queryService {
    (): ServiceDefinition[]
}
export interface executeservice {
    (serviceOrderPayload: contracts.serviceOrderPayload): Promise<contracts.serviceOrderReply>
}
export interface serviceCapability {
    (query: queryServicePayload): Promise<contracts.queryServiceCapabilityReply>
}
export interface MeshNodeConfiguration {
    serviceDefinitions: ServiceDefinition[]
    runningServices: ServiceInformation[]
    serviceFactory(serviceDefinition: ServiceDefinition): ServiceInformation
    serviceCapability: serviceCapability
    executeservice: executeservice
    queryService: queryService
}

export interface IMeshNode {
    startService(serviceDefinition: ServiceDefinition): Promise<ServiceInformation>
}
export class MeshNode extends BackgroundService implements IMeshNode {
    public serviceDescriptors: ServiceDescriptor[] = []
    public runningServices: IMeshService[] = []
    private _bus: IMessageBus;
    public nodeName: string;
    constructor(private serviceProvider: IServiceProvider, private config: MeshNodeConfiguration) {
        super();
        this.serviceDescriptors = this.serviceProvider.getServices<ServiceDescriptor>(BaseConstants.ServiceNames.ServiceDescriptor)
        this.config = this.config || { executeservice: null, queryService: null, runningServices: null, serviceCapability: null, serviceDefinitions: null, serviceFactory: null }
    }
    async startService(serviceDefinition: ServiceDefinition): Promise<ServiceInformation> {
        if (this.serviceDescriptors.length > 0) {
            const availability = this.serviceDescriptors.filter((x) => matchService(serviceDefinition, x.serviceDefinition))
            if (availability.length > 0) {
                const service = availability[0].serviceConstructor(serviceDefinition)
                await service.start()
                this.runningServices.push(service)
                return service.getInformation()
            }
        }
        return null
    }
    protected async run(token: CancellationToken): Promise<void> {

        while (!token.isCancelled) {
            await baseUtils.delay(3 * 1000);
            await this._bus.createMessage(
                contracts.NodeStatusEvent(this.nodeName, {
                    alive: true,
                    services: this.runningServices?.map(x => x.getInformation())
                }))
                .publish();
        }
    }

    async start() {
        this.serviceDescriptors = this.serviceProvider.getServices<ServiceDescriptor>(BaseConstants.ServiceNames.ServiceDescriptor)
        this._bus = this.serviceProvider.getBus();
        this.nodeName = this._bus.endpoint;
        await this._bus.subscribe(contracts.queryServiceCapability(null).topic, async (ctx) => {
            // if (this.config.serviceCapability) {
            //     const res = await this.config.serviceCapability(ctx.message.cast<queryServicePayload>())
            //     await ctx.reply(res)
            // }
            const msg = ctx.message.cast<queryServicePayload>()
            if (this.serviceDescriptors.length > 0) {
                const availability = this.serviceDescriptors.filter((x) => matchService(msg.serviceDefinition, x.serviceDefinition))
                if (availability.length > 0) {
                    const res: queryServiceCapabilityReply = { acceptable: true, load: 0 }
                    await ctx.reply(res)
                }

            }
        })
        await this._bus.subscribe(contracts.serviceOrder(null).topic, async (ctx) => {
            if (ctx.message.from !== this._bus.endpoint) {
                const msg = ctx.message.cast<serviceOrderPayload>()
                const res = await this.startService(msg.serviceDefinition)
                if(res){
                    ctx.reply(res)
                }
            }
        })
        await super.start();
    }
    async stop() {
        await super.stop();
    }


}
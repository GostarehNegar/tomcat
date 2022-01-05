import { baseUtils, CancellationToken, ILogger, IServiceProvider } from "../base";
import { BaseConstants } from "../base/baseconstants";
import { IMessageBus } from "../bus";
import * as contracts from '../contracts';
import { queryServiceCapabilityReply, queryServicePayload, serviceOrderPayload } from "../contracts";
import { BackgroundService } from "../hosting";

import { ServiceDefinition, ServiceDescriptor } from "./ServiceDefinition";

import { IMeshService, matchService, ServiceInformation } from ".";
import { IMeshNode } from "./IMeshNode";
import { MeshServiceContext } from "./MeshServiceContext";


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

export class MeshNode extends BackgroundService implements IMeshNode {
    public serviceDescriptors: ServiceDescriptor[] = []
    public runningServices: IMeshService[] = []
    private _bus: IMessageBus;
    public nodeName: string;
    public logger: ILogger
    constructor(private serviceProvider: IServiceProvider, private config: MeshNodeConfiguration) {
        super();
        this.logger = baseUtils.getLogger("MeshNode")
        this.serviceDescriptors = this.serviceProvider.getServices<ServiceDescriptor>(BaseConstants.ServiceNames.ServiceDescriptor)
        this.config = this.config || { executeservice: null, queryService: null, runningServices: null, serviceCapability: null, serviceDefinitions: null, serviceFactory: null }
    }
    async startService(serviceDefinition: ServiceDefinition): Promise<ServiceInformation> {
        const stringifiedServiceDefinition = JSON.stringify(serviceDefinition)
        this.logger.debug(`a new service order is recieved for ${stringifiedServiceDefinition}`)
        let startServiceResult;
        if (this.serviceDescriptors.length > 0) {
            const availability = this.serviceDescriptors.filter((x) => matchService(serviceDefinition, x.serviceDefinition))
            this.logger.debug(`${availability.length} services where matched with the required service definition`)
            if (availability.length > 0) {
                this.logger.debug(`starting the first available service`)
                try {
                    const service = availability[0].serviceConstructor(serviceDefinition)
                    await service.start(new MeshServiceContext(this.serviceProvider, this, service));
                    if (!this.runningServices.find(x => x.Id == service.Id)) {
                        this.runningServices.push(service)
                    }
                    startServiceResult = service.getInformation()
                } catch (err) {
                    this.logger.error(`an error occoured while trying to start service error: ${err}`)
                }
            }
        }
        startServiceResult ? this.logger.debug(`service was spawned with information ${JSON.stringify(startServiceResult)}`)
            : this.logger.debug(`no available services where found for ${stringifiedServiceDefinition}`)
        return startServiceResult
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
                if (res) {
                    ctx.reply(res)
                }
            }
        })
        await super.start();
        this.logger.info(`a new mesh node is spawning, name : ${this.nodeName}, which provides these services:`)
        this.serviceDescriptors.forEach(x => {
            this.logger.info(JSON.stringify(x.serviceDefinition))
        })
    }
    async stop() {
        await super.stop();
    }


}
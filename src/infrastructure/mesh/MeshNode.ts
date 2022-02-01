import { baseUtils, CancellationToken, CancellationTokenSource, ILogger, IServiceProvider } from "../base";
import { BaseConstants } from "../base/baseconstants";
import { IMessageBus } from "../bus";
import * as contracts from '../contracts';
import { queryServiceCapabilityReply, queryServicePayload, serviceOrderPayload } from "../contracts";
import { BackgroundService } from "../hosting";

import { ServiceDefinition } from "./ServiceDefinition";
import { ServiceDescriptor } from "./ServiceDescriptor";

import { IMeshService, matchService, ServiceInformation } from ".";
import { IMeshNode } from "./IMeshNode";
import { MeshServiceContext } from "./MeshServiceContext";
import baseconfig from "../base/baseconfig";

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

class MeshServiceEntry {
    constructor(public service: IMeshService) {

    }
    public context: MeshServiceContext;
    public promise: Promise<unknown>;
    public cancellationToken: CancellationTokenSource = new CancellationTokenSource();
    public getId() {
        return this.service.getId();
    }
    public getInformation(): ServiceInformation {

        return this.service.getInformation();
    }
    public getDefinition(): ServiceDefinition {
        return this.getInformation().definition;
    }

}

export class MeshNode extends BackgroundService implements IMeshNode {
    public serviceDescriptors: ServiceDescriptor[] = []
    public runningServices: MeshServiceEntry[] = []
    private _bus: IMessageBus;
    public nodeName: string;
    public logger: ILogger
    public options = baseconfig.mesh;
    constructor(private serviceProvider: IServiceProvider, private config: MeshNodeConfiguration) {
        super();
        this.logger = baseUtils.getLogger("MeshNode")
        //this.serviceDescriptors = this.serviceProvider.getServices<ServiceDescriptor>(BaseConstants.ServiceNames.ServiceDescriptor)
        this.config = this.config || { executeservice: null, queryService: null, runningServices: null, serviceCapability: null, serviceDefinitions: null, serviceFactory: null }
        this.options.heartBeatInSeconds = this.options.heartBeatInSeconds || 5;
    }
    getRunnigServices(): ServiceInformation[] {
        return this.runningServices.filter(x => x.getInformation().isRunning())
            .map(x => x.getInformation());
    }

    find(def: ServiceDefinition): MeshServiceEntry {
        return this.runningServices.find(x => matchService(x.getInformation().definition, def))

    }
    async stopService(serviceDefinition: ServiceDefinition): Promise<ServiceInformation> {
        const service = this.find(serviceDefinition);
        if (service && service.getInformation().status === 'start') {
            service.cancellationToken.cancel();
            try {
                await baseUtils.timeout(service.promise, 2000, true);
                service.getInformation().status = 'stop';
                this.runningServices = this.runningServices
                    .filter(x => matchService(x.getDefinition(), serviceDefinition));
            }
            catch (err) {

            }
        }
        return service.getInformation();
    }
    async startService(serviceDefinition: ServiceDefinition): Promise<ServiceInformation> {
        serviceDefinition = baseUtils.extend(new ServiceDefinition(), serviceDefinition);
        const stringifiedServiceDefinition = serviceDefinition.getName();
        this.logger.debug(`a new service order is recieved for ${stringifiedServiceDefinition}`)
        let startServiceResult: ServiceInformation = this.find(serviceDefinition)?.getInformation();
        if (startServiceResult && startServiceResult.status === 'start') {
            // Service already started....
            this.logger.info(
                `Service is alreadys started ${serviceDefinition.getName()}`);
        }
        else if (this.serviceDescriptors.length > 0) {
            const availability = this.serviceDescriptors.filter((x) => matchService(serviceDefinition, x.serviceDefinition))
            this.logger.debug(`${availability.length} services where matched with the required service definition`)
            if (availability.length > 0) {
                this.logger.debug(`starting the first available service`)
                try {
                    const service = availability[0].serviceConstructor(serviceDefinition)
                    const entry = new MeshServiceEntry(service);
                    //service.getId() = new ServiceDefinitionHelper(serviceDefinition).name;
                    service.getInformation().status = 'start';
                    entry.context = new MeshServiceContext(this.serviceProvider, this, service, entry.cancellationToken);
                    entry.promise = service.run(entry.context);
                    await baseUtils.delay(100);
                    startServiceResult = service.getInformation()
                    // var f = new ServiceDefinitionHelper(serviceDefinition);
                    // const id = f.name;
                    if (startServiceResult.status === 'start' && !this.runningServices.find(x => x.getId() == service.getId())) {
                        this.runningServices.push(entry);
                    }
                    //startServiceResult = service.getInformation()
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
            await baseUtils.delay(this.options.heartBeatInSeconds * 1000);
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
        const start_definition = baseconfig.start_args.service_definition as ServiceDefinition;
        if (start_definition && start_definition.category) {
            /// There is a service definition within the start_args
            await this.startService(start_definition);
        }
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
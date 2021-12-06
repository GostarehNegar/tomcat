import { baseUtils, CancellationToken, IServiceProvider } from "../base";
import { IMessageBus, IMessageContext } from "../bus";
import * as contracts from '../contracts'
import { BackgroundService, } from "../hosting";

import { IServiceDiscovery } from "./IServiceDiscovery";
import { MeshState } from "./MeshState";
import { ServiceDefinition } from "./ServiceDefinition";
import { ServiceStatus } from "./ServiceStatus";



export class MeshServer extends BackgroundService implements IServiceDiscovery {
    private bus: IMessageBus;
    public availableServices: string[] = []
    public meshState: MeshState
    constructor(private serviceProvider: IServiceProvider) {
        super();
        this.serviceProvider = serviceProvider;
        this.bus = this.serviceProvider.getBus();
        this.meshState = new MeshState()
    }
    async executeService(serviceDefinition: ServiceDefinition): Promise<contracts.serviceOrderReply> {
        try {
            const discovered = await this.discover(serviceDefinition)
            if (discovered.length == 0) {
                const capabilities = await this.queryServiceCapability(serviceDefinition)
                for (let i = 0; i < capabilities.length; i++) {
                    const node = capabilities[i]
                    if (node.acceptable) {
                        const res = await this.bus.createMessage(contracts.serviceOrder(serviceDefinition), undefined, node.endpoint).execute()
                        return res.cast<contracts.serviceOrderReply>()
                    }
                }
            }
        } catch (err) {
            console.error(err);

        }
        return null
    }
    async queryServiceCapability(serviceDefinition: ServiceDefinition): Promise<contracts.queryServiceCapabilityReply[]> {
        const providers: contracts.queryServiceCapabilityReply[] = []
        await this.bus.createMessage(contracts.queryServiceCapability(serviceDefinition)).execute((ctx) => {
            const res = ctx.message.cast<contracts.queryServiceCapabilityReply>()
            res.endpoint = ctx.message.from
            providers.push(res)
            return false
        }, 10000, true)
        return providers
    }
    discover(serviceDefinition: ServiceDefinition): Promise<ServiceStatus[]> {
        return this.meshState.queryServices(serviceDefinition)
    }

    protected async run(token: CancellationToken): Promise<void> {
        while (!token.isCancelled) {
            await baseUtils.delay(5000);
        }
    }
    async handleNodeStatusPayload(msg: IMessageContext) {
        const payload = msg.message.cast<contracts.NodeStatusPayload>()
        this.meshState.addNode(payload, msg.message.from)
    }
    async start(): Promise<void> {
        this.bus = this.serviceProvider.getBus();
        this.bus.subscribe(contracts.NodeStatusEvent('*', null).topic, async (ctx) => {
            await this.handleNodeStatusPayload(ctx);
        });
        await super.start();
    }
    async stop(): Promise<void> {
        super.stop();
    }

}
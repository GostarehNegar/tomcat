import { baseUtils, CancellationToken, ILogger, IServiceProvider } from "../base";
import { IMessageBus, IMessageContext } from "../bus";
import SystemTopics from "../bus/Topics";
import * as contracts from '../contracts'
import { BackgroundService, } from "../hosting";

import { IServiceDiscovery } from "./IServiceDiscovery";
import { MeshState } from "./MeshState";
import { ServiceDefinition, ServiceInformation } from "./ServiceDefinition";

export class MeshServer extends BackgroundService implements IServiceDiscovery {
    private bus: IMessageBus;
    public availableServices: string[] = []
    public meshState: MeshState
    public logger: ILogger;
    constructor(private serviceProvider: IServiceProvider) {
        super();
        this.logger = baseUtils.getLogger("MeshServer")
        this.serviceProvider = serviceProvider;
        this.bus = this.serviceProvider.getBus();
        this.meshState = new MeshState()

    }
    async executeService(serviceDefinition: ServiceDefinition, secondTry = false): Promise<ServiceInformation> {
        let executeServiceResult;
        const serviceDefinitionString = JSON.stringify(serviceDefinition)
        try {
            this.logger.debug(`a service was required with definition of ${serviceDefinitionString}`)
            const discovered = await (await this.discover(serviceDefinition)).filter(x => x.status == "started")
            if (discovered.length == 0) {
                this.logger.debug(`no services was discoverd, trying to query service capability`)
                const capabilities = await this.queryServiceCapability(serviceDefinition)
                if (capabilities.length > 0) {
                    this.logger.debug(`${capabilities.length} capable services were found`)
                    for (let i = 0; i < capabilities.length; i++) {
                        const node = capabilities[i]
                        if (node.acceptable) {
                            this.logger.debug(`ordering service to ${node.endpoint}`)
                            const res = await this.bus.createMessage(contracts.serviceOrder(serviceDefinition), undefined, node.endpoint).execute(undefined, 5 * 60 * 1000)
                            executeServiceResult = res.cast<ServiceInformation>()
                        }
                    }
                } else {
                    this.logger.debug(`no capable services were found, trying to spin up a new node`)
                    if (!secondTry) {
                        try {
                            await this.serviceProvider.getNodeManagerService().startNodeByServiceDefinition(serviceDefinition)
                            await baseUtils.delay(10000)
                            executeServiceResult = await this.executeService(serviceDefinition, true)

                        } catch (err) {
                            this.logger.error(`was uable to start a new node , ${err}`)
                        }
                    }
                }
            } else {
                this.logger.debug(`service ${serviceDefinitionString} was already available, returning information...`)
                executeServiceResult = discovered.find(x => x.status == "started")
            }
        } catch (err) {
            this.logger.error(`an error occured while trying to execute service definition ${serviceDefinitionString}\n${err}`)
        }
        if (executeServiceResult) {
            this.logger.info(`service requirement of ${serviceDefinitionString} was susccesfully satisfied, resulting service information is ${JSON.stringify(executeServiceResult)}`)
        } else {
            this.logger.warn(`failed to satisfy service requirement of ${serviceDefinitionString}`)
        }
        return executeServiceResult
    }
    async queryServiceCapability(serviceDefinition: ServiceDefinition): Promise<contracts.queryServiceCapabilityReply[]> {
        const providers: contracts.queryServiceCapabilityReply[] = []
        try {
            await this.bus.createMessage(contracts.queryServiceCapability(serviceDefinition)).execute((ctx) => {
                const res = ctx.message.cast<contracts.queryServiceCapabilityReply>()
                res.endpoint = ctx.message.from
                providers.push(res)
                return false
            }, 10000, true)
        } catch (err) {
            console.error(err);
        }
        return providers
    }
    discover(serviceDefinition: ServiceDefinition): Promise<ServiceInformation[]> {
        return this.meshState.queryServices(serviceDefinition)
    }

    protected async run(token: CancellationToken): Promise<void> {
        while (!token.isCancelled) {
            await baseUtils.delay(5000);
            this.meshState.disposeNode()
        }
    }
    async handleNodeStatusPayload(msg: IMessageContext) {
        const payload = msg.message.cast<contracts.NodeStatusPayload>()
        this.meshState.addNode(payload, msg.message.from)
    }
    async start(): Promise<void> {
        this.bus = this.serviceProvider.getBus();
        await this.bus.subscribe(contracts.NodeStatusEvent('*', null).topic, async (ctx) => {
            await this.handleNodeStatusPayload(ctx);
        });
        await this.bus.subscribe(contracts.requireService(null).topic, async (ctx) => {
            // ctx.reply(null)
            const executed = await this.executeService(ctx.message.cast<ServiceDefinition>())
            await ctx.reply(executed)
        })
        await this.bus.subscribe(contracts.registerService(null).topic, async (ctx) => {
            const manager = this.serviceProvider.getNodeManagerService();
            const repl = await manager.register(ctx.message.cast<any>());
            await ctx.reply(repl);
        });
        await this.bus.subscribe(SystemTopics.busdown, async (ctx) => {
            await Promise.resolve();
            if (ctx.message && ctx.message.cast<any>().endpoint) {
                this.logger.warn(
                    "MessageBus reports that a connection has been lost!!!")

            }
        });
        this.logger.info(
            `MeshServer Started. ${this.name}`);
        await super.start();
    }
    async stop(): Promise<void> {
        super.stop();
    }

}
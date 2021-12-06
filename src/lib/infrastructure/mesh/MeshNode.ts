import { baseUtils, CancellationToken, IServiceProvider } from "../base";
import { IMessageBus } from "../bus";
import * as contracts from '../contracts';
import { queryServicePayload } from "../contracts";
import { BackgroundService } from "../hosting";

import { ServiceDefinition } from "./ServiceDefinition";


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
    serviceCapability: serviceCapability
    executeservice: executeservice
    queryService: queryService
}
export class MeshNode extends BackgroundService {

    private _bus: IMessageBus;
    public name: string;
    constructor(private serviceProvider: IServiceProvider, private config: MeshNodeConfiguration) {
        super();

    }
    protected async run(token: CancellationToken): Promise<void> {

        while (!token.isCancelled) {
            await baseUtils.delay(3 * 1000);
            await this._bus.createMessage(
                contracts.NodeStatusEvent(this.name, {
                    alive: true,
                    services: this.config.queryService ? this.config.queryService() : []
                }))
                .publish();
        }
    }

    async start() {
        this._bus = this.serviceProvider.getBus();
        this.name = this._bus.endpoint;
        await this._bus.subscribe(contracts.queryServiceCapability(null).topic, async (ctx) => {
            if (this.config.serviceCapability) {
                const res = await this.config.serviceCapability(ctx.message.cast<queryServicePayload>())
                await ctx.reply(res)
            }
        })
        await this._bus.subscribe(contracts.serviceOrder(null).topic, async (ctx) => {
            if (this.config.executeservice) {
                const res = await this.config.executeservice(ctx.message.cast<contracts.serviceOrderPayload>())
                await ctx.reply(res)
            }
        })
        await super.start();
    }
    async stop() {
        await super.stop();
    }


}
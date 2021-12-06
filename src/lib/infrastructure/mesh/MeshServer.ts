import { baseUtils, CancellationToken, IServiceProvider } from "../base";
import { IMessageBus } from "../bus";
import { BackgroundService, } from "../hosting";
import * as contracts from '../contracts'

export class MeshServer extends BackgroundService {
    private bus: IMessageBus;
    constructor(private serviceProvider: IServiceProvider) {
        super();
        this.serviceProvider = serviceProvider;
        this.bus = this.serviceProvider.getBus();
    }

    protected async run(token: CancellationToken): Promise<void> {

        while (!token.isCancelled) {

            await baseUtils.delay(5000);
        }
    }




    async start(): Promise<void> {
        this.bus = this.serviceProvider.getBus();
        this.bus.subscribe(contracts.NodeStatusEvent('*', null).topic, async (ctx) => {
            ctx.message.cast<string>();
            await Promise.resolve();
        });


        await super.start();
    }
    async stop(): Promise<void> {
        super.stop();
    }

}
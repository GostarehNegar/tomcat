import { baseUtils, CancellationToken, IServiceProvider } from "../base";
import { BackgroundService } from "../hosting";
import * as contracts from '../contracts';
import { IMessageBus } from "../bus";

export class MeshNode extends BackgroundService {

    private _bus: IMessageBus;
    public name: string;
    constructor(private serviceProvider: IServiceProvider) {
        super();
    }
    protected async run(token: CancellationToken): Promise<void> {

        while (!token.isCancelled) {
            await baseUtils.delay(15 * 1000);
            await this._bus.createMessage(
                contracts.NodeStatusEvent(this.name, {
                    alive: true
                }))
                .publish();
        }
    }

    async start() {
        this._bus = this.serviceProvider.getBus();
        this.name = this._bus.endpoint;
        const message = contracts.NodeStatusEvent(this.name, {
            alive: true
        });
        (message)


        await this._bus.createMessage(
            contracts.NodeStatusEvent(this.name, {
                alive: true
            }))
            .publish();
        await super.start();
    }
    async stop() {
        await super.stop();
    }


}
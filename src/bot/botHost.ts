import { IStopCallBack } from "../common/IStopCallBack";
import { IServiceProvider, Ticks } from "../infrastructure/base";
import { HostBuilder, IHostBuilder, IWebHost } from "../infrastructure/hosting";
import { WebHost } from "../infrastructure/hosting/WebHost";
import { ServiceDescriptor } from "../infrastructure/mesh";

import { IPipeline, Pipeline } from "../pipes";
export interface IBotDescriptor {



}
export class BotDescriptor implements IBotDescriptor {

    public BotDescriptor() {
    }

    getDescriptor(): ServiceDescriptor {

        return null;

    }

}

export interface IBotHostBuilder extends IHostBuilder {
    build(): IBotHost
    addBot(configure: (bot: IBotDescriptor) => void): IBotHostBuilder;

}

export class BotHostBuilder extends HostBuilder implements IBotHostBuilder {
    constructor(name: string) {
        super(name)
    }
    addBot(configure: (bot: IBotDescriptor) => void): IBotHostBuilder {
        var descriptor = new BotDescriptor();
        configure(descriptor);
        this.addMessageBus();
        this.addMeshService(descriptor.getDescriptor());
        throw new Error("Method not implemented.");
    }
    // addBot(): IBotHostBuilder {
    //     throw new Error("Method not implemented.");
    // }
    build(): IBotHost {
        return new BotHost(this._name, this.services)
    }
}
export interface IBotHost extends IWebHost {
    get pipeline(): IPipeline
    startEx(startTime: Ticks, stopCallBack: IStopCallBack): Promise<void>
}

export class BotHost extends WebHost implements IBotHost {
    public pipeline: Pipeline
    constructor(public name: string, public services: IServiceProvider) {
        super(name, services)
        this.pipeline = new Pipeline(null, services)
    }
    async startEx(startTime: Ticks, stopCallBack: IStopCallBack) {
        await super.start()
        await this.pipeline.startEx(startTime, stopCallBack)
    }
}
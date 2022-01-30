import utils from "../common/Domain.Utils";
import { IStopCallBack } from "../common/IStopCallBack";
import { CancellationToken, IServiceProvider, Ticks } from "../infrastructure/base";
import { BaseConstants } from "../infrastructure/base/baseconstants";
import { BackgroundService, HostBuilder, IHostBuilder, IWebHost } from "../infrastructure/hosting";
import { WebHost } from "../infrastructure/hosting/WebHost";
import { IPipeline, Pipeline } from "../pipes";

export interface IBotBuilder extends IHostBuilder {
    build(): IBot
}

export class BotBuilder extends HostBuilder implements IBotBuilder {
    constructor(name: string) {
        super(name)
    }
    build(): IBot {
        return new Bot(this._name, this.services)
    }
}
export interface IBot extends IWebHost {
    get pipeline(): IPipeline
    startEx(startTime: Ticks, stopCallBack: IStopCallBack): Promise<void>
}

export class BotHeartBeat extends BackgroundService {
    constructor(private bot: Bot) {
        super();
    }
    protected async run(token: CancellationToken): Promise<void> {
        while (!token.isCancelled) {
            await this.bot.services.getBus().createMessage("").publish()
            await utils.delay(5000)
        }
    }
}
export class Bot extends WebHost implements IBot {
    public pipeline: Pipeline
    constructor(public name: string, public services: IServiceProvider) {
        super(name, services)
        const heartBeat = new BotHeartBeat(this)
        this.services.register(BaseConstants.ServiceNames.IHostedService, () => heartBeat)
        this.pipeline = new Pipeline(null, services)
    }
    async startEx(startTime: Ticks, stopCallBack: IStopCallBack) {
        await super.start()
        await this.pipeline.startEx(startTime, stopCallBack)
    }
}
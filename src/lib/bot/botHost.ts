import { IIndicator } from "../indicators";
import { IServiceProvider } from "../infrastructure/base";
import { WebHost } from "../infrastructure/hosting/WebHost";
import { IFilterCallBack, IFilterOptions, Pipeline } from "../pipes";

export interface IBotHost {
    addFilter(cb: IFilterCallBack | IIndicator, options?: IFilterOptions): IBotHost
    addApi(url: string, cb: (req, res) => void): IBotHost
    addService(name: string, ctor: unknown): IBotHost
    listen(port: number)
}
export class BotHost extends WebHost implements IBotHost {
    public pipeline: Pipeline
    constructor(public name: string, public services: IServiceProvider) {
        super(name, services)
        this.pipeline = new Pipeline(null, services)
    }
    addFilter(cb: IFilterCallBack | IIndicator, options?: IFilterOptions): IBotHost {
        this.pipeline.add(cb, options)
        return this
    }
    addApi(url, cb): IBotHost {
        this.expressApp.get(url, cb)
        return this
    }
    addService(name: string, ctor: unknown): IBotHost {
        this.services.register(name, ctor)
        return this
    }


}
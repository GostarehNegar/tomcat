import { IServiceContainer } from "../../base/ServiceContainer";
import { CanellationToken, IHost, IHostedService } from "../interfaces";
import { serviceNames } from "./ServerBuilder";

export class Host implements IHost {
    private _tasks: IHostedService[] = [];
    public started: boolean;
    constructor(public services: IServiceContainer) {
        this._tasks = this.services
            .getServices<IHostedService>(serviceNames.IHostedService);
    }
    start(): Promise<any> {
        if (this.started)
            return Promise.resolve();
        this.started = true;
        return Promise.all(this._tasks.map(x => x.start()));
    }
    stop(): Promise<any> {
        return Promise.all(this._tasks.map(x => x.stop()));
    }
    run(token: CanellationToken) {
        (token);
    }
}

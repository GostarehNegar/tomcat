
import _locator, { IServiceLocator } from "../base/ServiceLocator";

export interface CanellationToken {
    get isCancelled(): boolean;
}
export class CancellationTokenSource implements CanellationToken {

    public isCancelled: boolean;
    constructor() {
        this.isCancelled = false;
    }
    public cancel() {
        this.isCancelled = true;
    }

}



export interface IServer {
    get services(): IServiceLocator;
    start(): Promise<void>;
    stop(): Promise<void>

}
export interface ISeverBuilder {
    build(): IServer;
    addTask(task: IServerTask | ((IServiceLocator) => IServerTask)): ISeverBuilder;
    addService(name: string, ctor: any | ((locator: IServiceLocator) => any), key?: string): ISeverBuilder;

}
export abstract class IServerTask {
    protected _token: CancellationTokenSource = new CancellationTokenSource();
    protected _task: Promise<void> | null = null;
    public name: string;
    async start() {
        this._task = this.run(this._token);
    }
    protected run(token: CanellationToken): Promise<void> {
        (token)
        return Promise.resolve();
    }
    async stop() {
        this._token.cancel();
        if (this._task) {
            await this._task;
        }
    }
}
export class Server implements IServer {
    private _tasks: IServerTask[] = [];
    constructor(public services: IServiceLocator) {
        this._tasks = this.services.getServices("_SERVER_TASK_")

    }

    start(): Promise<any> {

        return Promise.all(this._tasks.map(x => x.start()));
    }
    stop(): Promise<any> {
        return Promise.all(this._tasks.map(x => x.stop()));
    }
    run(token: CanellationToken) {
        (token)

    }
}
export class SimpleTask extends IServerTask {


    protected override run(token: CanellationToken): Promise<void> {
        (token)
        throw new Error("Method not implemented.");
    }


}

export class ServerBuilder implements ISeverBuilder {

    public services: IServiceLocator = _locator;
    constructor() {
        ("");

    }
    public addDefaultServices(): ISeverBuilder {
        return this;
    }
    public build(): IServer {
        return new Server(this.services);

    }
    public addTask(task: IServerTask | ((IServiceLocator) => IServerTask)): ISeverBuilder {
        this.addService("_SERVER_TASK_", task);
        return this;
    }
    public addService(name: string, ctor: any | ((loc: IServiceLocator) => any), key?: string): ISeverBuilder {
        this.services.register(name, ctor, key)
        return this;
    }


}
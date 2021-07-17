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

}
export interface ISeverBuilder {

}
export abstract class ServerTask {
    protected _token: CancellationTokenSource = new CancellationTokenSource();
    protected _task: Promise<void> | null = null;
    public abstract get name(): string;
    async startAsync(token: CanellationToken) {
        (token)
        this._task = this.run(this._token);
    }
    protected abstract run(token: CanellationToken): Promise<void>;
    async stopAsync(token: CanellationToken) {
        (token)
        this._token.cancel();
        if (this._task) {
            await this._task;
        }

    }

}
export class Server implements IServer {

    start(): void {

        //_locator.getService
        const task = new SimpleTask();

    }
    stop(): void {

    }
    run(token: CanellationToken) {
        const task = new SimpleTask();
        task.startAsync(token);

    }
}
export class SimpleTask extends ServerTask {
    public get name(): string {
        return "simple.task";
    }

    protected override run(token: CanellationToken): Promise<void> {
        throw new Error("Method not implemented.");
    }


}

export class ServerBuilder implements ISeverBuilder {

    public services: IServiceLocator = _locator;
    constructor() {

    }
    public addDefaultServices(): ISeverBuilder {
        return this;
    }
    public build(): IServer {
        return new Server();

    }
    public addTask(task: ServerTask): ISeverBuilder {
        (task)
        return this;
    }
    public addService(name: string, ctor: (IServiceLocator) => any | any, key?: string): ISeverBuilder {
        this.services.register(name, ctor, key)
        return this;
    }


}
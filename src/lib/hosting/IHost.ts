import { IServiceProvider } from "../base";
import { IMessageBus } from "../bus";
import { config } from "../config";


export interface IHost {
    get services(): IServiceProvider; get name(): string; start(): Promise<unknown>;
    stop(): Promise<unknown>;
    get config(): typeof config; get bus(): IMessageBus;
}
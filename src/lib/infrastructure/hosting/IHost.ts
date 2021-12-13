import { config } from "../../config";
import { IServiceProvider } from "../base";
import { IMessageBus } from "../bus";
import { IMeshNode } from "../mesh";


export interface IHost {
    get services(): IServiceProvider;
    get name(): string;
    start(): Promise<unknown>;
    stop(): Promise<unknown>;
    get config(): typeof config;
    get bus(): IMessageBus;
    get node(): IMeshNode
}

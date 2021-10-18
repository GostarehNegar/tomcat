import { config } from "../../config";
import { Pipeline } from "../../pipes";
import { IServiceProvider } from "../base";
import { IMessageBus } from "../bus";


export interface IHost {
    get services(): IServiceProvider; get name(): string; start(): Promise<unknown>;
    stop(): Promise<unknown>;
    get config(): typeof config; get bus(): IMessageBus;
    get pipeline(): Pipeline
    // get bots(): BotCollection;
}

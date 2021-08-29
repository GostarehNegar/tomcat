import { IHost } from './IHost';
import { IHostBuilder } from "./IHostBuilder";

export interface IHostCollection {
    add(name: string, item: IHost): IHost;
    getByName(name: string): IHost;
    getHostBuilder(name?: string): IHostBuilder;
    get current(): IHost;
}

import { RedisClientOptions } from '../services/RedisClientOptions'

import { IStore } from "./IStore";
export type StoreProviders = 'redis' | 'sql'

export interface IFactoryOptions {
    provider: StoreProviders,
    redis?: RedisClientOptions;

}
export interface IStoreFactory {
    createStore(opt: IFactoryOptions): IStore;
}
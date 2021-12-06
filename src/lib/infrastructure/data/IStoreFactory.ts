import { IStore } from "./IStore";
import { RedisClientOptions } from '../services/RedisClientOptions'
export type StoreProviders = 'redis' | 'sql'

export interface IFactoryOptions {
    provider: StoreProviders,
    redis?: RedisClientOptions;

}
export interface IStoreFactory {
    createStore(opt: IFactoryOptions): IStore;
}
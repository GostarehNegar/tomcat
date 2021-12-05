import { IStore } from "./IStore";
export type StoreProviders = 'redis' | 'sql'
export interface IStoreFactory {
    createStore(provider: StoreProviders): IStore;
}
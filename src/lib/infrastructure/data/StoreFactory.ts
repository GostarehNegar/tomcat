import { IServiceProvider } from "../base";
import { IStore } from "./IStore";
import { IStoreFactory, StoreProviders } from "./IStoreFactory";
import { ReidsStore } from "./RedisRepository";

export class StoreFactory implements IStoreFactory {
    constructor(public sericeProvider: IServiceProvider) {

    }
    createStore(provider: StoreProviders): IStore {
        switch (provider) {
            case 'redis':
                return new ReidsStore(this.sericeProvider);
            default:
                return new ReidsStore(this.sericeProvider);
        }
    }

}
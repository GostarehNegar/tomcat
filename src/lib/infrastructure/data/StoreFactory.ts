import { IStore } from "./IStore";
import { IStoreFactory, StoreProviders } from "./IStoreFactory";
import { ReidsStore } from "./RedisRepository";

export class StoreFactory implements IStoreFactory {
    createStore(provider: StoreProviders): IStore {
        switch (provider) {
            case 'redis':
                return new ReidsStore();
            default:
                return new ReidsStore();
        }
    }

}
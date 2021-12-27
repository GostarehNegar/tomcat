import { IServiceProvider } from "../base";

import { IStore } from "./IStore";
import { IFactoryOptions, IStoreFactory } from "./IStoreFactory";
import { ReidsStore } from "./ReidsStore";

export class StoreFactory implements IStoreFactory {
    constructor(public sericeProvider: IServiceProvider) {

    }
    createStore(options: IFactoryOptions): IStore {
        switch (options.provider) {
            case 'redis':
                return new ReidsStore(this.sericeProvider, options.redis);
            default:
                return new ReidsStore(this.sericeProvider, options.redis);
        }
    }

}
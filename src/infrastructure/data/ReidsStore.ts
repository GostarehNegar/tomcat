import { baseUtils, IServiceProvider } from "../base";
import { RedisClientOptions } from "../services/RedisClientOptions";

import { IDataStream } from "./IDataSream";
import { IRepository } from "./IRepository";
import { IStore } from "./IStore";
import { RedisDataStream } from "./RedisDataStream";
import { RedisRepository } from "./RedisRepository";

export class ReidsStore implements IStore {
    constructor(public serviceProvider: IServiceProvider, public options: RedisClientOptions) {
    }
    getDataStream<T>(name: string): IDataStream<T> {
        return new RedisDataStream<T>(name, undefined, this.serviceProvider);
    }
    async getRepositoryAsync<T>(name: string | T): Promise<IRepository<T>> {
        if (typeof name !== 'string') {
            name = baseUtils.getClassName(name);
        }
        const result = new RedisRepository<T>(name, this.serviceProvider, this.options);
        await result.ensureConnection();

        return result;
    }
    getRepository<T>(name: string | T): IRepository<T> {
        if (typeof name !== 'string') {
            name = baseUtils.getClassName(name);
        }
        return new RedisRepository<T>(name, this.serviceProvider, this.options);
    }

}

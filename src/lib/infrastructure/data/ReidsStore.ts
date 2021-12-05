import { baseUtils, IServiceProvider } from "../base";
import { IDataStream } from "./IDataSream";
import { IRepository } from "./IRepository";
import { IStore } from "./IStore";
import { RedisDataStream } from "./RedisDataStream";
import { RedisRepository } from "./RedisRepository";

export class ReidsStore implements IStore {
    constructor(public serviceProvider: IServiceProvider) {
    }
    getDataStream<T>(name: string): IDataStream<T> {
        return new RedisDataStream<T>(name, undefined, this.serviceProvider);
    }
    async getRepositoryAsync<T>(name: string | T): Promise<IRepository<T>> {
        if (typeof name !== 'string') {
            name = baseUtils.getClassName(name);
        }
        var result = new RedisRepository<T>(name, this.serviceProvider);
        await result.ensureConnection();

        return result;
    }
    getRepository<T>(name: string | T): IRepository<T> {
        if (typeof name !== 'string') {
            name = baseUtils.getClassName(name);
        }
        return new RedisRepository<T>(name, this.serviceProvider);
    }

}

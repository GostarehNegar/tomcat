import { IDataStream } from "./IDataSream";
import { IRepository } from "./IRepository";


export interface IStore {
    getRepository<T>(name: string | T): IRepository<T>;
    getRepositoryAsync<T>(name: string | T): Promise<IRepository<T>>
    getDataStream<T>(name: string): IDataStream<T>;
}

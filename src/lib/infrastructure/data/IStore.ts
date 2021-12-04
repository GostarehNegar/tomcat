import { IRepository } from "./IRepository";


export interface IStore {
    getRepository<T>(name: string | T): IRepository<T>;
}

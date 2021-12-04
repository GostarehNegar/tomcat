export interface IRepository<T> {
    get(id: string): Promise<T>;
    insert(val: T, id?: string): Promise<T>;
    //getAll(): Promise<T[]>;
    //getIter(): Promise<AsyncGenerator<T>>;
    iterator(): AsyncGenerator<T>;
    toArray(predicate?: (item: T) => boolean, limit?: number): Promise<T[]>;
    delete(id: string): Promise<unknown>;

}
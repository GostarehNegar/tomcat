export interface IDistributedCacheService {
    get<T>(key: string): Promise<T>;
    set<T>(key: string, value: T, expiresInSecods: number): Promise<unknown>;
}

import { IDistributedCacheService } from "../ICacheService";
import { IRedisClientFactory } from "./IRedisClientFactory";

import { RedisClient } from "..";

export class RedisCacheService implements IDistributedCacheService {

    private client: RedisClient;
    constructor(clientFactory: IRedisClientFactory) {
        this.client = clientFactory.createClient({});
    }
    private _get<T>(key: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.client.get(key, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    if (res && res != null) {
                        resolve(JSON.parse(res));
                    } else {
                        resolve(null);
                    }
                }

            });

        })


    }
    _set<T>(key: string, value: T, expiresInSecods: number): Promise<unknown> {

        return new Promise<unknown>((resolve, reject) => {
            this.client.setex(key, expiresInSecods, JSON.stringify(value), (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res);
                }

            });

        });

    }
    async set<T>(key: string, value: T, expiresInSecods: number): Promise<unknown> {
        await this.client.ensureConnection();
        return await this._set<T>(key, value, expiresInSecods);

        return new Promise<unknown>((resolve, reject) => {
            this.client.setex(key, expiresInSecods, JSON.stringify(value), (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res);
                }

            });

        });

    }
    async get<T>(key: string): Promise<T> {
        await this.client.ensureConnection();
        return await this._get<T>(key);
    }

}
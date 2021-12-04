
import { RedisClient } from ".";
import { IDistributedCacheService } from "./ICacheService";
import { IRedisClientFactory } from "./IRedisClientFactory";

export class RedisCacheService implements IDistributedCacheService {

    private client: RedisClient;
    constructor(clientFactory: IRedisClientFactory) {
        this.client = clientFactory.createClient({});
    }
    get<T>(key: string): Promise<T> {
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

        throw new Error("Method not implemented.");
    }
    set<T>(key: string, value: T, expiresInSecods: number): Promise<unknown> {

        return new Promise<unknown>((resolve, reject) => {
            this.client.setex(key, expiresInSecods, JSON.stringify(value), (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res);
                }

            });

        });
        throw new Error("Method not implemented.");
    }
}
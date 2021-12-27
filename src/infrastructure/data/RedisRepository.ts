

import { baseUtils, ILogger, IServiceProvider } from "../base";
import { RedisClient } from "../services";
import { RedisClientOptions } from "../services/RedisClientOptions";

import { IRepository } from "./IRepository";

/// revise it according to this example:
// https://github.com/redis/node-redis/blob/master/examples/search-hashes.js
export class RedisRepository<T> implements IRepository<T>{
    private _client: RedisClient;
    private logger: ILogger;
    constructor(public readonly name: string, serviceProvider: IServiceProvider, options: RedisClientOptions) {
        serviceProvider = serviceProvider || baseUtils.getServiceProvider();
        this._client = serviceProvider.getRedisFactory().createClient(options);
        this.logger = baseUtils.getLogger('RedisRepository');
        (this.logger);
    }
    private get client() {
        return this._client;
    }
    async ensureConnection() {
        return this.client.ensureConnection();
    }
    _delete(id: string): Promise<unknown> {
        const key = this._getKey(id);
        return new Promise<number>((resolve, reject) => {
            this.client.del(key, (error, res) => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(res);
                }
            })
        });
    }


    private _exists(key: string): Promise<boolean> {
        //var key = this._getKey(id);
        return new Promise<boolean>((resolve, reject) => {
            this.client.exists(key, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res > 0);
                }
            });

        });
    }


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async * _getIterator(): AsyncGenerator<T, any, undefined> {
        let cursor = '0';
        const match = this._getKey('*');
        let ids: string[] = [];
        await this.client.ensureConnection();
        while (true) {
            const res = await this.scan(cursor, match);
            if (Array.isArray(res[1]) && res[1].length > 0) {
                const values = await this._getMany(res[1].filter(x => ids.indexOf(x) == -1));
                ids = ids.concat(res[1]);
                for (let i = 0; i < values.length; i++) {
                    if (values[i] && values[i] != null) {
                        yield JSON.parse(values[i]) as T
                    }
                }
            }
            cursor = res[0];
            if (cursor == '0')
                break;
        }
    }
    private scan(cursor: string, match: string) {
        //const match = this.getKey('*');
        return new Promise<[string, string[]]>((resolve, reject) => {
            this.client.scan(cursor, 'MATCH', match, (err, res) => {
                if (err) {
                    reject(err)
                }
                else {
                    if (Array.isArray(res) && typeof res[0] === 'string' && Array.isArray(res[1])) {
                        resolve(res);
                    } else {
                        reject('unexpected');
                    }

                }

            });

        });

    }
    async _getMany(keys: string[]): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (!keys || keys.length < 1) {
                resolve([]);
                return
            }
            //this.client.mget()
            this.client.mget(keys, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })
    }
    private _getKey(id?: string): string {
        return `${this.name}:${id}`

    }
    _getByKey(key: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.client.get(key, (error, res) => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(JSON.parse(res) as T);
                }
            })

        });
    }
    _insert(val: T, id?: string): Promise<T> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id = id || (val as any).id;
        if (typeof id !== 'string') {
            baseUtils.Throw('unexpected', 'Id not Found');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const key = this._getKey(id || (val as any).id);
        const value = JSON.stringify(val);
        return new Promise((resolve, reject) => {
            this.client.set(key, value, (err, res) => {
                //this.client.sendCommand('HSET', [key, 'val', JSON.stringify(val)], (err, res) => {
                if (err) {
                    reject(err);

                } else {
                    (res);
                    resolve(val);
                }
            });

        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    iterator(): AsyncGenerator<T, any, undefined> {
        return this._getIterator();
    }

    async get(id: string): Promise<T> {
        await this.client.ensureConnection();
        const key = this._getKey(id);
        return await this._getByKey(key);
    }
    async insert(val: T, id?: string): Promise<T> {
        await this.client.ensureConnection();
        return await this._insert(val, id);
    }
    async delete(id: string): Promise<unknown> {
        await this.ensureConnection();
        return await this._delete(id)
    }
    public async exists(id: string): Promise<boolean> {
        const key = this._getKey(id);
        await this.ensureConnection();

        return await this._exists(key);
    }

    async toArray(predicate: (item: T) => boolean = null, limit = 100): Promise<T[]> {
        const result: T[] = [];

        for await (const v of this.iterator()) {
            if (result.length >= limit) {
                break;
            }
            if (!predicate || predicate(v)) {
                result.push(v);
            }
        }
        return result;
    }




}


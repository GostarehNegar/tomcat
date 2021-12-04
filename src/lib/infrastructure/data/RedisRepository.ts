

import { baseUtils } from "../base";
import BaseServices from "../base/BaseServices";
import { RedisClient } from "../services";
import { IRepository } from "./IRepository";
import { IStore } from "./IStore";
// async function* name<T>(params: string[], cb: (id: string) => Promise<T>) {
//     for (let i = 0; i < params.length; i++) {
//         const item = await cb(params[i]);
//         yield item;
//     }
// }

export class RedisRepository<T> implements IRepository<T>{
    private client: RedisClient;
    constructor(public readonly name: string) {
        this.client = BaseServices.getRedisFactory().createClient({});
        (this.client);

    }
    delete(id: string): Promise<unknown> {
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
    async toArray(predicate: (item: T) => boolean = null, limit: number = 100): Promise<T[]> {
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


    private async * _getIterator(): AsyncGenerator<T, any, undefined> {
        let cursor = '0';
        const match = this._getKey('*');
        let ids: string[] = [];
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
    iterator(): AsyncGenerator<T, any, undefined> {
        return this._getIterator();
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
            this.client.MGET(keys, (err, res) => {
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
    insert(val: T, id?: string): Promise<T> {
        id = id || (val as any).id;
        if (typeof id !== 'string') {
            baseUtils.Throw('unexpected', 'Id not Found');
        }
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
        throw new Error("Method not implemented.");
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
    get(id: string): Promise<T> {
        var key = this._getKey(id);
        return this._getByKey(key);
    }


}
export class ReidsStore implements IStore {
    getRepository<T>(name: string | T): IRepository<T> {
        if (typeof name !== 'string') {
            name = baseUtils.getClassName(name);
        }
        return new RedisRepository<T>(name);
    }

}
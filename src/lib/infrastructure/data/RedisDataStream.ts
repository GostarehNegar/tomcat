

import { baseUtils, IServiceProvider, Ticks, TimeEx } from "../base";
import { ISerielizationService, RedisClient } from "../services";
import { IDataStream } from "./IDataSream";
type decoded = {
    id: string,
    stamp: string,
    value: string
};

export class RedisDataStream<T> implements IDataStream<T>{
    private serializer: ISerielizationService;
    constructor(public name: string, private client?: RedisClient, private serviceProvider?: IServiceProvider) {
        this.serviceProvider = serviceProvider || baseUtils.getServiceProvider();
        this.client = client || this.serviceProvider.getRedisFactory().createClient({});
        this.serializer = this.serviceProvider.getSerilizer();

        (this.client);
    }
    async _listenForMessage(lastId = "$", cb: (item: T, time: Ticks) => boolean, client: RedisClient) {
        // `results` is an array, each element of which corresponds to a key.
        // Because we only listen to one key (mystream) here, `results` only contains
        // a single element. See more: https://redis.io/commands/xread#return-value
        //const client = await this._getClient();
        await client.ensureConnection();
        const results = await client.duplicate().xread("block", 0, "STREAMS", this.name, lastId);
        const [key, messages] = results[0]; // `key` equals to "mystream"
        (key);
        const data = this.decode(messages);
        for (let i = 0; i < data.length; i++) {
            const val = this.serializer.deserialize<T>(data[i].value);
            const tick = parseInt(data[i].id);
            if (cb && cb(val, tick)) {
                return;
            }
        }
        // Pass the last id of the results to the next round.
        await this._listenForMessage(messages[messages.length - 1][0], cb, client);
    }
    async play(cb: (item: T, time: Ticks) => boolean, start?: Ticks): Promise<unknown> {
        start = start === 0 ? 1 : start;
        const _lastId = start ? baseUtils.ticks(start).toString() : '$'
        const client = (await this._getClient()).Duplicate();
        return this._listenForMessage(_lastId, cb, client);

    }

    private decode(x: [string, string[]][]): decoded[] {
        const result: decoded[] = [];
        if (x) {
            x.forEach(y => {
                const valid = Array.isArray(y) && y.length == 2 && Array.isArray(y[1]) && y[1].length == 2;
                if (!valid) {
                    console.error('Unexpected result from XRANGE.')
                }
                result.push({
                    id: y[0],
                    stamp: y[1][0],
                    value: y[1][1]
                })
            });
        }
        return result;
    }
    private async *_getIterator(start: Ticks, end: Ticks, count?: number): AsyncGenerator<T, any, undefined> {
        const client = await this._getClient();


        const _start = start ? baseUtils.ticks(start).toString() : '-';
        const _end = end ? baseUtils.ticks(end).toString() : '+';
        const _count = count || 1000;
        //const time_tag = `${_start}-${_end}`;
        //const res = await client.xread('COUNT', _count, 'STREAMS', this.name, time_tag);
        const res = this.decode(await client.xrange(this.name, _start, _end, 'COUNT', _count));
        for (let i = 0; i < res.length; i++) {
            yield this.serializer.deserialize<T>(res[i].value);
        }
    }
    iterator(start?: Ticks, end?: Ticks, count?: number): AsyncGenerator<T> {
        return this._getIterator(start, end, count);
    }

    async toArray(predicate?: (item: T) => boolean, start?: Ticks, end?: Ticks, count?: number): Promise<T[]> {
        const result: T[] = [];
        const _count = predicate ? 10000 : count;
        for await (const item of this.iterator(start, end, _count)) {
            if (count && result.length >= count) {
                break;
            }
            if (!predicate || predicate(item)) {
                result.push(item)
            }
        }
        return result;
    }
    async test(): Promise<void> {

        const client = await this._getClient();
        const info = await this._getInfo();
        const res = await client.xrange('BLOCK', 10000, 'STREAMS', this.name, '$');
        (res);
        (info);
        console.log(res);
    }
    private async _getClient(): Promise<RedisClient> {
        await this.client.ensureConnection();
        return this.client;
    }
    async add(value: T, time: Ticks): Promise<unknown> {
        const client = await this._getClient();
        const id = time ? baseUtils.ticks(time).toString() : "*";
        time = baseUtils.toTimeEx(time);
        return await client.xadd(this.name,
            id,
            time.toString(),
            this.serializer.serialize(value)
        );
    }
    getAt(time: TimeEx): Promise<T> {
        (time)
        throw new Error("Method not implemented.");
    }
    private async _getInfo() {
        const client = await this._getClient();
        try {
            const res = await client.xinfo("STREAM", this.name);
            return {
                length: res && res.length > 0 ? res[1] : null,
                lastGeneratedId: res && res.length > 6 ? res[7] : null
            }
        }
        catch {

        }
        return null;
    }


}
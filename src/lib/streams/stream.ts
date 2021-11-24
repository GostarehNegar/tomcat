import { baseUtils, Ticks } from "../infrastructure/base"


import { RedisStream } from ".";

export interface IStream<T> {
    play(cb: (OBJECT: T, err) => Promise<boolean>, startTime?: Ticks): Promise<void>
    write(id: Ticks, data: T): Promise<unknown>
}




export class Stream<T> implements IStream<T> {
    public deSerialize: (data: string) => T;
    private _redisStream: RedisStream;


    constructor(private _streamName: string, deserialize?: (data: string) => T) {
        this.deSerialize = deserialize || (data => (typeof data === 'string' ? data : JSON.parse(data)) as T)
    }

    get streamName() {
        return this._streamName
    }
    async play(cb: (OBJECT: T, err) => Promise<boolean>, startTime: Ticks = 0) {
        const stream = new RedisStream(this._streamName)
        await stream.XREADBLOCK((res, err) => {
            // return cb && cb(res ? JSON.parse(res) as CandleStickData : null, err)
            // if (res && res.candle === "null") {
            //     if (generateMissingCandles) {
            //         const mCandle = CandleStickData.fromMissing(res.id, res.id + 60000 - 1)
            //         return cb && cb(mCandle, err)

            //     }
            //     return false
            // }
            return cb && cb(res ? this.deSerialize(res.data) : null, err)
            // return cb && cb(res ? CandleStickData.from(JSON.parse(res)) : null, err)
        }, baseUtils.ticks(startTime).toString())
    }
    async write(id: Ticks, data: T): Promise<unknown> {
        return await this.redisStream.XADD(id, data, true)
    }
    protected get redisStream() {
        this._redisStream = this._redisStream || new RedisStream(this._streamName);
        return this._redisStream
    }
    async getElement(time: Ticks): Promise<T> {
        const res = await this.redisStream.XRANGE(time);
        return res ? this.deSerialize(res) : null;
    }
    async getLastElement(): Promise<T> {
        const res = await this.getLastElements(1)
        return res.length > 0 ? res[0] : null
    }
    async getLastElements(count): Promise<T[]> {
        const res = await this.redisStream.XREVRANGE(count);
        return res ? res.map(x => this.deSerialize(x)) : []
    }
    async getCount() {
        // const streams = await this.redisStream.SCANSTREAMS()
        try {
            return (await this.redisStream.XINFO()).length
        } catch (err) {
            return 0
        }
        // const a = await this.redisStream.XINFO();
        // console.log(a);
        // return streams && streams.indexOf(this._streamName) != -1 ? (await this.redisStream.XINFO()).length : 0
    }
    async exists() {
        return await this.redisStream.exists()
    }
    async creatStream() {
        return await this.redisStream.XCREATE()
    }
    // async quit() {
    //     this._isStop = true;
    //     if (this._redisStream) {
    //         await this._redisStream.quit();
    //     }
    //     this._redisStream = null;
    //     return this._myPromise;
    // }
}
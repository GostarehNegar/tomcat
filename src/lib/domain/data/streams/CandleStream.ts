import EventEmitter from "events";

import { Ticks, utils } from "../../../base";
import { CandleStickData } from "../../base";
import { IDataSource } from "../base";

import { RedisStream } from "./RedisStream";

export interface ICandleStream {
    get isWriter(): boolean;
    play(cb: (candle: CandleStickData, err) => boolean, startTime?: Ticks, timeOut?, count?, generateMissingCandles?): Promise<void>
    start(startTime?: Ticks, cb?: (candle: CandleStickData) => boolean): Promise<void>
}

export class CandleStream extends EventEmitter implements ICandleStream {
    public _redisStream: RedisStream;
    protected _isStop = false;
    protected _myPromise: Promise<void>;
    constructor(private _streamName: string) {
        super()
        // this._streamName = _streamName || `candles-${this.dataSource.exchange}-${this.dataSource.market}-${this.dataSource.symbol}-${this.dataSource.interval}`

    }
    start(startTime?: Ticks, cb?: (candle: CandleStickData) => boolean): Promise<void> {
        (startTime);
        (cb)
        return Promise.resolve()
    }
    get isWriter(): boolean {
        return false
    }
    get streamName() {
        return this._streamName
    }
    async getCandle(time: Ticks) {
        const res = await this.redisStream.XRANGE(time);
        return res ? JSON.parse(res) : null;
    }
    async getLastCandle() {
        const res = await this.getLastCandles(1)
        return res.length > 0 ? res[0] : null
    }
    async getLastCandles(count) {
        const res = await this.redisStream.XREVRANGE(count);
        return res ? res.map(x => CandleStickData.from(JSON.parse(x))) : []
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

    async write(id: Ticks, data: CandleStickData): Promise<unknown> {
        return await this.redisStream.XADD(id, data)
    }

    async exists() {
        return await this.redisStream.exists()
    }
    async creatStream() {
        return await this.redisStream.XCREATE()
    }
    async play(cb: (candle: CandleStickData, err) => boolean, startTime: Ticks = 0, timeOut = 500000, count = 1, generateMissingCandles = true) {
        const stream = new RedisStream(this._streamName)
        await stream.XREADBLOCK((res, err) => {
            // return cb && cb(res ? JSON.parse(res) as CandleStickData : null, err)
            if (res && res.candle === '"null"') {
                if (generateMissingCandles) {
                    const mCandle = CandleStickData.fromMissing(res.id, res.id + 60000 - 1)
                    return cb && cb(mCandle, err)

                }
                return false
            }
            return cb && cb(res ? CandleStickData.from(JSON.parse(res.candle)) : null, err)
            // return cb && cb(res ? CandleStickData.from(JSON.parse(res)) : null, err)
        }, utils.ticks(startTime).toString(), timeOut, count)
    }


    async quit() {
        this._isStop = true;
        if (this._redisStream) {
            await this._redisStream.quit();
        }
        this._redisStream = null;
        return this._myPromise;
    }
    protected get redisStream() {
        this._redisStream = this._redisStream || new RedisStream(this._streamName);
        return this._redisStream
    }
}

export class DataSourceStream extends CandleStream implements ICandleStream {
    constructor(public dataSource: IDataSource, name?: string) {
        super(name || `candles-${dataSource.exchange}-${dataSource.market}-${dataSource.symbol}-${dataSource.interval}`)
    }

    get isWriter(): boolean {
        return true
    }
    async start(startTime?: Ticks, cb?: (candle: CandleStickData) => boolean): Promise<void> {
        this._myPromise = this._start(startTime, cb)
        return this._myPromise
    }
    private async _start(startTime?: Ticks, cb?: (candle: CandleStickData) => boolean): Promise<void> {

        this._isStop = false;
        startTime = utils.ticks(startTime)
        let lastCandle = await this.getLastCandle();
        startTime = startTime || lastCandle?.openTime
        if (!startTime) {
            throw 'startTime is required';
        }
        if (lastCandle && startTime < lastCandle.openTime) {
            console.log("requested data will not be added to the stream Changing time to the last entry...");
            startTime = lastCandle.openTime
        }
        let fin = false
        while (!fin) {
            let binanceLastCandle = null;
            let endtime = utils.toTimeEx(startTime).addMinutes(1 * 24 * 60).floorToMinutes(1);
            if (endtime.ticks > utils.toTimeEx().ticks) {
                // endtime = utils.toTimeEx()
                binanceLastCandle = CandleStickData.from(await this.dataSource.getLatestCandle())
                endtime = utils.toTimeEx(binanceLastCandle.openTime)
            }
            const candles = await this.dataSource.getData(startTime, endtime)
            candles.populate(utils.toTimeEx(startTime).ceilToMinutes(1), endtime)
            for (let i = 0; i < candles.length; i++) {
                if (this._isStop) {
                    return
                }
                this.emit('data', candles.items[i])
                if ((await this.redisStream.XADD(candles.items[i].openTime, candles.items[i])) && cb && cb(candles.items[i])) {
                    return
                }
            }
            startTime = utils.toTimeEx(startTime).addMinutes(1 * 24 * 60 + 1).ticks
            // fin = startTime > utils.toTimeEx(Date.now()).ticks
            lastCandle = await this.getLastCandle()
            if (binanceLastCandle != null) {
                if (!lastCandle) {
                    startTime = utils.toTimeEx(startTime).addMinutes(-1 * 24 * 60).ticks
                    console.log("this is unexpected , no candles were added to redis, moving the start time to one day ago");
                } else {
                    startTime = lastCandle.openTime
                }
            }
            binanceLastCandle = CandleStickData.from(await this.dataSource.getLatestCandle())
            fin = lastCandle && (binanceLastCandle.openTime == lastCandle.openTime)

        }
        // lastCandle = await this.getLastCandle()
        // const binanceLastCandle = CandleStickData.from(await this.dataSource.getLatestCandle())
        // if (lastCandle.openTime < binanceLastCandle.openTime) {
        //     await this.dataSource.getData(lastCandle.openTime, binanceLastCandle.openTime)
        // }
        //if(time< getLastCandle().opentime){
        // const candles = await this.dataSource.getData(entime, binancetime)
        //
        // }
        const handle = setInterval(async () => {
            if (this._isStop) {
                clearInterval(handle)
                return
            }
            const lastCandle = CandleStickData.from(await this.dataSource.getLatestCandle());
            if (lastCandle) {
                if ((await this.redisStream.XADD(lastCandle.openTime, lastCandle)) && cb && cb(lastCandle)) {
                    clearInterval(handle)
                    return
                }
            }
        }, 30 * 1000)
        const timer = setInterval(() => {
            if (this._isStop) {
                clearInterval(handle)
                clearInterval(timer)
            }
        }, 1000)
    }
}
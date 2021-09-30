import EventEmitter from "events";

import { Ticks, utils } from "../../../base";
import { CandleStickData } from "../../base";
import { IDataSource } from "../base";

import { RedisStream } from "./RedisStream";


export class CandleStream extends EventEmitter {
    public _redisStream: RedisStream;
    private _isStop = false;
    private _myPromise: Promise<unknown>;
    constructor(public dataSource: IDataSource, private _streamName?: string) {
        super()
        this._streamName = _streamName || `candles-${this.dataSource.exchange}-${this.dataSource.market}-${this.dataSource.symbol}-${this.dataSource.interval}`
    }
    get streamName() {
        return this._streamName
    }
    async start(startTime?: Ticks, cb?: (candle: CandleStickData) => boolean) {
        this._myPromise = this._start(startTime, cb)
        return this._myPromise
    }
    private async _start(startTime?: Ticks, cb?: (candle: CandleStickData) => boolean) {

        this._isStop = false;
        startTime = utils.ticks(startTime)
        const lastCandle = await this.getLastCandle();
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
            const candles = await this.dataSource.getData(startTime, utils.toTimeEx(startTime).addMinutes(1 * 24 * 60));
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
            fin = startTime > utils.toTimeEx(Date.now()).ticks
        }
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
    async getCandle(time: Ticks) {
        const res = await this.redisStream.XRANGE(time);
        return res ? JSON.parse(res) : null;
    }
    async getLastCandle() {

        const res = await this.redisStream.XREVRANGE();
        return res ? (JSON.parse(res) as CandleStickData) : null;
    }
    async getCount() {
        const streams = await this.redisStream.SCANSTREAMS()
        return streams && streams.indexOf(this._streamName) != -1 ? (await this.redisStream.XINFO()).length : 0
    }

    async play(cb: (candle: CandleStickData, err) => boolean, startTime: Ticks = 0, timeOut = 500000, count = 1) {
        const stream = new RedisStream(this._streamName)
        await stream.XREADBLOCK((res, err) => {
            // return cb && cb(res ? JSON.parse(res) as CandleStickData : null, err)
            return cb && cb(res ? CandleStickData.from(JSON.parse(res)) : null, err)
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
    private get redisStream() {
        this._redisStream = this._redisStream || new RedisStream(this._streamName);
        return this._redisStream
    }
}

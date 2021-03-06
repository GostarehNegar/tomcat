import EventEmitter from "events";

import redis from 'redis'

import { CandleStickData } from "../common";
import utils from "../common/Domain.Utils";
import { IStopCallBack } from "../common/IStopCallBack";
import { IDataSource } from "../data";
import { baseUtils, Ticks } from "../infrastructure/base";

import { RedisStream } from "./RedisStream";


export interface ICandleStream {
    get isWriter(): boolean;
    //play(cb: (candle: CandleStickData, err) => Promise<boolean>, startTime?: Ticks, timeOut?, count?, generateMissingCandles?): Promise<void>
    play(cb: (candle: CandleStickData, err) => Promise<boolean>, startTime?: Ticks, timeOut?, count?, generateMissingCandles?);
    start(startTime?: Ticks, cb?: (candle: CandleStickData) => boolean): Promise<void>;
    startEx(startTime?: Ticks, stop?: IStopCallBack);
    get name(): string
}

export class CandleStream extends EventEmitter implements ICandleStream {
    public _redisStream: RedisStream;
    protected _isStop = false;
    protected _myPromise: Promise<void>;
    private factory: (n: string) => RedisStream;
    constructor(private _streamName: string, factory?: () => redis.RedisClient, private _stop?: IStopCallBack) {
        super()
        this.factory = (n: string) => new RedisStream(n, factory, _stop);
        (this._stop);
    }
    get name(): string {
        return this._streamName
    }
    static ctreatFromUrl(name: string, opt: redis.ClientOpts) {
        const a = new CandleStream(name, () => {
            return new redis.RedisClient(opt)
        })
        return a
    }
    startEx(startTime?: Ticks, stop?: IStopCallBack) {
        (startTime);
        (stop);
        throw new Error("Method not implemented.");
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
    async writeAsync(id: Ticks, data: CandleStickData, timeOut = 5000): Promise<unknown> {
        return new Promise<unknown>((resolve, reject) => {
            const handle = setTimeout(() => {
                reject();
            }, timeOut)
            this.write(id, data)
                .then(res => {
                    clearTimeout(handle);
                    resolve(res);
                }).catch(err => reject(err));

        });

    }

    async exists() {
        await this.redisStream.tryConnect();
        return await this.redisStream.exists()
    }
    async creatStream() {
        return await this.redisStream.XCREATE()
    }


    play(cb: (candle: CandleStickData, err) => Promise<boolean>, startTime: Ticks = 0, timeOut = 500000, count = 1, generateMissingCandles = true) {
        const stream = this.factory(this.streamName);// new RedisStream(this._streamName)
        stream.tryConnect()
            .then(() => {
                stream.XREADBLOCK((res, err) => {
                    // return cb && cb(res ? JSON.parse(res) as CandleStickData : null, err)
                    if (res && res.data === "null") {
                        if (generateMissingCandles) {
                            const mCandle = CandleStickData.fromMissing(res.id, res.id + 60000 - 1)
                            return cb && cb(mCandle, err)

                        }
                        return Promise.resolve(false)
                    }
                    return cb && cb(res ? CandleStickData.from(JSON.parse(res.data)) : null, err)
                    // return cb && cb(res ? CandleStickData.from(JSON.parse(res)) : null, err)
                }, ((baseUtils.ticks(startTime) - 1) > 0 ? baseUtils.ticks(startTime) - 1 : 0).toString(), timeOut, count)
            });
        // })
    }
    async playEx(cb: (candle: CandleStickData, err) => Promise<boolean>,
        startTime: Ticks = 0,
        timeOut = 500000,
        count = 1,
        generateMissingCandles = true, stop?: IStopCallBack) {
        const stream = this.factory(this.streamName);// new RedisStream(this._streamName)

        stream.XREADBLOCK((res, err) => {
            if (res && res.data === "null") {
                if (generateMissingCandles) {
                    const mCandle = CandleStickData.fromMissing(res.id, res.id + 60000 - 1)
                    return cb && cb(mCandle, err)

                }
                return Promise.resolve(false)
            }
            return cb && cb(res ? CandleStickData.from(JSON.parse(res.data)) : null, err)
        }, ((baseUtils.ticks(startTime) - 1) > 0 ? baseUtils.ticks(startTime) - 1 : 0).toString(), timeOut, count, stop);

    }


    async getAll() {
        return await this.redisStream.getAll()
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
        this._redisStream = this._redisStream || this.factory(this.streamName);
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
        startTime = baseUtils.ticks(startTime)
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
            lastCandle = null;
            let endTime = baseUtils.toTimeEx(startTime).addMinutes(1 * 24 * 60).floorToMinutes(1);
            if (endTime.ticks > baseUtils.toTimeEx().ticks) {
                // endtime = utils.toTimeEx()
                binanceLastCandle = CandleStickData.from(await this.doGetLastCandle())
                endTime = baseUtils.toTimeEx(binanceLastCandle.openTime)
            }
            const candles = await this.doGetData(startTime, endTime)
            candles.populate(baseUtils.toTimeEx(startTime).ceilToMinutes(1), endTime)
            for (let i = 0; i < candles.length; i++) {
                // console.log(`i : ${i}`);
                if (this._isStop) {
                    return
                }
                this.emit('data', candles.items[i])
                if ((await this.redisStream.XADD(candles.items[i].openTime, candles.items[i], true)) && cb && cb(candles.items[i])) {
                    console.log("unexpected return!");
                    return
                }
            }
            startTime = baseUtils.toTimeEx(startTime).addMinutes(1 * 24 * 60 + 1).ticks
            // this point on checks if we have arrived to present
            if (binanceLastCandle != null) {
                lastCandle = await this.getLastCandle()
                if (!lastCandle) {
                    startTime = baseUtils.toTimeEx(startTime).addMinutes(-1 * 24 * 60).ticks
                    console.log("this is unexpected , no candles were added to redis, moving the start time to one day ago");
                } else {
                    startTime = lastCandle.openTime
                }
                binanceLastCandle = CandleStickData.from(await this.doGetLastCandle())
                fin = lastCandle && binanceLastCandle && (binanceLastCandle.openTime == lastCandle.openTime)
            }

        }
        const handle = setInterval(async () => {
            if (this._isStop) {
                clearInterval(handle)
                return
            }
            const lastCandle = CandleStickData.from(await this.doGetLastCandle());
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
    async doGetData(startTime: Ticks, endTime: Ticks) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                return await this.dataSource.getData(startTime, endTime)
            } catch (err) {
                console.log("an error was occurred while fetching for data, waiting 10 second for retrying ...");
                if (err.code == "internetConnection") {
                    console.warn("internet connection or vpn has been disconnected, Waiting 10 seconds for retrying ...");
                    // await utils.waitForInternetConnection()
                }
                await baseUtils.delay(10 * 1000)
            }
        }
    }
    async doGetLastCandle() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                return await this.dataSource.getLatestCandle()
            } catch (err) {
                console.log("an error was occurred while fetching last candle, waiting 10 second for retrying ...");
                if (err.code == "internetConnection") {
                    console.warn("internet connection or vpn has been disconnected, Waiting 10 seconds for retrying ...");
                    // await utils.waitForInternetConnection()
                }
                await baseUtils.delay(10 * 1000)
            }
        }
    }
}

export class DataSourceStreamEx extends CandleStream implements ICandleStream {
    constructor(public dataSource: IDataSource, name?: string) {
        super(name || `candles-${dataSource.exchange}-${dataSource.market}-${dataSource.symbol}-${dataSource.interval}`)
    }

    get isWriter(): boolean {
        return true
    }
    private async _startPlay(startTime?: Ticks, stop?: IStopCallBack) {
        let lastCandle = await this.getLastCandle();
        startTime = utils.ticks(startTime);
        startTime = startTime || lastCandle?.openTime;
        const interval = utils.toMinutes(this.dataSource.interval) * 60 * 1000;
        await this.dataSource.play(async candles => {
            let populate_start = 0;
            if (candles.length > 0) {
                populate_start = lastCandle
                    ? lastCandle.openTime + interval
                    : candles.items[0].openTime;
                candles.populate(utils.ticks(populate_start), utils.ticks(candles.endTime))
                lastCandle = candles.lastCandle;
                for (let i = 0; i < candles.length; i++) {
                    while (true) {
                        let failures = 0;
                        try {
                            if (!this.redisStream.client.connected) {
                                throw "redis disconnected";
                            }
                            await this.writeAsync(candles.items[i].openTime, candles.items[i]);
                            break;
                        }
                        catch (err) {
                            failures++;
                            if (stop && stop({
                                err: err,
                                time: utils.toTimeEx(lastCandle?.openTime),
                                failures: failures
                            })) {
                                break;
                            }
                            if (err == "redis disconnected") {
                                this._redisStream = null;
                                (this.redisStream.client.connected);
                                await utils.delay(200);
                            }
                        }
                    }
                }
            }
        }, startTime, stop);

    }
    public async startEx(startTime?: Ticks, stop?: IStopCallBack) {
        let _stop = false
        while (!_stop) {
            try {
                await this.redisStream.tryConnect(stop);
                if (!this.redisStream.client.connected)
                    throw "redis disconnected";

                if (!await this.exists()) {
                    await this.creatStream();

                }
                await this._startPlay(startTime, stop);
                break;
            } catch (err) {
                if (stop && stop({
                    err: err,
                    failures: 0
                })) {
                    _stop = true;
                    break;
                }
                if (err == "redis disconnected") {
                    this._redisStream = null;
                    (this.redisStream.client.connected)
                    await utils.delay(1000);
                }

            }
            await utils.delay(100);
        }
    }
}


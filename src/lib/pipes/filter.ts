import { Intervals } from "../common";
import { CandleStickCollectionScaler } from "../indicators";
import { baseUtils, IServiceProvider, ServiceProvider, Ticks } from "../infrastructure/base";
import { CandleStream } from "../streams";

import { IFilter } from "./IFilter";
import { IFilterCallBack } from "./IFilterCallBack";
import { IFilterOptions } from "./IFilterOptions";
import { IPlay } from "./IPlay";
import { IStreamPlayer } from "./IStreamPlayer";
import { PipelineContext } from "./pipelineContext";



export class Filter implements IFilter {
    public context = {}
    public _scaller: CandleStickCollectionScaler;
    private _stream: CandleStream;
    // public streamplayer: RedisStream;
    _playSourceStream: IStreamPlayer;
    private _playBackHandler: IPlay;
    public _stop = false
    // private _redisStream: RedisStream;
    public isStreamSupported: boolean;
    public services: IServiceProvider
    constructor(public name: string, private callback: IFilterCallBack, public options?: IFilterOptions, services?: IServiceProvider) {
        this.name = name ? name : baseUtils.randomName("Filter", 1000)
        this.callback = this.callback || (() => { return Promise.resolve() })
        this.options = options || {}
        this.services = services || ServiceProvider.instance
    }
    async run(context: PipelineContext) {
        this._playSourceStream(async (candle, err) => {
            if (this._stop) {
                return Promise.resolve(true)
            }
            // context.myContext = this.context
            await this.callback(candle, this)
            if (this.stream) {
                await this.stream.write(candle.openTime, candle)
            } else {
                (this._playBackHandler && await this._playBackHandler(candle, err))
            }
            // this.callback(candle, this)
            //     .then(() => {
            //         if (this.stream) {
            //             this.stream.write(candle.openTime, candle)
            //         } else {
            //             (this._playBackHandler && this._playBackHandler(candle, err))
            //         }
            //     }).catch((err) => {
            //         console.log(`An error wat catched in filter ${this.name}`, err);
            //     })
            return Promise.resolve(false)
        }, context.startTime, undefined, 1000)

    }
    async runEX(context: PipelineContext) {
        this._playSourceStream((candle, err) => {
            if (this._stop) {
                return Promise.resolve(true)
            }
            // context.myContext = this.context
            this.callback(candle, this)
                .then(() => {
                    if (this.stream) {
                        this.stream.write(candle.openTime, candle)
                    } else {
                        (this._playBackHandler && this._playBackHandler(candle, err))
                    }
                }).catch((err) => {
                    console.log(`An error wat catched in filter ${this.name}`, err);
                })
            return Promise.resolve(false)
        }, context.startTime, undefined, 4)

    }
    getScaler(inteval: Intervals, maxCount = 200): CandleStickCollectionScaler {
        if (!this._scaller) {
            this._scaller = new CandleStickCollectionScaler(inteval, maxCount)
        }
        return this._scaller
    }

    play(cb: IPlay, startTime: Ticks = 0, timeOut = 500000, count = 1, generateMissingCandles = true) {
        (generateMissingCandles);
        if (this.stream) {
            this.stream.play((candle, err) => {
                return cb && cb(candle, err)
            }, baseUtils.ticks(startTime), timeOut, count, generateMissingCandles)
            // this.streamPlayer._redisStream.XREADBLOCK((res, err) => {
            //     if (res && res.candle === "null") {
            //         if (generateMissingCandles) {
            //             const mCandle = CandleStickData.fromMissing(res.id, res.id + 60000 - 1)
            //             return cb && cb(mCandle, err)

            //         }
            //         return false
            //     }
            //     return cb && cb(res ? CandleStickData.from(JSON.parse(res.candle)) : null, err)
            // }, utils.ticks(startTime).toString(), timeOut, count)
        } else {
            this._playBackHandler = cb
        }
    }
    async initialize() {
        // if (this.redisStream && !(await this.redisStream.exists())) {
        //     await this.redisStream.XCREATE()
        //     await this.streamplayer.XCREATE()

        // }
        if (this.stream && !(await this.stream.exists())) {
            await this.stream.creatStream()
        }
        // this.redisStream && this.redisStream.XADD(1, "null")
    }
    // private get redisStream() {
    //     if (this._redisStream == null && (this.options.stream || this.stream)) {
    //         this._redisStream = new RedisStream(this.name)
    //         this.streamplayer = new RedisStream(this.name)
    //     }
    //     return this._redisStream
    // }
    public get stream() {
        if (this._stream == null && (this.options.stream || this.isStreamSupported)) {
            this._stream = new CandleStream(this.name)
        }
        return this._stream
    }
}
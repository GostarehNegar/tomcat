import { Ticks, utils } from "../../base";
import { CandleStickData } from "../base";
import { RedisStream } from "../data";

import { IFilterCallBack } from "./IFilterCallBack";
import { PipelineContext } from "./pipelineContext";

interface IPlay {
    (candle: CandleStickData, err): boolean
}
interface IStreamPlayer {
    (cb: IPlay, startTime?: Ticks, timeOut?, count?)
}

export interface IFilterOptions {
    [key: string]: unknown
    'stream'?: boolean;
    'name'?: string;
}

export interface IFilter {
    context: unknown
}

export class Filter implements IFilter {
    public context = {}
    _playSourceStream: IStreamPlayer;
    private _playBackHandler: IPlay;
    public _stop = false
    private _redisStream: RedisStream;
    constructor(public name: string, private callback: IFilterCallBack, public options?: IFilterOptions) {
        this.callback = this.callback || (() => { return Promise.resolve() })
        this.options = options || {}
    }
    async run(context: PipelineContext) {
        this._playSourceStream((candle: CandleStickData, err) => {
            if (this._stop) {
                return true
            }
            context.myContext = this.context
            this.callback(candle, context)
                .then(() => {
                    if (this.redisStream) {
                        this.redisStream.XADD(candle.openTime, candle)
                    } else {
                        (this._playBackHandler && this._playBackHandler(candle, err))
                    }
                }).catch((err) => {
                    console.log(`An error wat catched in filter ${this.name}`, err);
                })
            return false
        },context.startTime)

    }

    play(cb: IPlay, startTime: Ticks = 0, timeOut = 500000, count = 1) {
        if (this.redisStream) {
            this.redisStream.XREADBLOCK((res, err) => {
                if (res === "null") {
                    return false
                }
                return cb && cb(res ? CandleStickData.from(JSON.parse(res)) : null, err)
            }, utils.ticks(startTime).toString(), timeOut, count)
        } else {
            this._playBackHandler = cb
        }
    }
    async initialize() {
        if (this.redisStream && !(await this.redisStream.exists())) {
            await this.redisStream.XADD(1, null)
        }
        // this.redisStream && this.redisStream.XADD(1, "null")
    }
    private get redisStream() {
        if (this._redisStream == null && this.options.stream) {
            this._redisStream = new RedisStream(this.name)
        }
        return this._redisStream
    }


}
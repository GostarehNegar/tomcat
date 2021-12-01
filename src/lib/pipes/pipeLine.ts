import { Exchanges, Intervals, Markets, Symbols } from "../common";
import { DataSourceFactory } from "../data";
import { IIndicator } from "../indicators";
import { baseUtils, IServiceProvider, Ticks } from "../infrastructure/base";
import { CandleStream, DataSourceStream, DataSourceStreamEx, ICandleStream } from "../streams";


import { IFilterCallBack } from "./IFilterCallBack";
import { IFilterOptions } from "./IFilterOptions";
import { Filter } from "./filter";
import { PipelineContext } from "./pipelineContext";

import { IStopCallBack } from "../common/IStopCallBack";
(DataSourceStream);


export interface IPipeline {
    from(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals, name?: string): IPipeline
    add(cb: IFilterCallBack | IIndicator, options?: IFilterOptions): IPipeline
    addEX(cb: IFilterCallBack | IIndicator, callback: (filter: Filter) => void): IPipeline
    start(startTime?: Ticks): Promise<unknown>;
    startEx(startTime?: Ticks, stop?: IStopCallBack): Promise<void>;
    stop(): Promise<unknown>
}

export class Pipeline implements IPipeline {
    public filters: Filter[] = [];


    // constructor(public candleStream?: ICandleStream) { }


    constructor(public candleStream?: ICandleStream, public services?: IServiceProvider) { }

    from(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals, name?: string) {
        //this.candleStream = new DataSourceStream(DataSourceFactory.createDataSource(exchange, market, symbol, interval), name)
        this.candleStream = new DataSourceStreamEx(DataSourceFactory.createDataSource(exchange, market, symbol, interval), name)
        return this
    }
    fromStream(name: string) {
        this.candleStream = new CandleStream(name)
        return this
    }
    stop(): Promise<unknown> {
        this.filters.map((x) => x._stop = true)
        return Promise.resolve()
    }
    _add(filter: Filter): IPipeline {
        if (!this.candleStream) {
            throw 'candleStream was not provided, did you forget to use from?'
        }
        if (this.filters.length == 0) {
            filter._playSourceStream = this.candleStream.play.bind(this.candleStream)
        }
        if (this.filters.length >= 1) {
            filter._playSourceStream = this.filters[this.filters.length - 1].play.bind(this.filters[this.filters.length - 1])
        }
        this.filters.push(filter)
        return this
    }
    add(cb: IFilterCallBack | IIndicator, options?: IFilterOptions): IPipeline {
        const name = options ? options.name || baseUtils.randomName('Filter') : baseUtils.randomName('Filter')
        if ((cb as IIndicator).id) {
            cb = (cb as IIndicator).handler
        }
        this._add(new Filter(name, cb as IFilterCallBack, options, this.services))
        return this
    }
    addEX(cb: IFilterCallBack | IIndicator, callback: (filter: Filter) => void): IPipeline {
        const filter = new Filter(null, cb as IFilterCallBack, null, this.services)
        callback(filter)
        if ((cb as IIndicator).id) {
            cb = (cb as IIndicator).handler
        }
        this._add(filter)
        return this
    }
    async start(startTime?: Ticks) {
        const context = new PipelineContext();
        context.startTime = startTime;
        context.timeOut = 50000;
        for (let i = 0; i < this.filters.length; i++) {
            await this.filters[i].initialize()
        }
        // await this.filters.reverse().map(async (x) => await x.initialize())
        this.filters.reverse().map((x) => x.run(context));
        (startTime)
        if (this.candleStream.isWriter) {
            this.candleStream.start(startTime)
        }
        // if (this.candleStream.isWriter) {
        //     this.candleStream.startEx(startTime, ctx => {
        //         return false;

        //     });
        // }
    }
    async startEx(startTime?: Ticks, stop?: IStopCallBack) {
        const context = new PipelineContext();
        context.stop = stop;
        context.startTime = startTime;
        for (let i = 0; i < this.filters.length; i++) {
            await this.filters[i].initialize()
        }
        const promises = [];
        // await this.filters.reverse().map(async (x) => await x.initialize())
        this.filters.reverse().map((x) => promises.push(x.runExEx(context)));
        (startTime)
        // if (this.candleStream.isWriter) {
        //     this.candleStream.start(startTime)
        // }
        if (this.candleStream.isWriter) {
            await this.candleStream.startEx(startTime, ctx => {
                return stop && stop(ctx);

            });
        }
        for (var i = 0; i < promises.length; i++) {
            try {
                await promises[i];
            }
            catch { }
        }
    }
}
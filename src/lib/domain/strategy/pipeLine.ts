import { Ticks, utils } from "../../base";
import { Exchanges, Intervals, Markets, Symbols } from "../base";
import { CandleStream, DataSourceFactory } from "../data";

import { IFilterCallBack } from "./IFilterCallBack";
import { Filter } from "./filter";
import { PipelineContext } from "./pipelineContext";

import { IFilterOptions } from ".";



export interface IPipeline {
    from(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals): IPipeline
    add(cb: IFilterCallBack, options?: IFilterOptions): IPipeline
    start(startTime?: Ticks): Promise<unknown>
    stop(): Promise<unknown>
}

export class Pipeline implements IPipeline {
    public filters: Filter[] = [];
    constructor(public candleStream?: CandleStream) { }
    from(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals) {
        this.candleStream = new CandleStream(DataSourceFactory.createDataSource(exchange, market, symbol, interval))
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
    add(cb: IFilterCallBack, options?: IFilterOptions): IPipeline {
        const name = options.name || utils.randomName('Filter')
        this._add(new Filter(name, cb, options))
        return this
    }
    async start(startTime?: Ticks) {
        const context = new PipelineContext()
        for (let i = 0; i < this.filters.length; i++) {
            await this.filters[i].initialize()
        }
        // await this.filters.reverse().map(async (x) => await x.initialize())
        this.filters.reverse().map((x) => x.run(context))
        this.candleStream.start(startTime)
    }
}
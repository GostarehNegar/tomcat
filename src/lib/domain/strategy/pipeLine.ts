import { Ticks, utils } from "../../base";
import { Exchanges, Intervals, Markets, Symbols } from "../base";
import { CandleStream, DataSourceFactory } from "../data";
import { IIndicator } from "../indicators";

import { IFilterCallBack } from "./IFilterCallBack";
import { Filter } from "./filter";
import { PipelineContext } from "./pipelineContext";

import { IFilterOptions } from ".";



export interface IPipeline {
    from(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals, name?: string): IPipeline
    add(cb: IFilterCallBack | IIndicator, options?: IFilterOptions): IPipeline
    start(startTime?: Ticks): Promise<unknown>
    stop(): Promise<unknown>
}

export class Pipeline implements IPipeline {
    public filters: Filter[] = [];
    constructor(public candleStream?: CandleStream) { }
    from(exchange: Exchanges, market: Markets, symbol: Symbols, interval: Intervals, name?: string) {
        this.candleStream = new CandleStream(DataSourceFactory.createDataSource(exchange, market, symbol, interval), name)
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
        const name = options ? options.name || utils.randomName('Filter') : utils.randomName('Filter')
        if ((cb as IIndicator).id) {
            cb = (cb as IIndicator).handler
        }
        this._add(new Filter(name, cb as IFilterCallBack, options))
        return this
    }
    async start(startTime?: Ticks) {
        const context = new PipelineContext();
        context.startTime = startTime;
        for (let i = 0; i < this.filters.length; i++) {
            await this.filters[i].initialize()
        }
        // await this.filters.reverse().map(async (x) => await x.initialize())
        this.filters.reverse().map((x) => x.run(context));
        (startTime)
        //this.candleStream.start(startTime)
    }
}
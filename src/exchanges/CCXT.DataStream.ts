

import { clearIntervalAsync, setIntervalAsync } from "set-interval-async/dynamic";

import { CandleStickCollection, CandleStickData, Exchanges, ICandleStickData, Intervals } from "../common";
import { Markets, Symbols } from "../common";
import utils from "../common/Domain.Utils";
import { IStopCallBack } from "../common/IStopCallBack";
import { IDataSource } from "../data";
import { ILogger, Ticks, TimeEx } from "../infrastructure/base";

import { CCXTExchange } from "./CCXT.Exchange";

export class CCXTDataStream implements IDataSource {

    private _ccxt_exchange: CCXTExchange = null;
    private logger: ILogger;
    public name: string;
    constructor(public exchange: Exchanges, public symbol: Symbols, public market: Markets, public interval: Intervals) {
        this._ccxt_exchange = new CCXTExchange(exchange, market);
        this.name = `DataStream.${exchange}.${symbol}`;
        this.logger = utils.getLogger(this.name);
    }
    getData(startTime: Ticks, endTime: Ticks): Promise<CandleStickCollection> {
        return this._ccxt_exchange.getCandles(this.symbol, this.interval, startTime, endTime);

    }
    getExactCandle(time: Ticks): Promise<ICandleStickData> {
        return this._ccxt_exchange.getExactCandle(this.symbol, this.interval, time)
    }
    getLatestCandle(): Promise<ICandleStickData> {
        throw new Error("Method not implemented.");
    }
    public async play(cb: (candle: CandleStickData) => Promise<void>,
        start?: Ticks,
        stop?: IStopCallBack) {
        const intervalMinutest = utils.toMinutes(this.interval);
        let _start = utils.toTimeEx(utils.ticks(start));
        const time_inter_val = 100;
        let _stop = false;
        let _next_tick = 0;
        let _number_of_failures = 0;
        let _last_error = null;
        let _last_candle = null;


        return new Promise<void>((resolve, reject) => {
            (resolve);
            (reject);
            const _handle = setIntervalAsync(async () => {

                if (utils.toTimeEx().ticks > _next_tick) {
                    try {
                        // const server_time = await this._ccxt_exchange.getServerTime();
                        // const _last = await this._ccxt_exchange.getLatestCandle(this.symbol,this.interval);
                        const candles = await this._ccxt_exchange.getCandlesAt(this.symbol, this.interval, _start);

                        _number_of_failures = 0;
                        _last_error = null;
                        for (let i = 0; i < candles.length; i++) {
                            await cb(candles.items[i]);
                        }
                        if (candles.length > 0) {
                            _start = utils.toTimeEx(candles.endTime).addMinutes(intervalMinutest);
                            _last_candle = candles.lastCandle;
                        }
                        if (candles.length < 2 && time_inter_val < 1000) {
                            //time_inter_val = intervalMinutest * 60 * 1000 / 3;
                            _next_tick = utils.toTimeEx().ticks + intervalMinutest * 60 * 1000 / 3;
                        }
                        if (candles.length > 5 && time_inter_val > 500) {
                            //time_inter_val = 100;
                            _next_tick = 0;
                        }
                    } catch (err) {
                        _last_error = err;

                        const should_reject = (stop && stop({
                            err: err,
                            time: _last_candle ? utils.toTimeEx(_last_candle.openTime) : utils.toTimeEx(_start),
                            failures: _number_of_failures,
                            lastCandle: _last_candle
                        }));
                        _number_of_failures++;
                        if (should_reject) {
                            this.logger.error(
                                `An error occured while playing this stream ${this.name}. ` +
                                `We are not able to continue because it's canceled by callback. ` +
                                `The origibal error was ${err}`);
                            clearIntervalAsync(_handle);
                            reject(err);
                        } else {

                            _next_tick = utils.toTimeEx().addMinutes(1).ticks;
                            this.logger.warn(
                                `An error coccured while playing this stream '${this.name}'.` +
                                `We will retry in one minute. Err:'${err}'`);
                        }

                    }
                }
                _stop = _stop || (stop && stop({
                    err: _last_error,
                    time: _last_candle ? utils.toTimeEx(_last_candle.openTime) : utils.toTimeEx(_start),
                    failures: _number_of_failures,
                    lastCandle: _last_candle
                }))
                if (_stop) {
                    this.logger.info(
                        `We are going to stop playing this stream '${this.name}', ` +
                        `beacuse the 'stop' callback returned true. `);

                    clearIntervalAsync(_handle);
                    resolve();
                }


            }, time_inter_val);

        });





    }
    public async playEx(cb: (candles: CandleStickCollection) => Promise<void>,
        start?: Ticks,
        stop?: IStopCallBack) {
        const intervalMinutest = utils.toMinutes(this.interval);
        let _start = utils.toTimeEx(utils.ticks(start));
        const time_inter_val = 100;
        let _stop = false;
        let _next_tick = 0;
        let _number_of_failures = 0;
        let _last_error = null;
        let _last_candle = null;


        return new Promise<void>((resolve, reject) => {
            (resolve);
            (reject);
            const _handle = setIntervalAsync(async () => {

                if (utils.toTimeEx().ticks > _next_tick) {
                    try {
                        // const server_time = await this._ccxt_exchange.getServerTime();
                        // const _last = await this._ccxt_exchange.getLatestCandle(this.symbol,this.interval);
                        const candles = await this._ccxt_exchange.getCandlesAt(this.symbol, this.interval, _start);

                        _number_of_failures = 0;
                        _last_error = null;
                        if (candles.length > 0) {
                            await cb(candles);
                        }
                        if (candles.length > 0) {
                            _start = utils.toTimeEx(candles.endTime).addMinutes(intervalMinutest);
                            _last_candle = candles.lastCandle;
                        }
                        if (candles.length < 2 && time_inter_val < 1000) {
                            //time_inter_val = intervalMinutest * 60 * 1000 / 3;
                            _next_tick = utils.toTimeEx().ticks + intervalMinutest * 60 * 1000 / 3;
                        }
                        if (candles.length > 5 && time_inter_val > 500) {
                            //time_inter_val = 100;
                            _next_tick = 0;
                        }
                    } catch (err) {
                        _last_error = err;

                        const should_reject = (stop && stop({
                            err: err,
                            time: _last_candle ? utils.toTimeEx(_last_candle.openTime) : utils.toTimeEx(_start),
                            failures: _number_of_failures,
                            lastCandle: _last_candle
                        }));
                        _number_of_failures++;
                        if (should_reject) {
                            this.logger.error(
                                `An error occured while playing this stream ${this.name}. ` +
                                `We are not able to continue because it's canceled by callback. ` +
                                `The origibal error was ${err}`);
                            clearIntervalAsync(_handle);
                            reject(err);
                        } else {

                            _next_tick = utils.toTimeEx().addMinutes(1).ticks;
                            this.logger.warn(
                                `An error coccured while playing this stream '${this.name}'.` +
                                `We will retry in one minute. Err:'${err}'`);
                        }

                    }
                }
                _stop = _stop || (stop && stop({
                    err: _last_error,
                    time: _last_candle ? utils.toTimeEx(_last_candle.openTime) : utils.toTimeEx(_start),
                    failures: _number_of_failures,
                    lastCandle: _last_candle
                }))
                if (_stop) {
                    this.logger.info(
                        `We are going to stop playing this stream '${this.name}', ` +
                        `beacuse the 'stop' callback returned true. `);

                    clearIntervalAsync(_handle);
                    resolve();
                }


            }, time_inter_val);

        });





    }

    public async playSync(cb: (candle: CandleStickData) => void,
        start?: Ticks,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stop?: (arg: { err: any, time: TimeEx, failures: number }) => boolean) {
        const intervalMinutest = utils.toMinutes(this.interval);
        let _start = utils.toTimeEx(utils.ticks(start));
        const time_inter_val = 100;
        let _stop = false;
        let _next_tick = 0;
        let _number_of_failures = 0;
        let _last_error = null;


        return new Promise<void>((resolve, reject) => {
            (resolve);
            (reject);
            const _handle = setIntervalAsync(async () => {

                if (utils.toTimeEx().ticks > _next_tick) {
                    try {
                        // const server_time = await this._ccxt_exchange.getServerTime();
                        // const _last = await this._ccxt_exchange.getLatestCandle(this.symbol,this.interval);
                        const candles = await this._ccxt_exchange.getCandlesAt(this.symbol, this.interval, _start);
                        _number_of_failures = 0;
                        _last_error = null;
                        for (let i = 0; i < candles.length; i++) {
                            cb(candles.items[i]);
                        }
                        if (candles.length > 0) {
                            _start = utils.toTimeEx(candles.endTime).addMinutes(intervalMinutest);
                        }
                        if (candles.length < 2 && time_inter_val < 1000) {
                            //time_inter_val = intervalMinutest * 60 * 1000 / 3;
                            _next_tick = utils.toTimeEx().ticks + intervalMinutest * 60 * 1000 / 3;
                        }
                        if (candles.length > 5 && time_inter_val > 500) {
                            //time_inter_val = 100;
                            _next_tick = 0;
                        }
                    } catch (err) {
                        _last_error = err;

                        const should_reject = (stop && stop({
                            err: err,
                            time: utils.toTimeEx(_start),
                            failures: _number_of_failures
                        }));
                        _number_of_failures++;
                        if (should_reject) {
                            this.logger.error(
                                `An error occured while playing this stream ${this.name}. ` +
                                `We are not able to continue because it's canceled by callback. ` +
                                `The origibal error was ${err}`);
                            clearIntervalAsync(_handle);
                            reject(err);
                        } else {

                            _next_tick = utils.toTimeEx().addMinutes(1).ticks;
                            this.logger.warn(
                                `An error coccured while playing this stream '${this.name}'.` +
                                `We will retry in one minute. Err:'${err}'`);
                        }

                    }
                }
                _stop = _stop || (stop && stop({
                    err: _last_error,
                    time: utils.toTimeEx(_start),
                    failures: _number_of_failures
                }))
                if (_stop) {
                    this.logger.info(
                        `We are going to stop playing this stream '${this.name}', ` +
                        `beacuse the 'stop' callback returned true. `);

                    clearIntervalAsync(_handle);
                    resolve();
                }


            }, time_inter_val);

        });
    }
}



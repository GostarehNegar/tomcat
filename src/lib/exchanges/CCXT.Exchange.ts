import ccxt, { Exchange } from 'ccxt';
import { IExchange } from './IExchange';
import { CandleStickCollection, CandleStickData, Intervals, Markets, Symbols } from '../common';
import utils from '../common/Domain.Utils';
import { Exchanges } from '../common/Exchanges';
import { ILogger, Ticks, TimeEx } from '../infrastructure/base';
import fetch from 'node-fetch';

const binance_nooce = async () => {

    const agent = await utils.getProxy();
    var resp = await fetch('https://api.binance.com/api/v3/time', { agent: agent })
    var f = await resp.json();
    return f.serverTime;

}
/// tomcat
/// 1189A75DDBA0442CA5996E544783DA1A
/// E08F2D0C43915121567096210AC8B3E3827921EEEC260C72
function getExchange_dep(ex: Exchanges, market: Markets): ccxt.Exchange {
    const opt = {
        options: { 'defaultType': market }
    };
    switch (ex) {
        case 'coinex':
            return new ccxt.coinex(opt);
        case 'binance':
            return new ccxt.binance(opt);
        case 'okeex':
            return new ccxt.okex(opt);
    };
}
(getExchange_dep);
function getExchange(ex: Exchanges, market: Markets): ccxt.Exchange {
    const opt = {
        apiKey: null,
        secret: null,

        options: { 'defaultType': market }
    };
    if (ex == 'coinex') {
        opt.apiKey = '1189A75DDBA0442CA5996E544783DA1A';
        opt.secret = 'E08F2D0C43915121567096210AC8B3E3827921EEEC260C72'
    };
    const exchangeId = ex;
    const _class = ccxt[exchangeId];
    const res = new _class(opt);
    return res;

}

export class CCXTExchange implements IExchange {
    private _ccxt_exchange: Exchange = null;
    private logger: ILogger;
    private _market: Markets;
    private _exchange_name: Exchanges;
    private _cached_server_time_diff?: number = null;
    constructor(exchange: Exchanges, market: Markets) {
        this._market = market;
        this._exchange_name = exchange;
        this.logger = utils.getLogger("Exchanges.CCTX." + exchange)
    }
    async getServerTime(): Promise<TimeEx> {
        var exchange = await this.getExchange();
        return utils.toTimeEx(await exchange.fetchTime());
    }
    async getCachedServerTime(refersh = false): Promise<TimeEx> {
        if (!this._cached_server_time_diff || refersh) {

            this._cached_server_time_diff = Date.now() - (await this.getServerTime()).ticks;
        }
        return utils.toTimeEx(Date.now() - this._cached_server_time_diff);

    }
    async isComplted(candle: CandleStickData) {
        return candle.closeTime < (await this.getCachedServerTime()).ticks;
    }
    get CurrenTime(): TimeEx {
        return utils.toTimeEx();
    }
    private async getExchange(refresh = false) {
        if (!this._ccxt_exchange || refresh) {
            this._ccxt_exchange = getExchange(this._exchange_name, this._market);
            this._ccxt_exchange.httpsAgent = await utils.getProxy();
            await this._ccxt_exchange.loadMarkets();
            var noonce = await binance_nooce();
            this._ccxt_exchange.nonce = () => noonce
        }
        return this._ccxt_exchange;
    }
    public async hasSymbol(symbol: Symbols): Promise<boolean> {
        var exchange = await this.getExchange();
        return (exchange.markets[symbol] != null)
    }
    public async getMarkets() {
        var exchange = await this.getExchange();
        return exchange.markets;
    }
    private toCandleStickData(c: ccxt.OHLCV, interval: Intervals) {
        var m = utils.toMinutes(interval as Intervals) * 60 * 1000 - 1;
        return new CandleStickData(
            c[0], c[1], c[2], c[3], c[4], c[0] + m, c[5]);
    }
    async getBalance() {
        return this.safeCall(async () => {
            var exchange = await this.getExchange();
            return await exchange.fetchBalance();

        });


    }
    async safeCall<T>(call: () => Promise<T>, max_triarls = 5, wait_between_calls = 2000) {
        let refersh_proxy = false;
        for (let i = 0; i < max_triarls; i++) {
            try {
                await utils.getProxy(undefined, undefined, undefined, undefined, refersh_proxy);
                return await call();
            }
            catch (err) {
                refersh_proxy = true;

            }
            await utils.delay(wait_between_calls)
        }
        return null;
    }

    async sell(symbol: Symbols, amount: number) {
        var exchange = await this.getExchange();
        // var m = await this.getMarkets();
        // const limit = m[symbol].limits;
        // if (amount < limit.amount.min) {
        //     throw "limit less than min";
        // }
        // (limit);

        const order = await exchange.createMarketOrder(symbol, 'sell', amount);
        return order;
    }

    async buy(symbol: Symbols, amount: number, price: number) {
        var exchange = await this.getExchange();
        // var m = await this.getMarkets();
        // const limit = m[symbol].limits;
        // if (amount < limit.amount.min) {
        //     throw "limit less than min";
        // }
        // (limit);
        // exchange.fetchTradingLimits();

        const order = await exchange.createMarketOrder(symbol, 'buy', amount, price);
        return order;
    }



    public async getCandlesAt(symbol: Symbols, interval: Intervals, startTime: Ticks, include_last_uncomplete = false) {
        const _startTime = utils.floorTime(
            utils.ticks(startTime), utils.toMinutes(interval));
        const result = new CandleStickCollection([]);
        try {
            const coinex = await this.getExchange();
            const server_time = (await this.getCachedServerTime()).ticks;
            var m = utils.toMinutes(interval as Intervals) * 60 * 1000 - 1;
            let _start = _startTime;
            (await coinex.fetchOHLCV(symbol, interval, _start))
                .forEach(c => {
                    if ((c[0] + m < server_time) || include_last_uncomplete) {
                        result.push(new CandleStickData(
                            c[0], c[1], c[2], c[3], c[4], c[0] + m, c[5]))
                    }
                });
            result.filter(c => (c.openTime >= _startTime));
        }
        catch (err) {
            this.logger.error(
                `An error occured while trying to fetchData. Err:${err}`);
            throw err;
        }
        return result;
    }

    public async getCandles(symbol: Symbols, interval: Intervals, startTime: Ticks,
        endTime: Ticks, include_last_uncompleted_candle = false) {
        const _startTime = utils.floorTime(
            utils.ticks(startTime), utils.toMinutes(interval));
        const _endTime = utils.floorTime(utils.ticks(endTime), utils.toMinutes(interval));
        const result = new CandleStickCollection([]);
        try {
            const coinex = await this.getExchange();
            var m = utils.toMinutes(interval as Intervals) * 60 * 1000 - 1;
            let fin = false
            let _start = _startTime;
            const server_time = (await this.getCachedServerTime()).ticks;
            while (!fin) {
                (await coinex.fetchOHLCV(symbol, interval, _start))
                    .forEach(c => {
                        if ((c[0] + m < server_time) || include_last_uncompleted_candle)
                            result.push(new CandleStickData(
                                c[0], c[1], c[2], c[3], c[4], c[0] + m, c[5]))
                    });
                fin = result.endTime >= _endTime;
                fin = fin || _start == result.closeTime;
                _start = result.closeTime;
            }
            result.filter(c => (c.openTime <= _endTime) && (c.openTime >= _startTime));
        }
        catch (err) {
            this.logger.error(
                `An error occured while trying to fetchData. Err:${err}`);
            throw err;
        }
        return result;
    }
    async getExactCandle(
        symbol: Symbols,
        interval: Intervals,
        time: Ticks): Promise<CandleStickData> {
        let result: CandleStickData = null;
        try {
            const since = utils.floorTime(utils.ticks(time), utils.toMinutes(interval));
            var exchange = await this.getExchange();

            const data = (await exchange.fetchOHLCV(symbol, interval, since));
            result = data.map(x => this.toCandleStickData(x, interval))
                .find(x => x.openTime >= since)
        }
        catch (err) {
            this.logger.error(
                `An error occured while trying to 'getExactCandle'. Exchange:${this._exchange_name} Err:${err}`);
        }
        return result;
    }
    async getLatestCandle(
        symbol: Symbols,
        interval: Intervals): Promise<CandleStickData> {
        let result: CandleStickData = null;
        try {
            const minutes = utils.toMinutes(interval);
            const since = utils.floorTime(utils.toTimeEx().addMinutes(-3 * minutes).ticks, minutes);
            var exchange = await this.getExchange();
            const data = (await exchange.fetchOHLCV(symbol, interval, since, 5))
                .reverse()
                .map(x => this.toCandleStickData(x, interval));
            result = data.length > 1 ? data[1] : result;
        }
        catch (err) {
            this.logger.error(
                `An error occured while trying to 'getExactCandle'. Exchange:${this._exchange_name} Err:${err}`);
        }
        return result;
    }
}
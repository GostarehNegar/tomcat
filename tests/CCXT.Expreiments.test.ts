import utils from '../src/lib/common/Domain.Utils';
import config from '../src/lib/config';
import tomcat from '../src'
import { CandleStickCollection, Markets, Symbols } from '../src/lib/common';
import { DataSourceStreamEx } from '../src/lib/streams';
import { Pipeline } from '../src/lib/pipes';

config.proxy.url = "http://localhost:2395";
jest.setTimeout(20000000)
describe('CoinEx', () => {
    test('exchange ha symbol', async () => {
        var exchange = new tomcat.Domain.Exchange.CCXTExchange('binance', 'spot');

        const hasShiba = await exchange.hasSymbol('SHIB/USDT');

        expect(hasShiba).toBeTruthy();



    });
    test('binance getdata works', async () => {
        const market: Markets = 'future';
        var exchange = new tomcat.Domain.Exchange.CCXTExchange('binance', market);
        const interval = '1h'
        const minutes = utils.toMinutes(interval);
        const start = utils.toTimeEx().addMinutes(-3000);
        const symbol: Symbols = 'BTC/USDT';
        var mm = await exchange.getMarkets();
        (mm);
        const data = await exchange.getCandles(symbol, interval, start.ticks, start.addMinutes(800).ticks);
        const exact = await exchange.getExactCandle(symbol, interval, start);
        const latest = await exchange.getLatestCandle(symbol, interval);
        var server_time = await exchange.getServerTime();
        var future_exchange = new tomcat.Domain.Exchange.CCXTExchange('binance', market);
        const at2021_11_29_15_0_0 = await future_exchange
            .getExactCandle('BTC/USDT', '1h', utils.toTimeEx(Date.UTC(2021, 10, 29, 15, 0, 0, 0)));
        expect(server_time.ticks).toBeGreaterThan(utils.toTimeEx().addMinutes(-4).ticks);
        expect(at2021_11_29_15_0_0).not.toBeNull();
        expect(at2021_11_29_15_0_0.open).toBe(57074.00);
        expect(at2021_11_29_15_0_0.close).toBe(57143.02);

        expect(latest).not.toBeNull();
        expect(exact.openTime).toBe(start.floorToMinutes(minutes).ticks);
        expect(data.length).toBeGreaterThan(0);
        expect(data.items[0].openTime).toBe(start.floorToMinutes(minutes).ticks);
    });

    test('okex getdata works', async () => {
        const market: Markets = 'spot';
        var exchange = new tomcat.Domain.Exchange.CCXTExchange('okeex', market);
        const interval = '1h'
        const minutes = utils.toMinutes(interval);
        const start = utils.toTimeEx().addMinutes(-3000);
        const symbol: Symbols = 'SHIB/USDT';
        var mm = await exchange.getMarkets();
        (mm);
        const data = await exchange.getCandles(symbol, interval, start.ticks, start.addMinutes(800).ticks);
        var exact = await exchange.getExactCandle(symbol, interval, start);
        const latest = await exchange.getLatestCandle(symbol, interval);
        expect(latest).not.toBeNull();
        expect(exact.openTime).toBe(start.floorToMinutes(minutes).ticks);
        expect(data.length).toBeGreaterThan(0);
        expect(data.items[0].openTime).toBe(start.floorToMinutes(minutes).ticks);
    });
    test('binance stream ', async () => {
        //const market: Markets = 'spot';
        var stream = new tomcat.Domain.Exchange.CCXTDataStream('binance', 'BTC/USDT', 'future', '1m')
        //const interval = '1h'
        const start = utils.toTimeEx().addMinutes(-8 * 60);
        const minutes_to_future = 5;
        const end = utils.toTimeEx().addMinutes(minutes_to_future);
        const test_start_time = utils.toTimeEx();
        const candles = new CandleStickCollection([]);
        let number_of_duplicates = 0;

        await stream.play(async c => {
            await Promise.resolve();
            if (candles.find(c.openTime))
                number_of_duplicates++;
            candles.push(c);
        }, start, err => {
            console.log(err);
            return err.time.ticks > end.ticks;

        })

        const ttt = utils.toTimeEx(candles.endTime);
        (ttt);

        expect(number_of_duplicates).toBe(0);

        expect(candles.endTime < end.ticks);
        const elapsed_mili = utils.toTimeEx().ticks - test_start_time.ticks;
        (elapsed_mili);
        const elapsed = utils.SubtractDates(utils.toTimeEx(), test_start_time).absMinutes;
        expect(elapsed).toBeLessThan(minutes_to_future + 1);
    });
    test('playSync works', async () => {
        //const market: Markets = 'spot';
        var stream = new tomcat.Domain.Exchange.CCXTDataStream('binance', 'BTC/USDT', 'future', '1m')
        //const interval = '1h'
        const start = utils.toTimeEx().addMinutes(-8 * 60);
        const minutes_to_future = 3;
        const end = utils.toTimeEx().addMinutes(minutes_to_future);
        const test_start_time = utils.toTimeEx();
        const candles = new CandleStickCollection([]);
        let number_of_duplicates = 0;

        await stream.playSync(c => {
            if (candles.find(c.openTime))
                number_of_duplicates++;
            candles.push(c);
        }, start, err => {
            console.log(err);
            return err.time.ticks > end.ticks;

        })
        expect(number_of_duplicates).toBe(0);
        expect(candles.endTime < end.ticks);
        expect(utils.SubtractDates(utils.toTimeEx().asDate, test_start_time.asDate).absMinutes).toBeCloseTo(minutes_to_future);
    });

    test('stream writer works', async () => {
        //const market: Markets = 'spot';
        var data = new tomcat.Domain.Exchange.CCXTDataStream('binance', 'BTC/USDT', 'future', '1m')
        const stream = new DataSourceStreamEx(data);
        //const interval = '1h'
        const start = utils.toTimeEx().addMinutes(-8 * 60);
        const minutes_to_future = 3;
        const end = utils.toTimeEx().addMinutes(minutes_to_future);
        const test_start_time = utils.toTimeEx();
        const candles = new CandleStickCollection([]);
        let number_of_duplicates = 0;
        await stream.startEx(start, ctx => {
            (ctx);

            if (ctx.err)
                console.error(ctx.err);
            return false;
        });

        expect(number_of_duplicates).toBe(0);
        expect(candles.endTime < end.ticks);
        expect(utils.SubtractDates(utils.toTimeEx().asDate, test_start_time.asDate).absMinutes).toBeCloseTo(minutes_to_future);
    });
    test("pipeline", async () => {
        const pipeline = new Pipeline();
        const start = utils.toTimeEx().addMinutes(-50 * 60).roundToMinutes(1);
        const candles = new CandleStickCollection([]);
        pipeline.from('binance', 'future', 'BTC/USDT', '1m')
            .add(async ctx => {
                (ctx);
                candles.push(ctx);
                await Promise.resolve();
            });
        await pipeline.startEx(start, ctx => {
            (ctx);
            if (candles.length > 3) {
                return true;
            }
            return false;
        });

        console.log("here");
    });

});

import tomcat from '../src'
import { utils } from '../src/lib/base'
import { CandleStickCollection, CandleStickData } from '../src/lib/domain/base'
import { CandleStream } from '../src/lib/domain/data'
// import { IndicatorCalculationContext, IndicatorProvider, Indicators } from '../src/lib/domain/data'
// import { CandleStream } from "../src/lib/domain/data/streams/CandleStream"
import { RedisStream } from '../src/lib/domain/data/streams/RedisStream'

const BinanceDataSource = tomcat.Index.Domain.Exchange.BinanceDataSource
const DataSourceStream = tomcat.Index.Domain.Data.DataSourceStream
// const RedisStream = tomcat.Index.Domain.Data.RedisStream




jest.setTimeout(100000000)
describe("redis", () => {
    test('enforceOneMinut', async () => {
        const redisStream = new RedisStream(utils.randomName("test"))
        await redisStream.XADD(utils.toTimeEx().addMinutes(-2), { paria: "hi" })
        await redisStream.XADD(utils.toTimeEx(), { babak: "hi" })
        // const info = await redisStream.XINFO();
        // (info);
        expect((await redisStream.XINFO()).length).toBe(1)
        const redisStream2 = new RedisStream(utils.randomName("test"))
        const time = utils.toTimeEx().addMinutes(-2)
        await redisStream2.XADD(time, { paria: "hi" }, true, true)
        await redisStream2.XADD(time.addMinutes(1), { babak: "hi" }, true, true)
        expect((await redisStream2.XINFO()).length).toBe(2)
        await redisStream.quit()
        await redisStream2.quit()
    })

    test('redis entries', async () => {
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        await myDataProvider.getLatestCandle();
        const target = new DataSourceStream(myDataProvider, "test-" + Math.floor(Math.random() * 1000))
        const countBeforFetch = await target.getCount()
        target.start(utils.toTimeEx(Date.now()).addMinutes(-60 * 24).roundToMinutes(1))
        await utils.delay(20 * 1000);
        await target.quit();
        const countAfterFetch = await target.getCount()
        expect(countAfterFetch).toBeGreaterThan(countBeforFetch)
        await target.quit()
    })
    test('stream event emitter', async () => {
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        const target = new DataSourceStream(myDataProvider, "test-" + Math.floor(Math.random() * 1000))
        const dataArray = []
        target.on('data', (data: CandleStickData) => {
            dataArray.push(data)
        })
        target.start(utils.toTimeEx(Date.now()).addMinutes(-60 * 24).roundToMinutes(1))
        await utils.delay(20 * 1000);
        await target.quit();
        expect(dataArray.length).toBeGreaterThan(0)
    })
    test('PLAY', async () => {
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        const target = new DataSourceStream(myDataProvider, "test-" + Math.floor(Math.random() * 100))
        target.start(utils.toTimeEx().addMinutes(-50))
        // const dataArray = []
        // target.on('data', (data: CandleStickData) => {
        //     dataArray.push(data)
        // })
        target.play((candle) => {
            console.log(candle);
            return true

        }, utils.toTimeEx().addMinutes(-50))
        await utils.delay(20 * 1000);
        await target.quit();
        // expect(dataArray.length).toBeGreaterThan(0)
    })
    test('x number of days data', async () => {
        const NumberOfDayes = 2
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        const target = new DataSourceStream(myDataProvider, "test-" + Math.floor(Math.random() * 1000))
        let lastCandle: CandleStickData = null;
        const candleSticks = new CandleStickCollection([])
        await target.start(utils.toTimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0)), (candle) => {
            if (lastCandle != null) {
                if (lastCandle.sameTime(candle)) {
                    console.log("same candle was retrieved form binance!!");

                } if (candle.openTime - lastCandle.openTime !== 60000) {
                    console.log("you migth have missed a candle!!");
                }
            }
            candleSticks.push(candle)
            lastCandle = candle;
            return candle.openTime >= utils.toTimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0)).addMinutes(NumberOfDayes * 24 * 60 - 1).ticks
        })
        expect(await target.getCount()).toBe(1440 * NumberOfDayes)
        expect(candleSticks.length).toBe(1440 * NumberOfDayes)
        await target.quit()

    })
    test('missingCandles', async () => {
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        const target = new DataSourceStream(myDataProvider, utils.randomName("dataSource2"))
        const candles = []
        target.play((candle) => {
            candles.push(candle)
            return false
        })
        target.start(utils.toTimeEx(1581213540000))
        // 1581217200000
        await utils.delay(50 * 1000)
        console.log("hi");

    })
    test('liveFeed', async () => {
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        const target = new DataSourceStream(myDataProvider, "PARIA2")
        target.start(utils.toTimeEx().floorToMinutes(1).addMinutes(-2))
        await utils.delay(20 * 1000)
        const streamLastCandle = await target.getLastCandle()
        const dataSourceLastCandle = await myDataProvider.getLatestCandle()
        expect(streamLastCandle.openTime).toBe(dataSourceLastCandle.openTime)
        expect((await target.getLastCandles(10)).length).toBeLessThan(4)
    })
    test('paria', async () => {
        // const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        // const target = new DataSourceStream(myDataProvider, utils.randomName("dataSource2"))
        const target = new CandleStream("dataSource2-186")
        target.getLastCandles(10)
        // target.start(utils.toTimeEx().addMinutes(-2))
        // await utils.delay(20 * 1000)
        // const streamLastCandle = await target.getLastCandle()
        // const dataSourceLastCandle = await myDataProvider.getLatestCandle()
        // expect(streamLastCandle.openTime).toBe(dataSourceLastCandle.openTime)
    })
})
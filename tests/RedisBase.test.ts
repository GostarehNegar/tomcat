import tomcat from '../src'
import { utils } from '../src/lib/base'
import { CandleStickCollection, CandleStickData } from '../src/lib/domain/base'
import { IndicatorCalculationContext, IndicatorProvider, Indicators } from '../src/lib/domain/data'
import { CandleStream } from "../src/lib/domain/data/streams/CandleStream"
import { RedisStream } from '../src/lib/domain/data/streams/RedisStream'

const BinanceDataSource = tomcat.Index.Domain.Exchange.BinanceDataSource

export class IndicatorStream {
    public redisStream: RedisStream
    constructor(public candleStream: CandleStream, public indicatorProvider: IndicatorProvider) {
        this.redisStream = new RedisStream("Btest")
    }
    create() {
        const candleSticks = new CandleStickCollection([])

        this.candleStream.play((candle) => {
            candleSticks.push(candle)
            this.indicatorProvider.calculate(new IndicatorCalculationContext(candleSticks.clone(false))).then(() => {
                this.redisStream.XADD(candle.openTime, candle)
            })
            return false
        })

    }
}




jest.setTimeout(100000000)
describe("redis", () => {
    test('redis entries', async () => {
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        await myDataProvider.getLatestCandle();
        const target = new CandleStream(myDataProvider, "test-" + Math.floor(Math.random() * 1000))
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
        const target = new CandleStream(myDataProvider, "test-" + Math.floor(Math.random() * 1000))
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
        const target = new CandleStream(myDataProvider, "test-" + Math.floor(Math.random() * 100))
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
        const target = new CandleStream(myDataProvider, "test-" + Math.floor(Math.random() * 1000))
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
    test('indicatorStream', async () => {
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        const target = new CandleStream(myDataProvider, "test-" + Math.floor(Math.random() * 1000))
        await target.start(utils.toTimeEx(Date.now()).addMinutes(-1 * 24 * 60), (candle) => {
            return candle.openTime >= utils.toTimeEx(Date.now()).ticks
        })
        const indicatorProvider = new IndicatorProvider().add(Indicators.ADX(14))
        const indicatorStream = new IndicatorStream(target, indicatorProvider)
        indicatorStream.create()
        await utils.delay(20 * 1000)
    })
})
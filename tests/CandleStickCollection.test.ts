import tomcat from '../src'
import { CandleStickCollection, CandleStickData } from '../src/lib/common'
import { Pipeline } from '../src/lib/pipes'

jest.setTimeout(500000)
describe('candleCollection', () => {
    test("populate should not add", () => {
        const candles = new CandleStickCollection([])
        let startingTime = tomcat.utils.toTimeEx(Date.UTC(2021, 0, 1, 0, 0, 0, 0))
        for (let i = 1; i <= 10; i++) {
            candles.push(new CandleStickData(startingTime.ticks, i, i, i, i, startingTime.addMinutes(15).ticks - 1))
            startingTime = startingTime.addMinutes(15)
        }
        const beforLength = candles.length
        candles.populate(candles.items[0].openTime, candles.items[candles.length - 1].openTime)
        expect(beforLength).toBe(candles.length)
    })
    test("populate should add", () => {
        const candles = new CandleStickCollection([], '15m')
        let startingTime = tomcat.utils.toTimeEx(Date.UTC(2021, 0, 1, 0, 0, 0, 0))
        for (let i = 1; i <= 10; i++) {
            if (i != 3) {
                candles.push(new CandleStickData(startingTime.ticks, i, i, i, i, startingTime.addMinutes(15).ticks - 1))
            }
            startingTime = startingTime.addMinutes(15)
        }
        candles.populate(candles.items[0].openTime, candles.items[candles.length - 1].openTime)
        expect(candles.length).toBe(10)
    })
    test("interval", async () => {
        const pipeline = new Pipeline()
        const candles = new CandleStickCollection([])
        const start = tomcat.utils.toTimeEx(Date.UTC(2021, 10, 21, 0, 0, 0, 0))
        const end = tomcat.utils.toTimeEx(Date.UTC(2021, 10, 22, 0, 0, 0, 0))
        pipeline.from('binance', 'spot', 'SHIBUSDT', '15m', "test1")
            .add(async (candle) => {
                if (candle.openTime >= end.ticks) {
                    pipeline.stop()
                }
                candles.push(candle)
            })
        pipeline.start(start)
        await tomcat.utils.delay(50000)
        console.log("");
    })
})
import tomcat from '../src'
import { CandleStickData } from '../src/lib/domain/base'
// import { utils } from '../src/lib/base'

const Pipeline = tomcat.Index.Domain.Strategy.Pipeline
const Indicators = tomcat.Index.Domain.Indicators
jest.setTimeout(60000000)
describe('indicators', () => {

    test("Fill1mIndicators", async () => {
        const pipeline = new Pipeline()
        const time = 1633174260000
        let resCandle: CandleStickData = null
        const a = []
        pipeline.from('binance', 'spot', 'BTCUSDT', '1m', tomcat.utils.randomName('source'))
            .add(Indicators.ADX(14, 200, '1m'))
            .add(Indicators.MDI(14, 200, '1m'))
            .add(Indicators.PDI(14, 200, '1m'), { stream: true })
            .add(async (candle) => {
                a.push(candle)
                candle.getSignals()[""]
                if (candle.openTime == time) {
                    resCandle = candle
                    pipeline.stop()
                }
            })
        pipeline.start(tomcat.utils.toTimeEx(time).addMinutes(-300))
        await tomcat.utils.delay(30 * 1000)
        expect(resCandle.indicators.getNumberValue(Indicators.ADX(14, 200, '1m'))).toBeCloseTo(17.3524, 4)
        expect(resCandle.indicators.getNumberValue(Indicators.MDI(14, 200, '1m'))).toBeCloseTo(18.4470, 4)
        expect(resCandle.indicators.getNumberValue(Indicators.PDI(14, 200, '1m'))).toBeCloseTo(28.8459, 4)
    })
    test("Fill4hIndicators", async () => {
        const pipeline = new Pipeline()
        const ftime = tomcat.utils.toTimeEx(Date.UTC(2021, 9, 3, 16, 0, 0, 0))
        const stime = tomcat.utils.toTimeEx(Date.UTC(2021, 9, 1, 8, 0, 0, 0))
        let fCandle: CandleStickData = null
        let sCandle: CandleStickData = null

        const a = []
        pipeline.from('binance', 'spot', 'BTCUSDT', '1m', tomcat.utils.randomName('source'))
            .add(Indicators.ADX())
            .add(Indicators.MDI())
            .add(Indicators.PDI(), { stream: true })
            .add(async (candle) => {
                a.push(candle)
                if (candle.openTime == stime.addMinutes(4 * 60).ticks) {
                    sCandle = candle
                }
                if (candle.openTime == ftime.addMinutes(4 * 60).ticks) {
                    fCandle = candle
                    pipeline.stop()
                }
            })
        pipeline.start(tomcat.utils.toTimeEx(stime).addMinutes(-50 * 1440))
        await tomcat.utils.delay(1000 * 1000)
        expect(fCandle.indicators.getNumberValue(Indicators.ADX())).toBeCloseTo(39.9510, 4)
        expect(fCandle.indicators.getNumberValue(Indicators.MDI())).toBeCloseTo(11.2145, 4)
        expect(fCandle.indicators.getNumberValue(Indicators.PDI())).toBeCloseTo(33.6062, 4)

        expect(sCandle.indicators.getNumberValue(Indicators.ADX())).toBeCloseTo(24.8837, 4)
        expect(sCandle.indicators.getNumberValue(Indicators.MDI())).toBeCloseTo(11.4337, 4)
        expect(sCandle.indicators.getNumberValue(Indicators.PDI())).toBeCloseTo(39.0525, 4)
    })
})
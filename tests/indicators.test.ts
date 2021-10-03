import tomcat from '../src'
import { CandleStickData } from '../src/lib/domain/base'
// import { utils } from '../src/lib/base'

const Pipeline = tomcat.Index.Domain.Strategy.Pipeline
const Indicators = tomcat.Index.Domain.Indicators
jest.setTimeout(60000)
describe('indicators', () => {

    test("FillIndicators", async () => {
        const pipeline = new Pipeline()
        const time = 1633174260000
        let resCandle: CandleStickData = null
        pipeline.from('binance', 'spot', 'BTCUSDT', '1m', tomcat.utils.randomName('source'))
            .add(Indicators.ADX(14, 200, '1m'))
            .add(Indicators.MDI(14, 200, '1m'))
            .add(Indicators.PDI(14, 200, '1m'), { stream: true })
            .add(async (candle, THIS) => {
                (THIS)
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
})
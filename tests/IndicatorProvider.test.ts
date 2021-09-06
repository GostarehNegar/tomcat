import tomcat from "../src"

type IIndicator = tomcat.Index.Domain.Data.IIndicator
type ICandleStickData = tomcat.Index.Domain.Base.ICandleStickData
const CandleStickCollection = tomcat.Index.Domain.Base.CandleStickCollection
const IndicatorProvider = tomcat.Index.Domain.Data.IndicatorProvider
const Indicators = tomcat.Index.Domain.Data.Indicators
const IndicatorCalculationContext = tomcat.Index.Domain.Data.IndicatorCalculationContext
const DataProvider = tomcat.Index.Domain.Data.DataProvider


jest.setTimeout(60000)
describe("Indicator Provider", () => {
    test("Calculate", async () => {
        const myIndicator = () => {
            const res: IIndicator = {
                pass: 1,
                calculate: async (x) => {
                    x.candleSticks.items.map((candle) => candle.indicators.setValue(myIndicator(), 2))
                    return Promise.resolve()
                },
                name: "a",
                id: "1"
            }
            return res
        }
        const items: ICandleStickData[] = []
        for (let i = 0; i < 30; i++) {
            items.push({ openTime: i, open: 1, high: 5, low: 1, close: 2, closeTime: i + 50 })
        }
        const a = new CandleStickCollection(items)

        const Provider = new IndicatorProvider()
            .add(myIndicator())
            .add(Indicators.ADX(14))
        await Provider.calculate(new IndicatorCalculationContext(a))

        expect(a.items[10].indicators.getValue(myIndicator())).toBe(2)
        // expect(a.items[10].indicators.getValue(Indicators.ADX(14))).toBe(a.items[10].indicators_deprecated.EMA8 * 2)
    })
    test("last indicators ADX", async () => {
        const dataProvider = new DataProvider('binance', 'spot', 'BTCUSDT', '1m')
        const startTime = Date.UTC(2020, 0, 1, 0, 0, 0, 0)
        const endTime = Date.UTC(2020, 0, 5, 0, 0, 0, 0,)
        const data = await dataProvider.getData(startTime, endTime)
        const context = new IndicatorCalculationContext(data)
        const fullContext = new IndicatorCalculationContext(data.clone())
        context.lastCandle = true;
        const indicatorProvider = new IndicatorProvider().add(Indicators.ADX(14)).add(Indicators.ADX(14, 100)).add(Indicators.ADX(14, 30)).add(Indicators.ADX(14, 1000))
        indicatorProvider.isCacheEnabled = false;
        await indicatorProvider.calculate(context)
        fullContext.lastCandle = false
        await indicatorProvider.calculate(fullContext)
        const treshHold = 0.001
        const fullIndicators = fullContext.candleSticks.lastCandle.indicators
        const indicators = context.candleSticks.lastCandle.indicators
        const delta = Math.abs(fullIndicators.getNumberValue(Indicators.ADX(14)) - indicators.getNumberValue(Indicators.ADX(14)))
        const delta100 = Math.abs(fullIndicators.getNumberValue(Indicators.ADX(14, 100)) - indicators.getNumberValue(Indicators.ADX(14, 100)))
        const delta200 = Math.abs(fullIndicators.getNumberValue(Indicators.ADX(14, 200)) - indicators.getNumberValue(Indicators.ADX(14, 200)))
        const delta30 = Math.abs(fullIndicators.getNumberValue(Indicators.ADX(14, 30)) - indicators.getNumberValue(Indicators.ADX(14, 30)))
        expect(delta).toBeLessThan(treshHold)
        expect(delta100).toBeLessThan(treshHold)
        expect(delta200).toBeLessThan(treshHold)
        expect(delta30).toBeLessThan(treshHold)

    })
    test("last indicators", async () => {
        const dataProvider = new DataProvider('binance', 'spot', 'BTCUSDT', '1m')
        const startTime = Date.UTC(2020, 0, 1, 0, 0, 0, 0)
        const endTime = Date.UTC(2020, 0, 5, 0, 0, 0, 0,)
        const data = await dataProvider.getData(startTime, endTime)
        const context = new IndicatorCalculationContext(data)
        const fullContext = new IndicatorCalculationContext(data.clone())
        context.lastCandle = true;
        const SAR = Indicators.SAREXT(0.02, 0.002, 0.02)
        const indicatorProvider = new IndicatorProvider()
            .add(Indicators.ADX(14))
            .add(Indicators.ATR(14))
            .add(SAR)
            .add(Indicators.MinusDi(14))
            .add(Indicators.PlusDi(14))
        indicatorProvider.isCacheEnabled = false;
        await indicatorProvider.calculate(context)
        fullContext.lastCandle = false
        await indicatorProvider.calculate(fullContext)
        const tolerance = 0.0001
        const fullIndicators = fullContext.candleSticks.lastCandle.indicators
        const indicators = context.candleSticks.lastCandle.indicators
        const deltaADX = Math.abs(fullIndicators.getNumberValue(Indicators.ADX(14)) - indicators.getNumberValue(Indicators.ADX(14)))
        const deltaATR = Math.abs(fullIndicators.getNumberValue(Indicators.ATR(14)) - indicators.getNumberValue(Indicators.ATR(14)))
        const deltaSAR = Math.abs(fullIndicators.getNumberValue(SAR) - indicators.getNumberValue(SAR))
        const deltaMDI = Math.abs(fullIndicators.getNumberValue(Indicators.MinusDi(14)) - indicators.getNumberValue(Indicators.MinusDi(14)))
        const deltaPDI = Math.abs(fullIndicators.getNumberValue(Indicators.PlusDi(14)) - indicators.getNumberValue(Indicators.PlusDi(14)))

        expect(deltaADX).toBeLessThan(tolerance)
        expect(deltaATR).toBeLessThan(tolerance)
        expect(deltaMDI).toBeLessThan(tolerance)
        expect(deltaPDI).toBeLessThan(tolerance)
        expect(deltaSAR).toBeLessThan(tolerance)


    })
})

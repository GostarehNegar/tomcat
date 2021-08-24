import { CandleStickCollection, ICandelStickData, } from "../src/lib/domain/base/index"
import { IndicatorProvider } from "../src/lib/domain/data/indicators/implementations/IndicatorProvider"
import { ADX } from "../src/lib/domain/data/indicators/implementations/talib-indicators/ADX"
import { Indicators } from "../src/lib/domain/data/indicators/implementations/indicatorFactory"

jest.setTimeout(60000)
describe("Indicator Provider", () => {
    test("Calculate", async () => {

        const items: ICandelStickData[] = []
        for (let i = 0; i < 30; i++) {
            items.push({ openTime: i, open: 1, high: 5, low: 1, close: 2, closeTime: i + 50 })
        }
        const a = new CandleStickCollection(items)
        const Provider = new IndicatorProvider().add({
            pass: 1,
            id: "TEST",
            name: "TEST",
            calculate: async (context) => {
                context.candleSticks.items.map((item) => {
                    item.indicators_deprecated = item.indicators_deprecated || {}
                    item.indicators_deprecated["TEST"] = (item.indicators_deprecated.EMA8 || 0) * 2
                })
            }
        }).addEMA("EMA8", 8)
            .add(Indicators.ADX(14))
        await Provider.calculate(a)

        expect(a.items[10].indicators_deprecated.TEST).toBe(a.items[10].indicators_deprecated.EMA8 * 2)
        expect(a.items[10].indicators.getValue(Indicators.ADX(14))).toBe(a.items[10].indicators_deprecated.EMA8 * 2)
    })
})

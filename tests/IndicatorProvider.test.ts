import { CandleStickCollection, ICandelStickData, } from "../src/lib/domain/base/index"
import { IndicatorProvider } from "../src/lib/domain/data/indicators/implementations/IndicatorProvider"

jest.setTimeout(60000)
describe("Indicator Provider", () => {
    test("Calculate", async () => {
        const items: ICandelStickData[] = []
        for (let i = 0; i < 30; i++) {
            items.push({ openTime: i, open: 1, high: 5, low: 1, close: 2, closeTime: i + 50 })
        }
        const a = new CandleStickCollection(items)
        const Provider = new IndicatorProvider().addCustomIndicator({
            pass: 1,
            calculate: async (context) => {
                context.candleSticks.items.map((item) => {
                    item.indicators = item.indicators || {}
                    item.indicators["TEST"] = (item.indicators.EMA8 || 0) * 2
                })
            }
        }).addEMA("EMA8", 8)
        await Provider.calculate(a)
        expect(a.items[10].indicators.TEST).toBe(a.items[10].indicators.EMA8 * 2)
    })
})

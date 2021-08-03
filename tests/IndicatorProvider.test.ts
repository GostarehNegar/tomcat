import { CandleStickCollection } from "../src/lib/domain/base"
import { IndicatorProvider } from "../src/lib/domain/data/indicators/IndicatorProvider"
describe("Indicator Provider", () => {
    test("Calculate", () => {
        const Provider = new IndicatorProvider([{ name: "EMA", param1: 5 }])
        Provider.calculate(new CandleStickCollection([]))
    })
})
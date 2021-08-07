import { CandleStickCollection, ICandelStickData } from "../src/lib/domain/base"
import { IndicatorProvider, Strategy } from "../src/lib/domain/data/indicators/IndicatorProvider"
import tomcat from "../src"
import { TimeEx } from "../src/lib"
jest.setTimeout(60000)
describe("Indicator Provider", () => {
    test("Calculate", async () => {
        let items: ICandelStickData[] = []
        for (let i = 0; i < 6; i++) {
            items.push({ openTime: i, open: 1, high: 5, low: 1, close: 2, closeTime: i + 50 })
        }
        let a = new CandleStickCollection(items)
        const Provider = new IndicatorProvider().addEMA("EMA8", 8)
        await Provider.calculate(a)
        expect(a.items[0].indicators.EMA8).toBe(10)
    })
})
describe("strategy test", () => {
    test('strategy', async () => {
        let count = 0
        const host = tomcat.hosts
            .getHostBuilder("name")
            .addMessageBus()
            .buildWebHost()
        host.bus.subscribe("signals/*", (ctx) => {
            count++
            (ctx)
            return Promise.resolve()
        })
        const endTime = new TimeEx()
        const startTime = endTime.addMinutes(-10)
        const strategy = new Strategy(host.bus)

        await strategy.run(startTime.ticks, endTime.ticks)
        expect(count).toBeGreaterThan(0)
    })


})
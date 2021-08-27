import tomcat from "../src"
import { TimeEx } from "../src/lib"
import { DataProvider } from "../src/lib/domain/data/sources/DataProvider"
import { BaseStrategy } from "../src/lib/domain/strategy/strategy"
jest.setTimeout(200000)
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
        const startTime = endTime.addMinutes(-100)
        const dataProvider = new DataProvider("binance", 'future', 'BTCUSDT', '1m')
        const strategy = new BaseStrategy(host.bus, dataProvider)

        await strategy.run(startTime.ticks, endTime.ticks)
        expect(count).toBeGreaterThan(0)
    })


})
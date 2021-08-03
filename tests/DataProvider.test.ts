import { TimeEx } from "../src/lib"
import { DataProvider } from "../src/lib/domain/data/sources/DataProvider"
jest.setTimeout(20000)
describe("data Provider", () => {
    test("tests", async () => {
        const endTime = new TimeEx()
        const startTime = endTime.addMinutes(-5)
        const dataProvider = new DataProvider("binance", 'future', "BTCUSDT", "1m")
        const latestCandle = await dataProvider.getData(startTime.ticks, endTime.ticks)
        const latestCandle2 = await dataProvider.getData(startTime.ticks, endTime.ticks)
        expect(latestCandle.sourceName || null).toBeNull()
        expect(latestCandle2.sourceName).toBe("DataBase")

    })
})
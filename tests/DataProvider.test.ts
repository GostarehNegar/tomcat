import { TimeEx } from "../src/lib"
import { DataProvider } from "../src/lib/domain/data/sources/DataProvider"
jest.setTimeout(2 * 60 * 60 * 1000)
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
    test("dataprovider start", async () => {
        const dataProvider = new DataProvider("binance", 'spot', "BTCUSDT", "1m")
        const endTime = new TimeEx(Date.UTC(2020, 2, 9, 0, 0, 0, 0))
        const startTime = new TimeEx(Date.UTC(2020, 2, 9, 10, 0, 0, 0))
        const res = await dataProvider.getData(startTime, endTime)
        expect(res.endTime).toBe(endTime.ticks)

    })
})

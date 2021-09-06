import tomcat from "../src"

const BinanceExchange = tomcat.Index.Domain.Exchange.BinanceExchange
const TimeEx = tomcat.Index.Base.TimeEx

jest.setTimeout(20000000)
describe('BinanceExchange', () => {

    test('should get server time', async () => {
        // const target = new BinanceExchange();
        const target = new BinanceExchange();
        const curren_time = await target.getServerTime();
        expect(curren_time.ticks).toBeGreaterThan(0);
    })
    test("getData", async () => {
        const target = new BinanceExchange();
        const endTime = new TimeEx().roundToMinutes(1)
        const startTime = endTime.addMinutes(-5).roundToMinutes(1)
        const res = await target.getData("future", "BTCUSDT", "1m", startTime.ticks, endTime.ticks)
        expect(res.items.length).toBeGreaterThan(0)
        expect(res.startTime).toBe(startTime.ticks)
        expect(res.endTime).toBeLessThan(endTime.ticks)
        expect(endTime.ticks - res.endTime).toBe(1000 * 60)
        expect(res.length).toBe(5)
    })
    test("exact candle", async () => {
        const target = new BinanceExchange();
        const time = new TimeEx().floorToMinutes(1)
        const res = await target.getExactCandle("future", "BTCUSDT", "1m", time.ticks)
        expect(res.openTime).toBe(time.ticks)
        expect(res).toBe(1)

    })
    test("latest candle", async () => {
        const target = new BinanceExchange();
        const time = new TimeEx().floorToMinutes(1).addMinutes(-1);
        const res = await target.getLatestCandle("future", "BTCUSDT", "1m")
        expect(res.openTime).toBe(time.ticks)
        expect(res).not.toBeNull()

    })
    test("missing candle", async () => {
        const target = new BinanceExchange();
        const startTime = Date.UTC(2020, 1, 19, 0, 0, 0, 0)
        const endTime = Date.UTC(2020, 1, 20, 0, 0, 0, 0)
        const res = await target.getData("future", "BTCUSDT", "1m", startTime, endTime);
        const missing = res.getMissingCandles(startTime, endTime);
        res.populate(startTime, endTime)
        const missing2 = res.getMissingCandles(startTime, endTime);
        expect(missing.length).toBeGreaterThan(0)
        expect(missing2.length).toBe(0)
    })

})
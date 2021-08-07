import { TimeEx } from '../src/lib/base';
import { BinanceExchange } from '../src/lib/domain/exchanges/internals/Binance.Exchange'
jest.setTimeout(20000)
describe('BinanceExchange', () => {

    test('should get server time', async () => {

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

})
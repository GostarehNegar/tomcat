import { TimeEx } from '../src/lib/base/TimeEx';
import { BinanceExchange } from '../src/lib/domain/exchanges/Binance.Exchange'

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
        expect(res.endTime).toBe(endTime.ticks)
        expect(res.length).toBe(6)
    })

})
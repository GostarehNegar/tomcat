import { BinanceExchange } from '../src/lib/domain/exchanges/Binance.Exchange'

describe('BinanceExchange', () => {

    test('should get server time', async () => {

        const target = new BinanceExchange();
        const curren_time = await target.getServerTime();
        expect(curren_time.ticks).toBeGreaterThan(0);
    })

})
import tomcat from "../src/"
import { ICandelStickData } from "../src/lib/domain/base"
import { Bot, Order } from "../src/lib/domain/bot/bot"

describe('Bot', () => {
    test("tests bot and wallet", async () => {
        let count = 0
        const host = tomcat
            .hosts
            .getHostBuilder("bot")
            .addMessageBus()
            .buildWebHost()
        host.bus.subscribe("wallet/tradesRegistered/openLong", async (ctx) => {
            (ctx)
            count++
            await Promise.resolve()
        })
        const bot = new Bot(host.bus)
        const candle: ICandelStickData = { close: 50, open: 2, closeTime: 5, high: 1, low: 5, openTime: 5, indicators: { ATR14: 1 } }
        const order = new Order(candle, 'future', 'ATR14', "BTCUSDT", 'long', 'open');
        (bot)
        await host.bus.createMessage('signals/myStrategy/buy', order).publish();
        expect(count).toBe(1)


    })

})
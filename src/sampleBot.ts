import { IIndicator, IIndicatorCalculationContext, TimeEx } from "./lib";
import { Bot, IStrategyContext } from "./lib/domain/bot/bot"

import tomcat from ".";

const host = tomcat
    .hosts
    .getHostBuilder("bot")
    .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
    .buildWebHost()
const bot = new Bot(host.bus).addDataProvider("binance", "future", "BTCUSDT", "4h").addStrategy("CustomStrategy");
const endTime = new TimeEx(Date.UTC(2019, 11, 31, 11, 59, 59, 999));
const startTime = new TimeEx(Date.UTC(2019, 0, 1, 0, 0, 0, 0));
const sample: IIndicator = {
    pass: 1,
    calculate: async (context: IIndicatorCalculationContext) => {
        for (let i = 0; i < context.candleSticks.items.length; i++) {
            const candle = context.candleSticks.items[i];
            if (candle.indicators) {
                candle.indicators.sample = 5
            }
        }
    },
};
const strategyContext: IStrategyContext = { startTime: startTime.ticks, endTime: endTime.ticks, atr: { id: "ATR14", period: 14 }, customIndicators: [sample] };
(async () => {
    await bot.execute(strategyContext);
})();




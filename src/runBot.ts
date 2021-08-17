// import { TimeEx } from "./lib"
import { Bot } from "./lib/domain/bot/bot"
// import { DataProvider } from "./lib/domain/data/sources/DataProvider"
// import { BaseStrategy } from "./lib/domain/strategy/strategy"

import tomcat from ".";

const host = tomcat
    .hosts
    .getHostBuilder("bot")
    .addMessageBus()
    .buildWebHost()
const bot = new Bot(host.bus).addDataProvider("binance", "future", "BTCUSDT", "4h").addStrategy();
const endTime = 1577836799000;
const startTime = 1546300800000;
host.bus.subscribe("wallet/tradesRegistered/*", async (ctx) => {
    (ctx)
    console.log(`trade!${ctx.message.topic}`);
    console.log(bot.wallet.toString());
    await Promise.resolve()
});

(async () => {
    await bot.execute(startTime, endTime);
    // console.log(bot.wallet.tradeList.length);

})();




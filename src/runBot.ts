import { TimeEx } from "./lib";
import { Bot, IStrategyContext } from "./lib/domain/bot/bot"
import { Trade } from "./lib/domain/wallet/wallet";

import tomcat from ".";

const host = tomcat
    .hosts
    .getHostBuilder("bot")
    .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
    .buildWebHost()
const bot = new Bot(host.bus).addDataProvider("binance", "future", "BTCUSDT", "4h").addStrategy("TestStrategy");
host.use(async (cxt) => {
    if (cxt.request.url == "/trades") {
        let report = 'NO. \t DATE \t \t SIDE \t QUANTITY \t \t PRICE \t \t \t PNL'
        bot.wallet.tradeList.map((trade, index) => {
            const date = new Date(trade.time)
            const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
            report += `\n${index}\t${formattedDate}\t${trade.side}\t${trade.quantity}\t${trade.price}\t\t${trade.realizedProfit}`
        })
        cxt.response.write(report);
        cxt.response.end()
    }
}).listen(3000)
const endTime = new TimeEx(Date.UTC(2019, 11, 31, 11, 59, 59, 999));
const startTime = new TimeEx(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
host.bus.subscribe("Wallet/tradesRegistered", async (ctx) => {
    (ctx)
    console.log(`trade!${ctx.message.cast<Trade>().side}`);
    console.log(bot.wallet.toString());
    await Promise.resolve()
});

(async () => {
    const strategyContext: IStrategyContext = { startTime: startTime.ticks, endTime: endTime.ticks }
    await bot.execute(strategyContext);
    console.log("hi");

})();




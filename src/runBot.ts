import { Bot, Logger, TimeEx } from "./lib";
// import { ICandelStickData } from "./lib/domain/base";
// import { Bot, IStrategyContext } from "./lib/domain/bot/bot"
// import { Order } from "./lib/domain/wallet/wallet";

import tomcat from ".";
const host = tomcat
    .hosts
    .getHostBuilder("bot")
    .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
    .buildWebHost()

// interface IstateChange {
//     candle: ICandelStickData
//     order: Order
//     state: string
// }
// class stateLogger {
//     public report = 'NO.\tDATE\t\t\tposition\tSIDE\tamount\t\tPRICE\t\tADX\tPDI\tMDI\tSAR\t\tADXSlope SARAbove'
//     public index = 1
//     constructor() {
//         host.bus.subscribe("Bot/stateChange", async (cxt) => {
//             const context = cxt.message.cast<IstateChange>()
//             const date = new Date(context.order.time)
//             const formattedDate = `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()},${date.getUTCHours()}:${date.getUTCMinutes()}`
//             // const indicator = { ADX: context.candle.indicators.ADX14, SAR: context.candle.indicators.SAR, PDI: context.candle.indicators.PDI, MDI: context.candle.indicators.MDI, isSARAbove: context.candle.indicators.isSarAbove, ADXSlope: context.candle.indicators.adxSlope }
//             this.report += `\n${this.index.toString().padEnd(3, " ")}\t${formattedDate.toString().padEnd(16, " ")}\t${context.state.padEnd(10, " ")}\t${context.order.side.toString().padEnd(4, " ")}\t${context.order.amount.toFixed(4).padEnd(8, " ")}\t${context.order.price.toString().padEnd(8, " ")}\t${context.candle.indicators_deprecated.ADX14.toFixed(4).padEnd(7, " ")}\t${context.candle.indicators_deprecated.PDI.toFixed(4).padEnd(7, " ")}\t${context.candle.indicators_deprecated.MDI.toFixed(4).padEnd(7, " ")}\t${context.candle.indicators_deprecated.SAR.toFixed(4).padEnd(10, " ")}\t${context.candle.indicators_deprecated.adxSlope.toFixed(4).padStart(7, " ")}\t${context.candle.indicators_deprecated.isSarAbove.toString().padStart(2, " ")}`
//             this.index += 1
//         });
//     }
// }
// const stateLog = new stateLogger();



const bot = new Bot(host.bus)
// .addDataProvider("binance", "future", "BTCUSDT", "4h").addStrategy("BaseStrategyExtended");
host.use(async (cxt) => {
    if (cxt.request.url == "/trades") {
        let report = 'NO. \t DATE \t \t SIDE \t QUANTITY \t \t PRICE \t \t \t PNL'
        bot.wallet.tradeList.map((trade, index) => {
            const date = new Date(trade.time)
            const formattedDate = `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()},${date.getUTCHours()}:${date.getUTCMinutes()}`
            report += `\n${index}\t${formattedDate}\t${trade.side}\t${trade.quantity}\t${trade.price}\t\t${trade.realizedProfit}`
        })
        cxt.response.write(report);
        cxt.response.end()
    }
    // if (cxt.request.url == "/botStates") {
    //     cxt.response.write(stateLog.report);
    //     cxt.response.end()
    // }
}).listen(3000);
let count = 0
host.bus.subscribe("Wallet/tradesRegistered", async (cxt) => {
    (cxt)
    count++
    console.log(count);
});


(async () => {
    const endTime = new TimeEx(Date.UTC(2020, 11, 31, 23, 59, 59, 999));
    const startTime = new TimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0));
    // const strategyContext: IStrategyContext = { startTime: startTime.ticks, endTime: endTime.ticks }
    Logger.level = 'log'
    await bot.start(startTime.ticks, endTime.ticks);
    console.log("DONE!");

})();




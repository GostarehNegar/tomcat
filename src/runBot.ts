// import fs from 'fs'

// import { IndicatorValueCollection } from './lib/domain/base';
// import { IReportContext, JobOrder } from './lib/domain/bot';

import tomcat from ".";
import { JobOrder } from "./lib/domain/bot";
// import { utils } from "./lib/base";
// import { Trade } from "./lib/domain/wallet";
const Bot = tomcat.Index.Domain.Bot.Bot
const TimeEx = tomcat.Index.Base.TimeEx
const Logger = tomcat.Index.Base.Logger

const host = tomcat
    .hosts
    .getHostBuilder("bot")
    .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
    .buildWebHost()

// interface IstateChange {
//     candle: ICandelStickData
//     order: Order
//     state: string
// // }
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



// .addDataProvider("binance", "future", "BTCUSDT", "4h").addStrategy("BaseStrategyExtended");
// host.use(async (cxt) => {
//     if (cxt.request.url == "/trades") {
//         let report = 'NO. \t DATE \t \t SIDE \t QUANTITY \t \t PRICE \t \t \t PNL'
//         bot.wallet.tradeList.map((trade, index) => {
//             const date = new Date(trade.time)
//             const formattedDate = `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()},${date.getUTCHours()}:${date.getUTCMinutes()}`
//             report += `\n${index}\t${formattedDate}\t${trade.side}\t${trade.quantity}\t${trade.price}\t\t${trade.realizedProfit}`
//         })

//         cxt.response.write(report);
//         cxt.response.end()
//     }
//     // if (cxt.request.url == "/botStates") {
//     //     cxt.response.write(stateLog.report);
//     //     cxt.response.end()
//     // }
// }).listen(3000);
// // let count = 1
// // host.bus.subscribe("Wallet/tradesRegistered", async (cxt) => {
// //     const trade = cxt.message.cast<Trade>()
// //     count++
// // });



const bot = new Bot(host.bus);
// let now: Date;
// let formattedDate: string;
(async () => {
    const startTime = new TimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0));
    const endTime = new TimeEx(Date.UTC(2020, 11, 31, 23, 59, 59, 999));
    // const strategyContext: IStrategyContext = { startTime: startTime.ticks, endTime: endTime.ticks }
    console.log("DONE!");

    Logger.level = 'log'
    Logger.getLogger('DataProvider').level = 'error'
    // now = new Date(Date.now())
    // formattedDate = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-${now.getUTCHours()}-${now.getUTCMinutes()}`
    const jobOrder = new JobOrder(startTime, endTime)
    await bot.start(jobOrder);
    console.log("DONE!");

})();

// const report = [];
// host.bus.subscribe("Bot/Report", async (ctx) => {
// report.push(ctx.message.cast<IReportContext>())
//     fs.writeFile(`./Report/${formattedDate}.json`, JSON.stringify(report), (e) => {
//         if (e) {
//             console.log(e);
//         } else {
//             console.log("Report appended");
//         }
//     })
// });

// const indicators = bot.strategy.indicators;
// let report = 'NO.\tDATE\t\t\tposition\tSIDE\tamount\t\tPRICE\t\tADX\tPDI\tMDI\tSAR\t\tADXSlope SARAbove';
// fs.readFile(`./Report/2021-9-10-13-44.json`, 'utf8', (err, data) => {
//     if (err) {
//         console.error(err)
//         return
//     } else {

//         (JSON.parse(data) as IReportContext[]).map((item, index) => {
//             const date = new Date(item.order.time)
//             const formattedDate = `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()},${date.getUTCHours()}:${date.getUTCMinutes()}`
//             item.candle.indicators = new IndicatorValueCollection(item.candle.indicators.values)
//             report += `\n${(index += 1).toString().padEnd(3, " ")}\t${formattedDate.toString().padEnd(16, " ")}\t${item.state.padEnd(10, " ")}\t${item.order.side.toString().padEnd(4, " ")}\t${item.order.amount.toFixed(4).padEnd(8, " ")}\t${item.order.price.toString().padEnd(8, " ")}\t${item.candle.indicators.getNumberValue(indicators.ADX).toFixed(4).padEnd(7, " ")}\t${item.candle.indicators.getNumberValue(indicators.plusDi).toFixed(4).padEnd(7, " ")}\t${item.candle.indicators.getNumberValue(indicators.minusDi).toFixed(4).padEnd(7, " ")}\t${item.candle.indicators.getNumberValue(indicators.SAR).toFixed(4).padEnd(10, " ")}\t${item.candle.indicators.getNumberValue(indicators.adxSlope).toFixed(4).padStart(7, " ")}\t${item.candle.indicators.getNumberValue(indicators.isSarAbove).toString().padStart(2, " ")}`
//             // console.log(item.candle.indicators.getNumberValue(indicators.ADX));

//         })
//     }
// })
// host.use(async (cxt) => {
//     if (cxt.request.url == "/report") {
//         cxt.response.write(report);
//         cxt.response.end()
//     }
// }).listen(3000)



// import fs from 'fs'

import tomcat from ".";

type IBot = tomcat.Index.Domain.Bot.IBot
const Bot = tomcat.Index.Domain.Bot.Bot
const TimeEx = tomcat.Index.Base.TimeEx
const Logger = tomcat.Index.Base.Logger
const JobOrder = tomcat.Index.Domain.Bot.JobOrder
let bot1 = null
const host = tomcat
    .hosts
    .getHostBuilder("bot")
    .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
    .addService(tomcat.Index.Constants.ServiceNames.IBot, (s) => {
        bot1 = bot1 || new Bot(s)
        return bot1
    })
    .buildWebHost();

const bot = host.services.getService<IBot>("IBot");
// let now: Date;
// let formattedDate: string;
(async () => {
    const startTime = new TimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0));
    const endTime = new TimeEx(Date.UTC(2020, 5, 3, 0, 59, 59, 999));
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



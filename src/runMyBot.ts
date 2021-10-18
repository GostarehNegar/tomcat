import tomcat from ".";

const MyBot = tomcat.Domain.Bot.Bot
// const CandleStream = tomcat.Index.Domain.Data.CandleStream
// const PORT = 8000;
// const app = tomcat
//     .hosts
//     .getHostBuilder("bot")
//     .buildWebHost('express')
//     .expressApp;
// const strategyStream = new CandleStream("strategy")
// const walletStream = new CandleStream("Wallet-17")



// app.get("/query", async (req, res) => {
//     const timquery = req.query["startTime"] as string
//     const time = timquery.indexOf('Z') > 0 ?
//         tomcat.utils.toTimeEx(new Date(timquery))
//         : tomcat.utils.toTimeEx(Number(req.query["startTime"])).floorToMinutes(1)
//     const result = await strategyStream.getCandle(time)
//     // const candle = JSON.parse(result.candle)
//     res.json(result)

// })
// app.get("/trades", async (req, res) => {
//     (req);
//     const trades = []
//     const result = await walletStream.getAll();
//     for (let i = 0; i < result.length; i++) {
//         const a = JSON.parse(result[i])
//         a["id"] = i
//         trades.push(a)
//     }
//     res.json(trades)


// })
// app.listen(PORT, () => {
//     console.log(`tomcat listening on port ${PORT} ...`);
// });



const startTime = tomcat.utils.toTimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0)).addMinutes(-30 * 1440)
const endTime = tomcat.utils.toTimeEx(Date.UTC(2021, 0, 1, 0, 0, 0, 0));
const bot = new MyBot()
bot.run(startTime, endTime)

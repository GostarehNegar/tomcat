import tomcat from ".";

// type IBot = tomcat.Index.Domain.Bot.IBot
const MyBot = tomcat.Index.Domain.Bot.MyBot
// const TimeEx = tomcat.Index.Base.TimeEx
// const Logger = tomcat.Index.Base.Logger
// const JobOrder = tomcat.Index.Domain.Bot.JobOrder
// let bot1 = null
// const host = tomcat
//     .hosts
//     .getHostBuilder("bot")
//     .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
//     .addService(tomcat.Index.Constants.ServiceNames.IBot, (s) => {
//         bot1 = bot1 || new Bot(s)
//         return bot1
//     })
//     .buildWebHost();

// const bot = host.services.getService<IBot>("IBot");
const startTime = tomcat.utils.toTimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0));
const endTime = tomcat.utils.toTimeEx(Date.UTC(2021, 0, 1, 0, 0, 0, 0));

const bot = new MyBot()
bot.run(startTime, endTime)

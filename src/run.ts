import tomcat from ".";

const MyBot = tomcat.Domain.Bot.Bot

const bot = new MyBot();

const startTime = tomcat.utils.toTimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0))
const endTime = tomcat.utils.toTimeEx(Date.UTC(2021, 0, 1, 0, 0, 0, 0))

bot.runEX(startTime, endTime)

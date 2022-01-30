import { TimeEx } from "./infrastructure/base";

import tomcat from ".";
tomcat.register({})
const bot = tomcat.getBotBuilder("test").build()
const redisClient = bot.services.getRedisFactory().createClient({ keyPrefix: "test:" })
redisClient.set("name", "paria")
redisClient.get("name")
bot.pipeline.from("binance", 'spot', 'BTCUSDT', '1m')
    .add(async (candle) => {

    })
bot.startEx(new TimeEx(), (ctx) => {

})
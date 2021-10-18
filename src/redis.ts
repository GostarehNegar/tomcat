
// import { IDataProvider } from "./lib/domain/data";

import { DataSourceStream } from "./lib/domain/data";

import tomcat from ".";
// import { CandleStream } from "./lib/domain/data/streams/CandleStream";

// const asyncRedis = require("async-redis");
// const client = (D as any).createClient() as any;
// client.SET("paria", "mahmoudi")
// const client = redis.createClient();
// (AsyncRedis as any).default.createClient() as AsyncRedis
export type IDataProvider = tomcat.Index.Domain.Data.IDataProvider
const DataProvider = tomcat.Index.Domain.Data.DataProvider
const myDataProvider = new DataProvider('binance', 'spot', 'BTCUSDT', '1m');
(async () => {
    // const candles = await exchange.getData(now.addMinutes(-40).ticks, now.ticks);
    // for (let i = 0; i < candles.length; i++) {
    //     await client.sendCommand("XADD", [`candles-binance-${exchange.market}-${exchange.symbol}-${exchange.interval}`, candles.items[i].openTime, "value", JSON.stringify(candles.items[i])])
    // }
    // const now = tomcat.utils.toTimeEx(Date.now()).roundToMinutes(1);
    const candleStream = new DataSourceStream(myDataProvider);
    // await candleStream.createStream(now.addMinutes(-40), now)
    // const streams = await client.sendCommand("SCAN", ["0", "TYPE", 'stream'])
    // streams[1][1]
    const candles = await candleStream.getLastCandle();
    console.log(candles);



})();


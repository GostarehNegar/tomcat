//https://www.okex.com/api/spot/v3/instruments/BTC-USDT/history/candles?start=2020-07-25T02:31:00.000Z&end=2020-07-24T02:55:00.000Z&granularity=60

import fetch from "node-fetch";



export class OkExExchange {
    async fetchData() {
        return await fetch("https://www.okex.com/api/spot/v3/instruments/BTC-USDT/history/candles?start=2020-07-25T02:31:00.000Z&end=2020-07-24T02:55:00.000Z&granularity=60")
            .then((res) => res.json())
            .then((json) => {
                json.map(x => {
                    console.log(x);
                })
            })
    }
}
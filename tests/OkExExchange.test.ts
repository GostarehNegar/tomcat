import tomcat from '../src'
const OkExExchange = tomcat.Domain.Exchange.OkExExchange
// export class OkExExchange {
//     async fetchData() {
//         const okex = new ccxt.okex3()
//         // const markets = await okex.loadMarkets();
//         const start = okex.parse8601("2020-01-01 03:03:00");
//         return await okex.fetchOHLCV("BTC/USDT", '1m', start, 300)
//     }
// }

jest.setTimeout(50000)
describe("okEx", () => {
    test("fetch data", async () => {
        const okEx = new OkExExchange()
        const res = await okEx.fetchData()
        console.log(res)
    })
})
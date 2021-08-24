import { IStrategyContext } from "./lib/domain/bot/bot"
import { Trade } from "./lib/domain/wallet/wallet"

import tomcat from "."
const host = tomcat
    .hosts
    .getHostBuilder("bot")
    .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
    .buildWebHost()

// interface params {
//     config: string
// }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const configurator = (config: any): IStrategyContext => {

    const configContext: IStrategyContext = {
        startTime: Number(config.startTime),
        endTime: Number(config.endTime),
    }
    if (config.ADX) {
        configContext.adx = { id: config.ADX.id, period: Number(config.ADX.period) }
    }
    if (config.ATR) {
        configContext.atr = { id: config.ATR.id, period: Number(config.ATR.period) }
    }
    if (config.MDI) {
        configContext.minusDi = { id: config.MDI.id, period: Number(config.MDI.period) }
    }
    if (config.PDI) {
        configContext.plusDi = { id: config.PDI.id, period: Number(config.PDI.period) }
    }
    if (config.SAR) {
        configContext.sar = { id: config.SAR.id, startIndex: Number(config.SAR.start), acceleration: Number(config.SAR.increment), maxAcceleration: Number(config.SAR.max) }
    }
    return configContext
}


const a = new tomcat.Bot(host.bus).addDataProvider('binance', 'future', 'BTCUSDT', '4h').addStrategy("CustomStrategy")
// const param = cxt.request.getParams<params>()
// const config = JSON.parse(param.config);
const config = {
    startTime: '1598181907000',
    endTime: '1603452307000',
    ATR: { id: 'ATR15', period: '15' },
    ADX: { id: 'ADX15', period: '15' },
    PDI: { id: 'PDI', period: '15' },
    MDI: { id: 'MDI', period: '15' },
    SAR: { id: 'SAR', start: '0.02', increment: '0.005', max: '0.2' }
}
const res = configurator(config)
// cxt.response.setHeader('Access-Control-Allow-Origin', '*')

host.bus.subscribe("Wallet/tradesRegistered", async (ctx) => {
    (ctx)
    console.log(`trade!${ctx.message.cast<Trade>().side}`);
    console.log(a.wallet.toString());
    await Promise.resolve()
});
(async () => {
    await a.execute(res)
    console.log(a.wallet.tradeList.length);
})();

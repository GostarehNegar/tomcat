
import tomcat from "../src";
import { BotServiceDefinition, MohsenBot } from "../src/bot";
import { DataServiceDefinition } from "../src/contracts";
import { CandleStreamMeshService } from "../src/data";

import TestFixture from "./TestFixture";
jest.setTimeout(5000000)
describe('BotTests', () => {
    test('01-botbuilder', async () => {
        tomcat.config.infrastructure.internet.proxy.url = "http://172.16.6.56:8080";
        const testFixture = await TestFixture.setup()
        // tomcat.config.infrastructure.data.redisOptions = { host: 'localhost' };
        // const def: DataServiceDefinition = { category: "data", parameters: { exchange: 'binance', interval: "1m", market: 'future', symbol: 'BTC/USDT' } }
        const dataService = testFixture.getBuilder("data").addMeshService(cfg => cfg.userServiceConstructor({ category: "data", parameters: {} }, {}, (def) => new CandleStreamMeshService(def as DataServiceDefinition))).build()
        await dataService.start()
        // await tomcat.utils.delay(5000)
        // dataService.node.startService(def)
        const botDefinition: BotServiceDefinition = { category: "strategy", parameters: { exchange: 'binance', interval: '1m', market: 'spot', symbol: 'DOGE/USDT', name: "mohsen" } }
        const bot = testFixture.getBuilder("test").addMeshService(
            cfg => cfg.userServiceConstructor({ category: 'strategy', parameters: { name: "mohsen" } }, {}, (def) => { return new MohsenBot(def as BotServiceDefinition) })).build()
        await bot.start()
        bot.node.startService(botDefinition)
        await tomcat.utils.delay(1500000)

        // bot2 = tomcat.getHostBuilder("bot2").addBot("bot",(pipeline)=>{
        //     pipeline.add()
        // })
    });

});
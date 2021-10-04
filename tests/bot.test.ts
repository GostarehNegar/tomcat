import tomcat from "../src"
import { utils } from "../src/lib/base"
import { MyBot } from "../src/lib/domain/bot"
import { Pipeline } from "../src/lib/domain/strategy"

const JobOrder = tomcat.Index.Domain.Bot.JobOrder
const TimeEx = tomcat.Index.Base.TimeEx
const Bot = tomcat.Index.Domain.Bot.Bot


jest.setTimeout(100000000)
describe('Bot', () => {
    test("bot", async () => {
        const host = tomcat
            .hosts
            .getHostBuilder("bot")
            .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
            .buildWebHost()
        const startTime = new TimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0))
        const endTime = new TimeEx(Date.UTC(2020, 0, 6, 0, 0, 0, 0))
        const jobOrder = new JobOrder(startTime, endTime)
        const bot = new Bot(host.services)
        const jobContext = await bot.start(jobOrder)
        expect(jobContext.startTime).not.toBe(0)

    })
    test("newBot", async () => {
        const bot = new MyBot()
        bot.run()
        await utils.delay(6000 * 1000)
    })


})
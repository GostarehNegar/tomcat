import tomcat from "../../..";
import { Ticks } from "../../base";

import { Bot, JobOrder } from ".";

export class BotFactory {
    static make(hostName: string, startTime: Ticks, endTime: Ticks) {
        const host = tomcat
            .hosts
            .getHostBuilder(hostName)
            .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
            .buildWebHost()
        return { host: host, bot: new Bot(host.services), jobOrder: new JobOrder(startTime, endTime) }
    }
    // static create(botName: string): IBot {
    //     switch (botName) {
    //         default:
    //             return new Bot()
    //     }
    // }
}
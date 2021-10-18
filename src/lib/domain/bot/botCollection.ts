import { IServiceProvider } from "../../base";
import { serviceNames } from "../../hosting";

import { IBot } from ".";

export class BotCollection {
    items: IBot[] = []
    constructor(public services: IServiceProvider) {

    }
    getBots(): IBot[] {
        return this.services.getServices<IBot>(serviceNames.IBot)
    }
    // add(bot: IBot) {
    //     this.items.push(bot)
    // }
    // createByName(botName: string): IBot {
    //     return this.services.getServices<IBot>("IBot").find(s => {
    //         s.name == botName
    //     })
    // }
    // addByName(botName: string) {
    //     this.add(this.createByName(botName))
    // }
}
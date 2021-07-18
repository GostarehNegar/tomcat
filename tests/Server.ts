
import { MessageBus } from "../src/lib/MessageBus/Internals/MessageBus";
import { ServerBuilder } from "../src/lib/server/ServerBuilder";
import tomcat from "../src/";







const bus = new MessageBus();


(async () => {

    await bus.subscribe("*://request", ctx => {

        console.log("::: Request From :", ctx.message.from, " Channel", bus.channelName);
        ctx.reply("reply from " + bus.channelName);

        return Promise.resolve();

    });
    await bus.start();
    console.log("publishing")

    setInterval(async () => {
        const msg = bus.createMessage("request", "*")
        msg.message.headers['remote'] = 'True'
        const r = await msg.execute();


        console.log("=== reply=", (r as any).payload, " Channel", bus.channelName)
        //console.log(bus.channelName)

    }, 1000);
})();

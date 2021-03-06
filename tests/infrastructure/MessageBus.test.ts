//import { MessageBus, IMessageBus } from '../src/lib/bus'
// import { IMessageBus } from '../src/lib/bus/_interfaces';
import tomcat from "../../src"
import SystemTopics from "../../src/infrastructure/bus/Topics";

const MessageBus = tomcat.Infrastructure.Bus.MessageBus
type IMessageBus = tomcat.Infrastructure.Bus.IMessageBus

jest.setTimeout(20000);
const bus = new MessageBus(cf => {
    cf.transports.websocket.diabled = true;
}) as IMessageBus;
afterAll(async () => {
    await bus.stop();

});
describe('MessageBus', () => {
    test('create message', () => {
        const body = { name: "babak" }
        const message = bus.createMessage("test", body);
        message.message.headers["on"] = Date.now().toString();
        expect(message.message.topic).toBe("test");
        expect(message.message.payload).toBe(body);
    });
    test('interprocess bus works', async () => {
        const port = 8085;

        const hub = tomcat.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        const server = tomcat.getHostBuilder('server')
            .addMessageBus(cfg => {
                cfg.endpoint = 'server'
                cfg.transports.websocket.diabled = false;
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .buildWebHost();
        const client = tomcat.getHostBuilder('client')
            .addMessageBus(cfg => {
                cfg.endpoint = 'client'
                cfg.transports.websocket.diabled = false;
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .buildWebHost();
        await server.bus.subscribe(SystemTopics.busdown, async (ctx) => {

            (ctx);
            await Promise.resolve();
        })
        await server.bus.subscribe('some-topic', async (ctx) => {
            ctx.reply('pong');

        });



        await hub.listen(port);
        await tomcat.utils.delay(3000);
        await server.start();
        await client.start();
        const res = await client.bus.createMessage('some-topic', {}).execute();
        (res);
        await tomcat.utils.delay(3000);
        await client.stop();
        await tomcat.utils.delay(3000);







    });

    test('busdown works', async () => {
        const port = 8085;
        const hub = tomcat.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        const server = tomcat.getHostBuilder('server')
            .addMessageBus(cfg => {
                cfg.endpoint = 'server'
                cfg.transports.websocket.diabled = false;
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .buildWebHost();
        const client = tomcat.getHostBuilder('client')
            .addMessageBus(cfg => {
                cfg.endpoint = 'client'
                cfg.transports.websocket.diabled = false;
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .buildWebHost();
        await server.bus.subscribe(SystemTopics.busdown, async (ctx) => {

            (ctx);
            await Promise.resolve();
        })


        await hub.listen(port);
        await tomcat.utils.delay(3000);
        await server.start();
        await client.start();
        await tomcat.utils.delay(3000);
        await client.stop();
        await tomcat.utils.delay(3000);







    });
    test('BABAK should publish messages to subscribers.', async () => {
        let called = null;
        let called_count = 0;
        bus.subscribe("topic", ctx => {
            (ctx);
            //console.log(ctx.message);
            called = ctx.message;
            called_count++;
            return Promise.resolve();
        });
        await bus.createMessage("topic")
            .publish();

        await bus.createMessage("topic2")
            .publish();

        expect(called_count).toBe(1);
        expect(called).not.toBeNull()
    });
    test('should correctly publish messages according to channels', async () => {

        let count1 = 0;
        let count2 = 0;
        let count3 = 0;
        let count4 = 0;
        bus.subscribe("babak@hp://request1", ctx => {
            count1++;
            (ctx)
            return Promise.resolve();
        });

        bus.subscribe("*@hp://request1", ctx => {
            (ctx)
            count2++;
            return Promise.resolve();
        });
        bus.subscribe("*://request1", () => {
            count3++;
            return Promise.resolve();
        });
        bus.subscribe('a://request1', ctx => {
            (ctx)
            count4++;
            return Promise.resolve();
        });

        await bus.createMessage('babak@hp://request1')
            .publish();
        expect(count1).toBe(1);
        expect(count2).toBe(1);
        expect(count3).toBe(1);
        expect(count4).toBe(0);

        await bus.createMessage('babak@hp://request1', {}, '*')
            .publish();
        expect(count1).toBe(2);
        expect(count2).toBe(2);
        expect(count3).toBe(2);
        //expect(count4).toBe(1);



        await bus.createMessage('babak@mobile://request1')
            .publish();
        expect(count1).toBe(2);
        expect(count2).toBe(2);
        expect(count3).toBe(3);
        //expect(count4).toBe(1);

    })
    test('should properly deliver replies.', async () => {
        bus.subscribe("request", ctx => {
            ctx.reply("reply");
            return Promise.resolve();
        });
        const response = await bus
            .createMessage("request", "ping")
            .execute()
        expect(response).not.toBeNull();

    });
    // test('transport', async () => {

    //     await bus.start();
    //     var message = bus.createMessage("topic", { name: "babak", lastName: 'mahmoudi' })
    //     message.message.headers["key"] = "value";

    //     await message
    //         .publish();
    //await bus.stop();


    // });

});
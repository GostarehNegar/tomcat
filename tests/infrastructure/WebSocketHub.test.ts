import tomcat from "../../src"
async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
jest.setTimeout(50000);

describe('WebSocketHub', () => {

    test('ping pong', async () => {
        const port = 8081;
        const hub = tomcat.hosts.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        const client1 = tomcat.hosts.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .build();

        await hub.listen(port);
        await client1.start();
        await wait(1000);
        await client1.bus.subscribe("topic", async () => { });
        await wait(100000);
        await client1.stop();
        await wait(10000);





    });
    test('publish works between processes', async () => {

        // lets spin up two servers on different ports
        // const builder = new HostBuilder();
        const port = 8081;
        const hub = tomcat.hosts.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        const client1 = tomcat.hosts.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .build();
        const client2 = tomcat.hosts.getHostBuilder('client2')
            .addMessageBus(cfg => {
                cfg.endpoint = `client`
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .build();
        // (client1);
        // (client2);
        (hub);
        await hub.listen(port);
        const messageName = 'some-message'
        let received: unknown | null = null;
        client1.bus.subscribe(messageName, (ctx) => {
            received = ctx.message.payload;
            return ctx.reply("result");
            return Promise.resolve();
        });
        await client1.start();
        await client2.start();
        await wait(500);

        await client2.bus.createMessage(messageName, "hi there")
            .publish();
        await wait(500);
        //tomcat.utils.getLogger().info(received);
        await wait(10000);
        await client1.stop();
        await client2.stop();
        await wait(10000);
        await hub.stop();
        expect(received).not.toBeNull();
    });

    test('remote execute works between processes', async () => {

        // lets spin up two servers on different ports
        // const builder = new HostBuilder();
        const port = 8081;
        const hub = tomcat.hosts.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        const client1 = tomcat.hosts.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .build();
        const client2 = tomcat.hosts.getHostBuilder('client2')
            .addMessageBus(cfg => {
                cfg.endpoint = `client`
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .build();
        // (client1);
        // (client2);
        (hub);
        await hub.listen(port);
        const messageName = 'some-message'
        let received: unknown | null = null;
        let call_count = 0;
        client1.bus.subscribe(messageName, (ctx) => {
            call_count++;
            if (call_count == 1) {
                received = ctx.message.payload;
                return ctx.reply("hi there");
            } else if (call_count == 2) {
                throw 'busy';
            }
            else {
                return ctx.reject("dont have time. come back later.");
            }
        });
        await client1.start();
        await client2.start();
        await wait(500);
        let response2 = null;
        let response3 = null;
        // The first request would work fine!
        const response1 = await client2.bus.createMessage(messageName, 'hi there')
            .execute();
        await client2.bus.createMessage(messageName, "hi there")
            .execute()
            .then()
            .catch(err => {
                response2 = err;
            });
        await client2.bus.createMessage(messageName, "hi there")
            .execute()
            .then()
            .catch(err => {
                response3 = err;
            });
        const response4 = await client2.bus.createMessage(messageName, "hi there")
            .execute(true)

        await wait(500);
        //tomcat.utils.getLogger().info(received);
        await wait(2000);
        await client1.stop();
        await client2.stop();
        await wait(2000);
        await hub.stop();
        expect(received).not.toBeNull();
        expect(response1).not.toBeNull();
        expect(response2).not.toBeNull();
        expect(response3).not.toBeNull();
        expect(response4).not.toBeNull();

    });


});
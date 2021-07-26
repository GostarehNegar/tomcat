// import { WebSocketHub } from '../src/lib/hosting/internals/WebSocketHub'
// import http, { Server } from 'http'
// import WebSocket from 'ws';
// import { HostBuilder, hosts } from '../src/lib/hosting';
//import config from '../src/lib/config';
import { hosts } from '../src/lib/hosting';

async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

describe('WebSocketHub', () => {

    // test('client connects', async () => {

    //     const port = 8080
    //     const hub = new WebSocketHub(null, { port: port });
    //     hub.start();
    //     let client: WebSocket = null;
    //     try {
    //         client = new WebSocket(`http://localhost:${port}/hub`);
    //     }
    //     catch { }
    //     expect(client).not.toBeNull();
    //     await setTimeout(async () => {
    //         client.close();
    //         hub.stop();
    //     }, 1000);
    // });

    // test('hub works with explicit server connects', async () => {
    //     const port = 8081
    //     const server: Server = http.createServer();
    //     const hub = new WebSocketHub(null, { server: server });
    //     server.listen(port);
    //     hub.start();
    //     let client: WebSocket = null;
    //     try {
    //         client = new WebSocket(`http://localhost:${port}/hub`);
    //     }
    //     catch { }
    //     expect(client).not.toBeNull();
    //     await wait(2000)
    //     client.close();
    //     await hub.stop();
    //     server.close();
    // });
    // test('host builder can add websocket', async () => {
    //     const port = 8085;
    //     const builder = new HostBuilder();
    //     const host = builder
    //         .addWebSocketHub('/myhub')
    //         .buildWebHost();
    //     await host.listen(port);
    //     let client: WebSocket = null;
    //     try {
    //         client = new WebSocket(`http://localhost:${port}/myhub`);
    //     }
    //     catch { }
    //     expect(client).not.toBeNull();
    //     await wait(200);
    //     client.close();
    //     await host.close();

    // });
    test('publish works between processes', async () => {

        // lets spin up two servers on different ports
        // const builder = new HostBuilder();
        const port = 8081;
        const hub = hosts.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        //config.messaging.transports.websocket.url = "http://localhost:8080/hub";
        const client1 = hosts.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .build();
        const client2 = hosts.getHostBuilder('client2')
            .addMessageBus(cfg => {
                cfg.channel = `sample-${Math.random()}}`
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .build();
        // (client1);
        // (client2);
        (hub);
        await hub.listen(port);
        const messageName = 'some-message'
        let received: unknown | null = null;
        client1.bus.subscribe("*://" + messageName, (ctx) => {

            received = ctx.message.payload;
            return Promise.resolve();
        });



        await client1.start();
        await client2.start();
        await wait(500);
        await client2.bus.createMessage(messageName, "hi there")
            .publish();
        await wait(500);
        console.log(received);
        await wait(500);
        await client1.stop();
        await client2.stop();
        await hub.stop();
        //await wait(100);
    });


});
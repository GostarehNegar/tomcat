import tomcat from "../../src";

jest.setTimeout(80000)
describe('Mesh', () => {
    test('heartbeat', async () => {
        const port = 8081;
        const hub = tomcat.hosts.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        const server = tomcat.hosts.getHostBuilder('server')
            .addMessageBus(cfg => {
                cfg.endpoint = 'server'
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshServer()

            .buildWebHost();

        const client1 = tomcat.hosts.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.endpoint = "clinet";
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshNode()
            .build();

        await hub.listen(port);
        await tomcat.utils.delay(1000);
        await server.start();
        await tomcat.utils.delay(1000);

        await client1.start()

        await tomcat.utils.delay(10000);




    });
});

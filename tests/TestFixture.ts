import tomcat from "../src";


export default class TestFixture {
    static async setup() {
        const port = await tomcat.utils.findPort(8000, 8800);
        const hub = tomcat.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        const server = tomcat.getHostBuilder('server')
            .addMessageBus(cfg => {
                cfg.endpoint = 'server'
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshServer()
            .buildWebHost();
        await hub.listen(port);
        await server.start();
        await tomcat.utils.delay(5000)
        return {
            hub: hub,
            server: server,
            url: `http://localhost:${port}/hub`,
            port: port,
            getBuilder: (name: string) => {
                return tomcat.getHostBuilder(name)
                    .addMessageBus(cfg => {
                        cfg.transports.websocket.url = `http://localhost:${port}/hub`;
                    })

            },
            stop: async () => {
                await server.stop();
                await hub.stop();
            }
        }


    }

}
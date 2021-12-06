import tomcat from "../../src";
import { ServiceDefinition } from "../../src/lib/infrastructure/mesh";

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
        const services: ServiceDefinition[] = [{ category: "data", parameters: { interval: "15m", exchange: "binance" } }]
        const client1 = tomcat.hosts.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.endpoint = "clinet";
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshNode((cfg) => {
                cfg.queryService = () => services

            })
            .build();
        const services2: ServiceDefinition[] = [{ category: "data", parameters: { interval: "15m", exchange: "coinex" } }]
        const client2 = tomcat.hosts.getHostBuilder('client2')
            .addMessageBus(cfg => {
                cfg.endpoint = "clinet2";
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshNode((cfg) => {
                cfg.queryService = () => services2
            })
            .build();

        await hub.listen(port);
        // await tomcat.utils.delay(1000);
        await server.start();
        // await tomcat.utils.delay(1000);
        await client1.start()
        await client2.start()
        await tomcat.utils.delay(15000);
        const meshServer = server.services.getService<tomcat.Infrastructure.Mesh.MeshServer>(tomcat.constants.Infrastructure.ServiceNames.MeshServer)
        const discoveryService = server.services.getServiceDiscovery();
        expect(meshServer.meshState.runningNodes.size).toBe(2)
        expect((await discoveryService.discover({ 'category': "data", parameters: { interval: "15m" } })).length).toBe(2)
        expect((await discoveryService.discover({ 'category': "data", parameters: {} })).length).toBe(2)
        expect((await discoveryService.discover({ 'category': "data", parameters: { exchange: "binance" } })).length).toBe(1)
        expect((await discoveryService.discover({ 'category': 'strategy', parameters: {} })).length).toBe(0)
    });
    test('queryService', async () => {
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
        const service: ServiceDefinition[] = [{ category: "data", parameters: { interval: "15m", exchange: "binance" } }]
        // type ServiceDescription = {
        //     pipeline: Pipeline
        // }
        // const ServiceDescriptions: ServiceDescription[] = []
        const client1 = tomcat.hosts.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.endpoint = "clinet";
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshNode(cfg => {
                cfg.queryService = () => service
                cfg.serviceCapability = async (query) => {
                    if (query.serviceDefinition.category == "data") {
                        return { acceptable: true, load: 0 }
                    } else {
                        return { acceptable: false, load: 1 }
                    }
                }
                cfg.executeservice = (async (p) => {
                    service.push(p.serviceDefinition)
                    // const pipeline = new Pipeline().from('binance', 'future', 'BTC/USDT', '12h')
                    // pipeline.start()
                    // ServiceDescriptions.push({ pipeline: pipeline })
                    return { started: Date.now() }
                })
            })
            .build();
        // client1.bus.subscribe("data",(ctx)=>{

        // })
        const service2: ServiceDefinition[] = []
        const client2 = tomcat.hosts.getHostBuilder('client2')
            .addMessageBus(cfg => {
                cfg.endpoint = "clinet2";
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshNode(cfg => {
                cfg.queryService = () => service2
                cfg.serviceCapability = async (query) => {
                    if (query.serviceDefinition.category == 'indicator') {
                        return { acceptable: true, load: 0 }
                    } else {
                        return { acceptable: false, load: 1 }
                    }
                }
                cfg.executeservice = async (order) => {
                    service2.push(order.serviceDefinition)
                    return { started: Date.now() }
                }
            })
            .build();

        await hub.listen(port);
        // await tomcat.utils.delay(1000);
        await server.start();
        // await tomcat.utils.delay(1000);
        await client1.start()
        await client2.start()
        await tomcat.utils.delay(5000);

        const discoveryServer = server.services.getServiceDiscovery()
        const availableNodes = await discoveryServer.queryServiceCapability({ category: 'data', parameters: {} })
        const res = await discoveryServer.executeService({ category: 'indicator', parameters: {} });
        (res)
        expect(availableNodes.length).toBe(1)
        // const isAvailable = discoveryService.discover({ category: "data", parameters: { interval: "15m", exchange: "coinex" } })
        console.log("done");



    });
});

import tomcat from "../../src";
import utils from "../../src/common/Domain.Utils";
import { Contracts } from "../../src/infrastructure";

import { IMeshService, matchService, ServiceDefinition, ServiceInformation } from "../../src/infrastructure/mesh";


class myService implements IMeshService {
    Id: string;
    getInformation(): ServiceInformation {
        return { category: "data", parameters: { interval: "15m", exchange: "coinex" }, status: 'start' }
    }
    async start() {
        return null
    }
}
jest.setTimeout(80000)
describe('Mesh', () => {
    test('heartbeat', async () => {
        const port = 8085;
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
        // const services: ServiceDefinition[] = [{ category: "data", parameters: { interval: "15m", exchange: "binance" } }]
        const client1 = tomcat.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.endpoint = "klient1";
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshService({ category: "data", parameters: { interval: "15m", exchange: "binance" } }, null)
            // .addMeshNode((cfg) => {
            //     cfg.queryService = () => services

            // })
            .build();
        // const services2: ServiceDefinition[] = [{ category: "data", parameters: { interval: "15m", exchange: "coinex" } }]
        const client2 = tomcat.getHostBuilder('klient2')
            .addMessageBus(cfg => {
                cfg.endpoint = "klinet2";
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshService({ category: "data", parameters: { interval: "15m", exchange: "coinex" } }, () => new myService())
            // .addMeshNode((cfg) => {
            //     cfg.queryService = () => services2
            // })
            .build();
        client2.node.startService({ category: "data", parameters: { interval: "15m", exchange: "coinex" } })

        await hub.listen(port);
        // await tomcat.utils.delay(5000);
        await server.start();
        // await tomcat.utils.delay(1000);
        await client1.start()
        await client2.start()
        await tomcat.utils.delay(15000);
        const meshServer = server.services.getService<tomcat.Infrastructure.Mesh.MeshServer>(tomcat.constants.Infrastructure.ServiceNames.MeshServer)
        const discoveryService = server.services.getServiceDiscovery();
        expect(meshServer.meshState.runningNodes.size).toBe(2)
        expect((await discoveryService.discover({ 'category': "data", parameters: { interval: "15m" } })).length).toBe(1)
        expect((await discoveryService.discover({ 'category': "data", parameters: {} })).length).toBe(1)
        expect((await discoveryService.discover({ 'category': "data", parameters: { exchange: "binance" } })).length).toBe(0)
        expect((await discoveryService.discover({ 'category': 'strategy', parameters: {} })).length).toBe(0)
        await client2.stop();
        await tomcat.utils.delay(1000);
    });
    test('queryService', async () => {
        const port = 8081;
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
        const service: ServiceDefinition[] = [{ category: "data", parameters: { interval: "15m", exchange: "binance" } }]
        // type ServiceDescription = {
        //     pipeline: Pipeline
        // }
        // const ServiceDescriptions: ServiceDescription[] = []
        const client1 = tomcat.getHostBuilder('client1')
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
        const client2 = tomcat.getHostBuilder('client2')
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
    test("match", () => {
        expect(matchService({ category: 'data', parameters: { "interval": '15m' } }, { category: 'data', parameters: {} })).toBe(true)
        expect(matchService({ category: 'data', parameters: { "interval": '15m' } }, { category: 'data', parameters: { "interval": "30m" } })).toBe(false)
        expect(matchService({ category: 'data', parameters: { "interval": '30m' } }, { category: 'data', parameters: { "interval": "30m", "exchange": "binance" } })).toBe(true)
        expect(matchService({ category: 'data', parameters: { "interval": '15m' } }, { category: 'indicator', parameters: {} })).toBe(false)
        expect(matchService({ category: 'data', parameters: { "interval": '15m' } }, { category: 'data', parameters: { interval: "*m" } })).toBe(true)
    })
    test('requirement', async () => {
        const port = 8085;
        tomcat.config.infrastructure.messaging.transports.websocket.url = `http://localhost:${port}/hub`
        const hub = tomcat.getHostBuilder('hub')
            .addWebSocketHub()
            .buildWebHost();
        const server = tomcat.getHostBuilder('server')
            .addMessageBus(cfg => {
                cfg.endpoint = 'server'
                // cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshServer()
            .buildWebHost();
        await hub.listen(port)
        await server.start()
        await tomcat.utils.delay(5000)
        const service: ServiceDefinition = { category: 'data', parameters: {} }
        const res = await server.services.getBus().createMessage(tomcat.Infrastructure.Contracts.requireService(service)).execute();
        (res)
        console.log("done");

    })

    test('redis mesh service', async () => {
        const port = 8085;
        tomcat.config.infrastructure.messaging.transports.websocket.url = `http://localhost:${port}/hub`
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
        const redisBuilder = tomcat.getHostBuilder('redis')
            .addMessageBus(cfg => {
                cfg.endpoint = 'redis'
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
        tomcat.Domain.Services.AddRedisService(redisBuilder);
        const redisServer = redisBuilder.build();



        const client = tomcat.getHostBuilder('client')
            .addMessageBus(cfg => {
                cfg.endpoint = 'client'
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshService({ category: 'strategy', parameters: {} }, (def) => {
                (def)
                return {
                    getInformation: () => {
                        var ret: ServiceInformation = {
                            category: 'strategy',
                            parameters: {
                                name: 'babak'
                            },
                            status: "start"
                        }
                        return ret;
                    },
                    Id: "hhh",
                    start: async (ctx) => {
                        //tomcat.Domain.Extenstions.getStore(ctx);
                        const store = await ctx.getHelper().getRedisStore('strategy-babak',);
                        const repo = store.getRepository<{ id: string, name: string }>('test');
                        await repo.insert({ id: 'babak@gnco.ir', name: 'babak' });
                    },
                }
            })
            .buildWebHost();

        await hub.listen(port);
        await utils.delay(3000);
        await server.start();
        const _info = await server.services.getRedisFactory().getRedisInfo('redis', 6379);
        (_info);

        await redisServer.start();
        var c = Contracts.requireService({ category: 'redis', parameters: {} })
        //await server.bus.subscribe('some-topic', async ctx => { await ctx.reply('pong') });
        // await server.bus.subscribe(c.topic, async ctx => {
        //     await ctx.reply('pong')
        // });
        await utils.delay(3000);
        await client.start();
        await utils.delay(5000);
        var result = await client.bus.createMessage(c).execute(undefined, 2 * 60 * 1000);
        await utils.delay(5000);

        (result);
        var info = await client.node.startService({ category: 'strategy', parameters: { name: 'babak' } })
        console.log("**************", info);


        await tomcat.utils.delay(3 * 1000);






    })
    test('node controller', async () => {

        const host = tomcat.getHostBuilder('test')
            .build();
        const target = new tomcat.Infrastructure.Mesh.MeshNodeController(host.services);
        const id = tomcat.Domain.Extenstions.getServiceDefintionExtentions({ category: 'miscelaneous', parameters: { name: 'babak' } })
            .name;
        (id);
        const description = await target.register(
            {
                dir: 'tomcat',
                repo: 'https://github.com/GostarehNegar/tomcat.git',
                definition: { category: 'miscelaneous', parameters: { name: 'babak' } },
                main: 'build/main/test-service.js',
            }
        )
        const desc = await target.findByName(description.name);
        await desc.spawn(tomcat.config);
        (desc);
        (description);
        const p = desc.process;
        (p);
        await tomcat.utils.delay(5000);








    });
});

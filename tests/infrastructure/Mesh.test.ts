
import tomcat from "../../src";
import utils from "../../src/common/Domain.Utils";
import { Contracts } from "../../src/infrastructure";
import { baseUtils } from "../../src/infrastructure/base";
import { IMeshService, IMeshServiceContext, matchService, ServiceDefinition, ServiceInformation } from "../../src/infrastructure/mesh";


class myService implements IMeshService {
    get info(): tomcat.Infrastructure.Mesh.ServiceInformation {
        throw new Error("Method not implemented.");
    }
    run(ctx?: tomcat.Infrastructure.Mesh.IMeshServiceContext): Promise<unknown> {
        (ctx);
        throw new Error("Method not implemented.");
    }
}
jest.setTimeout(80000)

const setup = async () => {
    const port = await baseUtils.findPort(8000, 8800);
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

describe('Mesh', () => {
    test('01-ready: services will start just once', async () => {
        const port = 8085;
        let no_services = 0;
        let calls = 0;
        const def: ServiceDefinition = {
            category: 'miscelaneous',
            parameters: { name: 'client1-service' }
        }
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
        const client1 = tomcat.getHostBuilder('client1')
            .addMessageBus(cfg => {
                cfg.endpoint = "client1";
                cfg.transports.websocket.url = `http://localhost:${port}/hub`;
            })
            .addMeshService(s => s.useRunMethod(def, {}, async ctx => {
                (ctx);
                no_services++;
                while (! await ctx.shouldStop()) {
                    calls++;
                }
            }))
            .build();
        await hub.listen(port);
        await server.start();
        await client1.start();
        await client1.node.startService(def);
        await client1.node.startService(def);
        expect(no_services).toBe(1);
        await baseUtils.delay(1000);
        calls++;
        (calls);
        await client1.stop()
        await server.stop()
        await hub.stop();
    })
    test('02-ready: started services will be discovered', async () => {
        const _setup = await setup();
        const client = _setup.getBuilder('test')
            .addMeshService(s => s.useRunMethod(
                { category: 'miscelaneous', parameters: { 'name': 'test' } },
                {},
                async (ctx) => {
                    while (! await ctx.shouldStop()) {

                    }

                }
            ))
            .build();
        await client.start();
        await client.node.startService({ category: 'miscelaneous', parameters: { 'name': 'test' } });
        await client.services.getUtility().delay(5000);
        const discovery = await _setup.server.services
            .getServiceDiscovery()
            .discover({ category: 'miscelaneous', parameters: { 'name': 'test' } });
        expect(discovery).not.toBeNull();
        expect(discovery.length).toBe(1);
        const discovered_def = baseUtils.extend(new ServiceDefinition(), discovery[0].definition);
        const service_def = baseUtils.extend(new ServiceDefinition(), { category: 'miscelaneous', parameters: { 'name': 'test' } });
        expect(discovered_def.getName()).toEqual(service_def.getName())
    })
    test('03-ready: meshservices can be stopped', async () => {
        const fixture = await setup();
        let stopped = false;
        baseUtils.disableLogs();
        const def: ServiceDefinition = { category: 'miscelaneous', parameters: { 'name': 'test' } }
        def.parameters
        const client = fixture.getBuilder('test')
            .addMeshService(s => s.useRunMethod(
                def,
                {},
                async (ctx) => {
                    while (!await ctx.shouldStop()) {
                        //await utils.delay(10);
                    }
                    ctx.service.info.status = 'stop'
                    stopped = true;
                }
            ))
            .build();
        await client.start();
        const request_def = baseUtils.extend(new ServiceDefinition(), def);
        let info = await client.node.startService(request_def);
        expect(info.isRunning()).toBe(true);
        expect(client.node.getServices().filter(x => x.isRunning()).length).toBe(1);

        info = await client.node.stopService(request_def);
        expect(stopped).toBe(true);
        expect(info.isRunning()).toBe(false);
        expect(client.node.getServices().filter(x => x.isRunning()).length).toBe(0);
        await client.stop();
        await fixture.stop();
        await utils.delay(2000);

    })
    test('04-ready it is possible to use a mesh service class.', async () => {

        const fixture = await setup();
        const def = new ServiceDefinition('miscelaneous', {})
        const client = fixture.getBuilder("test")
            .addMeshService(s => s.userServiceConstructor(def, {}, (def => ({
                info: new ServiceInformation(def),
                run: async (ctx?: IMeshServiceContext) => {
                    (ctx);
                    (def);

                }

            }))))
            .build();
        await client.start();
        const info = await client.node.startService(new ServiceDefinition('miscelaneous', { 'name': 'test' }));
        expect(def.match(info.definition)).toBe(true);

    })
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
            .addMeshService(s => s.useRunMethod({ category: 'miscelaneous', parameters: {} }, {}, async ctx => {
                (ctx);

            }))
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
            .addMeshService(s =>
                s.userServiceConstructor(
                    { category: "data", parameters: { interval: "15m", exchange: "coinex" } }, {},
                    () => new myService()))
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
            // .addMeshService_deprecated({ category: 'strategy', parameters: {} }, (def) => {
            //     (def)
            //     return {
            //         getInformation: () => {
            //             const ret: ServiceInformation = {
            //                 category: 'strategy',
            //                 parameters: {
            //                     name: 'babak'
            //                 },
            //                 status: "start"
            //             }
            //             return ret;
            //         },
            //         Id: "hhh",
            //         start: async (ctx) => {
            //             //tomcat.Domain.Extenstions.getStore(ctx);
            //             const store = await ctx.getHelper().getRedisStore('strategy-babak',);
            //             const repo = store.getRepository<{ id: string, name: string }>('test');
            //             await repo.insert({ id: 'babak@gnco.ir', name: 'babak' });
            //         },
            //     }
            // })
            .buildWebHost();

        await hub.listen(port);
        await utils.delay(3000);
        await server.start();
        const _info = await server.services.getRedisFactory().getRedisInfo('redis', 6379);
        (_info);

        await redisServer.start();
        const c = Contracts.requireService({ category: 'redis', parameters: {} })
        //await server.bus.subscribe('some-topic', async ctx => { await ctx.reply('pong') });
        // await server.bus.subscribe(c.topic, async ctx => {
        //     await ctx.reply('pong')
        // });
        await utils.delay(3000);
        await client.start();
        await utils.delay(5000);
        const result = await client.bus.createMessage(c).execute(undefined, 2 * 60 * 1000);
        await utils.delay(5000);

        (result);
        const info = await client.node.startService({ category: 'strategy', parameters: { name: 'babak' } })
        console.log("**************", info);
        await tomcat.utils.delay(3 * 1000);
    })

    test('node controller', async () => {
        const fixture = await setup();

        tomcat.config.setServer("localhost", fixture.port);
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

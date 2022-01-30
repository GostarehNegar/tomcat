import { Contracts } from "./infrastructure";
import { ServiceCategories, ServiceDefinition } from "./infrastructure/mesh";

import tomcat from ".";
tomcat.Infrastructure.Base.Logger.level = 'debug'
tomcat.Infrastructure.Base.Logger.getLogger("WebSocketHub").level = 'info'
// const port = 8084;
// const ip = tomcat.utils.ipAddress();
//const url = `http://${ip}:${port}/hub`;
tomcat.config.setServer("localhost", 8084)
//tomcat.config.infrastructure.messaging.transports.websocket.url = url;
// const hub = tomcat.getHostBuilder('hub')
//     .addWebSocketHub()
//     .buildWebHost('express')


const server = tomcat.getHostBuilder('api-server')
    .addMessageBus(cfg => {
        (cfg);
        // cfg.endpoint = 'server'
        // cfg.transports.websocket.url = url;
    })
    .addMeshServer()
    .buildWebHost("express");

const app = server.expressApp
app.get("/ping", (req, res) => {
    (req);
    res.send(Date.now().toString())
    res.end()
})

app.get("/services", (req, res) => {
    (req)
    const meshServer = server.services.getService<tomcat.Infrastructure.Mesh.MeshServer>(tomcat.constants.Infrastructure.ServiceNames.MeshServer)

    if (meshServer.meshState.runningNodes.size > 0) {
        const nodes = [];
        meshServer.meshState.runningNodes.forEach(function (val, key) {
            nodes.push({ server: key, status: val });
        });
        res.json(nodes)
    } else {
        res.send("no running nodes")
        res.end
    }
})
app.get("/proxy", async (req, res) => {
    (req)
    const meshServer = server.services.getService<tomcat.Infrastructure.Mesh.MeshServer>(tomcat.constants.Infrastructure.ServiceNames.MeshServer)
    const result = await meshServer.executeService({ category: "proxy" as tomcat.Infrastructure.Mesh.ServiceCategories, parameters: {} })
    res.send(result)
    res.end()
})

app.get("/proxyex", async (req, res) => {
    (req)
    const bus = server.services.getBus()
    const result = await bus.createMessage(Contracts.serviceOrder({ category: "proxy" as tomcat.Infrastructure.Mesh.ServiceCategories, parameters: {} })).execute()
    res.send(result)
    res.end()
})
app.get("/arshia", async (req, res) => {
    const bus = server.services.getBus()
    bus.createMessage(Contracts.serviceOrder({ category: 'strategy', parameters: req.query })).execute(undefined, 5 * 60 * 1000, true)
    res.send("done!")
    res.end()
})
app.get("/data", async (req, res) => {
    const bus = server.services.getBus()
    try {
        await bus.createMessage(Contracts.serviceOrder({ category: 'data', parameters: req.query })).execute()

    } catch (err) {
        console.error(err);
    }
    res.send("done!")
    res.end()
})
app.get("/redis", async (req, res) => {
    const bus = server.services.getBus()
    try {
        await bus.createMessage(Contracts.serviceOrder({ category: 'redis', parameters: req.query })).execute()

    } catch (err) {
        console.error(err);
    }
    res.send("done!")
    res.end()
})
app.get(`/start/:serviceName`, async (req, res) => {
    const bus = server.services.getBus()
    let result: tomcat.Infrastructure.Bus.IMessage;
    try {
        const def: ServiceDefinition = { category: req.params.serviceName as ServiceCategories, parameters: req.query };
        result = await bus.createMessage(Contracts.requireService(def)).execute(undefined, 5 * 60 * 1000, true)
    } catch (err) {
        console.error(err);
    }
    res.send(result)
    res.end()
})
app.get('/services/register', async (req, res) => {
    let result = null;
    try {
        let service_registry: tomcat.Infrastructure.Contracts.ServiceRegistrationPayload = JSON.parse(req.query.data as string);
        result = await server.bus.createMessage(tomcat.Infrastructure.Contracts.registerService(service_registry)).execute();
        (service_registry);
        res.send(result);
    }
    catch (err) {
        res.send(err);
    }



});




server.listen(80)
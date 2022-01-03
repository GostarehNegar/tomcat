import { Contracts } from "./infrastructure";
import { ServiceCategories } from "./infrastructure/mesh";

import tomcat from ".";
tomcat.Infrastructure.Base.Logger.level = 'debug'
tomcat.Infrastructure.Base.Logger.getLogger("WebSocketHub").level = 'info'
const port = 8084;
tomcat.config.infrastructure.messaging.transports.websocket.url = `http://172.16.2.10:${port}/hub`
const hub = tomcat.getHostBuilder('hub')
    .addWebSocketHub()
    .buildWebHost('express')


const server = tomcat.getHostBuilder('server')
    .addMessageBus(cfg => {
        cfg.endpoint = 'server'
        cfg.transports.websocket.url = `http://172.16.2.10:${port}/hub`;
    })
    .addMeshServer()
    .buildWebHost("express");

// hub.get()
const app = hub.expressApp
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
    try {
        await bus.createMessage(Contracts.serviceOrder({ category: req.params.serviceName as ServiceCategories, parameters: req.query })).execute()

    } catch (err) {
        console.error(err);
    }
    res.send("done!")
    res.end()
})

hub.listen(port)
server.start()
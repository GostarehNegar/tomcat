import { Contracts } from "./lib/infrastructure";

import tomcat from ".";

const port = 8082;
const hub = tomcat.hosts.getHostBuilder('hub')
    .addWebSocketHub()
    .buildWebHost('express')


const server = tomcat.hosts.getHostBuilder('server')
    .addMessageBus(cfg => {
        cfg.endpoint = 'server'
        cfg.transports.websocket.url = `http://localhost:${port}/hub`;
    })
    .addMeshServer()
    .buildWebHost();

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

hub.listen(port)
server.start()
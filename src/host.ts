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
hub.listen(port)
server.start()
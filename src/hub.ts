
import tomcat from ".";
tomcat.Infrastructure.Base.Logger.level = 'debug'
tomcat.Infrastructure.Base.Logger.getLogger("WebSocketHub").level = 'info'
const port = 8084;
const ip = tomcat.utils.ipAddress();
//const url = `http://${ip}:${port}/hub`;
tomcat.config.setServer(ip, port);
//tomcat.config.infrastructure.messaging.transports.websocket.url = url;
const hub = tomcat.getHostBuilder('hub')
    .addWebSocketHub()
    .buildWebHost('express')
const server = tomcat.getHostBuilder('mesh-server')
    .addMessageBus(cfg => {
        (cfg);
        // cfg.endpoint = 'server'
        // cfg.transports.websocket.url = url;
    })
    .addMeshServer()
    .build();

hub.listen(port)
server.start();

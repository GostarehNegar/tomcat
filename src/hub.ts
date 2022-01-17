
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
hub.listen(port)

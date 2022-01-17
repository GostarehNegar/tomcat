import tomcat from './index'
tomcat.config.setServer("172.16.2.10", 8084)
const builder = tomcat
    .getHostBuilder('redis-server')
    .addMessageBus();
const host = tomcat.Domain.Services.AddRedisService(builder).build();
host.start();









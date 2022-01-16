import tomcat from './index'


const builder = tomcat
    .getHostBuilder('redis-server')
    .addMessageBus();
const host = tomcat.Domain.Services.AddRedisService(builder).build();
host.start();









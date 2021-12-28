import tomcat from ".";

const host = tomcat.getHostBuilder("NodeManager").build()
const node = host.services.getNodeManagerService()
node.startNode({ name: "paria", jsFileName: "../tomcat-bot-hosting/build/main/services/dataService.js" })
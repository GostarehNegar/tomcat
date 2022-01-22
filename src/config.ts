import baseconfig from "./infrastructure/base/baseconfig";



export const config = {
  infrastructure: baseconfig,
  proxy: {
    url: ''
  },
  setServer: function (ip: string, port: number) {
    config.infrastructure.messaging.transports.websocket.url = `http://${ip}:${port}/hub`;
  }
};

export default config;
export function setServer(ip: string, port: number) {
  config.infrastructure.messaging.transports.websocket.url = `http://${ip}:${port}`;
}
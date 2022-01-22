import baseconfig from "./infrastructure/base/baseconfig";
import fs from 'fs'



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
export function getConfig() {
  return config;
}
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function setConfig(cfg: any) {
  mergeDeep(config, cfg);
}
export function readConfig(file?: string) {
  try {
    const config_file_name = file || process.argv[process.argv.length - 1];
    if (fs.existsSync(config_file_name)) {
      const conf = JSON.parse(fs.readFileSync(config_file_name).toString());
      setConfig(conf);
    }
  }
  catch { }

}

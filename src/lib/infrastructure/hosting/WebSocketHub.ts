import { Server } from 'http';


import WebSocket from 'ws';
import utils from '../../common/Domain.Utils';

import constants from '../../constants';
import { IServiceProvider, baseUtils } from '../base';
import { IEndpointInfo } from '../bus/IEndpointInfo';
import Topics from '../bus/Topics';


import { hosts } from './HostCollection';
import { IHostedService } from './IHostedService';

interface ConnectionInfo {
  last_seen?: number;
  is_closed?: boolean;
  id: string;
  info?: IEndpointInfo;
  endpoint: string | undefined;
}
const _CLIENT_INFO = 'clientinfo';
const messages = Topics.Internal;
const getConectionInfo = (client: unknown): ConnectionInfo => {
  client[_CLIENT_INFO] = client[_CLIENT_INFO] || {};
  const res = client[_CLIENT_INFO] as ConnectionInfo;
  res.id = res.id || Date.now().toString();
  res.info = res.info || { endpoint: res.endpoint, topics: [] };
  return res;
};
const addTopic = (client: unknown, topic: string) => {
  var info = getConectionInfo(client);
  const topics = info.info.topics;
  if (topics.findIndex(x => x == topic) < 0) {
    topics.push(topic)
  }
  return info.info.topics;
}
export interface WebSocktHubOptions {
  port?: number;
  server?: Server;
  path?: string;
}
export class WebSocketHub implements IHostedService {
  private _ws: WebSocket.Server | null = null;
  //public clients: WebSocket[] = [];
  private log = baseUtils.getLogger('WebSocketHub');
  private intervalHandle = null;
  public options: WebSocktHubOptions = null;
  constructor(
    private _services?: IServiceProvider,
    options?: WebSocktHubOptions
  ) {
    this._ws;
    this.options = options;
    this.options = this.options || {};
    this._services = _services || hosts.current.services;
    this.options.server = this.options.port
      ? undefined
      : this.options.server ||
      this._services.getService(constants.ServiceNames.HttpServer);
    this.options.port = this.options.server ? undefined : this.options.port;
  }
  public stop(): Promise<void> {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
    const result = new Promise<void>((resolve, reject) => {
      this._ws.close((err) => {
        err ? reject(err) : resolve();
      });
    });
    return result;

  }
  private _doSend(to: WebSocket, message: unknown): Promise<unknown> {
    if (typeof message === 'object') message = JSON.stringify(message);
    return new Promise<unknown>((resolve, reject) => {
      to.send(message, (err) => {
        err ? reject(err) : resolve(to);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public publish(from: WebSocket, message: any) {
    const promises: Promise<unknown>[] = [];
    this._ws.clients.forEach((x) => {
      const sender = getConectionInfo(from);
      const receiver = getConectionInfo(x).info;
      let should_send = sender && receiver && sender.endpoint != receiver.endpoint;
      receiver.topics = receiver.topics || [];
      const topic = message?.payload?.topic || '<notopic>'
      const to = message?.payload?.to;
      if (!to) {
        should_send = should_send &&
          (
            Topics.isSystemTopic(topic) ||
            receiver.topics.findIndex(x => utils.wildCardMatch(x, topic)) > -1
          )
      }
      else {
        should_send = should_send &&
          (
            to === receiver.endpoint
          )
      }
      if (should_send) {
        this.log.log(
          'sender:',
          sender,
          'receiver:',
          receiver,
          'from:',
          message.payload.from
        );
        promises.push(this._doSend(x, JSON.stringify(message))
          .then()
          .catch(err => {
            (err)

          }));
      }
    });


    return Promise.all(promises);
  }
  public start(): Promise<void> {
    this._ws = new WebSocket.Server({
      port: this.options.port,
      path: this.options.path || '/hub',
      server: this.options.server,
    });
    this._ws.on('close', socket => {
      (socket)

    })
    this._ws.on('connection', (ws) => {

      ws.on('close', (c, r) => {
        (c);
        (r);
        const info = getConectionInfo(ws);
        this.log.info(
          `WebSocket Connection Lost: ${info.endpoint}`);
      })
      ws.on('message', (message) => {
        if (!message) return;
        const info = getConectionInfo(ws);
        info.last_seen = Date.now();
        const _message = JSON.parse(message.toString()) as {
          method: string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload: any;
        };
        this.log.info(
          `WebSocket Received New Message:`, _message);
        switch (_message.method) {
          case messages.publish:
            this.publish(ws, _message);
            break;
          case messages.connect:
            const info = _message.payload as IEndpointInfo;
            getConectionInfo(ws).info = info;
            getConectionInfo(ws).endpoint = info.endpoint;
            this.log.info(
              `New WebSocket Connection: '${info.endpoint}''`);
            break;
          case messages.subscribe:
            var connection = getConectionInfo(ws);
            addTopic(ws, _message.payload.topic);
            break;
          case messages.pong:
            var connection = getConectionInfo(ws);
            connection.last_seen = Date.now();
            connection.info = _message.payload;
            break;
          default:
            break;
        }
      });
      setInterval(() => {
        this._ws.clients.forEach(x => {
          if (x.readyState === x.OPEN) {
            x.send(JSON.stringify({ method: messages.ping }), err => {
              if (err) {
                console.log(err);
              }

            });

          }
        });
      }, 5000);

    });

    return Promise.resolve();
  }
}

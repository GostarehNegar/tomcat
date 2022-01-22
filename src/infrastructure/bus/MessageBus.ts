
import { Utils } from '../../common';
import { CancellationToken, ILogger, IServiceProvider, Logger } from '../base';
import config from '../base/baseconfig';
import { BackgroundService } from '../hosting';

import { IEndpointInfo } from './IEndpointInfo';
import { IHandler } from './IHandler';
import { IMessageBus } from './IMessageBus';
import { IMessageBusSubscription } from './IMessageBusSubscription';
import { IMessageContext } from './IMessageContext';
import { IMessageContract } from './IMessageContract';
import { IMessageTransport } from './IMessageTransport';
import { Message } from './Message';
import { MessageBusSubscription } from './MessageBusSubscription';
import { MessageBusSubscriptions } from './MessageBusSubscriptions';
import { MessageContext } from './MessageContext';
//import { SignalRTransport } from './SignalRTransport';
import SystemTopics from './Topics';
import { WebSocketTransport } from './WebSocketTranstport';


import { IMessage } from '.';


type promise_def = {
  resolve: (e: unknown) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (err: any) => void;
  always_resolve?: boolean;
  cb?: (context: IMessageContext) => boolean
};

export class MessageBus extends BackgroundService implements IMessageBus {
  public nodeName = 'MessageBus';
  protected run(token: CancellationToken): Promise<void> {
    token;
    return Promise.resolve();
  }
  private _subscriptions: MessageBusSubscriptions =
    new MessageBusSubscriptions();
  private promises: { [id: string]: promise_def } = {};

  private _endpoint: string = Math.random().toString();
  private _transports: IMessageTransport[] = [];
  private _config = config.messaging;
  private _logger: ILogger;
  private _alreadyProcessed = [];
  constructor(
    public serviceProvider: IServiceProvider,
    cf?: (c: typeof config.messaging) => void,
    cfg?: typeof config.messaging
  ) {
    super();

    this._config = cfg || config.messaging;
    console.log("lll=", JSON.stringify(this._config));
    if (cf) cf(this._config);
    this._logger = Logger.getLogger('tomcat.MessageBus');
    this._subscriptions;
    this._endpoint = this._config.endpoint || Math.random().toString();
    this._endpoint = `${this._config.endpoint} (${Utils.instance.UUID()})`
    this.getTransports(true);
  }
  private getTransports(refresh = false): IMessageTransport[] {
    if (refresh) {
      this._transports = [];
      const config = this._config.transports.websocket;

      if (config.diabled !== true && Utils.instance.isValidUrl(config.url)) {
        this._transports.push(
          new WebSocketTransport(null, this._config.transports.websocket)
        );
      }
    }
    return this._transports;
  }
  private getInfo(): IEndpointInfo {
    return {
      endpoint: this.endpoint,
      topics: this._subscriptions.getTopics()
    };
  }
  private handleMessageFromTransport(transport: IMessageTransport, msg: string) {
    (transport);
    const _msg = JSON.parse(msg.toString()) as {
      method: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: any;
    };
    if (_msg && _msg.method === SystemTopics.Internal.ping) {
      transport.pong(this.getInfo());
    } else {

      const ctx = new MessageContext(Message.FromMessage(_msg.payload), this);
      if (ctx?.message?.from === this.endpoint) {
        // This was originaly sent by us
        // we do not need to republish it.
        this._logger.warn(
          'A message received from a transport was originally sent by this endpoint.' +
          `Normally the transport should prevent messages bounces back to the originator. ` +
          `We wil ignore this message, but something is worng with this transport.`);

      } else {
        ctx.scope = 'local';
        ctx.transport(transport?.name);
        this._logger.trace(
          `Message received from transport ${transport.name}. Topic:'${ctx.message.topic}'. From:'${ctx.message.from}' `);
        this.publishMessageContext(ctx);
      }
    }

  }
  publish(m: Message): Promise<void> {
    return this.publishMessageContext(new MessageContext(m, this))
  }
  get endpoint(): string {
    return this._endpoint;
  }
  async start(): Promise<void> {
    const transports = this.getTransports();
    let success_names = '';
    for (let i = 0; i < transports.length; i++) {
      try {
        await transports[i].open(this.handleMessageFromTransport.bind(this), this.getInfo())
        success_names += ' ' + transports[i].name;
      }
      catch (err) {
        this._logger.error(
          `An error occured while trying to start this transport. Name:${transports[i].name}. ` +
          `Error: '${err}'`)
      }
    }
    Logger.registerListner((level, message, args) => {
      (args)
      if (level == "criticalInfo") {
        this.createMessage("loggs/critical", message).publish()
      }
    })
    this._logger.info(
      `MessageBus successfullys started at Endpoint:'${this.endpoint}'. Transports:'${success_names}' `);
  }
  async stop(): Promise<void> {
    await this.createMessage(SystemTopics.busdown, { endpoint: this.endpoint })
      .publish();
    const transports = this.getTransports();
    for (let i = 0; i < transports.length; i++) {
      await transports[i].close();
    }
  }

  subscribe(
    topic: string,
    handler: IHandler,
  ): Promise<IMessageBusSubscription> {
    const result = new MessageBusSubscription(topic, this.endpoint, handler);
    return this._subscribe(result);
  }

  public createReplyPromise(message: IMessageContext, always_resolve = false, cb?): Promise<IMessage> {
    const result = new Promise<IMessage>((res, err) => {
      this.promises[message.message.id] = { resolve: res, reject: err, always_resolve: always_resolve, cb: cb };
      setTimeout(() => {
        if (this.promises[message.message.id]) {
          delete this.promises[message.message.id]
        }
      }, 1 * 60 * 1000)
    });
    return result;
  }
  createMessage(
    topic: string | IMessageContract,
    body?: unknown | null,
    to?: string | null,
  ): IMessageContext {

    let _topic: string = null;
    if (typeof topic === 'string') {
      _topic = topic;
    }
    else {
      _topic = topic?.topic;
      body = body || topic?.payload;
    }


    //const _topic = typeof topic === 'string' ? topic : topic?.topic;
    //const _topic = this._parseTopic(topic);
    //topic = _topic?.topic;
    //to = to || _topic?.to;
    body = body || {};
    return new MessageContext(
      new Message(_topic, this.endpoint, to, body),
      this
    );
  }
  private async _subscribe(
    subscription: MessageBusSubscription
  ): Promise<IMessageBusSubscription> {
    this._subscriptions.add(subscription);
    for (let i = 0; i < this._transports.length; i++) {
      await this._transports[i].subscribe(subscription.topicPattern);
    }
    return subscription;
  }
  public publishToTransports(ctx: IMessageContext): Promise<void> {
    if (ctx.isLocal() || this._transports.length < 1) {
      return Promise.resolve();
    }
    return this._transports[0].pubish(ctx);
  }
  public publishMessageContext(context: IMessageContext): Promise<void> {
    if (!context || !context?.message) {
      return Promise.reject("Missing Message.")
    }
    const id = context?.message?.id;
    if (!id) {
      return Promise.reject("Missing Message Id.")
    }
    /// Check if we have already seen
    // this message;
    if (this._alreadyProcessed[id]) {
      return Promise.resolve();
    }
    this._alreadyProcessed.push(id);
    this._alreadyProcessed[id] = true;
    if (this._alreadyProcessed.length > 1000) {
      delete this._alreadyProcessed[this._alreadyProcessed.shift()]
    }
    if (
      context &&
      context.message &&
      (context.message.topic === SystemTopics.reply || context.message.topic === SystemTopics.reject) &&
      context.message.to === this.endpoint
    ) {
      const promise = this.promises[context.message.reply_to];
      if (promise) {
        if (context.message.topic === SystemTopics.reject && !promise.always_resolve) {
          delete this.promises[context.message.reply_to];
          promise.reject(context.message);
        }
        else {
          if (!promise.cb || promise.cb(context)) {
            delete this.promises[context.message.reply_to];
            promise.resolve(context.message);
          }
        }
      }
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      this._subscriptions
        .publish(context)
        .then(() => {
          //console.warn(context.message)
          this.publishToTransports(context)
            .then(resolve)
            .catch((err) => reject(err));
        })
        .catch((err) => {
          this.publishToTransports(context)
            .then(resolve)
            .catch((err) => reject(err));
          reject(err);
        });
    });
  }
}

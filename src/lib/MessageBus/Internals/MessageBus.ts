import { Message } from './Message';
import { MessageBusSubscription } from './MessageBusSubscription';
import { MessageBusSubscriptions } from './MessageBusSubscriptions';
import { MessageContext } from './MessageContext';
import { SignalRTransport } from '../SignalRTransport';
import { MessageTopic } from './Topics';
import {

  IHandler,
  IMessageBus,
  IMessageBusSubscription,
  IMessageContext,
  IMessageTransport,
} from '../interfaces';

import { WebSocketTransport } from '../WebSocketTranstport';
import config from '../../config';
import { CanellationToken, IServerTask } from '../../server/ServerBuilder';

type promise_def = {
  resolve: (e: unknown) => void;
  error: (err: any) => void;
};

export class MessageBus extends IServerTask implements IMessageBus {
  public name: string = "MessageBus";
  protected run(token: CanellationToken): Promise<void> {
    (token);
    return Promise.resolve();
  }
  private _subscriptions: MessageBusSubscriptions =
    new MessageBusSubscriptions();
  private promises: { [id: string]: promise_def } = {};

  private _channelName: string = Math.random().toString();
  private _transports: IMessageTransport[] = [];
  private _config = config.messaging;
  constructor() {
    super();
    this._subscriptions;
    (SignalRTransport);
    this._channelName = this._config.channel;// "test_channel@" + Math.random().toString();
    this._transports.push(new WebSocketTransport());
    this._transports[0].on(msg => {
      const _msg = JSON.parse(msg.toString()) as { method: string, payload: any };
      var ctx = new MessageContext(_msg.payload, this);
      ctx.setScope('local');
      this.publish(ctx);
    });

  }
  get channelName(): string {
    return this._channelName;
  }
  async start(): Promise<void> {
    await this._transports[0].open({ channel: this.channelName });
  }
  async stop(): Promise<void> {
    this._transports[0].close();
    //return this._transport.stop();
  }

  subscribe(topic: string, handler: IHandler): Promise<IMessageBusSubscription> {
    const result = new MessageBusSubscription(topic, this.channelName, handler);
    return this._subscribe(result);
  }
  // public subscribeEx(
  //   fn: (subs: IMessageBusSubscription) => void
  // ): Promise<IMessageBusSubscription> {
  //   const result = new MessageBusSubscription('');
  //   fn(result);
  //   return this._subscribe(result);
  // }

  public createReplyPromise(message: IMessageContext): Promise<unknown> {
    const result = new Promise<unknown>((res, err) => {
      this.promises[message.message.id] = { resolve: res, error: err };
    });
    return result;
  }
  createMessageEx(config: {
    /**
     * sagduygusya
     */
    topic: string,
    to?: string | null,
    body?: unknown
  }): IMessageContext {
    (config)
    let { topic, to, body } = config;
    const _topic = MessageTopic.parse(topic);
    to = to || _topic.channel || this.channelName;
    topic = _topic.topic
    //topic = _topic.topic;
    body = body || {};

    return new MessageContext(new Message(topic, to, this.channelName, body), this);


  }

  createMessage(topic: string, to?: string | null, body?: unknown | null): IMessageContext {
    const _topic = MessageTopic.parse(topic);
    to = to || _topic.channel || this.channelName;
    topic = _topic.topic
    //topic = _topic.topic;
    body = body || {};

    return new MessageContext(new Message(topic, to, this.channelName, body), this);
  }
  private _subscribe(
    subscription: MessageBusSubscription
  ): Promise<IMessageBusSubscription> {
    return new Promise<IMessageBusSubscription>((resolve, reject) => {

      this._subscriptions.add(subscription);
      resolve(subscription);
      reject;
    });
  }
  public publishToTransports(ctx: IMessageContext): Promise<void> {
    if (ctx.isLocal()) {
      return Promise.resolve();
    }
    return this._transports[0].pubish(ctx);
  }
  public publish(context: IMessageContext): Promise<void> {
    if (context && context.message &&
      context.message.topic === MessageTopic.reply && context.message.to === this.channelName) {
      const promise = this.promises[context.message.reply_to];
      if (promise) {
        promise.resolve(context.message);
        delete this.promises[context.message.reply_to];
      }
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      this._subscriptions
        .publish(context)
        .then(() => {
          this.publishToTransports(context)
            .then(resolve)
            .catch(err => reject(err));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

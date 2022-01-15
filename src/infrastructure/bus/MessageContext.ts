import { IMessageBus } from './IMessageBus';
import { IMessageContext } from './IMessageContext';
import { Message } from './Message';
import { MessageBus } from './MessageBus';
import SystemTopics from './Topics';

import { IMessage, IMessageContextHeader } from '.';
import { IServiceProvider } from '../base';


export class MessageContext implements IMessageContext {
  private _bus: MessageBus = null;
  public headers: IMessageContextHeader = {};
  constructor(public message: Message, bus: IMessageBus) {
    this._bus = bus as MessageBus;
    this._bus;
  }
  setScope(scope: 'local' | 'remote' | 'both'): void {
    this.headers['scope'] = scope;
  }
  get serviceProvider(): IServiceProvider {
    return this._bus.serviceProvider;
  }
  get scope(): 'local' | 'remote' | 'both' | '' {
    return (this.headers['scope'] || '') as 'local' | 'remote' | 'both' | '';
  }
  set scope(value: 'local' | 'remote' | 'both' | '') {
    this.headers['scope'] = value;
  }
  transport(name?: string): string {
    if (name) {
      this.headers.transport = name;
    }
    return this.headers.transport;
  }

  isLocal(): boolean {
    return (
      this.message == null ||
      this.message.to == this._bus.endpoint ||
      this.scope == 'local'
    );
  }
  execute(cb?: (context: IMessageContext) => boolean, timeout = 10000, always_resolve = false): Promise<IMessage> {
    this.message.headers.is_request = true;
    const timeoutPromise = new Promise<IMessage>((resolve, reject) => {
      setTimeout(() => {
        (always_resolve ? resolve(null) : reject("time out!!!!"))
      }, timeout)
    })
    const result = this._bus.createReplyPromise(this, always_resolve, cb) as Promise<IMessage>;
    this.publish();
    return Promise.race([timeoutPromise, result])
  }
  publish(): Promise<void> {
    return this._bus.publishMessageContext(this);
  }
  reply(body: unknown): Promise<void> {
    const message = this._bus.createMessage(
      SystemTopics.reply,
      body,
      this.message.from
    );
    message.message.reply_to = this.message.id;
    return message.publish();
  }
  reject(body: unknown): Promise<void> {
    const message = this._bus.createMessage(
      SystemTopics.reject,
      body,
      this.message.from
    );
    message.message.reply_to = this.message.id;
    return message.publish();
  }

}

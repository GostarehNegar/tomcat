import { IMessageBus } from './IMessageBus';
import { IMessageContext } from './IMessageContext';
import { Message } from './Message';
import { MessageBus } from './MessageBus';
import { MessageTopic } from './Topics';

export class MessageContext implements IMessageContext {
  private _bus: MessageBus = null;
  public headers: { [id: string]: string } = {};
  constructor(public message: Message, bus: IMessageBus) {
    this._bus = bus as MessageBus;
    this._bus;
  }
  setScope(scope: 'local' | 'remote' | 'both'): void {
    this.headers['scope'] = scope;
  }
  get scope(): string {
    return this.headers['scope'] || '';
  }

  isLocal(): boolean {
    return (
      this.message == null ||
      this.message.to == this._bus.endpoint ||
      this.scope == 'local'
    );
  }
  execute<T>(): Promise<T> {
    const result = this._bus.createReplyPromise(this) as Promise<T>;
    this.publish();
    return result;
  }
  publish(): Promise<unknown> {
    return this._bus.publish(this);
  }
  reply(body: unknown): Promise<unknown> {
    const message = this._bus.createMessage(
      MessageTopic.reply,
      body,
      this.message.from
    );
    message.message.reply_to = this.message.id;
    return message.publish();
  }
}
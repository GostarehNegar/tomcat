import { Message } from './Message';
import { MessageBus } from './MessageBus';
import { MessageTopic } from './Topics';
import { IMessageBus, IMessageContext } from '../interfaces';

export class MessageContext implements IMessageContext {
  private _bus: MessageBus = null;
  public headers: { [id: string]: string } = {}
  constructor(public message: Message, bus: IMessageBus) {
    this._bus = bus as MessageBus;
    this._bus;
  }
  isLocal(): boolean {
    return this.message == null || this.message.to == this._bus.channelName;
  }
  execute<T>(): Promise<T> {
    const result = this._bus.createReplyPromise(this) as Promise<T>;
    this.publish();
    return result;
  }
  publish(): Promise<void> {
    return this._bus.publish(this);
  }
  reply(body: unknown): Promise<void> {
    const message = this._bus.createMessage(MessageTopic.reply, this.message.from, body);
    message.message.reply_to = this.message.id;
    return message.publish();
  }
}

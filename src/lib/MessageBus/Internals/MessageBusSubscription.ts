import {
  IHandler,
  IMessageBusSubscription,
  IMessageContext,
} from '../interfaces';
import { MessageTopic } from './Topics';

export class MessageBusSubscription implements IMessageBusSubscription {
  public handler: IHandler = null;
  private _topic: MessageTopic;

  constructor(public topicPattern: string, public channel: string, handler?: IHandler) {
    this.handler = handler;
    this._topic = MessageTopic.parse(topicPattern);
    this._topic.channel = this._topic.channel || channel;
  }
  public matches(message: IMessageContext): boolean {
    return message
      &&
      (
        message.message.to === "*"
        || typeof message.message.to === 'undefined'
        || message.message.to == null
        || this._matchRuleShort(message.message.to, this._topic.channel)
      )
      && this._matchRuleShort(message.message.topic, this._topic.topic);
  }
  private _matchRuleShort(str, rule) {
    const escapeRegex = (str) =>
      //eslint-disable-next-line no-useless-escape
      str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    return new RegExp(
      '^' + rule.split('*').map(escapeRegex).join('.*') + '$'
    ).test(str);
  }
  public handle(message: IMessageContext): Promise<void> {
    return this.handler && message && this.matches(message)
      ? this.handler(message)
      : Promise.resolve();

    if (!message || !this.handle(message)) return Promise.resolve();
  }
}


import { IHandler } from './IHandler';
import { IMessageBusSubscription } from './IMessageBusSubscription';
import { IMessageContext } from './IMessageContext';
//import { MessageTopic } from './Topics';

export class MessageBusSubscription implements IMessageBusSubscription {
  public handler: IHandler = null;
  /**
   * 
   * @param topicPattern 
   * @param endpoint
   * @param handler 
   */
  constructor(
    /**
     * the pattern to be used
     */
    public topicPattern: string,
    public endpoint: string,
    handler?: IHandler
  ) {
    this.handler = handler;
    //this._topic = topicPattern
    //this._topic.channel = this._topic.channel || channel || '';
  }
  public matches(message: IMessageContext): boolean {
    return (
      message && message.message &&
      (
        !message.message.to || message.message.to === '*' || message.message.to === this.endpoint ||
        this._matchRuleShort(message.message.to, this.endpoint)
      ) &&
      this._matchRuleShort(message.message.topic, this.topicPattern)
    );
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
  public toString(): string {
    return `Subscription (${this.topicPattern})`;
  }
}

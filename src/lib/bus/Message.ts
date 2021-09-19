
import { IMessage } from './IMessage';
import { MessageTopic } from './Topics';

export const uniqueId = (): string => {
  return Date.now().toString();
};
export class Message implements IMessage {
  public headers: { [id: string]: string } = {};
  /**
   * unique id of this message that us usually automatically
   * created fot each new message.
   */
  public id: string;
  public reply_to: string;

  /**
   * 
   * @param topic The message topic in the form "channel://topic"
   * @param channel Explicit 'channel' if channel is not specified in topic.
   * @param from endpoint adress where the message is sent. Normally provided by the 
   * message bus.
   * @param to endpoint where the message should be sent. If specified, the message will 
   * will be sent only to that endpoint. This is normally used to send commands or replies 
   * to commands.
   * @param payload payload of the messae usually a json serializable simpld object.
   */
  constructor(
    /**
     * Message topic. 
     */
    public topic: string,
    public channel: string,
    public from: string,
    public to: string,
    public payload: unknown
  ) {
    this.id = uniqueId();
    const _topic = MessageTopic.parse(topic);
    this.channel = channel || _topic.channel;
    this.topic = _topic.topic;
  }
  cast<T>(): T {
    return this.payload as unknown as T
  }
}

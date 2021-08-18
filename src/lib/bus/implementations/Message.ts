import { IMessage } from "../interfaces/IMessage";

import { MessageTopic } from './Topics';

export const uniqueId = (): string => {
  return Date.now().toString();
};
export class Message implements IMessage {
  public headers: { [id: string]: string } = {};
  public id: string;
  public reply_to: string;

  constructor(
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
    return this as unknown as T
  }
}

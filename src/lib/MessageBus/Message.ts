import { IMessage } from './interfaces';
import { MessageTopic } from './Topics';

export const uniqueId = (): string => {
  return Date.now().toString();
};
export class Message implements IMessage {
  public headers: { [id: string]: string } = {};
  public id: string;
  public reply_to: string;
  constructor(public topic: string, public to: string, public from: string, public payload: unknown) {
    this.id = uniqueId();
    (MessageTopic)
    //const _topic = MessageTopic.parse(topic);



  }
}

import { IMessageContext } from "../interfaces";

import { MessageBusSubscription } from './MessageBusSubscription';

export class MessageBusSubscriptions {
  private _items: MessageBusSubscription[] = [];
  constructor() {
    this._items;
  }
  add(item: MessageBusSubscription) {
    this._items.push(item);
  }
  publish(mssage: IMessageContext): Promise<void> {
    const promises = [];
    this._items.forEach((x) => {
      if (x.matches(mssage) && mssage.message.headers['remote'] != 'True') {
        promises.push(x.handle(mssage));
      }
      //x.handler(mssage);
    });
    return new Promise<void>((resolve, reject) => {
      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

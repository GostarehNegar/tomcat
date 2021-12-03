

import { Utils } from '../../common';
import { ILogger } from '../base';
import { IMessageContext } from './IMessageContext';
import { MessageBusSubscription } from './MessageBusSubscription';

export class MessageBusSubscriptions {
  private _items: MessageBusSubscription[] = [];
  private _logger: ILogger;
  constructor() {
    this._items;
    this._logger = Utils.instance.getLogger("Bus.Subscriptions")
  }
  public get items() {
    return this._items || [];
  }
  public getTopics(): string[] {
    return (this.items).map(x => x.topicPattern);
  }
  add(item: MessageBusSubscription) {
    this._items.push(item);
  }
  publish(mssage: IMessageContext): Promise<void> {
    const promises = [];
    this._items.forEach((x) => {
      if (x.matches(mssage) && mssage.message.headers['remote'] != 'True') {
        try {
          promises.push(x.handle(mssage));

        }
        catch (err) {
          this._logger.error(
            `An error occured while trying to invoke this subscription. ` +
            `:${x.toString()}, Err:'${err}'`)
          promises.push(Promise.reject(err));
          if (mssage && mssage.message && mssage.message?.headers?.is_request) {
            mssage.reject(err);

          }
        }

      }
      //x.handler(mssage);
    });
    return new Promise<void>((resolve, reject) => {
      Promise.allSettled(promises)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

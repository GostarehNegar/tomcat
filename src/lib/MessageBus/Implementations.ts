import { IMessagePayload, IMessageBus, IMessageContext, IMessgaeBusSubscription } from "./interfaces";

export class MessgaePayload implements IMessagePayload {
    constructor(public topic: string, public body: unknown) {

    }

}
export class MessageContext implements IMessageContext {
    private IMessageBus _bus = null;
    constructor(public payload: MessgaePayload, bus: IMessageBus) {
        this._bus = this._bus;

    }

}
export class MessageBusSubscription implements IMessgaeBusSubscription {
    constructor(public topic: string) {

    }

}
export class MessageBusSubscriptions {
    private _items: MessageBusSubscription[] = [];
    constructor() {

    }
    add(item: MessageBusSubscription) {
        this._items.push(item);
    }
}
export class MessageBus implements IMessageBus {

    private _subscriptions: MessageBusSubscriptions = new MessageBusSubscriptions();

    constructor() {

    }

    createMessage(topic: string, body: unknown): IMessageContext {
        return new MessageContext(new MessgaePayload(topic, body), this);
    }
    subscribe(topic: string): Promise<IMessgaeBusSubscription> {

        return new Promise < IMessgaeBusSubscription((resolve, reject) => {



        });

    }

    private _matchRuleShort(str, rule) {
        var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
    }


}
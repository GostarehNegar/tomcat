export interface IMessageBus {

    createMessage(topic: string, body: unknown): IMessageContext;
}
export interface IMessageContext { }
export interface IMessagePayload { }
export interface IMessgaeBusSubscription { }
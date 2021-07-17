export interface IMessage {
  get id(): string;
  reply_to: string;
  get topic(): string;
  get to(): string;
  get from(): string;
  get payload(): unknown;
  get headers(): { [id: string]: string };
}
export interface IParsedTopic {
  get topic(): string;
  get channel(): string | null;
}
export interface ICreateMessageConfig {
  /**
   * hfdiudshifu 
  */
  topic: string,
  /**
   * 
   */
  to: string,
  body: any,
}
export interface IMessageBus {
  createMessage(topic: string, to?: string | null, body?: unknown | null): IMessageContext;
  // subscribeEx(
  //   callBack: (subs: IMessageBusSubscription) => void
  // ): Promise<IMessageBusSubscription>;
  subscribe(topic: string, handler: IHandler): Promise<IMessageBusSubscription>;
  start(): Promise<void>;
  get channelName(): string;
}
export interface ITransportConnectInfo {
  channel: string;
}
export interface IMessageTransport {
  open(info: ITransportConnectInfo): Promise<IMessageTransport>;
  pubish(context: IMessageContext): Promise<void>;
  close(): Promise<void>;
  on(handler: (message: any) => void);
}

export interface IMessageContext {
  get message(): IMessage;
  publish(): Promise<void>;
  execute<T>(): Promise<T>;
  reply(body: unknown): Promise<void>;
  isLocal(): boolean;
  get headers(): { [id: string]: string };
}

export interface IMessageBusSubscription {
  get handler(): IHandler;
  get topicPattern(): string;


}
export interface IHandler {
  (context: IMessageContext): Promise<void>;
}

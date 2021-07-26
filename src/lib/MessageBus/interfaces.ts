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
/**
 * Represents messaging features.
 */
export interface IMessageBus {
  /**
   * Creates a message (context) with a specific body to be later
   * published.
   * @param topic Message topic e.g 'some-topic'. It can be perfixed
   * with the destination such as "some-destination://some-topic"
   * @param body Body/payload of the message, can be any json serializable object.
   * @param to Optionaly name of the destination endpoint. 
   */
  createMessage(topic: string, body?: unknown | null, to?: string | null): IMessageContext;

  /**
   * 
   * @param topic 
   * @param handler 
   */
  subscribe(topic: string, handler: IHandler): Promise<IMessageBusSubscription>;
  start(): Promise<unknown>;
  get channelName(): string;
  stop(): Promise<unknown>;
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
  publish(): Promise<unknown>;
  execute<T>(): Promise<T>;
  reply(body: unknown): Promise<unknown>;
  isLocal(): boolean;
  get headers(): { [id: string]: string };
  setScope(scope: "local" | "remote" | "both"): void;
}

export interface IMessageBusSubscription {
  get handler(): IHandler;
  get topicPattern(): string;


}
export interface IHandler {
  (context: IMessageContext): Promise<void>;
}

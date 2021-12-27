
import { IEndpointInfo } from "./IEndpointInfo";
import { IMessageContext } from "./IMessageContext";
//import { ITransportConnectInfo } from "./ITransportConnectInfo";

export interface ITransportMessageHandler {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (transport: IMessageTransport, message: any): void;
}
export interface IMessageTransport {
    get name(): string;
    open(handler: ITransportMessageHandler, info: IEndpointInfo): Promise<IMessageTransport>;
    pubish(context: IMessageContext): Promise<void>;
    close(): Promise<void>;
    on(handler: ITransportMessageHandler): void;
    pong(result: IEndpointInfo): void;
    subscribe(topic: string): Promise<void>;
    //init(handler: (transport: IMessageTransport, message: any) => void);
    //init(info:ITransportConnectInfo, handler:(message:any)=>void);
}

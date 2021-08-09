import { ITransportConnectInfo } from "./ITransportConnectInfo";
import { IMessageContext } from "./IMessageContext";


export interface IMessageTransport {
    open(info: ITransportConnectInfo): Promise<IMessageTransport>;
    pubish(context: IMessageContext): Promise<void>;
    close(): Promise<void>;
    on(handler: (message: any) => void);
}

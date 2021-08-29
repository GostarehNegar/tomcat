import { IMessageContext } from "./IMessageContext";
import { ITransportConnectInfo } from "./ITransportConnectInfo";


export interface IMessageTransport {
    open(info: ITransportConnectInfo): Promise<IMessageTransport>;
    pubish(context: IMessageContext): Promise<void>;
    close(): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(handler: (message: any) => void);
}

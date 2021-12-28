import { IMessageContext } from "./IMessageContext";


export interface IHandler {
    (context: IMessageContext): Promise<void>;
}

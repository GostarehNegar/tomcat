import { IMessage } from "./IMessage";


export interface IMessageContext {
    get message(): IMessage; publish(): Promise<unknown>;
    execute<T>(): Promise<T>;
    reply(body: unknown): Promise<unknown>;
    isLocal(): boolean;
    get headers(): { [id: string]: string; }; setScope(scope: 'local' | 'remote' | 'both'): void;
}

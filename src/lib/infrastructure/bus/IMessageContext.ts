import { IMessage } from "./IMessage";
export interface IMessageContextHeader {
    [key: string]: any | undefined;
    'transport'?: string | undefined;


}

/**
 * The context that provides helper methods for subscribers 
 * to handle a message. For instance to reply.
 */
export interface IMessageContext {
    /**
     * The message sent this context. Use this to access
     * message topic and body.
     */
    get message(): IMessage; publish(): Promise<void>;
    execute(always_resolve?: boolean): Promise<IMessage>;
    /**
     * sends a reply to this message.
     * @param body body of reply. 
     */
    reply(body: unknown): Promise<void>;
    reject(body: unknown): Promise<void>;
    isLocal(): boolean;
    /**
     * a set of headers that can be used to store meta-data
     * for this context. note that this differs from 'message.headers'. 
     * conetxt headers are only local and are not moved with the message.
     */
    get headers(): IMessageContextHeader;
    setScope(scope: 'local' | 'remote' | 'both'): void;
    get scope(): 'local' | 'remote' | 'both' | '';
    set scope(value: 'local' | 'remote' | 'both' | '');
    toString(): string;
}

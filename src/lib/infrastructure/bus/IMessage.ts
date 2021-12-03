export interface IMessageHeader {
    [key: string]: string | boolean | number | undefined;
    'is_request'?: boolean;
}


export interface IMessage {
    get id(): string;
    reply_to: string;
    get topic(): string;
    get to(): string;
    get from(): string;
    get payload(): unknown;
    get headers(): IMessageHeader;
    cast<T>(): T;
    toString(): string;
}

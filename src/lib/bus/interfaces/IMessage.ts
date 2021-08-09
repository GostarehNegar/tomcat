export interface IMessage {
    get id(): string; get channel(): string; reply_to: string;
    get topic(): string; get to(): string; get from(): string; get payload(): unknown; get headers(): { [id: string]: string; };
}

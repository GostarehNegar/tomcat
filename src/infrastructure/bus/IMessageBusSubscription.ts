import { IHandler } from "./IHandler";


export interface IMessageBusSubscription {
    get handler(): IHandler; get topicPattern(): string;
}

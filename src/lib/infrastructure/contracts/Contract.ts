import { IMessageContract } from "../bus/IMessageContract"

export class Contract<T> implements IMessageContract {
    topic: string;
    payload: T;
}

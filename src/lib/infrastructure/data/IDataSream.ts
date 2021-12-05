
import { Ticks } from "../base";

export interface IDataStream<T> {
    getAt(time: Ticks): Promise<T>;
    add(value: T, time?: Ticks): Promise<unknown>;
    iterator(start?: Ticks, end?: Ticks, count?: number): AsyncGenerator<T>
    toArray(predicate?: (item: T) => boolean, start?: Ticks, end?: Ticks, count?: number): Promise<T[]>;
    play(cb: (item: T, time: Ticks) => boolean, start?: Ticks): Promise<unknown>;
}
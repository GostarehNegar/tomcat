
import { Ticks } from "../base";

export interface IStreamInfo {
    length?: number,
    last?: number,
    first?: number;
}
export interface IDataStream<T> {
    getAt(time: Ticks, allow_after?: boolean): Promise<T>;
    add(value: T, time?: Ticks): Promise<unknown>;
    iterator(start?: Ticks, end?: Ticks, count?: number): AsyncGenerator<T>
    reverse(start?: Ticks, end?: Ticks, count?: number): AsyncGenerator<T>

    toArray(predicate?: (item: T) => boolean, start?: Ticks, end?: Ticks, count?: number): Promise<T[]>;
    play(cb: (item: T, time: Ticks) => boolean, start?: Ticks): Promise<unknown>;
    getInfo(): Promise<IStreamInfo>;
    getFirst(): Promise<T>;
    getLast(): Promise<T>;
    has(time: Ticks): Promise<boolean>;
    dispose()
}
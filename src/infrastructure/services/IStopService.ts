

export type StopTypes = 'info' | 'error';
export interface IStopCallBack<T> {
    (context: IStopContext<T>): boolean;

}

export interface IStopContext<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any | undefined;
    type: StopTypes;
    by: string;
    data?: T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err?: any;

}

export interface IStopService {
    onStop<T>(cb: IStopCallBack<T>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryStop<T>(by: string, type?: StopTypes, data?: T | any);
}

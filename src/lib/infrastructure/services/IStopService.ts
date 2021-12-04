

export type StopTypes = 'info' | 'error';
export interface IStopCallBack<T> {
    (context: IStopContext<T>): boolean;

}

export interface IStopContext<T> {
    [key: string]: any | undefined;
    type: StopTypes;
    by: string;
    data?: T;
    err?: any;

}

export interface IStopService {
    onStop<T>(cb: IStopCallBack<T>);
    queryStop<T>(by: string, type?: StopTypes, data?: T | any);
}

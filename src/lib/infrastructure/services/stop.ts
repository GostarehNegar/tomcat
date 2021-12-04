import { IServiceProvider } from "../base";
import { IStopService, IStopContext, StopTypes, IStopCallBack } from "./IStopService";

export class StopService implements IStopService {
    constructor(private Provider: IServiceProvider) {

    }
    onStop<T>(cb: IStopCallBack<T>) {
        this.Provider.register('_stop_', () => cb);
    }
    queryStop<T>(by: string, type: StopTypes = 'info', data: T | any = null): boolean {
        const callBacks = this.Provider.getServices<IStopCallBack<T>>('_stop_');
        const context: IStopContext<T> = {
            by: by,
            type: type,
            data: data,
        }
        return callBacks.find(x => {
            try { return x(context); }
            catch { return false }
        }) != null;
    }


}
export class SequentialPromise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private myPromise: { reject?: any, resolve?: any } = {}
    private promiseItems: (() => Promise<T>)[] = []
    private promiseResults: T[] = []
    private _stop = false;
    constructor(...params: (() => Promise<T>)[]) {
        this.push(...params)
    }
    push(...params: (() => Promise<T>)[]) {
        params.map(x => {
            this.promiseItems.push(x)
        })
        return this
    }
    private _execute(id = 0, rejectMode = true, cb?: (data: T) => void) {
        return new Promise<T[]>((resolve, reject) => {
            if (id === 0) {
                this.myPromise.resolve = resolve
                this.myPromise.reject = reject
            }
            if (this._stop) {
                this.myPromise.resolve(this.promiseResults);
                return;
            }
            this.promiseItems[id]().then((data) => {
                this.promiseResults.push(data);
                (cb && cb(data));
                if (id < this.promiseItems.length - 1) {
                    this._execute(id + 1, rejectMode, cb)
                } else {
                    this.myPromise.resolve(this.promiseResults)
                }
            }).catch((err) => {
                if (rejectMode) {
                    this.myPromise.reject(err)
                } else {
                    this.promiseResults.push(err);
                    // (cb && cb(data));
                    if (id < this.promiseItems.length - 1) {
                        this._execute(id + 1, rejectMode, cb)
                    } else {
                        this.myPromise.resolve(this.promiseResults)
                    }
                }
            })
        })
    }
    stop() {
        this._stop = true;

    }
    execute(rejectMode = true, cb?: (data: T) => void) {
        return this._execute(0, rejectMode, cb)
    }
}
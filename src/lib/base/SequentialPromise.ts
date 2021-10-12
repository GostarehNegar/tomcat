export class SequentialPromise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private myPromise: { reject?: any, resolve?: any } = {}
    private promiseItems: (() => Promise<T>)[] = []
    private promiseResults: T[] = []
    constructor(...params: (() => Promise<T>)[]) {
        this.push(...params)
    }
    push(...params: (() => Promise<T>)[]) {
        params.map(x => {
            this.promiseItems.push(x)
        })
        return this
    }
    private _execute(id = 0, rejectMode = true) {
        return new Promise<T[]>((resolve, reject) => {
            if (id === 0) {
                this.myPromise.resolve = resolve
                this.myPromise.reject = reject
            }
            this.promiseItems[id]().then((data) => {
                this.promiseResults.push(data)
                if (id < this.promiseItems.length - 1) {
                    this._execute(id + 1, rejectMode)
                } else {
                    this.myPromise.resolve(this.promiseResults)
                }
            }).catch((err) => {
                if (rejectMode) {
                    this.myPromise.reject(err)
                } else {
                    this.promiseResults.push(err)
                    if (id < this.promiseItems.length - 1) {
                        this._execute(id + 1, rejectMode)
                    } else {
                        this.myPromise.resolve(this.promiseResults)
                    }
                }
            })
        })
    }
    execute(rejectMode = true) {
        return this._execute(0, rejectMode)
    }
}
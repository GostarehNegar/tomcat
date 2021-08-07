import talib from 'talib'

// export type IndicatorParameters = {
//     name: string,
//     startIdx: number,
//     endIdx: number
// }

class TalibWrapper {

    async execute(inidicatorParameters) {
        const executePromise = new Promise((resolve, reject) => {
            talib.execute(
                inidicatorParameters,
                function (err, result) {
                    if (result) {
                        resolve(result.result.outReal);
                    } else if (err) {
                        reject(err)
                    }
                }
            )
        })
        return executePromise
    }
}
export const TalibWrapperEx = new TalibWrapper();




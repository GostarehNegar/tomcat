import redis from "redis";

import { Ticks, utils } from "../../../base";

export class RedisStream {
    public client: redis.RedisClient;
    constructor(public streamName: string) {
        this.client = redis.createClient();
        this.streamName = streamName;
    }
    async XADD(time: Ticks, data, ignoreDuplicate = true) {
        return new Promise((resolve, reject) => {
            this.client.sendCommand("XADD", [this.streamName, time, utils.toTimeEx(time).asUTCDate, JSON.stringify(data)], (err, res) => {
                if (err) {
                    if (((err.message as string).indexOf('is equal or smaller than the target') < 0) || !ignoreDuplicate) {
                        reject(err)
                    }
                    resolve(null)
                }
                resolve(res)
            })
        })
    }
    async XRANGE(time: Ticks) {
        return new Promise<string>((resolve, reject) => {
            this.client.sendCommand("XRANGE", [this.streamName, utils.ticks(time), "+", "COUNT", "1"], (err, res) => {
                if (res.length > 0) {
                    resolve(res[0][1][1])
                } if (err) {
                    reject(err)
                }
            });
        })
    }
    async XREVRANGE() {
        return new Promise<string>((resolve, reject) => {
            this.client.sendCommand("XREVRANGE", [this.streamName, "+", "-", "COUNT", "1"], (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    if (res.length > 0) {
                        resolve(res[0][1][1])
                    } else {
                        resolve(null)
                    }
                }
            });
        })
    }
    XREADBLOCK(cb: (res, err) => boolean, lastId = '$', timeOut = 5000000, count = 1) {
        let shouldCall = true;
        const handle = setInterval(() => {
            if (shouldCall) {
                this.client.sendCommand("XREAD", ["COUNT", count, "BLOCK", timeOut, "STREAMS", this.streamName, lastId], (err, res) => {
                    if (err) {
                        console.log(err);
                        cb(null, err)
                    } else {
                        if (res && Array.isArray(res) && res.length > 0 && res[0] && Array.isArray(res[0]) && res[0].length > 1 && res[0][1] && Array.isArray(res[0][1])) {
                            for (let i = 0; i < res[0][1].length; i++) {
                                lastId = res[0][1][i][0]
                                const stop = cb(res[0][1][i][1][1], err)
                                if (stop) {
                                    clearInterval(handle)
                                    return
                                }
                            }
                        } else {
                            throw "unexpected condition"
                        }
                    }
                    shouldCall = true;
                });
                shouldCall = false
            }
        }, 10)
    }
    async XINFO() {
        return new Promise<{ length: number, lastGeneratedId: string }>((resolve, reject) => {
            this.client.sendCommand("XINFO", ["STREAM", this.streamName], (err, res) => {
                if (err) {
                    reject(err)
                }
                resolve({
                    length: res && res.length > 0 ? res[1] : null,
                    lastGeneratedId: res && res.length > 6 ? res[7] : null,
                    // firstEntry: res.length > 10 ? res[11] : null,
                    // lastEntry: res.length > 12 ? res[13] : null
                })
            })
        })
    }
    async SCANSTREAMS() {
        return new Promise<string[]>((resolve, reject) => {
            this.client.SCAN("0", "TYPE", "stream", (err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res && res.length > 0 ? res[1] as string[] : null)
            })
        })
    }
    async exists(): Promise<boolean> {
        try {
            const res = await this.XINFO();
            (res);
            return true

        } catch (err) {
            // console.log(err);
            (err)
            return false
        }
    }
    async quit() {
        await this.client.quit()
    }

}

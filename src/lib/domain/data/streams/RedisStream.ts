import redis from "redis";

import { Ticks, utils } from "../../../base";

export class RedisStream {
    public client: redis.RedisClient;
    constructor(public streamName: string) {
        // this.client = redis.createClient({ host: 'redis' });
        this.client = redis.createClient();

        this.streamName = streamName;
    }
    async dep_XADD(time: Ticks, data, ignoreDuplicate = true) {
        return new Promise((resolve, reject) => {
            this.client.sendCommand("XADD", [this.streamName, utils.ticks(time), utils.toTimeEx(time).asUTCDate, JSON.stringify(data)], (err, res) => {
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
    async getLastGeneratedID() {
        try {
            return parseInt((await this.XINFO()).lastGeneratedId)
        } catch {
            return 0
        }
    }
    async _XADD(time: number, data, ignoreDuplicate = true) {
        return new Promise((resolve, reject) => {
            this.client.sendCommand("XADD", [this.streamName, utils.ticks(time), utils.toTimeEx(time).asUTCDate, typeof data === 'string' ? data : JSON.stringify(data)], (err, res) => {
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
    async XADD(time: Ticks, data, ignoreDuplicate = true, enforceOneMinut = true, missingCallBack?: (time: number) => unknown) {
        const lastId = await this.getLastGeneratedID()
        time = enforceOneMinut ? utils.toTimeEx(time).roundToMinutes(1).ticks : utils.ticks(time)
        if (enforceOneMinut && lastId != 0) {
            for (let i = lastId + 60000; i < time; i += 60000) {
                await this._XADD(i, missingCallBack ? missingCallBack(i) : "null", true)
            }
        }
        return await this._XADD(time, data, ignoreDuplicate)
    }

    async dep__XADD(time: Ticks, data, ignoreDuplicate = true, enforceOneMinut = true) {
        time = enforceOneMinut ? utils.toTimeEx(time).roundToMinutes(1).ticks : utils.ticks(time)
        return new Promise((resolve, reject) => {
            const _add = () => {
                this.client.sendCommand("XADD", [this.streamName, time, utils.toTimeEx(time).asUTCDate, JSON.stringify(data)], (err, res) => {
                    if (err) {
                        if (((err.message as string).indexOf('is equal or smaller than the target') < 0) || !ignoreDuplicate) {
                            reject(err)
                        }
                        resolve(null)
                    }
                    resolve(res)
                })
            }
            if (enforceOneMinut) {
                this.XINFO().then((x) => {
                    if (x.lastGeneratedId == "0-0" || (utils.ticks(time) - parseInt(x.lastGeneratedId) == 60000)) {
                        _add()
                    } else {
                        console.log("a candle migth be missing at " + time + " " + this.streamName);
                        resolve(null)
                    }
                }).catch((err) => {
                    // console.log(err);
                    (err);
                    _add()
                })
            } else {
                _add()
            }
        })
    }

    async XCREATE(): Promise<void> {
        const groupName = utils.randomName("temp")
        return new Promise((resolve, reject) => {
            this.client.sendCommand("XGROUP", ["CREATE", this.streamName, groupName, "$", "MKSTREAM"], (err, res) => {
                if (err) {
                    reject(err)
                }
                if (res) {
                    this.client.sendCommand("XGROUP", ["DESTROY", this.streamName, groupName], (err) => {
                        if (err) {
                            reject(err)
                        }
                        resolve()
                    })
                }
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
    async XREVRANGE(count) {
        return new Promise<string[]>((resolve, reject) => {
            this.client.sendCommand("XREVRANGE", [this.streamName, "+", "-", "COUNT", count], (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    if (res.length > 0) {
                        const result = []
                        for (let i = 0; i < res.length; i++) {
                            result.push(res[i][1][1])
                        }
                        resolve(result)
                    } else {
                        resolve(null)
                    }
                }
            });
        })
    }
    XREADBLOCK(cb: (res: { id: number, data: string }, err) => boolean, lastId = '$', timeOut = 5000000, count = 1) {
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
                                const stop = cb({ id: parseInt(lastId), data: res[0][1][i][1][1] }, err)
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

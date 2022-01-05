import fs from 'fs';
import path from 'path';



import { BaseUtils } from '../infrastructure/base';

import { Intervals, Symbols } from '.';


export class Utils extends BaseUtils {
    roundTime(time: number, minutes: number): number {
        const coeff = 1000 * 60 * minutes;
        return Math.round(time / coeff) * coeff;
    }
    floorTime(time: number, minutes: number): number {
        const coeff = 1000 * 60 * minutes;
        return Math.floor(time / coeff) * coeff;
    }
    //var roundToNearestMinute = function (date) {
    //     var coeff = 1000 * 60 * 1; // <-- Replace {5} with interval

    //     return new Date(Math.round(date.getTime() / coeff) * coeff);
    // };
    toMinutes(interval: Intervals): number {
        if (interval == null)
            return null;
        const _interval = interval.trim().toLowerCase();
        if (_interval.length == 0)
            return null;
        if (_interval.endsWith('m'))
            return Number.parseInt(_interval);
        if (_interval.endsWith('h'))
            return Number.parseInt(_interval) * 60;
        if (_interval.endsWith('d'))
            return Number.parseInt(_interval) * 60 * 24;
        return null;
    }
    toInterval(span: number): Intervals {
        const min = Math.round(span / (60 * 1000));
        if (min < 60)
            return `${min}m` as Intervals;
        else {
            const hours = Math.round(min / 60);
            if (hours < 24) {
                return `${hours}h` as Intervals;
            }
            else {
                const days = Math.round(hours / 24);
                return `${days}d` as Intervals;
            }
        }
    }
    parseSymbol(sym: string): Symbols {
        return sym as Symbols
    }

    async ensureRedisWorkingSpace(): Promise<string> {
        const workingDirectoryPath = path.resolve("workingDirectory")
        if (!fs.existsSync(workingDirectoryPath)) {
            await fs.promises.mkdir(workingDirectoryPath)
        }
        const dataDirectory = path.resolve("workingDirectory", "data")
        if (!fs.existsSync(dataDirectory)) {
            await fs.promises.mkdir(dataDirectory)
        }
        return dataDirectory
    }
    async getRedisDataDirectory(directoryName: string): Promise<string> {
        const dataDirectory = await this.ensureRedisWorkingSpace()
        if (dataDirectory) {
            const redisContainerDirectory = path.resolve(dataDirectory, directoryName)
            if (!fs.existsSync(redisContainerDirectory)) {
                fs.mkdirSync(redisContainerDirectory)
            }
            return redisContainerDirectory
        }
        throw "was unable to create redis data directory"
    }
}
const utils = new Utils();
export default utils;
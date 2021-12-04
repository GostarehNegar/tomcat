import fetch from "node-fetch";
import { TimeEx } from "../base";
import { IHostedService } from "../hosting";
import { IClock } from "./IClock";

export class Clock implements IClock, IHostedService {
    setInterval(cb: () => void, ms?: number) {
        const handel = setInterval(cb, ms);
        this.interval_handles.push(handel);
        return handel;
    }

    private interval_handles: NodeJS.Timer[] = []

    async start(): Promise<void> {
        await this.synch();
    }
    stop(): Promise<void> {
        return Promise.resolve();
    }
    private offset = 0;

    public now(): number {

        return Date.now() + this.offset;
    }
    public timeNow(): TimeEx {
        return new TimeEx(Date.now() + this.offset);
    }
    public async synch() {
        try {
            const res = await (await fetch('http://worldtimeapi.org/api/timezone/etc/utc')).json();
            this.offset = res.unixtime * 1000 - Date.now();
        }
        catch (err) {
            console.error(
                `An error occured while trying to synchronizae time with 'WorldTimeApi'. ` +
                `Error:${err}`);

        }
        return this.now();

    }

}

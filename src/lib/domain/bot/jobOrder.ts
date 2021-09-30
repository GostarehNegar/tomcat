import { Ticks } from "../../base";

export class JobOrder {
    public startTime;
    public endTime;
    constructor(startTime: Ticks, endTime: Ticks) {
        this.endTime = endTime
        this.startTime = startTime
    }
}


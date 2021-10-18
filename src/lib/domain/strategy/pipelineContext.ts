import { Ticks } from "../../base"

export class PipelineContext {
    myContext: { [key: string]: unknown }
    startTime?:Ticks;
}
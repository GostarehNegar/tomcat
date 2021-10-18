import { Ticks } from "../infrastructure/base"

export class PipelineContext {
    myContext: { [key: string]: unknown }
    startTime?: Ticks;
}
import { IPipeline, IPipelineContext, IPipelineRequest, IPipelineResponse } from "../interfaces";

export class PipelineContext implements IPipelineContext {
    constructor(public req: IPipelineRequest, public res: IPipelineResponse, public pipe: IPipeline) {
    }


}

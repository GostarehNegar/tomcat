import { IPipeline, IPipelineBuilder, IPipelineMiddleWare } from "../interfaces";
import { Pipeline } from "./Pipeline";

export class PipelineBuilder implements IPipelineBuilder {
    private middleware: IPipelineMiddleWare[] = [];
    constructor() {
        (this.middleware);
    }
    use(m: IPipelineMiddleWare): IPipelineBuilder {
        this.middleware.push(m);
        return this;
    }
    build(): IPipeline {
        return new Pipeline(this.middleware);
    }

}

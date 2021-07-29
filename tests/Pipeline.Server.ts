import { PipelineBuilder } from '../src/lib/Pipeline/Implementations'
const pipeline = new PipelineBuilder()
    .build();
pipeline.listen(8080);

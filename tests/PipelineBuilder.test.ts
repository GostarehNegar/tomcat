import { PipelineBuilder } from '../src/lib/Pipeline/Implementations'


describe('PipelineBuilder', () => {

    test('should create pipeline', async () => {
        const pipeline = new PipelineBuilder()
            .build();
        expect(pipeline).not.toBeNull();

    });
});
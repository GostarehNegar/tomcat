import { IPipeline, IPipelineBuilder, IPipelineContext, IPipelineRequest, IPipelineResponse } from "./interfaces";
import http from 'http'

export class Pipeline implements IPipeline {

    private http: http.Server;
    listen(port: number) {
        this.http = http.createServer(async (req, res) => {
            (req);
            res.write('hello there!')
            res.end();

        });
        this.http.listen(port);
    }
    close() {
        this.http?.close();
    }

    handle(request: IPipelineRequest): Promise<IPipelineResponse> {
        (request)
        throw new Error("Method not implemented.");
    }

}
export class PipelineBuilder implements IPipelineBuilder {
    build(): IPipeline {
        return new Pipeline();
    }

}
export class PipelineContext implements IPipelineContext {

}
export class PipelineRequest implements IPipelineRequest {

}
export class PipelineResponse implements IPipelineResponse {

}
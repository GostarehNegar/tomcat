
export interface IPipelineMiddleWare {
    handle(context: IPipelineContext, next: IPipelineMiddleWare);
}
export interface IPipeline {

    handle(request: IPipelineRequest): Promise<IPipelineResponse>;
    listen(port: number);
    close();


}
export interface IPipelineBuilder {
    build(): IPipeline;
}

export interface IPipelineContext {

}
export interface IPipelineRequest {

}
export interface IPipelineResponse {

}

export interface IPipelineHost {

}
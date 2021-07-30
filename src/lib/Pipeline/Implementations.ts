import { IRequestHeaders, IResponseHeaders } from "./interfaces";
import http from 'http'
export * from './Implementaions/Pipeline'
export * from './Implementaions/PipelineBuilder'
export * from './Implementaions/PipelineContext'
export * from './Implementaions/PipelineRequest'
export * from './Implementaions/PipelineResponse'
export class RequestHeaders implements IRequestHeaders {
    [key: string]: string | string[];

}
export class ResponseHeaders implements IResponseHeaders {
    [key: string]: http.OutgoingHttpHeader;

}

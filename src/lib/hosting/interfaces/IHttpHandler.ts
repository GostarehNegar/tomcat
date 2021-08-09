import { IHttpContext } from './IHttpContext';

export interface IHttpHandler {
    (
        ctx: IHttpContext,
        next: (ctx: IHttpContext) => Promise<unknown>
    ): Promise<unknown>;
}

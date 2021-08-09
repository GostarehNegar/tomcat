import { IncomingHttpHeaders } from 'http';

export interface IRequestHeaders extends IncomingHttpHeaders {
    'x-forward-peers'?: string | string[] | undefined;
    'x-forward-chain'?: string | string[] | undefined;
}

export interface IHostedService {
    start(): Promise<unknown>;
    stop(): Promise<unknown>;
}

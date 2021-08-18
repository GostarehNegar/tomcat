export interface IStrategy {
    run(startTime: number, endTime: number): Promise<unknown>;
    stream: string;
}
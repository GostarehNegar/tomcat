export interface IEndpointInfo {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any | undefined;
    'endpoint': string;
    'topics': string[];
}

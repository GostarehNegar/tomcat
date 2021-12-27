export interface ISerielizationService {
    serialize(obj: unknown);
    deserialize<T>(data: string): T;
}
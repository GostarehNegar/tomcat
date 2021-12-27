import { IServiceProvider } from "../base";

import { ISerielizationService } from "./ISerializationService";

export class SerializationService implements ISerielizationService {
    constructor(private serviceProvider: IServiceProvider) {
        (this.serviceProvider);
    }
    serialize(obj: unknown) {
        return JSON.stringify(obj);
    }
    deserialize<T>(data: string): T {
        return JSON.parse(data) as T;
    }

}
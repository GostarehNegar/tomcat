import { ServiceInformation } from "./ServiceDefinition";
import { IMeshServiceContext } from "./IMeshServiceContext";

export interface IMeshService {
    getInformation(): ServiceInformation;
    start(ctx?: IMeshServiceContext): Promise<unknown>;
    Id: string;
}

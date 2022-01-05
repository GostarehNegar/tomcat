import { IMeshService } from ".";
import { IServiceProvider } from "../base";

import { IMeshNode } from "./IMeshNode";


export interface IMeshServiceContext {
    ServiceProvider: IServiceProvider;
    service: IMeshService
    node: IMeshNode,

}

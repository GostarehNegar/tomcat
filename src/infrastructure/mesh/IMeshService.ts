import { ServiceInformation } from "./ServiceDefinition";
import { IMeshServiceContext } from "./IMeshServiceContext";

import { ServiceDefinition } from ".";

import { baseUtils } from "../base";
//import { ServiceDefinition } from ".";
export interface IMeshServiceMain {
    (ctx?: IMeshServiceContext): Promise<unknown>;
}
export interface IMeshService {
    getInformation?: () => ServiceInformation;
    run(ctx?: IMeshServiceContext): Promise<unknown>;
    getId?: () => string;
}
export class MeshServiceBase implements IMeshService {
    information: ServiceInformation = new ServiceInformation();
    constructor(public definiton: ServiceDefinition) {
        this.definiton = baseUtils.extend(new ServiceDefinition(), definiton);
        this.information.definition = definiton;
    }
    async run(ctx?: IMeshServiceContext): Promise<unknown> {
        (ctx);
        this.information.status = 'start';
        await Promise.resolve();
        this.information.status = 'stop';
        return this.information;
    }
    getInformation(): ServiceInformation {
        return this.information;
    }

    getId() {
        return this.definiton.getName();
    }
}

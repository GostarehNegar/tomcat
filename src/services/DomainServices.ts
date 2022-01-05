import { IServiceProvider } from "../infrastructure/base"

import { IDomainServices } from "./IDomainServices";
export class DomainServices implements IDomainServices {
    constructor(public serviceProvider: IServiceProvider) {

    }
}
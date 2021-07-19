import { IServiceContainer } from "../../base/ServiceContainer";
import { IWebHost } from "../interfaces";
import { Host } from "./Host";

export class WebHost extends Host implements IWebHost {
    constructor(services: IServiceContainer) {
        super(services);
    }
    listen(port?: number) {
        this.start();
        (port);
    }


}

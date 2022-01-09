import Dockerode from "dockerode";
import { DockerClientOptions, IDockerClient } from "./IDockerServices";

export class DockerClient implements IDockerClient {

    private client: Dockerode;
    constructor(public options: DockerClientOptions) {
        this.client = new Dockerode(options);
        (this.client);

    }
    async test(): Promise<any> {
        let result = null;
        try {
            result = await this.client.info()
        }
        catch { }
        return result;
        throw new Error("Method not implemented.");
    }

}
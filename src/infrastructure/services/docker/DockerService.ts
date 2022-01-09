import { DockerClient } from "./DockerClient";
import { DockerClientOptions, IDockerClient, IDockerService } from "./IDockerServices";

export class DockerService implements IDockerService {
    createClient(options: DockerClientOptions): IDockerClient {
        return new DockerClient(options);
    }
    isDockerAvaliable(host: string): Promise<boolean> {
        (host);
        throw new Error("Method not implemented.");

    }

}
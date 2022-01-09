import { DockerOptions } from "dockerode";

export interface DockerClientOptions extends DockerOptions {

}

export interface IDockerService {
    isDockerAvaliable(host: string): Promise<boolean>;
    createClient(options: DockerClientOptions): IDockerClient;


}
export interface IDockerClient {

    test(): Promise<any>;
}
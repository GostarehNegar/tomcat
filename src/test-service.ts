import tomcat from ".";
import { ServiceDefinition } from "./infrastructure/mesh";
export class SampleService implements tomcat.Infrastructure.Mesh.IMeshService {
    constructor(public def: ServiceDefinition) {

    }
    getInformation(): tomcat.Infrastructure.Mesh.ServiceInformation {
        return {
            'category': this.def.category,
            parameters: this.def.parameters,
            status: 'start'
        }
    }
    async start(ctx?: tomcat.Infrastructure.Mesh.IMeshServiceContext): Promise<unknown> {
        (ctx);
        console.log("started.........");
        return this;


    }
    Id: string;
    static definition: ServiceDefinition = {
        category: 'miscelaneous',
        parameters: { name: 'babak' }
    }
}

try {
    const srv = tomcat.getHostBuilder('test-service')
        .addMessageBus()
        .addMeshService(SampleService.definition, (def) => {
            return new SampleService(def);
        })
        .build();
    console.log(JSON.stringify(tomcat.config));
    console.log('test-service');
    srv.start();
    srv.bus.subscribe('kkkkk', async () => {


    });

}
catch (err) {
    console.error(err);

}


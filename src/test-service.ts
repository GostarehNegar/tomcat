import { ServiceDefinition, ServiceInformation } from "./infrastructure/mesh";

import tomcat from ".";
export class SampleService implements tomcat.Infrastructure.Mesh.IMeshService {
    constructor(public def: ServiceDefinition) {

    }
    getInformation(): tomcat.Infrastructure.Mesh.ServiceInformation {
        return {
            definition: {
                'category': this.def.category,
                parameters: this.def.parameters
            },
            status: 'start'
        }
    }
    async run(ctx?: tomcat.Infrastructure.Mesh.IMeshServiceContext): Promise<ServiceInformation> {
        (ctx);
        console.log("started.........");
        return this.getInformation();


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
        .addMeshService_deprecated(SampleService.definition, (def) => {
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


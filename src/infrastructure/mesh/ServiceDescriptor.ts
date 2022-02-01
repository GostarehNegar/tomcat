import { IMeshServiceContext, IMeshServiceMain, MeshServiceBase } from ".";

import { IMeshService } from "./IMeshService";
import { IServiceDescriptor, ServiceDefinition, ServiceConstructor, IServiceDescriptorOptions, ServiceCategories, IServiceDefinitionParameters } from "./ServiceDefinition";


export class GenericMeshService extends MeshServiceBase implements IMeshService {

    constructor(public def: ServiceDefinition, public m: IMeshServiceMain) {
        super(def);

    }
    run(ctx?: IMeshServiceContext): Promise<unknown> {
        return this.m(ctx);

    }

}

export class ServiceDescriptor implements IServiceDescriptor {
    public serviceDefinition: ServiceDefinition;
    public serviceConstructor: ServiceConstructor;
    public main: IMeshServiceMain;
    public options: IServiceDescriptorOptions = {};
    userServiceConstructor(def: ServiceDefinition, options: IServiceDescriptorOptions, ctor: (def: ServiceDefinition) => IMeshService) {
        this.serviceDefinition = def;
        this.serviceConstructor = ctor;
        this.options = options;
        return this;
    }
    useRunMethod(def: ServiceDefinition, options: IServiceDescriptorOptions, main: IMeshServiceMain) {
        this.serviceDefinition = def;
        this.options = options;
        this.main = main;
        this.serviceConstructor = (def) => new GenericMeshService(def, main);
    }
    useDefinition(cat: ServiceCategories, params?: IServiceDefinitionParameters) {
        this.serviceDefinition = { category: cat as ServiceCategories, parameters: params || {} };
        return this;
    }
    useGeneric(def: ServiceDefinition, op: IServiceDescriptorOptions, runner: IMeshServiceMain) {
        (def);
        (op);
        (runner);
        return this;
    }
    useConstructor(ctor: ServiceConstructor) {
        this.serviceConstructor = ctor;
        return this;
    }
    build(): ServiceDescriptor {
        // if (!this.serviceDefinition) {
        //     throw baseUtils.toException('Invalid Service Definition');
        // }
        // if (!this.serviceConstructor) {
        //     if (!this.main) {
        //         throw baseUtils.toException('Invalid Service Constructor');
        //     }
        //     this.serviceConstructor = () => {
        //         return {
        //             run: async (ctx) => {
        //                 this.main(ctx);
        //                 return null;
        //             }
        //         };
        //     };
        // }
        // const _ctor = this.serviceConstructor;
        // this.serviceConstructor = (def) => {
        //     const res = _ctor(def);
        //     const info = new ServiceInformation();
        //     info.category = def.category,
        //         info.parameters = def.parameters,
        //         info.status = 'unknown';
        //     if (!res.getInformation) {
        //         res.getInformation = () => info;
        //     }
        //     res.Id = new ServiceDefinitionHelper(def).name;

        //     return res;

        // };

        return this;

    }

}

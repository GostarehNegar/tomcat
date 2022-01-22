//import fs from "fs";
import { IMeshService, ServiceDefinition } from "./infrastructure/mesh";

import tomcat from ".";


// const script =
//     `
// [Unit]
// Description=hello_env.js - making your environment variables rad
// Documentation=https://example.com
// After=network.target

// [Service]
// Environment=NODE_PORT=3001
// Type=simple
// User=ubuntu
// ExecStart=/usr/bin/node /home/ubuntu/hello_env.js
// Restart=on-failure

// [Install]
// WantedBy=multi-user.target

// `
// fs.writeFileSync('/lib/systemd/system/tomcat-hub.service', script);
tomcat.config.setServer("172.16.2.10", 8084);
export class MyService implements IMeshService {
    constructor(public definition: ServiceDefinition) {

    }
    getInformation(): tomcat.Infrastructure.Mesh.ServiceInformation {
        return {
            category: 'strategy',
            parameters: {},
            status: 'start'
        }
    }
    async start(ctx?: tomcat.Infrastructure.Mesh.IMeshServiceContext): Promise<unknown> {
        (ctx);
        const store = await ctx.getHelper().getRedisStore("my_service");
        const repo = store.getRepository<{ id: string, name: string }>('test');
        await repo.insert({ id: tomcat.utils.randomName('user', 5), name: 'paria' });
        return null;

    }
    Id: string;

}
const node = tomcat.getHostBuilder('some-service')
    .addMessageBus()
    .addMeshService({ category: 'strategy', parameters: { name: 'babak' } }, (def) => new MyService(def))
    .build();


node.start();

node.node.startService({ category: 'strategy', parameters: { name: 'babak' } })


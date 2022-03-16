import fetch from "node-fetch";

import tomcat from "../src";
import { ApiServiceNode } from "../src/pipes/apipipeline"


jest.setTimeout(50000);

describe('API', () => {
    test('01 ', async () => {

        const id = "12";
        const a = [];
        a.push(id);
        a[id] = true;


        const port1 = 3001;// await tomcat.utils.findPort(3000, 4000);
        const port2 = 3002;// await tomcat.utils.findPort(4000, 5000);
        const port3 = 3003; // await tomcat.utils.findPort(5000, 6000);
        const node1 = tomcat.getBotBuilder('node1')
            .addHostedService((s) => new ApiServiceNode(s,
                [{ name: 'service1', params: {} },
                {
                    name: 'indicator', params: { name: "rsa" }, handler: async x => {
                        x.data.logs.push(x.data.memory["paria"])
                        return x
                    }
                }]

            ))
            .buildWebHost('express');
        const node2 = tomcat.getHostBuilder('node2')
            .addHostedService((s) => new ApiServiceNode(s,
                [{
                    name: 'service2', params: {}, handler: async x => {
                        x.data.memory = x.data.memory || {};
                        x.data.memory['service2'] = `service 2 called with ${JSON.stringify(x.data.params)}`
                        return x
                    }
                }], `http://localhost:${port1}`))
            .buildWebHost('express');
        const node3 = tomcat.getHostBuilder('node3')
            .addHostedService((s) => new ApiServiceNode(s,
                [{ name: 'service3', params: {} }], `http://localhost:${port2}`))
            .buildWebHost('express');
        await node1.listen(port1);
        await node2.listen(port2);
        await node3.listen(port3);
        const resp = await (await fetch(`http://localhost:${port1}/api/stat`)).text();
        (resp);
        const resp1 = await (await fetch(`http://localhost:${port1}/api/stat`, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: '',
                peers: [{
                    url: `http://localhost:3001`
                }]
            })
        })).text();
        (resp1);
        await tomcat.utils.delay(3000);
        const target = node2.services.getService<ApiServiceNode>("ApiServiceNode");

        const _resp = await target.call('indicator', { 'name': 'rsa' }, { memory: { paria: "mahmoudi" } });
        (target);
        (_resp);








    })

});
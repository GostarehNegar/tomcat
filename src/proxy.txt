import { createProxy } from "node-tcp-proxy";
// https://github.com/tewarid/node-tcp-proxy
const newProxy = createProxy(8080, "localhost", 2395, {
    upstream: function (context, data) {

        console.info('upstream', context.proxySocket.remoteAddress, 'data=')
        // console.log(util.format("Client %s:%s sent:",
        //     context.proxySocket.remoteAddress,
        //     context.proxySocket.remotePort));
        // do something with the data and return modified data
        return data;
    },
    downstream: function (context, data) {
        console.info('downstream', context.serviceSocket.remoteAddress)
        // console.log(util.format("Service %s:%s sent:",
        //     context.serviceSocket.remoteAddress,
        //     context.serviceSocket.remotePort));
        // do something with the data and return modified data
        return data;
    },
    serviceHostSelected: function (proxySocket, i) {
        console.info('selected', proxySocket.remoteAddress, 'i', i)
        // console.log(util.format("Service host %s:%s selected for client %s:%s.",
        //     serviceHosts[i],
        //     servicePorts[i],
        //     proxySocket.remoteAddress,
        //     proxySocket.remotePort));
        // // use your own strategy to calculate i
        return i;
    }
});
(newProxy);

import { utils } from '../src/lib';
import { WebSocketTransport } from '../src/lib/bus/_implementations'
import { MessageBus } from '../src/lib/bus/index';
import hosts from '../src/lib/hosting/implementations/HostCollection';


const bus = new MessageBus();

describe('WebSocketTransport', () => {
    //const ws = await transport.open();

    test('send', async () => {
        const port = 8083
        const host = hosts.getHostBuilder("host")
            .addWebSocketHub()
            .buildWebHost();

        await host.listen(port)
        const transport = new WebSocketTransport(cf => {
            cf.url = `http://localhost:${port}/hub`

        });

        const m = bus.createMessage('topic', { 'name': 'babak' });
        await transport.open({ endpoint: bus.endpoint });
        await transport.pubish(m);
        await utils.delay(1000)
        await transport.close();
        await host.stop();
    });



})
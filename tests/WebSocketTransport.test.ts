
import { utils } from '../src/lib';
import hosts from '../src/lib/hosting/internals/HostCollection';
import { MessageBus } from '../src/lib/MessageBus/Internals/MessageBus';
import { WebSocketTransport } from '../src/lib/MessageBus/WebSocketTranstport'


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
        await transport.open({ channel: bus.channelName });
        await transport.pubish(m);
        await utils.delay(1000)
        await transport.close();
        await host.stop();
    });



})
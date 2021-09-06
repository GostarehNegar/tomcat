import tomcat from "../src"

const MessageBus = tomcat.Index.Bus.MessageBus
const WebSocketTransport = tomcat.Index.Bus.WebSocketTransport

const bus = new MessageBus();

describe('WebSocketTransport', () => {
    //const ws = await transport.open();

    test('send', async () => {
        const port = 8083
        const host = tomcat.hosts.getHostBuilder("host")
            .addWebSocketHub()
            .buildWebHost();

        await host.listen(port)
        const transport = new WebSocketTransport(cf => {
            cf.url = `http://localhost:${port}/hub`

        });

        const m = bus.createMessage('topic', { 'name': 'babak' });
        await transport.open({ endpoint: bus.endpoint });
        await transport.pubish(m);
        await tomcat.utils.delay(1000)
        await transport.close();
        await host.stop();
    });



})
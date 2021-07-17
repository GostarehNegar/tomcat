
import { MessageBus } from '../src/lib/MessageBus/MessageBus';
import { WebSocketTransport } from '../src/lib/MessageBus/WebSocketTranstport'

const transport = new WebSocketTransport();
const bus = new MessageBus();

describe('websockt transport', () => {
    //const ws = await transport.open();

    test('send', async () => {
        const m = bus.createMessage('topic', null, { 'name': 'babak' });
        await transport.open({ channel: bus.channelName });

        await transport.pubish(m);
        await transport.close();
    });



})
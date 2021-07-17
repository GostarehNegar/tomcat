import { MessageBus } from '../src/lib/MessageBus/Implementations'

const bus = new MessageBus();
afterAll(async () => {
    await bus.stop();

});
describe('bus', () => {
    test('test', () => {
        var body = { name: "babak" }
        const message = bus.createMessage("test", null, body);
        message.message.headers["on"] = Date.now().toString();
        expect(message.message.topic).toBe("test");
        expect(message.message.payload).toBe(body);
    });
    test('subscribe', async () => {

        let called = null;
        let called_count = 0;
        bus.subscribe("topic", ctx => {
            (ctx);
            //console.log(ctx.message);
            called = ctx.message;
            called_count++;
            return Promise.resolve();
        });
        await bus.createMessage("topic")
            .publish();

        await bus.createMessage("topic2")
            .publish();

        expect(called_count).toBe(1);
        expect(called).not.toBeNull()
    });
    test('subcribe to specific channel', async () => {

        let count1 = 0;
        let count2 = 0;
        let count3 = 0;
        let count4 = 0;
        bus.subscribe("babak@hp://request1", ctx => {
            count1++;
            (ctx)
            return Promise.resolve();
        });

        bus.subscribe("*@hp://request1", ctx => {
            (ctx)
            count2++;
            return Promise.resolve();
        });
        bus.subscribe("*://request1", () => {
            count3++;
            return Promise.resolve();
        });
        bus.subscribe('request1', ctx => {
            (ctx)
            count4++;
            return Promise.resolve();
        });

        await bus.createMessage('babak@hp://request1')
            .publish();
        expect(count1).toBe(1);
        expect(count2).toBe(1);
        expect(count3).toBe(1);
        expect(count4).toBe(0);

        await bus.createMessage('*://request1')
            .publish();
        expect(count1).toBe(2);
        expect(count2).toBe(2);
        expect(count3).toBe(2);
        expect(count4).toBe(1);

        await bus.createMessage('babak@mobile://request1')
            .publish();
        expect(count1).toBe(2);
        expect(count2).toBe(2);
        expect(count3).toBe(3);
        expect(count4).toBe(1);







    })
    test('reply', async () => {
        bus.subscribe("request", ctx => {
            ctx.reply("reply");
            return Promise.resolve();
        });

        const response = await bus
            .createMessage("request", null, "ping")
            .execute()

        expect(response).not.toBeNull();
    });
    // test('transport', async () => {

    //     await bus.start();
    //     var message = bus.createMessage("topic", { name: "babak", lastName: 'mahmoudi' })
    //     message.message.headers["key"] = "value";

    //     await message
    //         .publish();
    //await bus.stop();


    // });

});
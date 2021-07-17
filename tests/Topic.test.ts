import { MessageTopic } from "../src/lib/MessageBus/Internals/Topics";

describe('message bus topics', () => {

    test('toString works', () => {

        const topic = new MessageTopic("some-topic", "babak@hp",).toString();
        expect(topic).toBe('babak@hp://some-topic')

    });

    test('parse works', () => {

        const topic = MessageTopic.parse(new MessageTopic("some-topic", "babak@hp",).toString());

        expect("some-topic").toEqual(topic.topic)
        expect("babak@hp").toEqual(topic.channel)
    });

});
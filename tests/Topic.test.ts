import { MessageTopic } from "../src/lib/MessageBus/Internals/Topics";

describe('Topics', () => {
    test('should correctly encode topic and channel to channel://topic ', () => {

        const topic = new MessageTopic("some-topic", "babak@hp",).toString();
        expect(topic).toBe('babak@hp://some-topic')

    });
    test('should correctly parse encoded strings like "chanel://topic"', () => {

        const topic = MessageTopic.parse(new MessageTopic("some-topic", "babak@hp",).toString());

        expect("some-topic").toEqual(topic.topic)
        expect("babak@hp").toEqual(topic.channel)
    });

});
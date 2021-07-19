import locator from "../src/lib/base/ServiceContainer";
import { Logger } from "../src/lib/base/logger"
import '../src/lib/base';



describe('ServiceLocator', () => {

    test('registeration', () => {
        locator.register("sample-service", "sample-value-1");
        locator.register("sample-service", "sample-value");
        locator.register("sample-service1", () => "sample-value1");
        locator.register("sample-service", "some-other-value", true);
        expect(locator.getService("sample-service") == "sample-value");
        expect(locator.getService("sample-service1") == "sample-value1");
        expect(2).toBe(locator.getServices("sample-service").length);
        expect("sample-value").toBe(locator.getService("sample-service"));


    });

});
describe('logger works', () => {
    test('should create logger', () => {
        const logger = Logger.getLogger("test");
        const logger2 = Logger.getLogger("test");
        (logger);
        (logger2);
        logger.log("hi", logger2)



    });
});
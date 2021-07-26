import { IServiceProvider, ServiceProvider } from "../src/lib/base/ServiceProvider";
import { Logger } from "../src/lib/base/logger"
import '../src/lib/base';
import '../src/lib/extensions'
const provider = new ServiceProvider() as IServiceProvider;



describe('ServiceLocator', () => {

    test('registeration', () => {
        provider.register("sample-service", "sample-value-1");
        provider.register("sample-service", "sample-value");
        provider.register("sample-service1", () => "sample-value1");
        provider.register("sample-service", "some-other-value", true);
        expect(provider.getService("sample-service") == "sample-value");
        expect(provider.getService("sample-service1") == "sample-value1");
        expect(2).toBe(provider.getServices("sample-service").length);
        expect("sample-value").toBe(provider.getService("sample-service"));



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
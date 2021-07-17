import locator from "../src/lib/base/ServiceLocator";

describe('ServiceLocator', () => {

    test('registeration', () => {

        locator.register("sample-service", "sample-value-1");
        locator.register("sample-service", "sample-value");
        locator.register("sample-service1", () => "sample-value1");
        expect(locator.getService("sample-service") == "sample-value");
        expect(locator.getService("sample-service1") == "sample-value1");
        expect(2).toBe(locator.getServices("sample-service").length);
        expect("sample-value").toBe(locator.getService("sample-service"));


    });

});
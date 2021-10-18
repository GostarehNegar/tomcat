import tomcat from "../../src";

const hosts = tomcat.hosts
const utils = tomcat.utils;

describe('HostCollection', () => {

    test('should build a host with correct name.', async () => {

        const name = 'some-host';
        const host = hosts
            .getHostBuilder(name)
            .build();
        expect(hosts.getByName(name)).not.toBeNull();
        expect(hosts.getByName(name).name).toEqual(name);
        expect(hosts.getByName(name).name).toEqual(host.name);
        await utils.delay(1000);
    });
    test('when a host is created it should be accessible as current.', async () => {
        const name = 'some-host' + Math.random();
        hosts.getHostBuilder(name)
            .build();
        expect(hosts.current.name).toBe(name);

    });

});



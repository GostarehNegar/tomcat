
import * as impl from '../src/lib/implementations'
const hosts = impl.Hosting.hosts;
const utils = impl.Base.utils;

describe('HostCollection', () => {

    test('builds hosts', async () => {

        const name = 'some-host';
        const host = hosts
            .getDefualtBuilder(name)
            .build();
        expect(hosts.getByName(name)).not.toBeNull();
        expect(hosts.getByName(name).name).toEqual(name);
        expect(hosts.getByName(name).name).toEqual(host.name);
        await utils.delay(1000);

    });

});



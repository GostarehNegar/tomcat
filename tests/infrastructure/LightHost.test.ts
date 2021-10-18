import axios from 'axios';

import tomcat from '../../src'

jest.setTimeout(20000);
describe('LightHost', () => {
    test('should create light host', async () => {
        const expected_reply = 'hi there';
        const port = 3000;
        const host = tomcat
            .hosts
            .getHostBuilder("light")
            .buildWebHost('light');
        host.use((ctx) => {
            ctx.response.write(expected_reply);
            ctx.response.end();
            ctx.getLogger().log()
            return Promise.resolve();
        }, { 'name': 'll', params: { kk: 'll', kkk: 12 } });
        await host.listen(port);
        const res = await axios.get(`http://localhost:${port}?ll=1`);
        (res)
        await host.stop();
        expect(res.data).toBe(expected_reply);
    });

    test('should forward to peer', async () => {
        const port1 = 3100;
        const port2 = 3101;
        const expected_reply = 'reply';
        const host = tomcat
            .hosts
            .getHostBuilder("light")
            .buildWebHost('light');
        host.use(ctx => {
            (ctx)
            return Promise.resolve();
        });
        await host.listen(port1);
        host.addPeer(`http://localhost:${port2}`)
        const host2 = tomcat
            .hosts
            .getHostBuilder("light")
            .buildWebHost('light');
        host2.use(ctx => {
            ctx.response.write(expected_reply);
            ctx.response.end();
            return Promise.resolve();
        });
        await host2.listen(port2);
        const res = await axios.get(`http://localhost:${port1}/test`);
        (res)
        await host.stop();
        await host2.stop();
        expect(res.data).toBe(expected_reply);

    });

    test('should propogate peers', async () => {
        const port1 = 3200;
        const port2 = 3201;
        const port3 = 3202;
        const expected_reply = 'reply';
        const host = tomcat
            .hosts
            .getHostBuilder("light")
            .buildWebHost('light');
        host.use(ctx => {
            (ctx)
            return Promise.resolve();
        });
        await host.listen(port1);
        host.addPeer(`http://localhost:${port2}`)
        host.addPeer(`http://localhost:${port3}`)
        const host2 = tomcat
            .hosts
            .getHostBuilder("light")
            .buildWebHost('light');
        host2.use(ctx => {
            if (ctx.request.url == '/host2') {
                ctx.response.write(expected_reply);
                ctx.response.end();
            }
            return Promise.resolve();
        });
        const host3 = tomcat
            .hosts
            .getHostBuilder("light")
            .buildWebHost('light');
        host3.use(ctx => {
            if (ctx.request.url == '/host3') {
                ctx.response.write(expected_reply);
                ctx.response.end();
            }
            return Promise.resolve();
        });
        await host2.listen(port2);
        await host3.listen(port3);
        const res = await axios.get(`http://localhost:${port1}/host3`);
        expect(res.data).toBe(expected_reply);
        expect(axios.get(`http://localhost:${port1}/host4`)).rejects.toThrow()

        //
        await host.stop();
        await host2.stop();
        await host3.stop();


    });

    test('tor', async () => {
        //const res = await axios.get(`http://localhost:${port1}/host3`);
        const res = await axios.get('https://youtube.com', {
            // `proxy` means the request actually goes to the server listening
            // on localhost:3000, but the request says it is meant for
            // 'http://httpbin.org/get?answer=42'
            proxy: {
                host: 'tor',
                port: 8118
            }
        });
        console.log(res);


    });

});
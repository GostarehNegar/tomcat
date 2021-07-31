import axios from 'axios';
import tomcat from '../src/index'
(axios);
(tomcat);
jest.setTimeout(20000);
describe('LightHost', () => {
    test('should create light host', async () => {
        const expected_reply = 'hi there';
        const port = 3000;
        const host = tomcat
            .hosts
            .getHostBuilder("light")
            .buildWebHost('light');
        host.use(ctx => {
            (ctx)
            ctx.response.write(expected_reply);
            ctx.response.end();
            return Promise.resolve();
        });
        await host.listen(port);
        const res = await axios.get(`http://localhost:${port}`);
        (res)
        await host.stop();
        expect(res.data).toBe(expected_reply);
    });

    test('binance', async () => {
        const expected_reply = 'hi there';
        const port = 3000;
        const host = tomcat
            .hosts
            .getHostBuilder("light")
            .buildWebHost('light');
        host.use(ctx => {
            if (ctx.request.url == '/data') {
                ctx.response.write(expected_reply);
                ctx.response.end();
            }
            return Promise.resolve();
        });
        await host.listen(port);
        const res = await axios.get(`http://localhost:${port}/data`);
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
        const res = await axios.get(`http://172.16.6.158:${port1}/test`);
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
        const res = await axios.get(`http://172.16.6.158:${port1}/host3`);
        expect(res.data).toBe(expected_reply);
        expect(axios.get(`http://172.16.6.158:${port1}/host4`)).rejects.toThrow()

        //
        await host.stop();
        await host2.stop();
        await host3.stop();


    });

});
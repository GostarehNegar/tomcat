import { CanellationToken, ServerBuilder, IServerTask } from "../src/lib/server/ServerBuilder";

class dummyTask extends IServerTask {
    public started = false;
    public stopped = false;
    public name: string = "dummy-task";

    protected run(token: CanellationToken): Promise<void> {
        (token)
        return Promise.resolve();
    }
    start(): Promise<void> {
        this.started = true;
        return super.start();
    }
    stop(): Promise<void> {
        this.stopped = true;
        return super.stop();
    }
}

describe('ServerBuilder', () => {

    test('how server builder works', async () => {
        const builder = new ServerBuilder();
        var server = builder
            .addService("my-service", "my-service-value")
            .build();
        expect("my-service-value").toBe(server.services.getService("my-service"));
    });
    test('server tasks are started', async () => {
        const builder = new ServerBuilder();
        const task = new dummyTask();
        var server = builder
            .addService("my-service", "my-service-value")
            .addTask(task)
            .build();
        await server.start();
        const tasks = server.services.getServices("_SERVER_TASK_");
        (tasks)
        expect(task.started);
        await server.stop();
        expect(task.stopped);

    });


});
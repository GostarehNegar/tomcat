export default {
    start_args: {
        service_definition: {}
    },
    internet: {
        proxy: {
            url: ''
        }
    },
    messaging: {
        endpoint: `<noname>` as string | undefined,
        transports: {
            websocket: {
                url: 'http://localhost:8082/hub',
                diabled: false,
            },
        },
    },
    mesh: {
        heartBeatInSeconds: 5,
    },
    data: {
        redis: { /**
    * The url to redis server.
    * null: localhost.
    * 'redis://redis:6379': connect to redis in this container.
    */
            url: "redis://localhost:6379",
            publicUrl: null,
        },
        redisEx: { host: "redis://localhost:6379" }

    },
}
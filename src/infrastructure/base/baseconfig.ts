export default {

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
    data: {
        redis: { /**
    * The url to redis server.
    * null: localhost.
    * 'redis://redis:6379': connect to redis in this container.
    */
            url: null,
            publicUrl: null,
        }
    },
}
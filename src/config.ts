import baseconfig from "./infrastructure/base/baseconfig";



export const config = {
  infrastructure: baseconfig,
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
  messaging: {
    endpoint: `<noname>` as string | undefined,
    transports: {
      websocket: {
        url: 'http://localhost:8080/hub',
        diabled: false,
      },
    },
  },
  proxy: {
    url: ''
  }
};

export default config;

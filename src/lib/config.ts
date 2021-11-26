import { redisConfig } from "./infrastructure/data";

export const config = {
  data:{
    redis: redisConfig
  },
  messaging: {
    channel: `smaple-${Math.random()}` as string | undefined,
    transports: {
      websocket: {
        url: 'http://localhost:8080/hub',
        diabled: false,
      },
    },
  },
};

export default config;

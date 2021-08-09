export const config = {
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

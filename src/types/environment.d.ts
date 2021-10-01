declare global {
  namespace NodeJS {
    interface ProcessEnv {
      redis_host: string;
      tor_host:string;
      NODE_ENV: 'development' | 'production';
    }
  }
}
export {}
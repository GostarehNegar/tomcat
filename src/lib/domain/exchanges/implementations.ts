import { IServiceProvider } from "../../base"
let config = {
    name: 'kk'
}

export function configureBinanceServices(cb?: ((cfg: typeof config) => void)) {
    cb ? cb(config) : (1);
    return (s: IServiceProvider) => {
        s.register("___L", "");
    }
}
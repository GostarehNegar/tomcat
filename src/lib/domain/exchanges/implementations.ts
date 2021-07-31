import { IServiceProvider } from "../../base"

export function addBinanceServices(cfg: { name: string }) {
    (cfg)
    return (s: IServiceProvider) => {
        s.register("___L", "");
    }
}
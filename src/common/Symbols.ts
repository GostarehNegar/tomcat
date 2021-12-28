export type Symbols = 'BTCUSDT' | 'ETHUSDT' | "SHIBUSDT" | 'SHIB/USDT' | 'BTC/USDT' | 'DOGE/USDT';

export type Currencies = 'BTC' | 'ETH' | 'DOGE' | 'SHIB' | 'XRBP';

export function getSymbol(currency: Currencies): Symbols {
    return (currency + '/USDT') as Symbols
}

// import { ICandelStickData } from "../src/lib/domain/base/_interfaces"
// import { Wallet } from "../src/lib/domain/wallet/wallet"
// import { Order } from "../src/lib/domain/bot/bot"

// describe("wallet test", () => {
//     test('should add trade and pnl', () => {
//         const a: ICandelStickData = { close: 50, open: 2, closeTime: 5, high: 1, low: 5, openTime: 5, indicators: { ATR14: 1 } }
//         const b: ICandelStickData = { close: 60, open: 2, closeTime: 5, high: 1, low: 5, openTime: 5, indicators: { ATR14: 2 } }
//         const order1 = new Order(a, "short", 'future', "ATR14", 'BTCUSDT')
//         const order2 = new Order(b, 'long', 'future', "ATR14", 'BTCUSDT')
//         const wallet = new Wallet(1000)
//         wallet.orderProcess(order1)
//         wallet.orderProcess(order2)
//         expect(wallet.tradeList.items.length).toBe(2)
//         expect(wallet.Balance).toBe(1750)
//     })

// })
// import axios from 'axios';
import tomcat from '../src'
const host = tomcat.hosts.getHostBuilder("myServer")
    .addBinance()
    .buildWebHost()
host.listen(3000);
// (async function () {

//     const res = await axios.get(`http://localhost:3000/data/binance/future?symbol=BTCUSDT`);
//     console.log(res);

// })();

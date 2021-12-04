import tomcat from '.'
tomcat.config.data.redis.url = "redis://redis:6379";
//import { CandleStickData } from '@gostarehnegar/tomcat/build/main/lib/common';
//const client = tomcat.Infrastructure.Data.createRedistClient();
(async () => {

    tomcat.utils.UUID();
    tomcat.services.getClock();

})();


// const ok = client.set("paria", "mahmoudi", (err) => {
//     console.log(err);

// });
// console.log(ok);




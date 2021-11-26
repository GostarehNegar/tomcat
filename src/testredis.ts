import tomcat from '.'
tomcat.config.data.redis.url = "redis://redis:6379"
//import { CandleStickData } from '@gostarehnegar/tomcat/build/main/lib/common';
const client = tomcat.Infrastructure.Data.createRedistClient();
(async () => {
    return new Promise((resolve, reject) => {
        client.info((err) => {
            if (err) {
                console.log(err);
                reject(err)
            }
            else {
                client.set("paria1", "mahmoudi1", (e, i) => {
                    if (e) {
                        console.log(e);
                        reject(e);

                    }
                    else {
                        console.log('succcess');
                        resolve(i)
                    }

                });
            }


        });

    })

})();


// const ok = client.set("paria", "mahmoudi", (err) => {
//     console.log(err);

// });
// console.log(ok);




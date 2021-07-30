import { PipelineBuilder } from '../src/lib/Pipeline/Implementations'

import axios from 'axios'

const pipeline = new PipelineBuilder()
    .use(async (ctx, next) => {
        if (ctx.req.url == '/t1') {
            //console.log(res.data);
            ctx.res.write("t1");
            ctx.res.end();
        }
        else
            return next(ctx);

    })

    .use(async (ctx, next) => {
        if (ctx.req.url == '/test') {
            const res = await axios.get("http://localhost:8080/data", {
                data: { name: 'babak' },
            })
            //console.log(res.data);
            ctx.res.write(res.data);
            ctx.res.end();
        }
        else
            return next(ctx);

    })
    // .use(async (ctx, next) => {
    //     if (ctx.req.url == '/data') {
    //         ctx.res.write("some-data");
    //         return;

    //     }
    //     return next(ctx);

    // })
    .build();
const pipeline1 = new PipelineBuilder()
    .use(async (ctx, next) => {
        if (ctx.req.url == '/data') {
            ctx.res.write("some-data");
            ctx.res.end();

            return;

        }
        return next(ctx);

    })
    .build()


pipeline.listen(8080);
pipeline1.listen(8081);


(async () => {
    setInterval(async () => {
        const res = await axios.get("http://localhost:8080/test", {
            data: { name: 'babak' },
        })
        console.log(res.data);
    }, 2000)

})();



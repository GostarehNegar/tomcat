import tomcat from ".";

const host = tomcat
    .hosts
    .getHostBuilder("bot")
    .addMessageBus((cfg) => { cfg.transports.websocket.diabled = true })
    .buildWebHost();
host.use(async (ctx) => {
    if (ctx.request.url == "/ping") {
        ctx.response.write("hello world!")
        ctx.response.end()

    }
    console.log(ctx.request);
})
console.log("listening.....");

host.listen(8080);
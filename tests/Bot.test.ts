import tomcat from "../src";

describe('BotTests', () => {
    test('botbuilder', async () => {
        const host = tomcat.getBotBuilder("test")
            .addMeshService(cfg => cfg.userServiceConstructor(null, null, null));





    });

});
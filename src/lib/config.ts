
export let config = {
    "messaging": {
        "channel": `smaple-${Math.random()}`,
        "transports": {
            "websocket": {
                "url": 'http://localhost:8080/hub'

            }

        }
    }

}

export default config;
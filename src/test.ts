import fs from "fs";

const script =
    `
[Unit]
Description=hello_env.js - making your environment variables rad
Documentation=https://example.com
After=network.target

[Service]
Environment=NODE_PORT=3001
Type=simple
User=ubuntu
ExecStart=/usr/bin/node /home/ubuntu/hello_env.js
Restart=on-failure

[Install]
WantedBy=multi-user.target

`
fs.writeFileSync('/lib/systemd/system/tomcat-hub.service', script);
ARG VARIANT="16-buster"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}
RUN mkdir /app
WORKDIR /app
RUN git clone https://github.com/GostarehNegar/tomcat.git
WORKDIR /app/tomcat
RUN yarn install
CMD ["npm","run","run"]
EXPOSE 8084
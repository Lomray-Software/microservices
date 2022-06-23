# NodeJS Microservices based on [microservice-nodejs-lib](https://github.com/Lomray-Software/microservice-nodejs-lib)

![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![Build staging](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml/badge.svg?branch=staging)](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml)   
[![Build prod](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml/badge.svg?branch=prod)](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml)

## Microservices list:
 - [Gateway](microservices/gateway)
 - [Configuration](microservices/configuration)
 - [Authentication](microservices/authentication)
 - [Authorization](microservices/authorization)
 - [Notification](microservices/notification)
 - [Users](microservices/users)
 - [Attachments](microservices/attachments)
 
Use `npm run create-microservice name` for create new microservice from template.

## How to start
Use [docker-compose](docker-compose.yml) to run all in one command (`docker-compose up`) or:

1. Run `Inverted Json` job server.
```bash
docker run -it -p 8001:8001 lega911/ijson --log 47
```
2. Run `gateway` microservice.
```bash
docker run -it -p 8001:8001 ghcr.io/lomray-software/microservices/gateway:latest-staging
```
3. Run other needed microservices (the same actions as in step 2, just replace docker image).
4. That is all. Check it:
```bash
curl -X POST http://127.0.0.1:3000
   -H 'Content-Type: application/json'
   -d '{"id":"unique-id-1","method":"microservice-name.method","params":{}}'
```

[Chek all available microservices](https://github.com/orgs/Lomray-Software/packages?repo_name=microservices)   

Microservices also available like npm packages:   
```bash
npm i --save @lomray/microservice-NAME

# for e.g.
npm i --save @lomray/microservice-configuration
```

## Complete example

Just run:
```bash
git clone git@github.com:Lomray-Software/microservices.git
cd example
docker-compose up
```

see example requests in file `requests.http`

## Integration tests
1. Run all microservices
2. Run commands:
```bash
cd tests
npm run test
```

## TODO
- [ ] Add api service generator (backend) (generate api service for microservices based on metadata endpoint)
- [ ] Add api service generator (frontend)

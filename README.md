# NodeJS Microservices based on [microservice-nodejs-lib](https://github.com/Lomray-Software/microservice-nodejs-lib)

![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Staging: [![Build staging](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml/badge.svg?branch=staging)](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml)   
Prod: [![Build prod](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml/badge.svg?branch=prod)](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml)

## Microservices list:
 - [Authentication](microservices/authentication)
 - [Authorization](microservices/authorization)
 - [Configuration](microservices/configuration)
 - [Cron](microservices/cron)
 - [Files](microservices/files)
 - [Gateway](microservices/gateway)
 - [Notification](microservices/notification)
 - [Users](microservices/users)
 
## Use [CLI](https://github.com/Lomray-Software/microservices-cli) to start your own art.

## How to investigate it

### Method 1:
Use docker to run all in one command:
```bash
docker-compose -f docker-compose.yml -f docker-compose.ms.yml up
```

### Method 2
1. Run `Inverted Json` job server and `postgres` database.
```bash
docker-compose up
```
2. Run `configuration` microservice.
 - Through docker:
```bash
docker-compose -f docker-compose.ms.yml up configuration
```
 - Through node:
```bash
cd microservices/configuration
npm i
npm run start:dev
```
3. Run other needed microservices (the same actions as in step 2).

#### **That is all. Check it:**
```bash
curl -X POST http://127.0.0.1:3000
   -H 'Content-Type: application/json'
   -d '{"id":"unique-id-1","method":"microservice-name.method","params":{}}'
```

see example requests in `http-requests` folder

[Chek all available microservices](https://github.com/orgs/Lomray-Software/packages?repo_name=microservices)   

Microservices also available like npm packages:   
```bash
npm i --save @lomray/microservice-NAME

# for e.g.
npm i --save @lomray/microservice-configuration
```

## Integration tests
1. Run all microservices
2. Run commands:
```bash
cd tests
npm run test
```

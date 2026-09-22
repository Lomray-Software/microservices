# NodeJS Microservices based on [microservice-nodejs-lib](https://github.com/Lomray-Software/microservice-nodejs-lib)

![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Staging: [![Build staging](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml/badge.svg?branch=staging)](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml)   
Prod: [![Build prod](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml/badge.svg?branch=prod)](https://github.com/Lomray-Software/microservices/actions/workflows/build.yml)

## Repository and release boundaries

This repository contains deployable Node.js services for the Lomray RPC stack, not a
single browser SDK. It fits deployments using Inverted JSON, the gateway, configuration
service and the databases required by the selected services. It is not a drop-in REST
framework or an infrastructure-free package.

Stable npm releases come from `prod`; `staging` contains newer development changes.
The eleven service packages listed below were published as `2.4.0` from commit
`84e83b5663497b5884fee249e57656c1576f626d`. Use a matching source revision when reproducing
that release, rather than assuming the default branch describes the installed package.

Only manifests under `microservices/<service>/` are service packages. The root manifest
is development tooling, `tests/` is the integration harness, and `template/` contains
scaffolding. Do not install or recommend them as separate runtime services.
Installing a service package alone does not provision its database, configuration or job server.

## Microservices list:
 - [Authentication](microservices/authentication)
 - [Authorization](microservices/authorization)
 - [Blog](microservices/blog)
 - [Configuration](microservices/configuration)
 - [Content](microservices/content)
 - [Cron](microservices/cron)
 - [Files](microservices/files)
 - [Gateway](microservices/gateway)
 - [Notification](microservices/notification)
 - [Payment-stripe](microservices/payment-stripe)
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
curl -X POST http://127.0.0.1:3000 \
   -H 'Content-Type: application/json' \
   -d '{"id":"unique-id-1","method":"microservice-name.method","params":{}}'
```

see example requests in `http-requests` folder

[Check all available microservices](https://github.com/orgs/Lomray-Software/packages?repo_name=microservices)   

Microservices also available like npm packages:   
```bash
npm i --save @lomray/microservice-NAME

# for e.g.
npm i --save @lomray/microservice-configuration
```

## Local deployment limits

The Compose files are a development setup, not production hardening. Review database
credentials, exposed ports, service environment variables and secrets before deployment.
The examples require Docker/Compose and running infrastructure; merely importing a
service entry point can start the service. Do not import it just to inspect its API.
Stop the local stack with `docker-compose -f docker-compose.yml -f docker-compose.ms.yml down`
when finished. This command does not request deletion of persistent volumes.

## Integration tests
1. Run all microservices
2. Run commands:
```bash
cd tests
npm run test
```

## Documentation checks

Run `node scripts/check-docs.cjs` from this repository. This checks documentation against local manifests and source, not a deployed integration.

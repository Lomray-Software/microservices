# Kety API.

Based on microservice architecture.

[![Build staging](https://github.com/Kety-Inc/kety-api/actions/workflows/build.yml/badge.svg?branch=staging)](https://github.com/Kety-Inc/kety-api/actions/workflows/build.yml)   
[![Build prod](https://github.com/Kety-Inc/kety-api/actions/workflows/build.yml/badge.svg?branch=prod)](https://github.com/Kety-Inc/kety-api/actions/workflows/build.yml)

## Microservices list:
 - [Gateway](microservices/gateway)
 - [Configuration](microservices/configuration)
 - [Authentication](microservices/authentication)
 - [Authorization](microservices/authorization)
 - [Notification](microservices/notification)
 - [Users](microservices/users)
 
Use `npm run create-microservice name` for create new microservice from template.

## How to start
Use [docker-compose](docker-compose.yml) to run all in one command (`docker-compose up`) or:

1. Run `Inverted Json` job server.
```bash
docker run -it -p 8001:8001 lega911/ijson --log 47
```
2. Run `gateway` microservice.
```bash
docker run -it -p 8001:8001 ghcr.io/kety-inc/kety-api/gateway:latest-staging
```
3. Run other needed microservices (the same actions as in step 2, just replace docker image).
4. That is all. Check it:
```bash
curl -X POST http://127.0.0.1:3000
   -H 'Content-Type: application/json'
   -d '{"id":"unique-id-1","method":"microservice-name.method","params":{}}'
```

## Complete example

Just run:
```bash
git clone git@github.com:Kety-Inc/kety-api.git
cd example
docker-compose up
```

see example requests in file `requests.http`

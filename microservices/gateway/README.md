Gateway
-------------------

RPC 2.0 Microservice. This is a single entry point for all clients.

![Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FLomray-Software%2Fmicroservices%2Fstaging%2Fmicroservices%2Fgateway%2Fpackage.json&label=Staging%20version&query=$.version&colorB=blue)  
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=microservice-gateway&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=microservice-gateway)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-gateway&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=microservice-gateway)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-gateway&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=microservice-gateway)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=microservice-gateway&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=microservice-gateway)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=microservice-gateway&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=microservice-gateway)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=microservice-gateway&metric=coverage)](https://sonarcloud.io/summary/new_code?id=microservice-gateway)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO RUN](#how-to-run)
- [HOW TO DEVELOP](#how-to-develop)
- [MEMORY USAGE](#memory-usage)

### <a id="environments"></a>ENVIRONMENTS:
- `MS_BATCH_LIMIT` - Batch JSON_RPC request size. Default: `5`
- `MS_INFO_ROUTE` - Gateway info route. Default: `/`
- `MS_JSON_LIMIT` - Limit of request body size in Megabyte (MB). Default: `30`
- `MS_REQ_TIMEOUT` - Gateway request timeout in sec. Default: `15`
- `MS_LISTENER_PORT` - Express listener port. Default: `3000`
- `MS_CORS_CONFIG` - Express CORS config. See [CORS](https://www.npmjs.com/package/cors) lib. Default: `{"origin":["http://localhost:3000"],"credentials":true}`
- [See full list `COMMON ENVIRONMENTS`](https://github.com/Lomray-Software/microservice-helpers#common-environments)

### <a id="how-to-run"></a>HOW TO RUN:
1. Run `Inverted Json` job server.
```bash
docker run -it -p 8001:8001 lega911/ijson --log 47
```
2. Run microservice (please, see `ENVIRONMENTS` above for understand config)
```
npm run start:dev
```
3. Make some request
```bash
curl localhost:8001/ms/gateway -d '{"id": "unique-id", "method": "demo", "params": {}}'
# or
curl localhost:3000 -d '{"id": "unique-id", "method": "demo", "params": {}}'
```

If you use `JetBrains` IDE, try to find run configurations in `.run`

You can also install microservice like npm package:
```bash
npm i --save @lomray/microservice-gateway
```

### <a id="how-to-develop"></a>HOW TO DEVELOP:
For develop this microservice, preferred use TDD technique.
You can run all tests with `watch` flag or run one test:
```
// case 1
npm run test -- --watch

// case 2
NODE_ENV=tests TS_NODE_COMPILER_OPTIONS='{"target":"es6"}' mocha --harmony --no-warnings  __tests__/your-test-name.ts --require ts-node/register --recursive --watch

// check code coverage
nyc npm run test
```

That is all. **Don't forget install npm dependencies**
(in root folder & local folder run:  `npm ci`)

### <a id="memory-usage"></a>MEMORY USAGE:

__AWS Memory__: ~160 MB

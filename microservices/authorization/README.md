authorization
-------------------

RPC 2.0 Microservice.  
This microservice provides authorization mechanism for all other microservices.

![Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FLomray-Software%2Fmicroservices%2Fstaging%2Fmicroservices%2Fauthorization%2Fpackage.json&label=Staging%20version&query=$.version&colorB=blue)  
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=microservice-authorization&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=microservice-authorization)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-authorization&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=microservice-authorization)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-authorization&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=microservice-authorization)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=microservice-authorization&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=microservice-authorization)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=microservice-authorization&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=microservice-authorization)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=microservice-authorization&metric=coverage)](https://sonarcloud.io/summary/new_code?id=microservice-authorization)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO RUN](#how-to-run)
- [HOW TO DEVELOP](#how-to-develop)
- [DEFAULT PERMISSIONS](#how-to-work-with-default-permissions)
- [MEMORY USAGE](#memory-usage)

### <a id="environments"></a>ENVIRONMENTS:
- `MS_DEFAULT_ROLE_ALIAS` - Default role alias for authenticated users. Default: `user`
- `MS_DEFAULT_PERMISSION_MIGRATION` - Apply migration with default permissions. Default: `0`
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
curl localhost:8001/ms/authorization -d '{"id": "unique-id", "method": "demo", "params": {}}'
```

If you use `JetBrains` IDE, try to find run configurations in `.run`

You can also install microservice like npm package:
```bash
npm i --save @lomray/microservice-authorization
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

### <a id="how-to-work-with-default-permissions"></a>DEFAULT PERMISSIONS:
Make needed changes in `permissions/list`.
For sync dumped permissions with db, run: `npm run sync:permissions`

### <a id="memory-usage"></a>MEMORY USAGE:
__AWS Memory__: ~160 MB

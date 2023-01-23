configuration
-------------------

RPC 2.0 Microservice.   
This microservice provides configuration for all other microservices. Single point for store configurations of microservices.

![npm (scoped)](https://img.shields.io/npm/v/@lomray/microservice-configuration)  
![Docker](https://img.shields.io/npm/v/@lomray/microservice-configuration?label=docker)  
![Docker prod](https://img.shields.io/badge/Docker%20prod-%3Alatest-blue)  
![Docker staging](https://img.shields.io/badge/Docker%20staging-%3Alatest--staging-orange)    
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=microservice-configuration&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=microservice-configuration)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-configuration&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=microservice-configuration)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-configuration&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=microservice-configuration)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=microservice-configuration&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=microservice-configuration)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=microservice-configuration&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=microservice-configuration)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=microservice-configuration&metric=coverage)](https://sonarcloud.io/summary/new_code?id=microservice-configuration)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO RUN](#how-to-run)
- [HOW TO DEVELOP](#how-to-develop)
- [MEMORY USAGE](#memory-usage)

### <a id="environments"></a>ENVIRONMENTS:
- `MS_INIT_CONFIGS` - JSON string for configure initial `Config` values. Default: `[]`
- `MS_INIT_MIDDLEWARES` - JSON string for configure initial `Middleware` values. Default: `[]`
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
curl localhost:8001/ms/configuration -d '{"id": "unique-id", "method": "demo", "params": {}}'
```

If you use `JetBrains` IDE, try to find run configurations in `.run`

You can also install microservice like npm package:
```bash
npm i --save @lomray/microservice-configuration
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

__AWS Memory__: ~130 MB

### Use [CLI](https://github.com/Lomray-Software/microservices-cli) to start your own art.

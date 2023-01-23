authentication
-------------------

RPC 2.0 Microservice.  
This microservice provides authentication mechanism for microservices.

![npm (scoped)](https://img.shields.io/npm/v/@lomray/microservice-authentication)  
![Docker](https://img.shields.io/npm/v/@lomray/microservice-authentication?label=docker)  
![Docker prod](https://img.shields.io/badge/Docker%20prod-%3Alatest-blue)  
![Docker staging](https://img.shields.io/badge/Docker%20staging-%3Alatest--staging-orange)  
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=microservice-authentication&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=microservice-authentication)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-authentication&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=microservice-authentication)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-authentication&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=microservice-authentication)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=microservice-authentication&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=microservice-authentication)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=microservice-authentication&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=microservice-authentication)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=microservice-authentication&metric=coverage)](https://sonarcloud.io/summary/new_code?id=microservice-authentication)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO RUN](#how-to-run)
- [HOW TO DEVELOP](#how-to-develop)
- [MEMORY USAGE](#memory-usage)

### <a id="environments"></a>ENVIRONMENTS:
- `MS_JWT_SECRET_KEY` - Secret key for generation JWT tokens. Required if you want to use JWT auth. Default: `undefined`
- `MS_JWT_PARAMS` - JSON string for configure JWT creation tokens method. See [IJwtParams](src/services/tokens/jwt.ts). Default: `{}`
- `IS_SECURE_COOKIE` - Set secure cookie for `returnType: cookies`. Default: `1`
- `IS_HTTPONLY_COOKIE` - Set httpOnly cookie for `returnType: cookies`. Default: `1`
- `COOKIE_SAME_SITE` - Set sameSite cookie for `returnType: cookies`. Default: `undefined`
- `COOKIE_DOMAIN` - Set cookie domain for `returnType: cookies`. Default: `undefined`
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
curl localhost:8001/ms/authentication -d '{"id": "unique-id", "method": "demo", "params": {}}'
```

If you use `JetBrains` IDE, try to find run configurations in `.run`

You can also install microservice like npm package:   
```bash
npm i --save @lomray/microservice-authentication
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

__AWS Memory__: ~140 MB

### Use [CLI](https://github.com/Lomray-Software/microservices-cli) to start your own art.

configuration
-------------------

RPC 2.0 Microservice.   
This microservice provides configuration for all other microservices. Single point for store configurations of microservices.

![Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FLomray-Software%2Fmicroservices%2Fstaging%2Fmicroservices%2Fconfiguration%2Fpackage.json&label=Staging%20version&query=$.version&colorB=blue)  
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarqube-proxy.lomray.com/status/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Reliability Rating](https://sonarqube-proxy.lomray.com/reliability/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Security Rating](https://sonarqube-proxy.lomray.com/security/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Vulnerabilities](https://sonarqube-proxy.lomray.com/vulnerabilities/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Lines of code](https://sonarqube-proxy.lomray.com/lines/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Coverage](https://sonarqube-proxy.lomray.com/coverage/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO RUN](#how-to-run)
- [HOW TO DEVELOP](#how-to-develop)
- [MEMORY USAGE](#memory-usage)

### <a id="environments"></a>ENVIRONMENTS:
- `NODE_ENV` - Can be `production` or `development` or `tests`. Default: `development`
- `MS_CONNECTION` - Invert json host and port (with protocol). Default: `http://127.0.0.1:8001`
- `MS_CONNECTION_SRV` - Invert json connection it is SRV record. Default: `false`
- `MS_NAME` - Microservice name. Default: `gateway`
- `MS_WORKERS` - Microservice queue workers count. Default: `1`
- `MS_ENABLE_REMOTE_MIDDLEWARE` - Enable remote middleware feature. Set `0` to disable. Default: `1` (enabled)
- `DB_URL` - Database url connection string. Default: `undefined`. Please use URL or credentials.
- `DB_HOST` - Database host. Default: `127.0.0.1`
- `DB_PORT` - Database port. Default: `5432`
- `DB_USERNAME` - Database user name. Default: `postgres`
- `DB_PASSWORD` - Database password. Default: `example`
- `DB_DATABASE` - Database db name. Default: `ms-configuration`
- `MS_INIT_CONFIGS` - JSON string for configure initial `Config` values. Default: `[]`
- `MS_INIT_MIDDLEWARES` - JSON string for configure initial `Middleware` values. Default: `[]`

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

__Run on typescript__: ~200 MB PEAK / ~180 MB  
__Run on JS__: ~36 MB PEAK / ~25 MB

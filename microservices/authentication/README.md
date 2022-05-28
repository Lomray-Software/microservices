authentication
-------------------

RPC 2.0 Microservice.  
This microservice provides authentication mechanism for microservices.

![Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FLomray-Software%2Fmicroservices%2Fstaging%2Fmicroservices%2Fauthentication%2Fpackage.json&label=Staging%20version&query=$.version&colorB=blue)  
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarqube-proxy.lomray.com/status/microservices-authentication?token=b6ab7058149225b55075f5564fe532c9)](https://sonarqube.lomray.com/dashboard?id=microservices-authentication)
[![Reliability Rating](https://sonarqube-proxy.lomray.com/reliability/microservices-authentication?token=b6ab7058149225b55075f5564fe532c9)](https://sonarqube.lomray.com/dashboard?id=microservices-authentication)
[![Security Rating](https://sonarqube-proxy.lomray.com/security/microservices-authentication?token=b6ab7058149225b55075f5564fe532c9)](https://sonarqube.lomray.com/dashboard?id=microservices-authentication)
[![Vulnerabilities](https://sonarqube-proxy.lomray.com/vulnerabilities/microservices-authentication?token=b6ab7058149225b55075f5564fe532c9)](https://sonarqube.lomray.com/dashboard?id=microservices-authentication)
[![Lines of code](https://sonarqube-proxy.lomray.com/lines/microservices-authentication?token=b6ab7058149225b55075f5564fe532c9)](https://sonarqube.lomray.com/dashboard?id=microservices-authentication)
[![Coverage](https://sonarqube-proxy.lomray.com/coverage/microservices-authentication?token=b6ab7058149225b55075f5564fe532c9)](https://sonarqube.lomray.com/dashboard?id=microservices-authentication)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO RUN](#how-to-run)
- [HOW TO DEVELOP](#how-to-develop)
- [MEMORY USAGE](#memory-usage)

### <a id="environments"></a>ENVIRONMENTS:
- `NODE_ENV` - Can be `production` or `development` or `tests`. Default: `development`
- `MS_CONNECTION` - Invert json host and port (with protocol). Default: `http://127.0.0.1:8001`
- `MS_CONNECTION_SRV` - Invert json connection it is SRV record. Default: `false`
- `MS_NAME` - Microservice name. Default: `authentication`
- `MS_WORKERS` - Microservice queue workers count. Default: `5`
- `MS_ENABLE_REMOTE_MIDDLEWARE` - Enable remote middleware feature. Set `0` to disable. Default: `1` (enabled)
- `DB_FROM_CONFIG_MS` - Get db credentials from configuration microservice. Set `0` to disable. Default: `1`
- `MS_JWT_SECRET_KEY` - Secret key for generation JWT tokens. Required if you want to use JWT auth. Default: `undefined`
- `MS_JWT_PARAMS` - JSON string for configure JWT creation tokens method. See [IJwtParams](src/services/tokens/jwt.ts). Default: `{}`
- `MS_REMOTE_CONFIG` - Enable remote config (get from configuration microservice). Set `0` to disable. Default: `1`
- `DB_URL` - Database url connection string. Default: `undefined`. Please use URL or credentials.
- `DB_HOST` - Database host. Default: `127.0.0.1`
- `DB_PORT` - Database port. Default: `5432`
- `DB_USERNAME` - Database user name. Default: `postgres`
- `DB_PASSWORD` - Database password. Default: `example`
- `DB_DATABASE` - Database db name. Default: `ms-authentication`
- `IS_SECURE_COOKIE` - Set secure cookie for `returnType: cookies`. Default: `1`
- `IS_HTTPONLY_COOKIE` - Set httpOnly cookie for `returnType: cookies`. Default: `1`
- `COOKIE_SAME_SITE` - Set sameSite cookie for `returnType: cookies`. Default: `undefined`
- `MS_GRAFANA_LOKI_CONFIG` - Grafana loki config. Default: `null`
- `MS_ENABLE_GRAFANA_LOG` - Enable grafana loki log (config from configuration ms). Default: `0`

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

__Run on typescript__: ~177 MB PEAK / ~162 MB  
__Run on JS__: ~33 MB PEAK / ~26 MB
__AWS Memory__: ~70 MB

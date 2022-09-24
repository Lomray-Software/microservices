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
- `NODE_ENV` - Can be `production` or `development` or `tests`. Default: `development`
- `MS_CONNECTION` - Invert json host and port (with protocol). Default: `http://127.0.0.1:8001`
- `MS_CONNECTION_SRV` - Invert json connection it is SRV record. Default: `false`
- `MS_NAME` - Microservice name. Default: `authorization`
- `MS_CONFIG_NAME` - Configuration microservice name. Default: `configuration` 
- `MS_WORKERS` - Microservice queue workers count. Default: `5`
- `MS_ENABLE_REMOTE_MIDDLEWARE` - Enable remote middleware feature. Set `0` to disable. Default: `1` (enabled)
- `MS_REMOTE_CONFIG` - Enable remote config (get from configuration microservice). Set `0` to disable. Default: `1`
- `DB_FROM_CONFIG_MS` - Get db credentials from configuration microservice. Set `0` to disable. Default: `1`
- `DB_URL` - Database url connection string. Default: `undefined`. Please use URL or credentials.
- `DB_HOST` - Database host. Default: `127.0.0.1`
- `DB_PORT` - Database port. Default: `5432`
- `DB_USERNAME` - Database user name. Default: `postgres`
- `DB_PASSWORD` - Database password. Default: `example`
- `DB_DATABASE` - Database db name. Default: `ms-authorization`
- `MS_DEFAULT_ROLE_ALIAS` - Default role alias for authenticated users. Default: `user`
- `MS_DEFAULT_PERMISSION_MIGRATION` - Apply migration with default permissions. Default: `0`
- `MS_GRAFANA_LOKI_CONFIG` - Grafana loki config. Default: `null`
- `MS_ENABLE_GRAFANA_LOG` - Enable grafana loki log (config from configuration ms). Default: `0`
- `MS_OPENTELEMETRY_ENABLE` - Enable opentelemetry tracers. Default: `0`
- `MS_OPENTELEMETRY_OTLP_URL` - Custom opentelemetry OTLP exporter URL. Default: `undefined`
- `MS_OPENTELEMETRY_OTLP_URL_SRV` - Custom opentelemetry OTLP URL it is SRV record. Default: `0`
- `MS_OPENTELEMETRY_DEBUG` - Enable debug log opentelemetry. Default: `0`
- `MS_CONSOLE_LOG_LEVEL` - Change console log level. Default: `info`

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
__Run on typescript__: ~205 MB PEAK / ~181 MB  
__Run on JS__: ~33 MB PEAK / ~26 MB
__AWS Memory__: ~100 MB

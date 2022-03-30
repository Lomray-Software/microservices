Gateway
-------------------

RPC 2.0 Microservice. This is a single entry point for all clients.

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
- `MS_CONFIG_NAME` - Configuration microservice name. Default: `configuration`
- `MS_ENABLE_REMOTE_MIDDLEWARE` - Enable remote middleware feature. Set `0` to disable. Default: `1` (enabled)
- `MS_BATCH_LIMIT` - Batch JSON_RPC request size. Default: `5`
- `MS_INFO_ROUTE` - Gateway info route. Default: `/`
- `MS_REQ_TIMEOUT` - Gateway request timeout in sec. Default: `15`
- `MS_LISTENER_PORT` - Express listener port. Default: `3000`
- `MS_CORS_CONFIG` - Express CORS config. See [CORS](https://www.npmjs.com/package/cors) lib. Default: `{"origin":["http://localhost:3000"],"credentials":true}`

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

__Run on typescript__: ~165 MB PEAK / ~158 MB  
__Run on JS__: ~58 MB PEAK / ~47 MB

payment-stripe
-------------------

RPC 2.0 Microservice.
This microservice provides payments mechanism for stipe.

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO RUN](#how-to-run)
- [HOW TO DEVELOP](#how-to-develop)
- [MEMORY USAGE](#memory-usage)

### <a id="environments"></a>ENVIRONMENTS:
- `MS_API_KEY` - Stripe api key to connect ms with stripe sdk. Default: `example`
- `MS_CONFIG` - JSON onject which contains apiVersion property required by Stripe. Default: `'{"apiVersion": "2022-11-15"}'`
- `MS_PAYMENT_METHODS` - Payment methods allowed using in Stripe. Default: `'["bancontact", "card"]'`
- `MS_WEBHOOK_KEY` - Stripe webhook key to connect ms and work with stripe webhook service. Example: `whsec_c6332a6b339173127d2e6c813112e2f2323b4b2b10eea5ac17c5649a60cf335e`
- `MS_PAYOUT_COEFF` - Number for calculating amount of money for transferring to the product owners. Default: `0.3`
- `MS_FEES` - Fees that takes while creating payment intent. Default: `'{ "stableUnit": 30, "paymentPercent": 2.9 }'`
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
curl localhost:8001/ms/payment-stripe -d '{"id": "unique-id", "method": "demo", "params": {}}'
```

If you use `JetBrains` IDE, try to find run configurations in `.run`

You can also install microservice like npm package:
```bash
npm i --save @lomray/microservice-payment-stripe
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

__Run on typescript__: ~200 MB PEAK / ~160 MB  
__Run on JS__: ~38 MB PEAK / ~26 MB

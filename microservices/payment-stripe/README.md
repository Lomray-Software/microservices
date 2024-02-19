payment-stripe
-------------------

RPC 2.0 Microservice.
This microservice provides payments mechanism for stipe.

![npm (scoped)](https://img.shields.io/npm/v/@lomray/microservice-payment-stripe)  
![Docker](https://img.shields.io/npm/v/@lomray/microservice-payment-stripe?label=docker)  
![Docker prod](https://img.shields.io/badge/Docker%20prod-%3Alatest-blue)  
![Docker staging](https://img.shields.io/badge/Docker%20staging-%3Alatest--staging-orange)  
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=microservice-payment-stripe&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=microservice-payment-stripe)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-payment-stripe&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=microservice-payment-stripe)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=microservice-payment-stripe&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=microservice-payment-stripe)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=microservice-payment-stripe&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=microservice-payment-stripe)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=microservice-payment-stripe&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=microservice-payment-stripe)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=microservice-payment-stripe&metric=coverage)](https://sonarcloud.io/summary/new_code?id=microservice-payment-stripe)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO RUN](#how-to-run)
- [HOW TO DEVELOP](#how-to-develop)
- [MEMORY USAGE](#memory-usage)
- [OVERVIEW](#overview)

### <a id="environments"></a>ENVIRONMENTS:
- `MS_API_KEY` - Stripe api key to connect ms with stripe sdk. Default: `example`
- `MS_CONFIG` - JSON onject which contains apiVersion property required by Stripe. Default: `'{"apiVersion": "2022-11-15"}'`
- `MS_PAYMENT_METHODS` - Payment methods allowed using in Stripe. Default: `'["bancontact", "card"]'`
- `MS_WEBHOOK_KEYS` - Stripe webhook keys to connect ms and work with stripe webhook service. Example: `{"myId":"whsec_c6332a6b339173127d2e6c813112e2f2323b4b2b10eea5ac17c5649a60cf335e"}`
- `MS_PAYOUT_COEFF` - Number for calculating amount of money for transferring to the product owners. Default: `0.3`
- `MS_FEES` - Fees that takes while creating payment intent. Default: `'{ "stablePaymentUnit": 30, "paymentPercent": 2.9, "stableDisputeFee": 1500, "instantPayoutPercent": 1 }'`
- `MS_TAX` - Tax that takes while creating payment intent. Default: `'{ "defaultPercent": 8, "stableUnit": 50, "autoCalculateFeeUnit": 5 }'`
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

#### Run stripe cli for test dev env:
1. Account events
```bash
stripe listen --forward-to 'http://localhost:3000/webhook/payment-stripe.stripe.webhook/webhooktokenoooooooooooooooooooo?id=account'
```
2. Connect events
```bash
stripe listen --forward-connect-to 'http://localhost:3000/webhook/payment-stripe.stripe.webhook/webhooktokenoooooooooooooooooooo?id=connect'
```

#### Webhooks:
1. For cloud environment: Integrate all necessary and specified webhook endpoints from the payment factory Stripe service
   into your hosted endpoint listeners in the Stripe dashboard.
2. For local development: use stripe-cli. See: https://docs.stripe.com/stripe-cli

#### Use these test cards to simulate successful payments from North and South America.
1. United States (US)	- 4242424242424242 - Visa

To simulate a declined payment with a successfully attached card, use the next one.
1. Decline after attaching	- 4000000000000341	- Attaching this card to a Customer object succeeds, but attempts to charge the customer fail.

To simulate a disputed transaction, use the test cards in this section. Then, to simulate winning or losing the dispute, provide winning or losing evidence.
1. Fraudulent	- 4000000000000259 - With default account settings, charge succeeds, only to be disputed as fraudulent. This type of dispute is protected after 3D Secure authentication.
2. Not received	- 4000000000002685	- With default account settings, charge succeeds, only to be disputed as product not received. This type of dispute isn’t protected after 3D Secure authentication.
3. Inquiry	- 4000000000001976	- With default account settings, charge succeeds, only to be disputed as an inquiry.
4. Warning	- 4000000000005423	- With default account settings, charge succeeds, only to receive an early fraud warning.
5. Multiple disputes	- 4000000404000079	- With default account settings, charge succeeds, only to be disputed multiple times.

See: https://stripe.com/docs/testing

### <a id="memory-usage"></a>MEMORY USAGE:

__Run on typescript__: ~200 MB PEAK / ~160 MB  
__Run on JS__: ~110 MB PEAK / ~80 MB

### <a id="overview"></a>OVERVIEW:

#### Navigation
- [INTRODUCTION](#introduction)
- [NOTES](#notes)
- [REFERENCES](#references)
- [PURPOSE AND GOALS](#purpose-and-goals)
- [TARGET AUDIENCE](#target-audience)
- [ARCHITECTURE HIGH-LEVEL OVERVIEW](#architecture-high-level-overview)
- [COMPONENTS AND THEIR ROLES](#components-and-their-roles)
- [COMPONENTS AND THEIR USAGE](#components-and-their-usage)
- [SERVICES AND THEIR ROLES](#services-and-their-usage)
- [GUIDES](#guides)

#### <a id="introduction"></a>INTRODUCTION:
The Payment-Stripe microservice provides APIs that enable both front-end and backend systems to interact with Stripe without requiring in-depth knowledge of Stripe documentation. 
These APIs facilitate:

1. Creation of customers, connected accounts, bank accounts, and cards.
2. Processing of payments, payouts, refunds, and checkouts.
3. Handling of disputes and Stripe webhooks events

#### <a id="notes"></a>NOTES:
The URLs provided in this overview are for accessing the Stripe dashboard in live (production) mode. 
For testing purposes, please enable test mode in your Stripe dashboard settings. 
Below are the Stripe dashboard URLs:

1. Live (production) https://dashboard.stripe.com
2. Test https://dashboard.stripe.com/test

#### <a id="references"></a>REFERENCES:
You can locate information based on the API and this documentation here:

1. Stripe API - https://docs.stripe.com/api
2. Stripe common documentation - https://docs.stripe.com
3. Stripe FAQ - https://support.stripe.com/questions/payouts-faq

#### <a id="purpose-and-goals"></a>PURPOSE AND GOALS:
The aim of this microservice is to deliver a secure, scalable, and resilient API that enables integration and development of business logic without requiring extensive knowledge of Stripe.

#### <a id="target-audience"></a>TARGET AUDIENCE:
The intended audience comprises both backend and frontend developers.

#### <a id="architecture-high-level-overview"></a>ARCHITECTURE HIGH-LEVEL OVERVIEW:
The current microservice utilizes the Stripe API and relies on the Stripe package for interfacing with it. We manage Stripe webhooks as part of our system. Our payment gateway service provides APIs for Stripe interactions. Webhooks are managed through a middleware declared within the gateway microservice, with webhook handlers provided by a separate service.
To enhance security for webhooks, we've implemented an additional route specifically for handling Stripe webhooks. This route includes a token with the role "webhook" to validate incoming requests and prevent vulnerabilities.
Additionally, for complex fee and tax calculations, we have our own calculation service that handles this functionality.

#### <a id="components-and-their-roles"></a>COMPONENTS AND THEIR ROLES:
#### 1. Customer
This entity presents a recurring customer. The customer can utilize their card or bank account to purchase products or subscribe.
Additionally, customers have the option to set up a Stripe connected account for accepting payments from other customers and subsequently disbursing these funds.
You can view all your customers on the Stripe dashboard by following this link: https://dashboard.stripe.com/test/customers

#### 2. Card
This component presents a Stripe card, facilitating the storage of multiple cards on a customer for subsequent 
charging. Similarly, it allows the storage of multiple debit cards on a recipient for future transfers. 
Additionally, the card serves as an external account card for connected accounts. These external account cards 
are debit cards associated with a Stripe platform's connected accounts, enabling the transfer of funds to or from 
the connected accounts' Stripe balance. If the card is designated as an external account, users can payout funds 
to this card. When a card is declared as the payment method, it denotes a customer card. 
Conversely, if the card is declared with the "cardId" reference stored in parameters, 
it indicates the external account linked to a user's connected account.

#### 3. Bank account
This component presents a Stripe bank account. Similar to a card, a bank account can be used 
as either the customer's payment method or the external account of a user's connected account. 
If designated as an external account, users can transfer funds to this bank account. 
When declared as the payment method, it represents a customer bank account suitable for purchasing products, etc. 
Conversely, if specified with the "bankAccountId" reference stored in parameters, it indicates the 
external account associated with a user's connected account.

#### 4. Transaction
This component presents an abstract model of a Stripe transaction. 
A Stripe transaction refers to transactions that occur through Stripe checkout or payment intent.
You can see all transaction that occur in you Stripe environment by following this link:
https://dashboard.stripe.com/payments

4.1 Payment Intent
A PaymentIntent assists you in collecting payment from your customer

4.2 Checkout
A Checkout Session presents your customer's session as they make one-time purchases or subscribe through Checkout or Payment Links.

#### 5. Refund
This component represents Stripe refund.
Refund objects enable you to reimburse a charge that was previously made but not yet refunded. 
The funds are returned to the original credit or debit card used for the initial transaction.
See: https://docs.stripe.com/refunds

#### 6. Payout
This component represents Stripe payout.
Created when user initiate a payout to either a bank account or debit card of a connected Stripe account.
See: https://docs.stripe.com/payouts

1.1 Instant payout
Instant Payouts allow for the immediate transfer of funds to a supported debit card or bank account.
You can request Instant Payouts at any time, even on weekends and holidays, and typically, the funds will appear in the associated bank account within 30 minutes. However, new Stripe users are not immediately eligible for Instant Payouts.

1.2 Default payout

#### 7. Dispute
This component represents Stripe disputes in other words transaction chargeback.
Card issuer have the ability to challenge transactions that the cardholder does not recognize, 
suspects to be fraudulent, or encounters other issues with.
See: https://docs.stripe.com/disputes

#### 8. Evidence details
This component represents Stripe dispute (chargeback) evidence detail of the transaction.
Evidence provided to respond to a dispute.

#### <a id="components-and-their-usage"></a>COMPONENTS AND THEIR USAGE:
#### 1. Customer
For set up customer in an application you should utilize payment-gateway service.

1.1 Method "createCustomer"
This method facilitates the creation of a Stripe customer. By invoking this method, the API will generate a Stripe customer using the user information provided by you.

#### 2. Card
To establish a card within an application, you can employ either a payment-gateway service or utilize a setup intent to set up customer cards. 
Alternatively, you can utilize user-connected account onboarding to set up a card as the external account for your user's connected account.

1.1 Method "addCard"
This function streamlines the process of generating a Stripe customer card. 
When called, the API will create a Stripe customer card based on the user information you provide. 
However, in this scenario, your application must adhere to 
PCI (Payment Card Industry Data Security Standard) requirements. Ideally, this method is best suited for setting up test Stripe cards for integration testing purposes.

1.2 Setup Intent Card (Payment method) template "@templates/card/setup-intent"
A SetupIntent walks you through the steps of configuring and storing a customer's payment information for future transactions.
For instance, you can employ a SetupIntent to establish and retain your customer's card details without promptly processing a payment

1.3 Setup Card (External account). Method "connectAccount"
To configure a card as the external account for a user's connected account, 
you can utilize Stripe's onboarding process. The user needs to be logged into the Stripe Form, 
and they can achieve this by invoking the "connectAccount" method.

#### 3. Bank account
You can utilize user-connected account onboarding to set up a bank account as the external account for your user's connected account.

1.1 Setup Bank Account (External account). Method "connectAccount"
To configure a bank account as the external account for a user's connected account,
you can utilize Stripe's onboarding process. The user needs to be logged into the Stripe Form,
and they can achieve this by invoking the "connectAccount" method.

#### 4. Transaction
For use transaction API in an application you should utilize payment-gateway service.

1.1 Method "createCheckout"
Generate a checkout session and provide a URL to redirect the user for payment.

#### 5. Refund
Every refund will be detected by the webhook handler service and documented in the refund table. 
For refunds related to an existing transaction record, the transaction status, refunded amount, and transferred amount will be recalculated.
Also, for handling refunds see: Webhook Handler service

5.1 Partial refund
Partial transaction amount was refunded.

5.2 Full refund
Full transaction amount was refunded.

#### 6. Payout
Every payout will be detected by the webhook handler service and documented in the payout table.
Also, for handling disputes see: Webhook Handler service

1.1 Method "instantPayout"
Validates the eligibility of a user's connected account for instant payouts, confirming available funds and other relevant criteria. 
At the end of the day, initiates an instant payout to the user associated with the connected account's external account, whether it be a bank account or card.

1.2 Method "payout"

#### 7. Dispute
Each dispute will be identified by the webhook handler service and recorded in the disputes table along with related evidence details. 
If a dispute occurs for a recorded transaction, the transaction will be flagged as disputed in the "isDisputed" column of the transaction model.
For handling disputes see: Webhook Handler service

#### 8. Evidence details
Upon occurrence of a dispute, the webhook handler service will oversee it, capturing relevant evidence details. 
Users can then submit evidence details through the Stripe Dashboard, after which the API will synchronize this data in the database.

#### <a id="services-and-their-roles"></a>SERVICES AND THEIR ROLES:
In this section, we will review the common services provided by the microservice and discuss their necessity.

#### 1. Payment gateway
This is a fundamental microservice providing an API for interacting with Stripe. 
Here, you can access methods for creating customers, cards, transactions, checkouts, payouts, and more. 
Additionally, this service defines methods that rely on the webhook handler service for managing incoming webhook events from Stripe.

#### 2. Webhook handlers
This is a foundational service designed to manage incoming webhooks from Stripe. 
For each Stripe object, this service defines its own handler that deals with related events. 
For example, there's a handler for "customer" events corresponding to the customer model, 
and another for "payout" events related to Stripe payout objects.

### 3. Calculation
This service provides sophisticated calculation helpers for Stripe transaction fees, taxes, and other related calculations.

### 4. Other components services
This structure pattern is commonly employed in the Lomray Software Microservices API.
Each component has its own associated service, encompassing business logic pertinent to that component. 
These services are utilized in subscribers, endpoints, and other functionalities. For example, 
the "update" method of the "dispute" service parses dispute webhook event data, updates transaction data, and records the dispute in the database.

#### <a id="guides"></a>GUIDES:
Here you can discover guides that will assist you in serving your customers in most situations.
See: http-requests/payment-stripe/guides

#### 1. Setup customer account
See: setup-customer-account.http

Description:

1.1 In step 1, we create a customer account.

1.2 In step 2, if a user is to receive funds from another customer, set up a connected account for them.

1.3 Retrieve the initial balance of the user's connected account. 

Stripe dashboard. See:

1.1 Created customer: https://dashboard.stripe.com/customers/${customerId}

1.2 Created connected account: https://dashboard.stripe.com/test/connect/accounts/${connectedAccountId}

#### 2. Setup customer payment method (card)
See: setup-customer-payment-method.http

Description:

2.1 Create setup intent (card) token

2.2 Navigate to the file templates/card/setup-intent.html. 
Paste the retrieved token into options.clientSecret. 
Then, in the instantiation of the Stripe class, insert the Stripe public token like this: new Stripe("publicToken"). 
You can obtain the public token from here: https://dashboard.stripe.com/apikeys.
Open html in any browser and paste card information, you can grab test cards here: https://docs.stripe.com/testing#cards.

Rebuild: 1

import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'payment-stripe';

const constants = {
  ...GetConstants({ msNameDefault, version, isBuild, packageName: name, withDb: true }),
  API_KEY: process.env.API_KEY ?? '',
  CONFIG: JSON.parse(process.env.CONFIG ?? '{"apiVersion": "2022-11-15"}'),
  PAYMENT_METHODS: JSON.parse(process.env.PAYMENT_METHODS ?? '["bancontact", "card"]'),
  WEBHOOK_KEY: process.env.STRIPE_WEBHOOK_KEY ?? '',
  PAYOUT_COEFF: Number(process.env.PAYOUT_COEFF) ?? 0.3,
  FEES: process.env.FEES ?? '{ "stableUnit": 30, "paymentPercent": 2.9 }',
};

export default constants;

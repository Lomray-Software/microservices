import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import type { TSetupIntentUsage } from '@interfaces/remote-config';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'payment-stripe';

const constants = {
  ...GetConstants({ msNameDefault, version, isBuild, packageName: name, withDb: true }),
  MS_API_KEY: process.env.MS_API_KEY ?? '',
  MS_CONFIG: JSON.parse(process.env.MS_CONFIG ?? '{"apiVersion": "2022-11-15"}'),
  MS_PAYMENT_METHODS: JSON.parse(process.env.MS_PAYMENT_METHODS ?? '["bancontact", "card"]'),
  MS_WEBHOOK_KEYS: JSON.parse(process.env.MS_WEBHOOK_KEYS ?? '{}'),
  MS_PAYOUT_COEFF: Number(process.env.MS_PAYOUT_COEFF) ?? 0.3,
  MS_FEES:
    process.env.MS_FEES ?? '{ "stableUnit": 30, "paymentPercent": 2.9, "instantPayoutPercent": 1 }',
  MS_TAXES: process.env.MS_TAXES ?? '{ "defaultPercent": 8, "stableUnit": 50 }',
  SETUP_INTENT_USAGE: (process.env.SETUP_INTENT_USAGE || 'off_session') as TSetupIntentUsage,
};

export default constants;

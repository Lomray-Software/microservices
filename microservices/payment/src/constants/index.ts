import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import PaymentProvider from '@constants/payment-provider';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'payment';

const constants = {
  ...GetConstants({ msNameDefault, version, isBuild, packageName: name, withDb: true }),
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER ?? PaymentProvider.STRIPE,
  PAYMENT_OPTIONS: process.env.PAYMENT_OPTIONS ?? '{}',
  PAYMENT_WEBHOOK_KEY: process.env.PAYMENT_WEBHOOK_KEY ?? '',
  PAYOUT_COEFF: Number(process.env.PAYOUT_COEFF) ?? 0.3,
};

export default constants;

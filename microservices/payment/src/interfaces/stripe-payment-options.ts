import Stripe from 'stripe';
import StripePaymentMethods from '@constants/stripe-payment-methods';

export default interface IStripePaymentOptions {
  config: Stripe.StripeConfig;
  apiKey: string;
  methods: StripePaymentMethods[];
}

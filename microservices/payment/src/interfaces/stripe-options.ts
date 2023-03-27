import type Stripe from 'stripe';
import type StripePaymentMethods from '@constants/stripe-payment-methods';

export default interface IStripeOptions {
  config: Stripe.StripeConfig;
  apiKey: string;
  methods: StripePaymentMethods[];
}

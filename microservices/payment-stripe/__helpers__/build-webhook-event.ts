import type StripeSdk from 'stripe';

/**
 * Stripe event interfaces
 * @description Using for access event data, Stripe event don't have generic
 */
export interface IStripeEvent<TEventData>
  extends Pick<StripeSdk.Event, 'id' | 'object' | 'account'> {
  data: {
    object: TEventData;
  };
}

/**
 * Returns Stripe webhook event
 */
const buildWebhookEvent = <TEventData>(data: TEventData): IStripeEvent<TEventData> => ({
  id: 'event-id',
  object: 'event',
  account: 'account',
  data: {
    object: Object.assign({}, data),
  },
});

export default buildWebhookEvent;

import type StripeSdk from 'stripe';

export interface IStripeEvent<TEventData>
  extends Pick<StripeSdk.Event, 'id' | 'object' | 'account'> {
  data: {
    object: TEventData;
  };
}

/**
 * Returns Stripe webhook event
 */
const buildWebhookEvent = <T>(data: T): IStripeEvent<T> => ({
  id: 'event-id',
  object: 'event',
  account: 'account',
  data: {
    object: data,
  },
});

export default buildWebhookEvent;

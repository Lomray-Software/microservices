/**
 * Returns id or extracted id from stripe instance
 */
const extractIdFromStripeInstance = <T extends { id: string }>(data: string | T): string =>
  typeof data === 'string' ? data : data.id;

export default extractIdFromStripeInstance;

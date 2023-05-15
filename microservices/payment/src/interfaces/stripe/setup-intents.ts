/**
 * The SetupIntent object
 */
interface ISetupIntent {
  id: string;
  object: string;
  payment_method: string | null;
}

export default ISetupIntent;

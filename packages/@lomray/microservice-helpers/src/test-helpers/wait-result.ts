/**
 * Return result if success or function when error for pass to 'expect'
 */
const waitResult = async <TResult>(
  promise: Promise<TResult | undefined> | TResult | undefined,
): Promise<TResult | (() => void) | undefined> => {
  try {
    return await promise;
  } catch (e) {
    return () => {
      throw e;
    };
  }
};

export default waitResult;

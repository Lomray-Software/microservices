import FirebaseSdk from '@lomray/microservice-helpers/services/firebase-sdk';
import { FIREBASE_CREDENTIAL, FIREBASE_FROM_CONFIG_MS } from '@constants/index';

export default (): ReturnType<typeof FirebaseSdk.get> => {
  FirebaseSdk.init({
    hasConfigMs: Boolean(FIREBASE_FROM_CONFIG_MS),
    credential: FIREBASE_CREDENTIAL,
  });

  return FirebaseSdk.get();
};

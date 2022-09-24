import { FirebaseSdk } from '@lomray/microservice-helpers';
import FirebaseAdmin from 'firebase-admin';
import { FIREBASE_CREDENTIAL, FIREBASE_FROM_CONFIG_MS } from '@constants/index';

export type TFirebaseAdmin = typeof FirebaseAdmin;

export default (): Promise<TFirebaseAdmin> => {
  FirebaseSdk.init(FirebaseAdmin, {
    hasConfigMs: Boolean(FIREBASE_FROM_CONFIG_MS),
    credential: FIREBASE_CREDENTIAL,
  });

  return FirebaseSdk.get();
};
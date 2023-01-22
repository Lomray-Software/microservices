import { FirebaseSdk } from '@lomray/microservice-helpers';
import FirebaseAdmin from 'firebase-admin';
import CONST from '@constants/index';

export type TFirebaseAdmin = typeof FirebaseAdmin;

export default (): Promise<TFirebaseAdmin> => {
  FirebaseSdk.init(FirebaseAdmin, {
    hasConfigMs: CONST.FIREBASE.IS_FROM_CONFIG_MS,
    credential: CONST.FIREBASE.CREDENTIAL,
  });

  return FirebaseSdk.get();
};

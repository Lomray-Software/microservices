import { firebaseConfig } from '@lomray/microservice-helpers';
import FirebaseAdmin from 'firebase-admin';
import CONST from '@constants/index';

export type TFirebaseAdmin = typeof FirebaseAdmin;

let isInit = false;

export default async (): Promise<TFirebaseAdmin> => {
  if (!isInit) {
    const { credential } = await firebaseConfig(CONST);

    FirebaseAdmin.initializeApp({
      credential: FirebaseAdmin.credential.cert(credential!),
    });

    isInit = true;
  }

  return FirebaseAdmin;
};

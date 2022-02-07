import FirebaseAdmin from 'firebase-admin';
import RemoteConfig from '@services/remote-config';

export interface IFirebaseSdkParams {
  hasConfigMs?: boolean;
  credential?: Record<string, any>;
}

export type TFirebaseAdmin = typeof FirebaseAdmin;

/**
 * Firebase singletone
 */
class FirebaseSdk {
  /**
   * @private
   */
  private static hasInit = false;

  /**
   * @private
   */
  private static hasConfigMs: boolean;

  /**
   * @private
   */
  private static credential?: Record<string, any>;

  /**
   * Init service
   */
  public static init(
    { hasConfigMs = true, credential = {} }: IFirebaseSdkParams = {},
    shouldReset = false,
  ): void {
    this.hasConfigMs = hasConfigMs;
    this.credential = credential;

    if (shouldReset) {
      this.hasInit = false;
    }
  }

  /**
   * Get firebase sdk
   */
  public static async get(): Promise<TFirebaseAdmin> {
    if (!this.hasInit) {
      const config = this.hasConfigMs
        ? await RemoteConfig.get('firebase', { isThrowNotExist: true })
        : {};

      FirebaseAdmin.initializeApp({
        credential: config?.credential ?? this.credential,
      });

      this.hasInit = true;
    }

    return FirebaseAdmin;
  }
}

export default FirebaseSdk;

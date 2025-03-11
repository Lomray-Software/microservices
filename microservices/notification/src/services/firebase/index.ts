import { Batch } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import type { Message, Messaging } from 'firebase-admin/lib/messaging';
import type { Repository } from 'typeorm';
import FcmToken from '@entities/fcm-token';
import FirebaseSdk from '@services/firebase/firebase-sdk';

type FirebaseErrorCode =
  | 'messaging/invalid-registration-token'
  | 'messaging/registration-token-not-registered'
  | 'messaging/invalid-argument'
  | 'messaging/server-unavailable';

// Firebase has a limit of 500 messages per batch
const BATCH_SIZE = 500;
// Rate limit: 500 messages per second
const RATE_LIMIT_DELAY = 1000;

// Common error message
const ERROR_NOT_INITIALIZED = 'Firebase service is not initialized';

/**
 * Service for handling Firebase Cloud Messaging operations
 */
class FCMService {
  /**
   * Tokens repository
   * @private
   */
  private tokenRepository: Repository<FcmToken>;

  /**
   * Constructor
   * @param repository
   */
  constructor(repository: Repository<FcmToken>) {
    this.tokenRepository = repository;
  }

  /**
   * Send a batch of FCM messages
   */
  private async sendBatch(messages: Message[], messaging: Messaging): Promise<void> {
    try {
      await Promise.all(messages.map((message) => messaging.send(message)));
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message as FirebaseErrorCode;

        switch (errorMessage) {
          case 'messaging/invalid-registration-token':
            throw new BaseException({
              status: 422,
              message: 'Invalid device token(s) provided',
            });
          case 'messaging/registration-token-not-registered':
            throw new BaseException({
              status: 422,
              message: 'Device token(s) are no longer valid',
            });
          case 'messaging/invalid-argument':
            throw new BaseException({
              status: 422,
              message: 'Invalid notification payload',
            });
          case 'messaging/server-unavailable':
            throw new BaseException({
              status: 503,
              message: 'Firebase service is temporarily unavailable',
            });
          default:
            throw new BaseException({
              status: 500,
              message: 'Failed to send notification batch',
            });
        }
      }

      throw new BaseException({
        status: 500,
        message: 'Failed to send notification batch',
      });
    }
  }

  /**
   * Send push notification to multiple users
   */
  public async sendNotification(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!userIds.length) {
      throw new BaseException({
        status: 422,
        message: 'No recipients specified',
      });
    }

    const firebase = await FirebaseSdk();

    let messaging: Messaging;

    try {
      messaging = firebase.messaging();
    } catch (error) {
      throw new BaseException({
        status: 503,
        message: ERROR_NOT_INITIALIZED,
      });
    }

    // Process users in chunks using Batch helper
    await Batch.find(
      this.tokenRepository
        .createQueryBuilder('token')
        .where('token.userId IN (:...userIds)', { userIds })
        .take(BATCH_SIZE),
      async (tokens: FcmToken[]) => {
        if (tokens.length === 0) {
          return;
        }

        const messages: Message[] = tokens.map(({ token }) => ({
          notification: {
            title,
            body,
          },
          data: data || {},
          token,
        }));

        // Process messages in batches
        for (let i = 0; i < messages.length; i += BATCH_SIZE) {
          const batch = messages.slice(i, i + BATCH_SIZE);

          await this.sendBatch(batch, messaging);

          // Add delay between batches to respect rate limits
          if (i + BATCH_SIZE < messages.length) {
            await new Promise((resolve) => {
              setTimeout(resolve, RATE_LIMIT_DELAY);
            });
          }
        }
      },
      {
        chunkSize: 1000, // Process 1000 users at a time
      },
    );
  }

  /**
   * Save or update FCM token for a user
   */
  public async saveToken(userId: string, token: string, userAgent?: string): Promise<FcmToken> {
    // Check if token already exists
    let fcmToken = await this.tokenRepository.findOne({ where: { token } });

    if (fcmToken) {
      // Update existing token
      fcmToken.userId = userId;
      fcmToken.userAgent = userAgent;

      return this.tokenRepository.save(fcmToken);
    }

    // Create new token
    fcmToken = this.tokenRepository.create({
      userId,
      token,
      userAgent,
    });

    return this.tokenRepository.save(fcmToken);
  }

  /**
   * Remove FCM token
   */
  public async removeToken(token: string): Promise<void> {
    try {
      const result = await this.tokenRepository.delete({ token });

      if (result.affected === 0) {
        throw new BaseException({
          status: 404,
          message: 'FCM token not found',
        });
      }
    } catch (error) {
      if (error instanceof BaseException) {
        throw error;
      }

      throw new BaseException({
        status: 500,
        message: 'Failed to remove FCM token',
      });
    }
  }

  /**
   * Remove all FCM tokens for a user
   */
  public async removeUserTokens(userId: string): Promise<void> {
    try {
      const result = await this.tokenRepository.delete({ userId });

      if (result.affected === 0) {
        throw new BaseException({
          status: 404,
          message: 'No FCM tokens found for this user',
        });
      }
    } catch (error) {
      if (error instanceof BaseException) {
        throw error;
      }

      throw new BaseException({
        status: 500,
        message: 'Failed to remove user FCM tokens',
      });
    }
  }
}

export default FCMService;

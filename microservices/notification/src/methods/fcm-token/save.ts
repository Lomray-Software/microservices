import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, MaxLength } from 'class-validator';
import { getRepository } from 'typeorm';
import FcmToken from '@entities/fcm-token';
import FCMService from '@services/firebase';

class FcmTokenSaveInput {
  @IsString()
  @MaxLength(36)
  userId: string;

  @IsString()
  @MaxLength(255)
  token: string;

  @IsString()
  @MaxLength(255)
  @IsUndefinable()
  userAgent?: string;
}

class FcmTokenSaveOutput {
  @IsBoolean()
  success: boolean;
}

/**
 * Save FCM token for user
 */
const save = Endpoint.custom(
  () => ({
    input: FcmTokenSaveInput,
    output: FcmTokenSaveOutput,
    description: 'Save FCM token for user',
  }),
  async ({ userId, token, userAgent, payload }) => {
    const fcmService = new FCMService(getRepository(FcmToken));
    const finalUserAgent = userAgent ?? (payload?.headers?.['user-agent'] as string);

    await fcmService.saveToken(userId, token, finalUserAgent);

    return {
      success: true,
    };
  },
);

export default save;

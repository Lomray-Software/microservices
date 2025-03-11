import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, MaxLength } from 'class-validator';
import { getRepository } from 'typeorm';
import FcmToken from '@entities/fcm-token';
import FCMService from '@services/firebase';

class FcmTokenRemoveInput {
  @IsString()
  @MaxLength(255)
  token: string;
}

class FcmTokenRemoveOutput {
  @IsBoolean()
  success: boolean;
}

/**
 * Remove FCM token
 */
const remove = Endpoint.custom(
  () => ({
    input: FcmTokenRemoveInput,
    output: FcmTokenRemoveOutput,
    description: 'Remove FCM token',
  }),
  async ({ token }) => {
    const fcmService = new FCMService(getRepository(FcmToken));

    await fcmService.removeToken(token);

    return {
      success: true,
    };
  },
);

export default remove;

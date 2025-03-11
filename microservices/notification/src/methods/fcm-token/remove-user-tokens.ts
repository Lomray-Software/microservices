import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, Length } from 'class-validator';
import { getRepository } from 'typeorm';
import FcmToken from '@entities/fcm-token';
import FCMService from '@services/firebase';

class FcmTokenRemoveUserTokensInput {
  @IsString()
  @Length(1, 36)
  userId: string;
}

class FcmTokenRemoveUserTokensOutput {
  @IsBoolean()
  success: boolean;
}

/**
 * Remove all FCM tokens for a user
 */
const removeUserTokens = Endpoint.custom(
  () => ({
    input: FcmTokenRemoveUserTokensInput,
    output: FcmTokenRemoveUserTokensOutput,
    description: 'Remove all FCM tokens for a user',
  }),
  async ({ userId }) => {
    const fcmService = new FCMService(getRepository(FcmToken));

    await fcmService.removeUserTokens(userId);

    return {
      success: true,
    };
  },
);

export default removeUserTokens;

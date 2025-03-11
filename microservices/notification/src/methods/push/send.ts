import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsString, IsArray, MaxLength, IsObject, IsBoolean } from 'class-validator';
import { getRepository } from 'typeorm';
import FcmToken from '@entities/fcm-token';
import FCMService from '@services/firebase';

class PushSendInput {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(36, { each: true })
  to: string[];

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(1000)
  message: string;

  @IsObject()
  @IsUndefinable()
  data?: Record<string, string>;
}

class PushSendOutput {
  @IsBoolean()
  isSent: boolean;
}

/**
 * Send push notification to user device
 */
const send = Endpoint.custom(
  () => ({
    input: PushSendInput,
    output: PushSendOutput,
    description: 'Send push notification to user device',
  }),
  async ({ to, title, message, data }) => {
    const fcmService = new FCMService(getRepository(FcmToken));

    await fcmService.sendNotification(to, title, message, data);

    return {
      isSent: true,
    };
  },
);

export default send;

import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, MaxLength } from 'class-validator';

class PushSendInput {
  @MaxLength(20, {
    each: true,
  })
  to: string[];

  @MaxLength(100)
  message: string;
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
  () => {
    throw new Error('Method not implemented.');

    // return {
    //   isSent: false,
    // };
  },
);

export default send;

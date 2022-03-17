import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, MaxLength } from 'class-validator';

class PhoneSendInput {
  @MaxLength(20, {
    each: true,
  })
  to: string[];

  @MaxLength(100)
  message: string;
}

class PhoneSendOutput {
  @IsBoolean()
  isSent: boolean;
}

/**
 * Send message to phone
 */
const send = Endpoint.custom(
  () => ({
    input: PhoneSendInput,
    output: PhoneSendOutput,
    description: 'Send message to phone number',
  }),
  () => {
    throw new Error('Method not implemented.');

    // return {
    //   isSent: false,
    // };
  },
);

export default send;

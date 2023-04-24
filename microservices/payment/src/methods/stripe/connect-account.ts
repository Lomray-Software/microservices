import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString } from 'class-validator';
import remoteConfig from '@config/remote';
import ConnectAccount, { IConnectAccountOutput } from '@services/stripe/connect-account';

class ConnectAccountInput {
  @IsString()
  userId: string;
  @IsString()
  email: string;
  @IsString()
  refreshUrl: string;
  @IsString()
  returnUrl: string;
}

class ConnectAccountOutput {
  @IsObject()
  object: IConnectAccountOutput;
}

/**
 * Create new connected account
 */
const connectAccount = Endpoint.custom(
  () => ({
    input: ConnectAccountInput,
    output: ConnectAccountOutput,
    description: 'Create new connected account with link',
  }),
  async ({ userId, email, refreshUrl, returnUrl }) => {
    const { paymentOptions } = await remoteConfig();

    if (!paymentOptions) {
      throw new Error('Payment intent only suitable for the stripe payment provider');
    }

    const service = new ConnectAccount(paymentOptions);

    return {
      object: await service.createConnectAccountWithLink(userId, email, refreshUrl, returnUrl),
    };
  },
);

export default connectAccount;

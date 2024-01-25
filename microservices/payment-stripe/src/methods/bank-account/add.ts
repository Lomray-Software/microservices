import { Endpoint, IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import BankAccount from '@entities/bank-account';
import type { IBankAccountParams } from '@services/payment-gateway/abstract';
import Stripe from '@services/payment-gateway/stripe';

class BankAccountAddInput implements IBankAccountParams {
  @IsString()
  userId: string;

  @IsString()
  lastDigits: string;

  @IsString()
  @IsUndefinable()
  @IsNullable()
  holderName?: string | null;

  @IsString()
  @IsUndefinable()
  @IsNullable()
  bankName?: string | null;

  @IsString()
  @IsUndefinable()
  bankAccountId?: string;
}

class BankAccountAddOutput {
  @IsObject()
  @Type(() => BankAccount)
  entity: BankAccount;
}

/**
 * Add new bank account
 */
const add = Endpoint.custom(
  () => ({
    input: BankAccountAddInput,
    output: BankAccountAddOutput,
    description: 'Add new bank account',
  }),
  async ({ userId, bankName, holderName, bankAccountId, lastDigits }) => {
    const service = await Stripe.init();

    return {
      entity: await service.addBankAccount({
        userId,
        bankName,
        holderName,
        bankAccountId,
        lastDigits,
      }),
    };
  },
);

export default add;

import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';
import { getManager } from 'typeorm';
import BankAccount from '@entities/bank-account';
import type { IBankAccountParams } from '@services/payment-gateway/abstract';
import Factory from '@services/payment-gateway/factory';

class BankAccountAddInput implements IBankAccountParams {
  test: boolean;
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
  async (params) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.addBankAccount(params),
    };
  },
);

export default add;

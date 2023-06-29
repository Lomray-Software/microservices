import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import HolderType from '@constants/holder-type';
import BankAccount from '@entities/bank-account';
import Factory from '@services/payment-gateway/factory';

class BankAccountAddInput {
  @IsString()
  userId: string;

  @IsString()
  accountHolderName: string;

  @IsEnum(HolderType)
  accountHolderType: HolderType;

  @IsString()
  routingNumber: string;

  @IsString()
  accountNumber: string;
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
  async ({ userId, accountHolderName, accountHolderType, accountNumber, routingNumber }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.addBankAccount({
        userId,
        accountHolderName,
        accountHolderType,
        accountNumber,
        routingNumber,
      }),
    };
  },
);

export default add;

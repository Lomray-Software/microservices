import { Endpoint, IsMeta } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import User from '@entities/user';
import Freeze, { FreezeStatusType } from '@services/freeze';

class FreezeInput {
  @JSONSchema({
    description: 'Account that will be frozen or unfrozen',
  })
  @Length(1, 36)
  userId: string;

  @IsEnum(FreezeStatusType)
  status: FreezeStatusType;
}

class FreezeOutput {
  @IsMeta()
  @Type(() => User)
  user: User;
}

/**
 * Perform freeze status to user account
 */
const freeze = Endpoint.custom(
  () => ({
    input: FreezeInput,
    output: FreezeOutput,
    description: 'Perform freeze status to user account',
  }),
  async ({ userId, status }) => ({
    user: await Freeze.init({
      userId,
      status,
      manager: getManager(),
    }).process(),
  }),
);

export { FreezeInput, FreezeOutput, freeze };

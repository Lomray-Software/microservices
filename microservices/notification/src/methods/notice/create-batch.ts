import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsArray, IsBoolean, IsNumber, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column } from 'typeorm';
import Notice from '@services/notice';
import type { ICreateBatchParams } from '@services/notice';

class CreateBatchInput implements ICreateBatchParams {
  @Column({ type: 'varchar' })
  @Length(1, 255)
  title: string;

  @Column({ type: 'varchar' })
  @Length(1, 50)
  type: string;

  @Column({ type: 'text' })
  @Length(1)
  @IsUndefinable()
  description: string;

  @JSONSchema({
    description: 'Notice params status',
    example: 'warning',
  })
  @Column({ type: 'text' })
  @Length(1)
  @IsUndefinable()
  status: string;

  @JSONSchema({ description: 'Users that will receive this notice' })
  @IsArray()
  @IsString({ each: true })
  @IsUndefinable()
  userIds?: string[];

  @JSONSchema({
    description: 'Should create notice for all existing users',
  })
  @IsBoolean()
  @IsUndefinable()
  isForAll?: boolean;
}

class CreateBatchOutput {
  @IsNumber()
  count: number;
}

/**
 * Create notices for large group or for all users
 */
const createBatch = Endpoint.custom(
  () => ({
    input: CreateBatchInput,
    output: CreateBatchOutput,
    description: 'Create notices for large group or for all users',
  }),
  async ({ userIds, isForAll, title, description, type, status }) => ({
    count: await Notice.init().createBatch({ userIds, isForAll, title, description, type, status }),
  }),
);

export { createBatch, CreateBatchInput, CreateBatchOutput };

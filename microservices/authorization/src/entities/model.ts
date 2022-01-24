import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, Length, IsObject } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum FieldPolicy {
  allow = 'allow',
  deny = 'deny',
}

interface IFieldCondition {
  template: string; // lodash template
}

export interface IRolePermissions {
  [roleAliasOrUserId: string | number]: FieldPolicy | IFieldCondition;
}

export interface IModelSchema {
  '*': FieldPolicy;
  [fieldName: string]:
    | string // related model alias
    | { object: IModelSchema }
    | {
        in?: IRolePermissions;
        out?: IRolePermissions;
      };
}

@Entity()
class Model {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Length(1, 50)
  @IsNullable()
  microservice: string;

  @Column({ type: 'varchar', length: 30 })
  @Unique(['alias'])
  @Length(1, 30)
  alias: string;

  @Column({ type: 'varchar', length: 30 })
  @Length(3, 30)
  title: string;

  @JSONSchema({
    description:
      'Schema for validate input/output fields. Template variables: value - current field value, fields - input data, current: { userId, roles }',
    examples: [
      { '*': 'allow' },
      { '*': 'deny' },
      { field1: 'aliasAnotherModel', field2: { object: { nestedField: 'aliasModel' } } },
      { simpleField: { in: { guests: 'deny', users: 'allow' }, out: { guest: 'allow' } } },
      {
        userId: {
          in: {
            guests: FieldPolicy.deny,
            users: {
              // allow only if userId equal userId from authentication microservice
              template: '<%= value === current.userId ? value : undefined %>',
            },
          },
          out: { guests: 'allow' },
        },
      },
    ],
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  schema: IModelSchema;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default Model;

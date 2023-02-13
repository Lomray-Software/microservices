import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
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
import FieldPolicy from '@constants/field-policy';

interface IFieldCondition {
  template: string; // lodash template
}

export interface IRolePermissions {
  [roleAliasOrUserId: string]: FieldPolicy | IFieldCondition;
}

export interface IModelSchema {
  '*': FieldPolicy;
  [fieldName: string]:
    | string // related model alias
    | { object: IModelSchema; isCustom?: boolean }
    | {
        case: IFieldCondition;
        object: { [key: string]: string | IModelSchema };
        isCustom?: boolean;
      }
    | {
        in?: IRolePermissions;
        out?: IRolePermissions;
        isCustom?: boolean;
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
  microservice: string | null;

  @Column({ type: 'varchar', length: 150 })
  @Unique(['alias'])
  @Length(1, 150)
  alias: string;

  @Column({ type: 'varchar', length: 255 })
  @Length(3, 255)
  title: string;

  @JSONSchema({
    description:
      'Schema for validate input/output fields. Template variables: value - current field value, fields - input data, current: { userId, roles }',
    examples: [
      { '*': 'allow' },
      { '*': 'deny' },
      { field1: 'aliasAnotherModel', field2: { object: { nestedField: 'aliasModel' } } }, // aliases
      {
        field1: {
          case: 'case2', // dynamic choose scheme
          cases: { case1: 'aliasModel', case2: 'modelAlias' },
        },
      }, // dynamic schema => { field1: 'modelAlias' }
      { simpleField: { in: { guests: 'deny', users: 'allow' }, out: { guest: 'allow' } } }, // standard fields
      {
        // standard field
        userId: {
          in: {
            guests: FieldPolicy.deny,
            users: {
              // allow only if userId equal userId from authentication microservice (available: current - (userId, userRoles), params - payload, value)
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

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Model;

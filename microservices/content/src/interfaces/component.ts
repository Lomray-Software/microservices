import type { JQFieldType } from '@lomray/microservices-types';
import type InputType from '@constants/input-type';

/**
 * Input types that can be used in components creating
 */
interface IBaseSchema {
  type: InputType;
  name: string;
  title: string;
}

interface IRelation {
  microservice: string;
  entity: string;
  fields: {
    name: string;
    insensitive?: boolean;
    castType?: JQFieldType;
  }[];
  hasMany: boolean;
}

/**
 * Primitive input types: Text, Number, Rich Text, Date, Boolean, Email, Password, JSON, ENUM
 */
interface IDefaultSchema extends IBaseSchema {}

/**
 * Relation input types: Relation, Media
 */
interface IRelationSchema extends IBaseSchema {
  relation: IRelation;
}

/**
 * Custom input type: Component
 */
interface IComponentSchema extends IBaseSchema, Pick<IRelation, 'hasMany'> {
  id: string;
}

type ISchema = IDefaultSchema | IRelationSchema | IComponentSchema;

export { ISchema, IRelationSchema, IComponentSchema, IDefaultSchema };

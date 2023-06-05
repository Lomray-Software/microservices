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
  searchFields: {
    name: string;
    insensitive?: boolean;
    castType?: JQFieldType;
  }[];
  idFields: string[];
  titleFields: string[];
  hasMany: boolean;
}

/**
 * Primitive input types: Text, Number, Rich Text, Date, Boolean, Email, Password, JSON, ENUM
 */
interface IDefaultSchema extends IBaseSchema {
  isRequired?: boolean;
}

/**
 * Text input type options
 */
interface ILongTextSchema extends IDefaultSchema {
  isLong: true;
}

/**
 * Relation input types: Relation
 */
interface IRelationSchema extends IBaseSchema {
  relation: IRelation;
}

/**
 * Relation input types: Media
 */
interface IFileSchema extends IRelationSchema {
  isFiles: true;
}

/**
 * Custom input type: Component
 */
interface IComponentSchema extends IBaseSchema {
  id: string;
  hasMany: boolean;
}

type ISchema = IDefaultSchema | IRelationSchema | IComponentSchema | IFileSchema | ILongTextSchema;

export { ISchema, IRelationSchema, IComponentSchema, IDefaultSchema, IFileSchema, ILongTextSchema };

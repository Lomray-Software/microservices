import type { SchemaObject } from 'openapi3-ts';
import Component from '@entities/component';

type TMetaSchema = Record<Component['alias'], SchemaObject>;

export default TMetaSchema;

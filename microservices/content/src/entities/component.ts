import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsObject, Length, Validate } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import InputType from '@constants/input-type';
import type SingleType from '@entities/single-type';
import IsCamelCaseString from '@helpers/is-camel-case-string';
import IsCamelCaseSchema from '@helpers/validators/is-camel-case-schema';
import IsComponentSchema from '@helpers/validators/is-component-schema';
import IsRelationSchema from '@helpers/validators/is-relation-schema';
import { ISchema } from '@interfaces/component';

@JSONSchema({
  properties: {
    singleTypes: { $ref: '#/definitions/SingleType', type: 'array' },
    children: { $ref: '#/definitions/Component', type: 'array' },
    parent: { $ref: '#/definitions/Component', type: 'array' },
  },
})
@Entity()
class Component {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Unique('component(uq):alias', ['alias'])
  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  @Validate(IsCamelCaseString)
  alias: string;

  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  title: string;

  @JSONSchema({
    example: [{ name: 'exampleName', title: 'Example title', inputType: InputType.TEXT }],
  })
  @Column({ type: 'json', default: [] })
  @IsObject({ each: true })
  @IsComponentSchema()
  @IsRelationSchema()
  @IsCamelCaseSchema()
  schema: ISchema[];

  @CreateDateColumn()
  @IsTypeormDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsTypeormDate()
  updatedAt: Date;

  @JSONSchema({
    example: [{ id: 'id' }],
  })
  @IsObject({ each: true })
  @IsUndefinable()
  @ManyToMany('SingleType', 'components')
  singleTypes: SingleType[];

  @JSONSchema({
    example: [{ id: 'id' }],
  })
  @IsObject({ each: true })
  @IsUndefinable()
  @ManyToMany('Component', 'children', { onDelete: 'CASCADE' })
  @JoinTable({
    joinColumn: {
      name: 'childrenId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'parentId',
      referencedColumnName: 'id',
    },
  })
  parent: Component[];

  @JSONSchema({
    example: [{ id: 'id' }],
  })
  @IsObject({ each: true })
  @IsUndefinable()
  @ManyToMany('Component', 'parent')
  children: Component[];
}

export default Component;

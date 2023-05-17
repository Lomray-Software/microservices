import type { RequiredProps } from '@lomray/client-helpers/interfaces';
import { IsTypeormDate } from '@lomray/microservice-helpers';
import { Allow, IsObject, Length, Validate } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  JoinTable,
} from 'typeorm';
import type Component from '@entities/component';
import IsCamelCaseString from '@helpers/is-camel-case-string';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISingleTypeValue {}

@JSONSchema({
  properties: {
    components: { $ref: '#/definitions/Component', type: 'array' },
  },
})
@Entity()
class SingleType {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  title: string;

  @Unique('article(uq):alias', ['alias'])
  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  @Validate(IsCamelCaseString)
  alias: string;

  @JSONSchema({
    description: 'Schema for static single-type data. Name abbreviations: CN - component name',
    example: {
      companyContentAlias: {
        id: 'company-component-1',
        data: {
          teamAlias: {
            id: 'team-component-id',
            data: {
              headTitleCN: 'Team members',
              countOfEmployeeCN: 1000,
              techStackAlias: {
                id: 'tech-stack-component-id',
                data: {
                  stackCN: ['TypeScript', 'Express.js'],
                  descriptionCN: '<p>Why we prefer Typescript while building Node.js services</p>',
                },
              },
            },
            editorAlias: {
              id: 'editors-component-id',
              data: {
                ourEditorsCN: ['user-id-1', 'user-id-2'],
              },
            },
          },
        },
      },
      projectAlias: {
        id: 'project-alias-id',
        data: {
          articlesCN: 'Here you can view references on our articles',
          projectArticleCN: ['data case 1', 'data case 2'],
        },
      },
    },
  })
  @Column({ type: 'json', default: {} })
  @IsObject()
  value: ISingleTypeValue;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @JSONSchema({
    example: [{ id: 'id' }],
  })
  @IsObject({ each: true })
  @ManyToMany('Component', 'singleTypes')
  @JoinTable({
    name: 'singleTypes_components',
    joinColumn: {
      name: 'singleTypeId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'componentId',
      referencedColumnName: 'id',
    },
  })
  components: RequiredProps<Component, 'id'>[];
}

export default SingleType;

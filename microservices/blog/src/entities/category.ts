import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import Article from './article';

@JSONSchema({
  properties: {
    articles: { $ref: '#/definitions/Article', type: 'array' },
  },
})
@Entity()
class Category {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50)
  name: string;

  @Unique('category(uq):alias', ['alias'])
  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  alias: string;

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
  @ManyToMany('Article', 'categories')
  @JoinTable({
    name: 'categories_articles',
    joinColumn: {
      name: 'categoryId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
    },
  })
  articles: Article[];
}

export default Category;

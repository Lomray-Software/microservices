import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsObject, IsString, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import Category from './category';

@JSONSchema({
  properties: {
    categories: { $ref: '#definitions/Category', type: 'array' },
  },
})
@Entity()
class Article {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 36, default: null })
  @Length(1, 36)
  @IsNullable()
  @IsUndefinable()
  userId: string | null;

  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  title: string;

  @Unique('article(uq):alias', ['alias'])
  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  alias: string;

  @Column({ type: 'varchar', length: 255 })
  @Length(1, 255)
  description: string;

  @Column({ type: 'text', default: '' })
  @IsString()
  @IsUndefinable()
  content: string;

  @JSONSchema({ description: 'If publish date is null - this article is draft' })
  @Column({ type: 'timestamp', default: null })
  @IsTypeormDate()
  @IsUndefinable()
  @IsNullable()
  publishDate: string | null;

  @JSONSchema({
    description:
      'Set of key-value pairs that can be attach to an article.' +
      'This can be useful for storing extra information about the article in a structured format.',
  })
  @Column({ type: 'json', default: {} })
  @IsUndefinable()
  @IsObject()
  extra: Record<string, any>;

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
  @IsUndefinable()
  @ManyToMany('Category', 'articles')
  categories: Category[];
}

export default Article;
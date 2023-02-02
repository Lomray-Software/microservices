import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsObject, IsNumber, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from 'typeorm';
import type File from '@entities/file';

@JSONSchema({
  properties: {
    parent: { $ref: '#/definitions/Folder', type: 'array' },
    children: { $ref: '#/definitions/Folder', type: 'array' },
    files: { $ref: '#/definitions/File', type: 'array' },
  },
})
@Entity()
class Folder {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Index('IDX_folder_userId', ['userId'])
  @Column({ type: 'varchar', length: 36, default: null })
  @Length(1, 36)
  @IsNullable()
  @IsUndefinable()
  userId: string | null;

  @Index('IDX_folder_alias', ['alias'])
  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50)
  @IsNullable()
  @IsUndefinable()
  alias: string;

  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50)
  title: string;

  @Column({ type: 'real', default: 999 })
  @IsNumber()
  @IsUndefinable()
  order: number;

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
  @ManyToMany(() => Folder, (category) => category.children, { onDelete: 'CASCADE' })
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
  parent: Folder[];

  @JSONSchema({
    example: [{ id: 'id' }],
  })
  @IsObject({ each: true })
  @IsUndefinable()
  @ManyToMany(() => Folder, (category) => category.parent)
  children: Folder[];

  @OneToMany('File', 'folder')
  files: File[];
}

export default Folder;

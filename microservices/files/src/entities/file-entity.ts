import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsNumber, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  Entity,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import type File from '@entities/file';

@JSONSchema({
  description: 'Related entity with file',
  properties: {
    file: { $ref: '#/definitions/File' },
  },
})
@Entity()
@Unique(['entityId', 'fileId', 'microservice', 'type'])
class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  entityId: string;

  @Column({ type: 'varchar' })
  @Length(1, 36)
  fileId: string;

  @Column({ type: 'varchar', length: 30 })
  @Length(1, 30)
  type: string;

  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50)
  microservice: string;

  @Column({ type: 'integer', default: 1 })
  @IsNumber()
  @IsUndefinable()
  order: number;

  @CreateDateColumn()
  @IsTypeormDate()
  createdAt: Date;

  @ManyToOne('File', 'fileEntities', {
    onDelete: 'CASCADE',
  })
  file: File;
}

export default FileEntity;

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
import type Attachment from '@entities/attachment';

@JSONSchema({
  properties: {
    attachment: { $ref: '#/definitions/Attachment' },
  },
})
@Entity()
@Unique(['entityId', 'attachmentId', 'microservice', 'type'])
class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;

  @Column({ type: 'varchar', length: 36 })
  @Length(1, 36)
  entityId: string;

  @Column({ type: 'varchar' })
  @Length(1, 36)
  attachmentId: string;

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

  @ManyToOne('Attachment', 'attachmentEntities', {
    onDelete: 'CASCADE',
  })
  attachment: Attachment;
}

export default AttachmentEntity;

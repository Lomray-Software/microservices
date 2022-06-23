import { IsTypeormDate, IsUndefinable, IsNullable } from '@lomray/microservice-helpers';
import { Allow, IsEnum, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import AttachmentType from '@constants/attachment-type';
import AttachmentEntity from '@entities/attachment-entity';

export interface IAttachmentFormat {
  [key: string]: {
    url: string;
    width: number;
    height: number;
    size: number;
    hasWebp?: boolean;
  };
}

interface IAttachmentMeta {
  mime: string;
  size?: number;
  width?: number;
  height?: number;
  hasWebp: boolean;
}

@JSONSchema({
  properties: {
    attachmentEntities: { $ref: '#/definitions/AttachmentEntity' },
  },
})
@Entity()
class Attachment {
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
  url: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  @Length(0, 150)
  @IsUndefinable()
  alt: string;

  @Column({ type: 'enum', enum: AttachmentType })
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  formats: IAttachmentFormat;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  meta: IAttachmentMeta;

  @CreateDateColumn()
  @IsTypeormDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsTypeormDate()
  updatedAt: Date;

  @OneToMany(() => AttachmentEntity, (entityAttachment) => entityAttachment.attachment)
  attachmentEntities: AttachmentEntity[];
}

export default Attachment;

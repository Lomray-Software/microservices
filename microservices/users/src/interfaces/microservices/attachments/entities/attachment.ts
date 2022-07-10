import type { IEntity } from '@lomray/microservices-types';
import type AttachmentEntity from '@interfaces/microservices/attachments/entities/attachment-entity';

export enum Formats {
  medium = 'medium',
  small = 'small',
  large = 'large',
  extraLarge = 'extra-large',
}

interface IAttachmentFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  hasWebp?: boolean;
}

interface IAttachmentMeta {
  mime: string;
  size?: number;
  width?: number;
  height?: number;
  hasWebp: boolean;
}

interface IAttachment extends IEntity {
  id: string;
  userId: string | null;
  url: string;
  alt: string;
  type: string;
  formats: { [key in Formats]: IAttachmentFormat };
  meta: IAttachmentMeta;
  createdAt: string;
  updatedAt: string;
  attachmentEntities?: AttachmentEntity[];
}

export { IAttachmentFormat, IAttachment };

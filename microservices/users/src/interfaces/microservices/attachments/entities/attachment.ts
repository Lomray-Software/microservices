import type AttachmentEntity from '@interfaces/microservices/attachments/entities/attachment-entity';

interface IAttachmentFormat {
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

interface IAttachment {
  id: string;
  userId: string | null;
  url: string;
  alt: string;
  type: string;
  formats: IAttachmentFormat;
  meta: IAttachmentMeta;
  createdAt: string;
  updatedAt: string;
  attachmentEntities?: AttachmentEntity[];
}

export { IAttachmentFormat, IAttachment };

import type { IRelation } from '@lomray/typeorm-json-query';

interface IAttachmentEntity extends IRelation {
  id: string;
  entityId: string;
  attachmentId: string;
  type: string;
  microservice: string;
  order: number;
}

export default IAttachmentEntity;

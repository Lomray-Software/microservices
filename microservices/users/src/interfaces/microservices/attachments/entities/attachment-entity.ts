import type { IEntity } from '@lomray/microservices-types';

interface IAttachmentEntity extends IEntity {
  id: string;
  entityId: string;
  attachmentId: string;
  type: string;
  microservice: string;
  order: number;
}

export default IAttachmentEntity;

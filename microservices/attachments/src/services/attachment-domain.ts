import { MS_STORAGE_TYPE } from '@constants/index';
import Attachment from '@entities/attachment';
import AttachmentEntity from '@entities/attachment-entity';
import StorageFactory from '@services/storage/factory';

class AttachmentDomain {
  /**
   * Add domain to the url of the attachment and to the url of its formats
   */
  public static async addDomain(entity: Attachment): Promise<Attachment> {
    const storage = await StorageFactory.create(MS_STORAGE_TYPE);

    entity.url = `${storage.getDomain()}${entity.url}`;

    for (const format in entity.formats) {
      entity.formats[format].url = `${storage.getDomain()}${entity.formats[format].url}`;
    }

    return entity;
  }

  /**
   * Add domain to the url of the attachment entity "attachment" relation
   */
  public static async addDomainRelation(entity: AttachmentEntity): Promise<AttachmentEntity> {
    if (entity.attachment) {
      entity.attachment = await AttachmentDomain.addDomain(entity.attachment);
    }

    return entity;
  }

  /**
   * Add domains for attachment array
   */
  public static async addDomains(entities: Attachment[]): Promise<Attachment[]> {
    const result = [];

    for (const entity of entities) {
      result.push(await AttachmentDomain.addDomain(entity));
    }

    return result;
  }

  /**
   * Add domains for attachment entity array
   */
  public static async addDomainsRelation(
    entities: AttachmentEntity[],
  ): Promise<AttachmentEntity[]> {
    const result = [];

    for (const entity of entities) {
      result.push(await AttachmentDomain.addDomainRelation(entity));
    }

    return result;
  }
}

export default AttachmentDomain;

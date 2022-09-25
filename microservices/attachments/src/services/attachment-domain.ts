import { MS_STORAGE_TYPE } from '@constants/index';
import Attachment, { IAttachmentFormat } from '@entities/attachment';
import AttachmentEntity from '@entities/attachment-entity';
import StorageFactory from '@services/storage/factory';

interface IAttachmentDomainOptions extends Record<string, any> {
  // return only specified formats
  onlyFormats?: string[];
}

class AttachmentDomain {
  /**
   * Add domain to the url of the attachment and to the url of its formats
   */
  public static async addDomain(
    entity: Attachment,
    options: IAttachmentDomainOptions = {},
  ): Promise<Attachment> {
    const storage = await StorageFactory.create(MS_STORAGE_TYPE);
    const { onlyFormats } = options;

    if (entity.url) {
      entity.url = `${storage.getDomain()}${entity.url}`;
    }

    const formats: IAttachmentFormat = {};

    for (const format in entity.formats) {
      if (Array.isArray(onlyFormats) && !onlyFormats.includes(format)) {
        continue;
      }

      formats[format] = {
        ...format[format],
        url: `${storage.getDomain()}${entity.formats[format].url}`,
      };
    }

    entity.formats = formats;

    return entity;
  }

  /**
   * Add domain to the url of the attachment entity "attachment" relation
   */
  public static async addDomainRelation(
    entity: AttachmentEntity,
    options: IAttachmentDomainOptions = {},
  ): Promise<AttachmentEntity> {
    if (entity.attachment) {
      entity.attachment = await AttachmentDomain.addDomain(entity.attachment, options);
    }

    return entity;
  }

  /**
   * Add domains for attachment array
   */
  public static async addDomains(
    entities: Attachment[],
    options: IAttachmentDomainOptions = {},
  ): Promise<Attachment[]> {
    const result = [];

    for (const entity of entities) {
      result.push(await AttachmentDomain.addDomain(entity, options));
    }

    return result;
  }

  /**
   * Add domains for attachment entity array
   */
  public static async addDomainsRelation(
    entities: AttachmentEntity[],
    options: IAttachmentDomainOptions = {},
  ): Promise<AttachmentEntity[]> {
    const result = [];

    for (const entity of entities) {
      result.push(await AttachmentDomain.addDomainRelation(entity, options));
    }

    return result;
  }
}

export default AttachmentDomain;

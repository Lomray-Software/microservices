import { BaseException } from '@lomray/microservice-nodejs-lib';
import mime from 'mime';
import sharp, { JpegOptions, OutputInfo, PngOptions, ResizeOptions, WebpOptions } from 'sharp';
import AttachmentType from '@constants/attachment-type';
import ImageExtensions from '@constants/image-extensions';
import Attachment from '@entities/attachment';
import Abstract from './abstract';

/**
 * Image attachment
 */
class Image extends Abstract {
  /**
   * Save formatted image to storage
   * @inheritDoc
   */
  public save(file: string, userId: string, alt?: string): Promise<Attachment> {
    return this.manager.transaction(async (transactionManager) => {
      const attachmentRepository = transactionManager.getRepository(Attachment);
      const attachment = await attachmentRepository.save(
        attachmentRepository.create({ userId, alt, url: '/', type: AttachmentType.image }),
      );

      const { attachmentData, images } = await this.composeData(file, attachment.id);

      await this.uploadImages(images);

      return attachmentRepository.save({ ...attachment, ...attachmentData });
    });
  }

  /**
   * Update attachment
   * @inheritDoc
   */
  public async update(attachment: Attachment, file?: string, alt?: string): Promise<Attachment> {
    const { id } = attachment;
    let attachmentData;
    let images;

    if (file) {
      ({ attachmentData, images } = await this.composeData(file, id));

      await this.storage.delete(this.getFilePath(id));
      await this.uploadImages(images);
    }

    return this.attachmentRepository.save({
      ...attachment,
      ...(attachmentData && { ...attachmentData }),
      ...(alt && { alt }),
    });
  }

  /**
   * Delete attachment
   * @inheritDoc
   */
  public async remove(attachment: Attachment): Promise<boolean> {
    const { id } = attachment;

    if (!id) {
      return false;
    }

    await this.attachmentRepository.remove(attachment);
    await this.storage.delete(this.getFilePath(id));

    return true;
  }

  /**
   * Compose data
   * @private
   */
  private async composeData(file: string, id: string) {
    const fileBuffer = Buffer.from(file.replace(/^data:image\/([a-zA-Z]*);base64,/, ''), 'base64');
    const imageMetadata = await sharp(fileBuffer).metadata();
    const extension = imageMetadata.format;
    const { isWebp } = this.config;

    if (!extension || !ImageExtensions[extension]) {
      throw new BaseException({
        status: 422,
        message: 'Invalid image format.',
      });
    }

    const imageUrl = this.getFilePath(id, 'origin', extension);
    const fileMime = mime.lookup(extension);
    const { formattedImages, metadata } = await this.makeFormats(fileBuffer, extension, id);

    const mappedFormats = metadata.reduce(
      (acc, { meta: { width, height, size }, hasWebp, url, format }) => ({
        ...acc,
        [format]: {
          url,
          width,
          height,
          size,
          hasWebp,
        },
      }),
      {},
    );

    return {
      attachmentData: {
        url: `/${imageUrl}`,
        type: AttachmentType.image,
        formats: mappedFormats,
        meta: {
          mime: fileMime,
          width: imageMetadata.width,
          height: imageMetadata.height,
          size: imageMetadata.size,
          hasWebp: isWebp || false,
        },
      },
      images: [...formattedImages, { buffer: fileBuffer, url: imageUrl, fileMime }],
    };
  }

  /**
   * Upload images to storage
   * @private
   */
  private async uploadImages(
    images: { buffer: Buffer; url: string; fileMime: string }[],
  ): Promise<void> {
    await Promise.all(
      images.map(({ buffer, url, fileMime }) => this.storage.upload(url, buffer, fileMime)),
    );
  }

  /**
   * Create image formats and create webp
   */
  private async makeFormats(buffer: Buffer, extension: string, id: string) {
    const { thumbnails, outputOptions, isWebp } = this.config;
    const formattedImages = [];
    const metadata = [];

    for (const { name, options } of thumbnails) {
      const params = { buffer, options, outputOptions };
      const { data: imageBuffer, info: meta } = await Image.sharpGenerate(extension, params);
      const url = this.getFilePath(id, name, extension);

      if (isWebp && extension !== ImageExtensions.webp) {
        const { data: webpBuffer } = await sharp(imageBuffer)
          .toFormat(ImageExtensions.webp)
          .toBuffer({ resolveWithObject: true });

        formattedImages.push({
          buffer: webpBuffer,
          url: this.getFilePath(id, name, ImageExtensions.webp),
          fileMime: mime.lookup(ImageExtensions.webp),
        });
      }

      formattedImages.push({
        buffer: imageBuffer,
        url,
        fileMime: mime.lookup(extension),
      });

      metadata.push({
        meta,
        hasWebp: isWebp || false,
        format: name,
        url: `/${url}`,
      });
    }

    return { formattedImages, metadata };
  }

  /**
   * Image processing
   */
  private static sharpGenerate(
    method: string,
    {
      buffer,
      options,
      outputOptions,
    }: {
      buffer: Buffer;
      options: ResizeOptions;
      outputOptions: JpegOptions | PngOptions | WebpOptions;
    },
  ): Promise<{ data: Buffer; info: OutputInfo }> {
    return sharp(buffer)
      .resize(options)
      [method]({ ...outputOptions[method] })
      .toBuffer({ resolveWithObject: true });
  }
}

export default Image;

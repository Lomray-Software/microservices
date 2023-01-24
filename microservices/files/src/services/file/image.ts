import { BaseException } from '@lomray/microservice-nodejs-lib';
import mime from 'mime';
import sharp, { JpegOptions, OutputInfo, PngOptions, ResizeOptions, WebpOptions } from 'sharp';
import FileType from '@constants/file-type';
import ImageExtensions from '@constants/image-extensions';
import File from '@entities/file';
import Abstract from './abstract';

interface IUploadImage {
  buffer: Buffer;
  url: string;
  fileMime: string;
}

const defaultMime = 'text/plain';

/**
 * Image file
 */
class Image extends Abstract {
  /**
   * Save formatted image to storage
   * @inheritDoc
   */
  public save(file: string, userId: string, alt?: string): Promise<File> {
    return this.manager.transaction(async (transactionManager) => {
      const fileRepository = transactionManager.getRepository(File);
      const fileEntity = await fileRepository.save(
        fileRepository.create({ userId, alt, url: '/', type: FileType.image }),
      );

      const { fileData, images } = await this.composeData(file, fileEntity.id);

      await this.uploadImages(images);

      return fileRepository.save({ ...fileEntity, ...fileData });
    });
  }

  /**
   * Update file
   * @inheritDoc
   */
  public async update(fileEntity: File, file?: string, alt?: string): Promise<File> {
    const { id } = fileEntity;
    let fileData;
    let images;

    if (file) {
      ({ fileData, images } = await this.composeData(file, id));

      await this.storage.delete(this.getFilePath(id));
      await this.uploadImages(images);
    }

    return this.fileRepository.save({
      ...fileEntity,
      ...(fileData && { ...fileData }),
      ...(alt && { alt }),
    });
  }

  /**
   * Delete file
   * @inheritDoc
   */
  public async remove(file: File): Promise<boolean> {
    const { id } = file;

    if (!id) {
      return false;
    }

    await this.fileRepository.remove(file);
    await this.storage.delete(this.getFilePath(id));

    return true;
  }

  /**
   * Compose data
   * @private
   */
  private async composeData(
    file: string,
    id: string,
  ): Promise<{ fileData: Partial<File>; images: IUploadImage[] }> {
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
    const fileMime = mime.getType(extension) || defaultMime;
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
      fileData: {
        url: `/${imageUrl}`,
        type: FileType.image,
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
  private async uploadImages(images: IUploadImage[]): Promise<void> {
    await Promise.all(
      images.map(({ buffer, url, fileMime }) => this.storage.upload(url, buffer, fileMime)),
    );
  }

  /**
   * Create image formats and create webp
   */
  private async makeFormats(
    buffer: Buffer,
    extension: string,
    id: string,
  ): Promise<{
    formattedImages: IUploadImage[];
    metadata: { meta: sharp.OutputInfo; hasWebp: boolean; format: string; url: string }[];
  }> {
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
          fileMime: mime.getType(ImageExtensions.webp) || defaultMime,
        });
      }

      formattedImages.push({
        buffer: imageBuffer,
        url,
        fileMime: mime.getType(extension) || defaultMime,
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

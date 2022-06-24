import { RemoteConfig } from '@lomray/microservice-helpers';
import type { JpegOptions, PngOptions, ResizeOptions, WebpOptions } from 'sharp';

export interface IImageProcessingConfig {
  thumbnails: {
    name: string;
    options: ResizeOptions;
  }[];
  outputOptions: {
    [key: string]: JpegOptions | PngOptions | WebpOptions;
  };
  isWebp?: boolean;
}

class ImageProcessingConfig {
  /**
   * @private
   */
  private static hasInit = false;

  /**
   * @private
   */
  private static imageProcessingConfig: IImageProcessingConfig;

  /**
   * Create/get image processing configuration
   */
  public static async get(params: {
    isFromConfigMs?: number;
    config: IImageProcessingConfig;
  }): Promise<IImageProcessingConfig> {
    const { isFromConfigMs, config } = params;

    if (!this.hasInit) {
      if (isFromConfigMs) {
        this.imageProcessingConfig = await RemoteConfig.get('imageProcessingConfig');
      } else {
        this.imageProcessingConfig = config;
      }

      this.hasInit = true;
    }

    return this.imageProcessingConfig;
  }

  /**
   * Reset instance
   */
  public static reset(): void {
    this.hasInit = false;
  }
}

export default ImageProcessingConfig;

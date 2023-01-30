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

declare module 'gif.js' {
  export interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    transparent?: string | number;
    dither?: boolean | string;
    debug?: boolean;
  }

  export interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  export default class GIF {
    constructor(options?: GIFOptions);
    addFrame(image: HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D, options?: AddFrameOptions): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (percent: number) => void): void;
    render(): void;
  }
}

declare module 'omggif' {
  export class GifReader {
    constructor(buffer: Uint8Array);
    width: number;
    height: number;
    numFrames(): number;
    decodeAndBlitFrameRGBA(frameIndex: number, pixels: Uint8ClampedArray | number[]): void;
    frameInfo(frameIndex: number): { delay: number; disposal: number; transparent_index: number; };
  }
}

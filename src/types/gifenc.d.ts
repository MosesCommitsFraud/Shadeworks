declare module 'gifenc' {
  export interface GIFEncoderOptions {
    palette?: number[][];
    delay?: number;
  }

  export interface GIFEncoderInstance {
    writeHeader(): void;
    setRepeat(repeat: number): void;
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options: GIFEncoderOptions
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  }

  export function GIFEncoder(): GIFEncoderInstance;
  export function quantize(rgba: Uint8Array, maxColors: number): number[][];
  export function applyPalette(rgba: Uint8Array, palette: number[][]): Uint8Array;
}

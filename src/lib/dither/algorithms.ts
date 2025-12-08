import type { Color, Palette, DitheringSettings } from './types';
import { findClosestColor, clamp } from './utils';

/**
 * Floyd-Steinberg error diffusion dithering
 * Classic algorithm with good quality
 */
export function floydSteinberg(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      // Get current pixel color
      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      // Find closest color in palette
      const newColor = findClosestColor(oldColor, palette.colors);

      // Set new color
      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      // Calculate error
      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Distribute error to neighboring pixels
      // Floyd-Steinberg matrix:
      //     X   7/16
      // 3/16 5/16 1/16

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 7 / 16);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 3 / 16);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 5 / 16);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 1 / 16);
    }
  }

  return output;
}

/**
 * Atkinson dithering
 * Mac-style algorithm, softer than Floyd-Steinberg
 */
export function atkinson(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      // Calculate error (Atkinson uses 1/8 factor)
      const errR = ((oldColor.r - newColor.r) / 8) * errorAttenuation;
      const errG = ((oldColor.g - newColor.g) / 8) * errorAttenuation;
      const errB = ((oldColor.b - newColor.b) / 8) * errorAttenuation;

      // Atkinson matrix:
      //     X   1   1
      // 1   1   1
      //     1

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 1);
      distributeError(output, width, height, x + 2 * xDelta, y, errR, errG, errB, 1);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 1);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 1);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 1);
      distributeError(output, width, height, x, y + 2, errR, errG, errB, 1);
    }
  }

  return output;
}

/**
 * Bayer matrix ordered dithering
 * Fast, creates characteristic patterns
 */
export function bayerDither(
  imageData: ImageData,
  palette: Palette,
  matrixSize: 2 | 4 | 8 | 16 = 4
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  const bayerMatrix = getBayerMatrix(matrixSize);
  const matrixScale = matrixSize * matrixSize;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Get Bayer threshold for this position
      const threshold = bayerMatrix[y % matrixSize][x % matrixSize] / matrixScale - 0.5;

      // Apply threshold to color
      const color: Color = {
        r: clamp(data[idx] + threshold * 255, 0, 255),
        g: clamp(data[idx + 1] + threshold * 255, 0, 255),
        b: clamp(data[idx + 2] + threshold * 255, 0, 255),
        a: data[idx + 3],
      };

      // Find closest color in palette
      const newColor = findClosestColor(color, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;
    }
  }

  return output;
}

/**
 * Jarvis-Judice-Ninke dithering
 * Wider error diffusion pattern
 */
export function jarvisJudiceNinke(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Jarvis-Judice-Ninke matrix:
      //         X   7   5
      // 3   5   7   5   3
      // 1   3   5   3   1

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 7 / 48);
      distributeError(output, width, height, x + 2 * xDelta, y, errR, errG, errB, 5 / 48);
      distributeError(output, width, height, x - 2 * xDelta, y + 1, errR, errG, errB, 3 / 48);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 5 / 48);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 7 / 48);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 5 / 48);
      distributeError(output, width, height, x + 2 * xDelta, y + 1, errR, errG, errB, 3 / 48);
      distributeError(output, width, height, x - 2 * xDelta, y + 2, errR, errG, errB, 1 / 48);
      distributeError(output, width, height, x - xDelta, y + 2, errR, errG, errB, 3 / 48);
      distributeError(output, width, height, x, y + 2, errR, errG, errB, 5 / 48);
      distributeError(output, width, height, x + xDelta, y + 2, errR, errG, errB, 3 / 48);
      distributeError(output, width, height, x + 2 * xDelta, y + 2, errR, errG, errB, 1 / 48);
    }
  }

  return output;
}

/**
 * Stucki dithering
 * Balanced error diffusion
 */
export function stucki(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Stucki matrix:
      //         X   8   4
      // 2   4   8   4   2
      // 1   2   4   2   1

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 8 / 42);
      distributeError(output, width, height, x + 2 * xDelta, y, errR, errG, errB, 4 / 42);
      distributeError(output, width, height, x - 2 * xDelta, y + 1, errR, errG, errB, 2 / 42);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 4 / 42);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 8 / 42);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 4 / 42);
      distributeError(output, width, height, x + 2 * xDelta, y + 1, errR, errG, errB, 2 / 42);
      distributeError(output, width, height, x - 2 * xDelta, y + 2, errR, errG, errB, 1 / 42);
      distributeError(output, width, height, x - xDelta, y + 2, errR, errG, errB, 2 / 42);
      distributeError(output, width, height, x, y + 2, errR, errG, errB, 4 / 42);
      distributeError(output, width, height, x + xDelta, y + 2, errR, errG, errB, 2 / 42);
      distributeError(output, width, height, x + 2 * xDelta, y + 2, errR, errG, errB, 1 / 42);
    }
  }

  return output;
}

/**
 * Burkes dithering
 * Fast with good quality
 */
export function burkes(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Burkes matrix:
      //         X   8   4
      // 2   4   8   4   2

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 8 / 32);
      distributeError(output, width, height, x + 2 * xDelta, y, errR, errG, errB, 4 / 32);
      distributeError(output, width, height, x - 2 * xDelta, y + 1, errR, errG, errB, 2 / 32);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 4 / 32);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 8 / 32);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 4 / 32);
      distributeError(output, width, height, x + 2 * xDelta, y + 1, errR, errG, errB, 2 / 32);
    }
  }

  return output;
}

/**
 * Sierra dithering
 * Three-row error diffusion
 */
export function sierra(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Sierra matrix:
      //         X   5   3
      // 2   4   5   4   2
      //     2   3   2

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 5 / 32);
      distributeError(output, width, height, x + 2 * xDelta, y, errR, errG, errB, 3 / 32);
      distributeError(output, width, height, x - 2 * xDelta, y + 1, errR, errG, errB, 2 / 32);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 4 / 32);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 5 / 32);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 4 / 32);
      distributeError(output, width, height, x + 2 * xDelta, y + 1, errR, errG, errB, 2 / 32);
      distributeError(output, width, height, x - xDelta, y + 2, errR, errG, errB, 2 / 32);
      distributeError(output, width, height, x, y + 2, errR, errG, errB, 3 / 32);
      distributeError(output, width, height, x + xDelta, y + 2, errR, errG, errB, 2 / 32);
    }
  }

  return output;
}

/**
 * Sierra Two-Row dithering
 * Lighter Sierra variant
 */
export function sierraTwoRow(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Sierra Two-Row matrix:
      //         X   4   3
      // 1   2   3   2   1

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 4 / 16);
      distributeError(output, width, height, x + 2 * xDelta, y, errR, errG, errB, 3 / 16);
      distributeError(output, width, height, x - 2 * xDelta, y + 1, errR, errG, errB, 1 / 16);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 2 / 16);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 3 / 16);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 2 / 16);
      distributeError(output, width, height, x + 2 * xDelta, y + 1, errR, errG, errB, 1 / 16);
    }
  }

  return output;
}

/**
 * Sierra Lite dithering
 * Simplest Sierra variant
 */
export function sierraLite(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Sierra Lite matrix:
      //     X   2
      // 1   1

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 2 / 4);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 1 / 4);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 1 / 4);
    }
  }

  return output;
}

/**
 * False Floyd-Steinberg dithering
 * Simplified variant, faster but less accurate
 */
export function falseFloydSteinberg(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // False Floyd-Steinberg matrix:
      //     X   3
      // 3   2

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 3 / 8);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 3 / 8);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 2 / 8);
    }
  }

  return output;
}

/**
 * Fan dithering
 * Specialized error diffusion
 */
export function fan(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Fan matrix:
      //         X   7
      //     1   3   5

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 7 / 16);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 1 / 16);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 3 / 16);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 5 / 16);
    }
  }

  return output;
}

/**
 * Shiau-Fan dithering
 * Hybrid error diffusion
 */
export function shiauFan(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const serpentine = settings.serpentine ?? true;
  const errorAttenuation = settings.errorAttenuation ?? 1.0;

  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1;
    const xStart = reverse ? width - 1 : 0;
    const xEnd = reverse ? -1 : width;
    const xDelta = reverse ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xDelta) {
      const idx = (y * width + x) * 4;

      const oldColor: Color = {
        r: output.data[idx],
        g: output.data[idx + 1],
        b: output.data[idx + 2],
        a: output.data[idx + 3],
      };

      const newColor = findClosestColor(oldColor, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;

      const errR = (oldColor.r - newColor.r) * errorAttenuation;
      const errG = (oldColor.g - newColor.g) * errorAttenuation;
      const errB = (oldColor.b - newColor.b) * errorAttenuation;

      // Shiau-Fan matrix:
      //         X   4
      // 1   1   2

      distributeError(output, width, height, x + xDelta, y, errR, errG, errB, 4 / 8);
      distributeError(output, width, height, x - xDelta, y + 1, errR, errG, errB, 1 / 8);
      distributeError(output, width, height, x, y + 1, errR, errG, errB, 1 / 8);
      distributeError(output, width, height, x + xDelta, y + 1, errR, errG, errB, 2 / 8);
    }
  }

  return output;
}

/**
 * Simple 2x2 threshold dithering
 * Very simple pattern
 */
export function simple2x2(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  const matrix = [
    [0, 2],
    [3, 1]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const threshold = (matrix[y % 2][x % 2] / 4 - 0.5) * 255;

      const color: Color = {
        r: clamp(data[idx] + threshold, 0, 255),
        g: clamp(data[idx + 1] + threshold, 0, 255),
        b: clamp(data[idx + 2] + threshold, 0, 255),
        a: data[idx + 3],
      };

      const newColor = findClosestColor(color, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;
    }
  }

  return output;
}

/**
 * Random threshold dithering
 * Adds random noise for organic look
 */
export function randomThreshold(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  const noiseLevel = (settings.randomNoise ?? 0) * 128;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const threshold = (Math.random() - 0.5) * noiseLevel;

      const color: Color = {
        r: clamp(data[idx] + threshold, 0, 255),
        g: clamp(data[idx + 1] + threshold, 0, 255),
        b: clamp(data[idx + 2] + threshold, 0, 255),
        a: data[idx + 3],
      };

      const newColor = findClosestColor(color, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;
    }
  }

  return output;
}

/**
 * Blue noise dithering
 * High-frequency noise pattern for smooth results
 */
export function blueNoise(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  // Generate blue noise using Mitchell's best-candidate algorithm
  // Simplified version for performance
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Blue noise approximation using high-frequency pattern
      const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123);
      const threshold = ((noise - Math.floor(noise)) - 0.5) * 64;

      const color: Color = {
        r: clamp(data[idx] + threshold, 0, 255),
        g: clamp(data[idx + 1] + threshold, 0, 255),
        b: clamp(data[idx + 2] + threshold, 0, 255),
        a: data[idx + 3],
      };

      const newColor = findClosestColor(color, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;
    }
  }

  return output;
}

/**
 * White noise dithering
 * Random uniform noise
 */
export function whiteNoise(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const threshold = (Math.random() - 0.5) * 128;

      const color: Color = {
        r: clamp(data[idx] + threshold, 0, 255),
        g: clamp(data[idx + 1] + threshold, 0, 255),
        b: clamp(data[idx + 2] + threshold, 0, 255),
        a: data[idx + 3],
      };

      const newColor = findClosestColor(color, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;
    }
  }

  return output;
}

/**
 * Ordered 3x3 dithering
 * Alternative to Bayer matrix
 */
export function ordered3x3(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  const matrix = [
    [0, 7, 3],
    [6, 5, 2],
    [4, 1, 8]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const threshold = ((matrix[y % 3][x % 3] / 9) - 0.5) * 128;

      const color: Color = {
        r: clamp(data[idx] + threshold, 0, 255),
        g: clamp(data[idx + 1] + threshold, 0, 255),
        b: clamp(data[idx + 2] + threshold, 0, 255),
        a: data[idx + 3],
      };

      const newColor = findClosestColor(color, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;
    }
  }

  return output;
}

/**
 * Clustered dot (halftone) dithering
 * Creates circular halftone dots
 */
export function clusteredDot(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  // Clustered dot matrix (4x4)
  const matrix = [
    [12, 5, 6, 13],
    [4, 0, 1, 7],
    [11, 3, 2, 8],
    [15, 10, 9, 14]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const threshold = ((matrix[y % 4][x % 4] / 16) - 0.5) * 255;

      const color: Color = {
        r: clamp(data[idx] + threshold, 0, 255),
        g: clamp(data[idx + 1] + threshold, 0, 255),
        b: clamp(data[idx + 2] + threshold, 0, 255),
        a: data[idx + 3],
      };

      const newColor = findClosestColor(color, palette.colors);

      output.data[idx] = newColor.r;
      output.data[idx + 1] = newColor.g;
      output.data[idx + 2] = newColor.b;
      output.data[idx + 3] = newColor.a ?? 255;
    }
  }

  return output;
}

/**
 * Helper function to distribute error to a neighboring pixel
 */
function distributeError(
  imageData: ImageData,
  width: number,
  height: number,
  x: number,
  y: number,
  errR: number,
  errG: number,
  errB: number,
  factor: number
): void {
  if (x < 0 || x >= width || y < 0 || y >= height) return;

  const idx = (y * width + x) * 4;
  imageData.data[idx] = clamp(imageData.data[idx] + errR * factor, 0, 255);
  imageData.data[idx + 1] = clamp(imageData.data[idx + 1] + errG * factor, 0, 255);
  imageData.data[idx + 2] = clamp(imageData.data[idx + 2] + errB * factor, 0, 255);
}

/**
 * Get Bayer matrix for ordered dithering
 */
function getBayerMatrix(size: 2 | 4 | 8 | 16): number[][] {
  if (size === 2) {
    return [
      [0, 2],
      [3, 1],
    ];
  }

  if (size === 4) {
    return [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
  }

  if (size === 8) {
    return [
      [0, 32, 8, 40, 2, 34, 10, 42],
      [48, 16, 56, 24, 50, 18, 58, 26],
      [12, 44, 4, 36, 14, 46, 6, 38],
      [60, 28, 52, 20, 62, 30, 54, 22],
      [3, 35, 11, 43, 1, 33, 9, 41],
      [51, 19, 59, 27, 49, 17, 57, 25],
      [15, 47, 7, 39, 13, 45, 5, 37],
      [63, 31, 55, 23, 61, 29, 53, 21],
    ];
  }

  // 16x16 Bayer matrix (generated)
  const matrix: number[][] = [];
  for (let i = 0; i < 16; i++) {
    matrix[i] = [];
    for (let j = 0; j < 16; j++) {
      matrix[i][j] =
        (i % 4) * 64 +
        (j % 4) * 16 +
        Math.floor(i / 4) * 4 +
        Math.floor(j / 4);
    }
  }
  return matrix;
}

/**
 * Apply dithering based on algorithm selection
 */
export function applyDithering(
  imageData: ImageData,
  palette: Palette,
  settings: DitheringSettings
): ImageData {
  const algorithm = settings.algorithm;

  switch (algorithm) {
    case 'floyd-steinberg':
      return floydSteinberg(imageData, palette, settings);

    case 'atkinson':
      return atkinson(imageData, palette, settings);

    case 'jarvis-judice-ninke':
      return jarvisJudiceNinke(imageData, palette, settings);

    case 'stucki':
      return stucki(imageData, palette, settings);

    case 'burkes':
      return burkes(imageData, palette, settings);

    case 'sierra':
      return sierra(imageData, palette, settings);

    case 'sierra-2row':
      return sierraTwoRow(imageData, palette, settings);

    case 'sierra-lite':
      return sierraLite(imageData, palette, settings);

    case 'false-floyd-steinberg':
      return falseFloydSteinberg(imageData, palette, settings);

    case 'fan':
      return fan(imageData, palette, settings);

    case 'shiau-fan':
      return shiauFan(imageData, palette, settings);

    case 'simple-2x2':
      return simple2x2(imageData, palette, settings);

    case 'random-threshold':
      return randomThreshold(imageData, palette, settings);

    case 'blue-noise':
      return blueNoise(imageData, palette, settings);

    case 'white-noise':
      return whiteNoise(imageData, palette, settings);

    case 'ordered-3x3':
      return ordered3x3(imageData, palette, settings);

    case 'clustered-dot':
      return clusteredDot(imageData, palette, settings);

    case 'bayer-2x2':
      return bayerDither(imageData, palette, 2);

    case 'bayer-4x4':
      return bayerDither(imageData, palette, 4);

    case 'bayer-8x8':
      return bayerDither(imageData, palette, 8);

    case 'bayer-16x16':
      return bayerDither(imageData, palette, 16);

    default:
      // Default to Floyd-Steinberg
      return floydSteinberg(imageData, palette, settings);
  }
}

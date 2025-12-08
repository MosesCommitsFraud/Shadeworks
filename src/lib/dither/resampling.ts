import type { ResamplingAlgorithm } from './types';

/**
 * Resampling algorithms for image scaling
 *
 * Provides various interpolation methods for high-quality image resizing
 */

/**
 * Nearest neighbor resampling (fast, pixelated)
 */
export function nearestNeighbor(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(targetWidth, targetHeight);
  const outData = output.data;

  const xRatio = width / targetWidth;
  const yRatio = height / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * xRatio);
      const srcY = Math.floor(y * yRatio);
      const srcIdx = (srcY * width + srcX) * 4;
      const outIdx = (y * targetWidth + x) * 4;

      outData[outIdx] = data[srcIdx];
      outData[outIdx + 1] = data[srcIdx + 1];
      outData[outIdx + 2] = data[srcIdx + 2];
      outData[outIdx + 3] = data[srcIdx + 3];
    }
  }

  return output;
}

/**
 * Bilinear interpolation (smooth, good quality)
 */
export function bilinear(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(targetWidth, targetHeight);
  const outData = output.data;

  const xRatio = (width - 1) / targetWidth;
  const yRatio = (height - 1) / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;

      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, width - 1);
      const y2 = Math.min(y1 + 1, height - 1);

      const xWeight = srcX - x1;
      const yWeight = srcY - y1;

      const outIdx = (y * targetWidth + x) * 4;

      // Interpolate each channel
      for (let c = 0; c < 4; c++) {
        const tl = data[(y1 * width + x1) * 4 + c];
        const tr = data[(y1 * width + x2) * 4 + c];
        const bl = data[(y2 * width + x1) * 4 + c];
        const br = data[(y2 * width + x2) * 4 + c];

        const top = tl * (1 - xWeight) + tr * xWeight;
        const bottom = bl * (1 - xWeight) + br * xWeight;
        const value = top * (1 - yWeight) + bottom * yWeight;

        outData[outIdx + c] = Math.round(value);
      }
    }
  }

  return output;
}

/**
 * Bicubic interpolation (high quality, slower)
 */
export function bicubic(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(targetWidth, targetHeight);
  const outData = output.data;

  const xRatio = width / targetWidth;
  const yRatio = height / targetHeight;

  // Cubic interpolation kernel
  const cubicKernel = (x: number): number => {
    const absX = Math.abs(x);
    if (absX <= 1) {
      return 1.5 * absX * absX * absX - 2.5 * absX * absX + 1;
    } else if (absX < 2) {
      return -0.5 * absX * absX * absX + 2.5 * absX * absX - 4 * absX + 2;
    }
    return 0;
  };

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;

      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);

      const outIdx = (y * targetWidth + x) * 4;

      // Sample 4x4 neighborhood
      for (let c = 0; c < 4; c++) {
        let value = 0;
        let weightSum = 0;

        for (let dy = -1; dy <= 2; dy++) {
          for (let dx = -1; dx <= 2; dx++) {
            const sx = Math.max(0, Math.min(width - 1, x0 + dx));
            const sy = Math.max(0, Math.min(height - 1, y0 + dy));

            const weight =
              cubicKernel(srcX - (x0 + dx)) * cubicKernel(srcY - (y0 + dy));

            value += data[(sy * width + sx) * 4 + c] * weight;
            weightSum += weight;
          }
        }

        outData[outIdx + c] = Math.round(Math.max(0, Math.min(255, value / weightSum)));
      }
    }
  }

  return output;
}

/**
 * Lanczos resampling (highest quality, slowest)
 */
export function lanczos(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  lobes: number = 3
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(targetWidth, targetHeight);
  const outData = output.data;

  const xRatio = width / targetWidth;
  const yRatio = height / targetHeight;

  // Lanczos kernel
  const lanczosKernel = (x: number): number => {
    if (x === 0) return 1;
    if (Math.abs(x) >= lobes) return 0;

    const xPi = x * Math.PI;
    return (lobes * Math.sin(xPi) * Math.sin(xPi / lobes)) / (xPi * xPi);
  };

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;

      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);

      const outIdx = (y * targetWidth + x) * 4;

      // Sample neighborhood
      for (let c = 0; c < 4; c++) {
        let value = 0;
        let weightSum = 0;

        for (let dy = -lobes + 1; dy <= lobes; dy++) {
          for (let dx = -lobes + 1; dx <= lobes; dx++) {
            const sx = Math.max(0, Math.min(width - 1, x0 + dx));
            const sy = Math.max(0, Math.min(height - 1, y0 + dy));

            const weight =
              lanczosKernel(srcX - (x0 + dx)) * lanczosKernel(srcY - (y0 + dy));

            value += data[(sy * width + sx) * 4 + c] * weight;
            weightSum += weight;
          }
        }

        outData[outIdx + c] = Math.round(Math.max(0, Math.min(255, value / weightSum)));
      }
    }
  }

  return output;
}

/**
 * Resample image using specified algorithm
 */
export function resampleImage(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  algorithm: ResamplingAlgorithm = 'bilinear'
): ImageData {
  // If no scaling needed, return copy
  if (imageData.width === targetWidth && imageData.height === targetHeight) {
    const output = new ImageData(targetWidth, targetHeight);
    output.data.set(imageData.data);
    return output;
  }

  switch (algorithm) {
    case 'nearest-neighbor':
      return nearestNeighbor(imageData, targetWidth, targetHeight);
    case 'bilinear':
      return bilinear(imageData, targetWidth, targetHeight);
    case 'bicubic':
      return bicubic(imageData, targetWidth, targetHeight);
    case 'lanczos':
      return lanczos(imageData, targetWidth, targetHeight);
    default:
      return bilinear(imageData, targetWidth, targetHeight);
  }
}

/**
 * Scale image by percentage
 */
export function scaleImageByPercent(
  imageData: ImageData,
  scalePercent: number,
  algorithm: ResamplingAlgorithm = 'bilinear'
): ImageData {
  const scale = scalePercent / 100;
  const targetWidth = Math.round(imageData.width * scale);
  const targetHeight = Math.round(imageData.height * scale);
  return resampleImage(imageData, targetWidth, targetHeight, algorithm);
}

/**
 * Scale image to fit within max dimensions while maintaining aspect ratio
 */
export function scaleToFit(
  imageData: ImageData,
  maxWidth: number,
  maxHeight: number,
  algorithm: ResamplingAlgorithm = 'bilinear'
): ImageData {
  const { width, height } = imageData;

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const scale = Math.min(widthRatio, heightRatio, 1); // Don't upscale

  if (scale === 1) {
    const output = new ImageData(width, height);
    output.data.set(imageData.data);
    return output;
  }

  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);
  return resampleImage(imageData, targetWidth, targetHeight, algorithm);
}

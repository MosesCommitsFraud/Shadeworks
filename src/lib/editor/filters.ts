/**
 * Image Filters
 * Built-in and custom filters for image processing
 */

export type FilterType =
  | 'blur'
  | 'sharpen'
  | 'gaussianBlur'
  | 'brighten'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'pixelate'
  | 'emboss'
  | 'edgeDetect';

export interface FilterConfig {
  type: FilterType;
  intensity: number; // 0-100
}

/**
 * Apply blur filter
 */
export function applyBlur(imageData: ImageData, radius: number): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  // Simple box blur
  const w = imageData.width;
  const h = imageData.height;
  const data = result.data;
  const tempData = new Uint8ClampedArray(data);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const i = (ny * w + nx) * 4;
            r += tempData[i];
            g += tempData[i + 1];
            b += tempData[i + 2];
            count++;
          }
        }
      }

      const i = (y * w + x) * 4;
      data[i] = r / count;
      data[i + 1] = g / count;
      data[i + 2] = b / count;
    }
  }

  return result;
}

/**
 * Apply sharpen filter
 */
export function applySharpen(imageData: ImageData, amount: number): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const w = imageData.width;
  const h = imageData.height;
  const data = result.data;
  const tempData = new Uint8ClampedArray(data);

  // Sharpen kernel
  const kernel = [
    0, -amount, 0,
    -amount, 1 + 4 * amount, -amount,
    0, -amount, 0
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const i = ((y + ky) * w + (x + kx)) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];
          r += tempData[i] * k;
          g += tempData[i + 1] * k;
          b += tempData[i + 2] * k;
        }
      }

      const i = (y * w + x) * 4;
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
  }

  return result;
}

/**
 * Apply grayscale filter
 */
export function applyGrayscale(imageData: ImageData): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const data = result.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  return result;
}

/**
 * Apply sepia filter
 */
export function applySepia(imageData: ImageData, intensity: number): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const data = result.data;
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const nr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
    const ng = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
    const nb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);

    data[i] = r + (nr - r) * factor;
    data[i + 1] = g + (ng - g) * factor;
    data[i + 2] = b + (nb - b) * factor;
  }

  return result;
}

/**
 * Apply invert filter
 */
export function applyInvert(imageData: ImageData): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const data = result.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }

  return result;
}

/**
 * Apply pixelate filter
 */
export function applyPixelate(imageData: ImageData, pixelSize: number): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const w = imageData.width;
  const h = imageData.height;
  const data = result.data;
  const tempData = new Uint8ClampedArray(imageData.data);

  for (let y = 0; y < h; y += pixelSize) {
    for (let x = 0; x < w; x += pixelSize) {
      // Get average color of block
      let r = 0, g = 0, b = 0, count = 0;

      for (let dy = 0; dy < pixelSize && y + dy < h; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < w; dx++) {
          const i = ((y + dy) * w + (x + dx)) * 4;
          r += tempData[i];
          g += tempData[i + 1];
          b += tempData[i + 2];
          count++;
        }
      }

      r /= count;
      g /= count;
      b /= count;

      // Set block to average color
      for (let dy = 0; dy < pixelSize && y + dy < h; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < w; dx++) {
          const i = ((y + dy) * w + (x + dx)) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
      }
    }
  }

  return result;
}

/**
 * Apply emboss filter
 */
export function applyEmboss(imageData: ImageData): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const w = imageData.width;
  const h = imageData.height;
  const data = result.data;
  const tempData = new Uint8ClampedArray(imageData.data);

  // Emboss kernel
  const kernel = [
    -2, -1, 0,
    -1, 1, 1,
    0, 1, 2
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const i = ((y + ky) * w + (x + kx)) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];
          r += tempData[i] * k;
          g += tempData[i + 1] * k;
          b += tempData[i + 2] * k;
        }
      }

      const i = (y * w + x) * 4;
      data[i] = Math.max(0, Math.min(255, r + 128));
      data[i + 1] = Math.max(0, Math.min(255, g + 128));
      data[i + 2] = Math.max(0, Math.min(255, b + 128));
    }
  }

  return result;
}

/**
 * Apply edge detection filter
 */
export function applyEdgeDetect(imageData: ImageData): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const w = imageData.width;
  const h = imageData.height;
  const data = result.data;
  const tempData = new Uint8ClampedArray(imageData.data);

  // Sobel kernel for edge detection
  const kernelX = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ];

  const kernelY = [
    -1, -2, -1,
    0, 0, 0,
    1, 2, 1
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const i = ((y + ky) * w + (x + kx)) * 4;
          const gray = 0.299 * tempData[i] + 0.587 * tempData[i + 1] + 0.114 * tempData[i + 2];
          const kIndex = (ky + 1) * 3 + (kx + 1);
          gx += gray * kernelX[kIndex];
          gy += gray * kernelY[kIndex];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const i = (y * w + x) * 4;
      data[i] = magnitude;
      data[i + 1] = magnitude;
      data[i + 2] = magnitude;
    }
  }

  return result;
}

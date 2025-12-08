import type { Palette, Color, PaletteType } from './types';

/**
 * Basic monochrome palette (pure black and white)
 */
export const BW_PALETTE: Palette = {
  name: 'Black & White',
  type: 'bw',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'Pure black and white, high contrast',
};

/**
 * Warm monochrome palette (sepia-toned)
 */
export const WARM_BW_PALETTE: Palette = {
  name: 'Warm B&W',
  type: 'warm-bw',
  colors: [
    { r: 40, g: 26, b: 13, a: 255 },
    { r: 255, g: 250, b: 240, a: 255 },
  ],
  description: 'Warm, sepia-toned black and white',
};

/**
 * Cool monochrome palette (blue-toned)
 */
export const COOL_BW_PALETTE: Palette = {
  name: 'Cool B&W',
  type: 'cool-bw',
  colors: [
    { r: 13, g: 26, b: 40, a: 255 },
    { r: 240, g: 250, b: 255, a: 255 },
  ],
  description: 'Cool, blue-toned black and white',
};

/**
 * 2-shade grayscale
 */
export const GRAYSCALE_2_PALETTE: Palette = {
  name: '2 Shades',
  type: 'grayscale-2',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: '2-level grayscale',
};

/**
 * 4-shade grayscale
 */
export const GRAYSCALE_4_PALETTE: Palette = {
  name: '4 Shades',
  type: 'grayscale-4',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 85, g: 85, b: 85, a: 255 },
    { r: 170, g: 170, b: 170, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: '4-level grayscale',
};

/**
 * 8-shade grayscale
 */
export const GRAYSCALE_8_PALETTE: Palette = {
  name: '8 Shades',
  type: 'grayscale-8',
  colors: Array.from({ length: 8 }, (_, i) => {
    const value = Math.round((255 / 7) * i);
    return { r: value, g: value, b: value, a: 255 };
  }),
  description: '8-level grayscale',
};

/**
 * 16-shade grayscale
 */
export const GRAYSCALE_16_PALETTE: Palette = {
  name: '16 Shades',
  type: 'grayscale-16',
  colors: Array.from({ length: 16 }, (_, i) => {
    const value = Math.round((255 / 15) * i);
    return { r: value, g: value, b: value, a: 255 };
  }),
  description: '16-level grayscale',
};

/**
 * Game Boy palette (4 greens)
 */
export const GAMEBOY_PALETTE: Palette = {
  name: 'Game Boy',
  type: 'gameboy',
  colors: [
    { r: 15, g: 56, b: 15, a: 255 },
    { r: 48, g: 98, b: 48, a: 255 },
    { r: 139, g: 172, b: 15, a: 255 },
    { r: 155, g: 188, b: 15, a: 255 },
  ],
  description: 'Classic Game Boy green palette',
};

/**
 * CGA Palette (4 colors)
 */
export const CGA_PALETTE: Palette = {
  name: 'CGA',
  type: 'cga',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 0, g: 255, b: 255, a: 255 },
    { r: 255, g: 0, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'IBM CGA graphics standard',
};

/**
 * All built-in palettes
 */
export const BUILT_IN_PALETTES: Palette[] = [
  BW_PALETTE,
  WARM_BW_PALETTE,
  COOL_BW_PALETTE,
  GRAYSCALE_2_PALETTE,
  GRAYSCALE_4_PALETTE,
  GRAYSCALE_8_PALETTE,
  GRAYSCALE_16_PALETTE,
  GAMEBOY_PALETTE,
  CGA_PALETTE,
];

/**
 * Get palette by type
 */
export function getPaletteByType(type: PaletteType): Palette | undefined {
  return BUILT_IN_PALETTES.find((p) => p.type === type);
}

/**
 * Get default palette
 */
export function getDefaultPalette(): Palette {
  return BW_PALETTE;
}

/**
 * Create a custom grayscale palette
 */
export function createGrayscalePalette(shades: number): Palette {
  const colors: Color[] = Array.from({ length: shades }, (_, i) => {
    const value = Math.round((255 / (shades - 1)) * i);
    return { r: value, g: value, b: value, a: 255 };
  });

  return {
    name: `${shades} Shades`,
    type: 'custom',
    colors,
    description: `${shades}-level grayscale palette`,
  };
}

/**
 * Create a custom palette from an array of colors
 */
export function createCustomPalette(
  colors: Color[],
  name: string = 'Custom',
  description?: string
): Palette {
  return {
    name,
    type: 'custom',
    colors,
    description,
  };
}

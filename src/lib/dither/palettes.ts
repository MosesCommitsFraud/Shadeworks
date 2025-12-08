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
 * EGA Palette (16 colors)
 */
export const EGA_PALETTE: Palette = {
  name: 'EGA',
  type: 'ega',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 0, g: 0, b: 170, a: 255 },
    { r: 0, g: 170, b: 0, a: 255 },
    { r: 0, g: 170, b: 170, a: 255 },
    { r: 170, g: 0, b: 0, a: 255 },
    { r: 170, g: 0, b: 170, a: 255 },
    { r: 170, g: 85, b: 0, a: 255 },
    { r: 170, g: 170, b: 170, a: 255 },
    { r: 85, g: 85, b: 85, a: 255 },
    { r: 85, g: 85, b: 255, a: 255 },
    { r: 85, g: 255, b: 85, a: 255 },
    { r: 85, g: 255, b: 255, a: 255 },
    { r: 255, g: 85, b: 85, a: 255 },
    { r: 255, g: 85, b: 255, a: 255 },
    { r: 255, g: 255, b: 85, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'IBM EGA 16-color palette',
};

/**
 * Commodore 64 Palette
 */
export const C64_PALETTE: Palette = {
  name: 'Commodore 64',
  type: 'commodore-64',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 136, g: 57, b: 50, a: 255 },
    { r: 103, g: 182, b: 189, a: 255 },
    { r: 139, g: 63, b: 150, a: 255 },
    { r: 85, g: 160, b: 73, a: 255 },
    { r: 64, g: 49, b: 141, a: 255 },
    { r: 191, g: 206, b: 114, a: 255 },
    { r: 139, g: 84, b: 41, a: 255 },
    { r: 87, g: 66, b: 0, a: 255 },
    { r: 184, g: 105, b: 98, a: 255 },
    { r: 80, g: 80, b: 80, a: 255 },
    { r: 120, g: 120, b: 120, a: 255 },
    { r: 148, g: 224, b: 137, a: 255 },
    { r: 120, g: 105, b: 196, a: 255 },
    { r: 159, g: 159, b: 159, a: 255 },
  ],
  description: 'Classic Commodore 64 color palette',
};

/**
 * Apple II Palette
 */
export const APPLE_II_PALETTE: Palette = {
  name: 'Apple II',
  type: 'apple-ii',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 114, g: 38, b: 64, a: 255 },
    { r: 64, g: 51, b: 127, a: 255 },
    { r: 228, g: 52, b: 254, a: 255 },
    { r: 14, g: 89, b: 64, a: 255 },
    { r: 128, g: 128, b: 128, a: 255 },
    { r: 27, g: 154, b: 254, a: 255 },
    { r: 191, g: 179, b: 255, a: 255 },
    { r: 64, g: 76, b: 0, a: 255 },
    { r: 228, g: 101, b: 1, a: 255 },
    { r: 128, g: 128, b: 128, a: 255 },
    { r: 241, g: 166, b: 191, a: 255 },
    { r: 27, g: 203, b: 1, a: 255 },
    { r: 191, g: 204, b: 128, a: 255 },
    { r: 141, g: 217, b: 191, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'Apple II high-resolution color palette',
};

/**
 * NES Palette (simplified to 16 most used colors)
 */
export const NES_PALETTE: Palette = {
  name: 'NES',
  type: 'nes',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 124, g: 124, b: 124, a: 255 },
    { r: 0, g: 0, b: 252, a: 255 },
    { r: 0, g: 120, b: 248, a: 255 },
    { r: 0, g: 168, b: 0, a: 255 },
    { r: 216, g: 0, b: 204, a: 255 },
    { r: 228, g: 0, b: 88, a: 255 },
    { r: 248, g: 56, b: 0, a: 255 },
    { r: 252, g: 152, b: 56, a: 255 },
    { r: 248, g: 216, b: 0, a: 255 },
    { r: 60, g: 188, b: 252, a: 255 },
    { r: 88, g: 248, b: 152, a: 255 },
    { r: 0, g: 232, b: 216, a: 255 },
    { r: 188, g: 188, b: 188, a: 255 },
    { r: 248, g: 184, b: 184, a: 255 },
    { r: 248, g: 248, b: 248, a: 255 },
  ],
  description: 'Nintendo Entertainment System palette',
};

/**
 * ZX Spectrum Palette
 */
export const ZX_SPECTRUM_PALETTE: Palette = {
  name: 'ZX Spectrum',
  type: 'zx-spectrum',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 0, g: 0, b: 215, a: 255 },
    { r: 215, g: 0, b: 0, a: 255 },
    { r: 215, g: 0, b: 215, a: 255 },
    { r: 0, g: 215, b: 0, a: 255 },
    { r: 0, g: 215, b: 215, a: 255 },
    { r: 215, g: 215, b: 0, a: 255 },
    { r: 215, g: 215, b: 215, a: 255 },
    { r: 0, g: 0, b: 255, a: 255 },
    { r: 255, g: 0, b: 0, a: 255 },
    { r: 255, g: 0, b: 255, a: 255 },
    { r: 0, g: 255, b: 0, a: 255 },
    { r: 0, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 0, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'Sinclair ZX Spectrum palette',
};

/**
 * Pastel Palette
 */
export const PASTEL_PALETTE: Palette = {
  name: 'Pastel',
  type: 'pastel',
  colors: [
    { r: 255, g: 223, b: 211, a: 255 },
    { r: 255, g: 234, b: 234, a: 255 },
    { r: 234, g: 221, b: 255, a: 255 },
    { r: 221, g: 234, b: 255, a: 255 },
    { r: 221, g: 255, b: 247, a: 255 },
    { r: 221, g: 255, b: 221, a: 255 },
    { r: 255, g: 255, b: 221, a: 255 },
    { r: 255, g: 234, b: 221, a: 255 },
    { r: 255, g: 192, b: 203, a: 255 },
    { r: 230, g: 190, b: 255, a: 255 },
    { r: 173, g: 216, b: 230, a: 255 },
    { r: 176, g: 224, b: 230, a: 255 },
    { r: 152, g: 255, b: 152, a: 255 },
    { r: 255, g: 255, b: 176, a: 255 },
    { r: 255, g: 218, b: 185, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'Soft pastel color palette',
};

/**
 * Vaporwave Palette
 */
export const VAPORWAVE_PALETTE: Palette = {
  name: 'Vaporwave',
  type: 'vaporwave',
  colors: [
    { r: 1, g: 0, b: 38, a: 255 },
    { r: 102, g: 26, b: 102, a: 255 },
    { r: 178, g: 26, b: 140, a: 255 },
    { r: 255, g: 0, b: 153, a: 255 },
    { r: 255, g: 77, b: 166, a: 255 },
    { r: 0, g: 217, b: 217, a: 255 },
    { r: 102, g: 255, b: 255, a: 255 },
    { r: 179, g: 255, b: 255, a: 255 },
    { r: 255, g: 26, b: 255, a: 255 },
    { r: 255, g: 128, b: 255, a: 255 },
    { r: 128, g: 0, b: 255, a: 255 },
    { r: 191, g: 128, b: 255, a: 255 },
    { r: 0, g: 140, b: 217, a: 255 },
    { r: 77, g: 191, b: 255, a: 255 },
    { r: 230, g: 179, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'Aesthetic vaporwave pink and cyan',
};

/**
 * Synthwave/Outrun Palette
 */
export const SYNTHWAVE_PALETTE: Palette = {
  name: 'Synthwave',
  type: 'synthwave',
  colors: [
    { r: 5, g: 4, b: 23, a: 255 },
    { r: 20, g: 12, b: 41, a: 255 },
    { r: 41, g: 14, b: 76, a: 255 },
    { r: 94, g: 15, b: 135, a: 255 },
    { r: 169, g: 17, b: 157, a: 255 },
    { r: 237, g: 20, b: 141, a: 255 },
    { r: 255, g: 56, b: 100, a: 255 },
    { r: 255, g: 111, b: 66, a: 255 },
    { r: 255, g: 169, b: 56, a: 255 },
    { r: 255, g: 224, b: 102, a: 255 },
    { r: 3, g: 195, b: 131, a: 255 },
    { r: 58, g: 255, b: 226, a: 255 },
    { r: 102, g: 191, b: 255, a: 255 },
    { r: 179, g: 128, b: 255, a: 255 },
    { r: 230, g: 179, b: 255, a: 255 },
    { r: 255, g: 230, b: 255, a: 255 },
  ],
  description: 'Retro synthwave/outrun neon colors',
};

/**
 * Cyberpunk Palette
 */
export const CYBERPUNK_PALETTE: Palette = {
  name: 'Cyberpunk',
  type: 'cyberpunk',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 26, g: 28, b: 44, a: 255 },
    { r: 51, g: 28, b: 66, a: 255 },
    { r: 93, g: 39, b: 93, a: 255 },
    { r: 177, g: 62, b: 83, a: 255 },
    { r: 239, g: 125, b: 87, a: 255 },
    { r: 255, g: 205, b: 117, a: 255 },
    { r: 255, g: 255, b: 153, a: 255 },
    { r: 0, g: 226, b: 255, a: 255 },
    { r: 41, g: 173, b: 255, a: 255 },
    { r: 131, g: 118, b: 255, a: 255 },
    { r: 255, g: 0, b: 162, a: 255 },
    { r: 255, g: 73, b: 206, a: 255 },
    { r: 144, g: 219, b: 255, a: 255 },
    { r: 194, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'Dark cyberpunk neon palette',
};

/**
 * Nordic Palette
 */
export const NORDIC_PALETTE: Palette = {
  name: 'Nordic',
  type: 'nordic',
  colors: [
    { r: 46, g: 52, b: 64, a: 255 },
    { r: 59, g: 66, b: 82, a: 255 },
    { r: 67, g: 76, b: 94, a: 255 },
    { r: 76, g: 86, b: 106, a: 255 },
    { r: 216, g: 222, b: 233, a: 255 },
    { r: 229, g: 233, b: 240, a: 255 },
    { r: 236, g: 239, b: 244, a: 255 },
    { r: 143, g: 188, b: 187, a: 255 },
    { r: 136, g: 192, b: 208, a: 255 },
    { r: 129, g: 161, b: 193, a: 255 },
    { r: 94, g: 129, b: 172, a: 255 },
    { r: 191, g: 97, b: 106, a: 255 },
    { r: 208, g: 135, b: 112, a: 255 },
    { r: 235, g: 203, b: 139, a: 255 },
    { r: 163, g: 190, b: 140, a: 255 },
    { r: 180, g: 142, b: 173, a: 255 },
  ],
  description: 'Muted Nordic earth tones',
};

/**
 * Newspaper Palette
 */
export const NEWSPAPER_PALETTE: Palette = {
  name: 'Newspaper',
  type: 'newspaper',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 128, g: 128, b: 128, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'Simple newspaper print (black, gray, white)',
};

/**
 * Risograph Palette
 */
export const RISOGRAPH_PALETTE: Palette = {
  name: 'Risograph',
  type: 'risograph',
  colors: [
    { r: 255, g: 72, b: 18, a: 255 },
    { r: 255, g: 120, b: 0, a: 255 },
    { r: 255, g: 222, b: 23, a: 255 },
    { r: 0, g: 167, b: 157, a: 255 },
    { r: 0, g: 120, b: 191, a: 255 },
    { r: 62, g: 68, b: 156, a: 255 },
    { r: 227, g: 33, b: 88, a: 255 },
    { r: 255, g: 70, b: 148, a: 255 },
  ],
  description: 'Bright risograph printing colors',
};

/**
 * Screen Print Palette (spot colors)
 */
export const SCREEN_PRINT_PALETTE: Palette = {
  name: 'Screen Print',
  type: 'screen-print',
  colors: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 237, g: 28, b: 36, a: 255 },
    { r: 255, g: 242, b: 0, a: 255 },
    { r: 0, g: 166, b: 81, a: 255 },
    { r: 0, g: 114, b: 188, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
  description: 'Simple spot colors for screen printing',
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
  EGA_PALETTE,
  C64_PALETTE,
  APPLE_II_PALETTE,
  NES_PALETTE,
  ZX_SPECTRUM_PALETTE,
  PASTEL_PALETTE,
  VAPORWAVE_PALETTE,
  SYNTHWAVE_PALETTE,
  CYBERPUNK_PALETTE,
  NORDIC_PALETTE,
  NEWSPAPER_PALETTE,
  RISOGRAPH_PALETTE,
  SCREEN_PRINT_PALETTE,
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

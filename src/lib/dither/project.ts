import type {
  Palette,
  DitheringSettings,
  AdjustmentSettings,
  ColorModeSettings,
} from './types';

/**
 * Shadeworks Dither Project File Format (.swdither)
 */
export interface DitherProject {
  version: string; // Format version for future compatibility
  metadata: {
    name: string; // Project name
    created: string; // ISO timestamp
    modified: string; // ISO timestamp
    author?: string;
    description?: string;
  };
  image: {
    width: number;
    height: number;
    data: string; // Base64 encoded ImageData
  };
  settings: {
    dithering: DitheringSettings;
    adjustments: AdjustmentSettings;
    colorMode: ColorModeSettings;
    palette: Palette;
  };
  ui?: {
    zoom?: number;
    pan?: { x: number; y: number };
  };
}

/**
 * Current project format version
 */
const CURRENT_VERSION = '1.0.0';

/**
 * Convert ImageData to base64 string
 */
function imageDataToBase64(imageData: ImageData): string {
  // Create canvas to convert ImageData to PNG
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Convert base64 string to ImageData
 */
async function base64ToImageData(base64: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

/**
 * Create a new project from current editor state
 */
export function createProject(
  name: string,
  image: ImageData,
  settings: {
    dithering: DitheringSettings;
    adjustments: AdjustmentSettings;
    colorMode: ColorModeSettings;
    palette: Palette;
  },
  ui?: {
    zoom?: number;
    pan?: { x: number; y: number };
  }
): DitherProject {
  const now = new Date().toISOString();

  return {
    version: CURRENT_VERSION,
    metadata: {
      name,
      created: now,
      modified: now,
    },
    image: {
      width: image.width,
      height: image.height,
      data: imageDataToBase64(image),
    },
    settings,
    ui,
  };
}

/**
 * Save project to .swdither file
 */
export function saveProject(project: DitherProject): void {
  // Update modified timestamp
  project.metadata.modified = new Date().toISOString();

  // Convert to JSON
  const json = JSON.stringify(project, null, 2);

  // Create blob and download
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.metadata.name}.swdither`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Load project from .swdither file
 */
export async function loadProject(file: File): Promise<DitherProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const project: DitherProject = JSON.parse(text);

        // Validate project structure
        if (!project.version || !project.metadata || !project.image || !project.settings) {
          reject(new Error('Invalid project file structure'));
          return;
        }

        // Check version compatibility
        if (!isCompatibleVersion(project.version)) {
          reject(new Error(`Incompatible project version: ${project.version}. Current version: ${CURRENT_VERSION}`));
          return;
        }

        resolve(project);
      } catch (error) {
        reject(new Error('Failed to parse project file: ' + (error as Error).message));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Extract ImageData from loaded project
 */
export async function extractImageData(project: DitherProject): Promise<ImageData> {
  return base64ToImageData(project.image.data);
}

/**
 * Check if project version is compatible with current version
 */
function isCompatibleVersion(version: string): boolean {
  const [major] = version.split('.').map(Number);
  const [currentMajor] = CURRENT_VERSION.split('.').map(Number);

  // Compatible if major version matches
  return major === currentMajor;
}

/**
 * Export project as JSON string (for debugging or API use)
 */
export function exportProjectJSON(project: DitherProject): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Import project from JSON string
 */
export async function importProjectJSON(json: string): Promise<DitherProject> {
  try {
    const project: DitherProject = JSON.parse(json);

    if (!project.version || !project.metadata || !project.image || !project.settings) {
      throw new Error('Invalid project structure');
    }

    if (!isCompatibleVersion(project.version)) {
      throw new Error(`Incompatible version: ${project.version}`);
    }

    return project;
  } catch (error) {
    throw new Error('Failed to import project: ' + (error as Error).message);
  }
}

/**
 * Create a quick save snapshot (autosave)
 */
export function createQuickSave(
  image: ImageData,
  settings: {
    dithering: DitheringSettings;
    adjustments: AdjustmentSettings;
    colorMode: ColorModeSettings;
    palette: Palette;
  }
): string {
  const project = createProject(
    'autosave',
    image,
    settings
  );

  return exportProjectJSON(project);
}

/**
 * Restore from quick save
 */
export async function restoreQuickSave(json: string): Promise<{
  image: ImageData;
  settings: {
    dithering: DitheringSettings;
    adjustments: AdjustmentSettings;
    colorMode: ColorModeSettings;
    palette: Palette;
  };
}> {
  const project = await importProjectJSON(json);
  const image = await extractImageData(project);

  return {
    image,
    settings: project.settings,
  };
}

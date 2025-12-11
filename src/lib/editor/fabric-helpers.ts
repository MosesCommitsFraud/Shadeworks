// @ts-nocheck - Fabric.js v6 has incomplete TypeScript definitions
import * as fabric from 'fabric';
import type { Layer } from './types';

/**
 * Initialize a new Fabric.js canvas
 */
export function initializeCanvas(
  canvasElement: HTMLCanvasElement,
  width: number,
  height: number
): fabric.Canvas {
  const canvas = new fabric.Canvas(canvasElement, {
    width,
    height,
    backgroundColor: '#ffffff',
    preserveObjectStacking: true,
    selection: true,
    renderOnAddRemove: true,
  });

  // Force initial render
  setTimeout(() => {
    canvas.requestRenderAll();
  }, 0);

  return canvas;
}

/**
 * Convert Fabric.js object to Layer
 */
export function fabricObjectToLayer(obj: any): Layer {
  const data = obj.data || {};
  const id = data.id || obj.name || generateLayerId();

  return {
    id,
    name: data.name || getDefaultLayerName(obj),
    type: getLayerType(obj),
    visible: obj.visible ?? true,
    opacity: (obj.opacity ?? 1) * 100,
    locked: !obj.selectable,
    fabricObject: obj,
  };
}

/**
 * Get layer type from Fabric object
 */
function getLayerType(obj: any): Layer['type'] {
  const type = obj.type;
  if (type === 'image' || type === 'FabricImage') return 'image';
  if (type === 'text' || type === 'i-text' || type === 'textbox') return 'text';
  if (type === 'group') return 'group';
  return 'shape';
}

/**
 * Get default layer name based on object type
 */
function getDefaultLayerName(obj: any): string {
  const type = obj.type;
  if (type === 'image' || type === 'FabricImage') return 'Image';
  if (type === 'text' || type === 'i-text' || type === 'textbox') return 'Text';
  if (type === 'rect') return 'Rectangle';
  if (type === 'circle') return 'Circle';
  if (type === 'line') return 'Line';
  if (type === 'path') return 'Path';
  if (type === 'group') return 'Group';
  return 'Shape';
}

/**
 * Generate unique layer ID
 */
export function generateLayerId(): string {
  return `layer_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Apply opacity to a Fabric object
 */
export function applyOpacity(obj: any, opacity: number): void {
  obj.set('opacity', opacity / 100);
}

/**
 * Apply visibility to a Fabric object
 */
export function applyVisibility(obj: any, visible: boolean): void {
  obj.set('visible', visible);
}

/**
 * Apply lock state to a Fabric object
 */
export function applyLock(obj: any, locked: boolean): void {
  obj.set({
    selectable: !locked,
    evented: !locked,
  });
}

/**
 * Load image from URL or File
 */
export function loadImage(source: string | File): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof source === 'string') {
      fabric.FabricImage.fromURL(source).then(resolve).catch(reject);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        fabric.FabricImage.fromURL(dataUrl).then(resolve).catch(reject);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Center object on canvas
 */
export function centerObject(canvas: fabric.Canvas, obj: any): void {
  canvas.centerObject(obj);
  obj.setCoords();
}

/**
 * Fit canvas to container
 */
export function fitCanvasToContainer(
  canvas: fabric.Canvas,
  containerWidth: number,
  containerHeight: number,
  padding: number = 40
): void {
  const objects = canvas.getObjects();
  if (objects.length === 0) return;

  // Get bounding box of all objects
  const group = new fabric.Group(objects);
  const boundingBox = group.getBoundingRect();

  // Calculate scale to fit
  const scaleX = (containerWidth - padding * 2) / boundingBox.width;
  const scaleY = (containerHeight - padding * 2) / boundingBox.height;
  const scale = Math.min(scaleX, scaleY, 1);

  // Apply zoom
  canvas.setZoom(scale);
  canvas.requestRenderAll();
}

/**
 * Get canvas as data URL
 */
export function getCanvasDataURL(
  canvas: fabric.Canvas,
  format: 'png' | 'jpg' = 'png',
  quality: number = 1
): string {
  return canvas.toDataURL({
    format: format === 'png' ? 'png' : 'jpeg',
    quality,
    multiplier: 1,
  });
}

/**
 * Clear canvas selection
 */
export function clearSelection(canvas: fabric.Canvas): void {
  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

/**
 * Delete selected objects
 */
export function deleteSelected(canvas: fabric.Canvas): void {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }
}

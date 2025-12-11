// @ts-nocheck - Fabric.js v6 has incomplete TypeScript definitions
import * as fabric from 'fabric';
import type { Layer } from './types';
import { fabricObjectToLayer, generateLayerId } from './fabric-helpers';

/**
 * Get all layers from canvas
 */
export function getLayersFromCanvas(canvas: fabric.Canvas): Layer[] {
  const objects = canvas.getObjects();
  return objects.map((obj) => fabricObjectToLayer(obj));
}

/**
 * Find layer by ID
 */
export function findLayerById(layers: Layer[], id: string): Layer | undefined {
  return layers.find((layer) => layer.id === id);
}

/**
 * Find fabric object by layer ID
 */
export function findObjectByLayerId(canvas: fabric.Canvas, layerId: string): any {
  const objects = canvas.getObjects();
  return objects.find((obj: any) => obj.data?.id === layerId || obj.name === layerId);
}

/**
 * Update layer properties
 */
export function updateLayer(
  canvas: fabric.Canvas,
  layerId: string,
  updates: Partial<Layer>
): void {
  const obj = findObjectByLayerId(canvas, layerId);
  if (!obj) return;

  if (updates.opacity !== undefined) {
    obj.set('opacity', updates.opacity / 100);
  }

  if (updates.visible !== undefined) {
    obj.set('visible', updates.visible);
  }

  if (updates.locked !== undefined) {
    obj.set({
      selectable: !updates.locked,
      evented: !updates.locked,
    });
  }

  if (updates.name !== undefined) {
    if (!obj.data) obj.data = {};
    obj.data.name = updates.name;
  }

  canvas.requestRenderAll();
}

/**
 * Delete layer
 */
export function deleteLayer(canvas: fabric.Canvas, layerId: string): void {
  const obj = findObjectByLayerId(canvas, layerId);
  if (obj) {
    canvas.remove(obj);
    canvas.requestRenderAll();
  }
}

/**
 * Reorder layers
 */
export function reorderLayer(
  canvas: fabric.Canvas,
  layerId: string,
  newIndex: number
): void {
  const obj = findObjectByLayerId(canvas, layerId);
  if (!obj) return;

  const currentIndex = canvas.getObjects().indexOf(obj);
  if (currentIndex === -1) return;

  // Move object to new index
  canvas.moveTo(obj, newIndex);
  canvas.requestRenderAll();
}

/**
 * Duplicate layer
 */
export function duplicateLayer(canvas: fabric.Canvas, layerId: string): Layer | null {
  const obj = findObjectByLayerId(canvas, layerId);
  if (!obj) return null;

  obj.clone((cloned: any) => {
    const newId = generateLayerId();
    cloned.set({
      left: (obj.left || 0) + 10,
      top: (obj.top || 0) + 10,
    });

    if (!cloned.data) cloned.data = {};
    cloned.data.id = newId;
    cloned.data.name = obj.data?.name ? `${obj.data.name} Copy` : 'Copy';

    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
  });

  return null;
}

/**
 * Select layer
 */
export function selectLayer(canvas: fabric.Canvas, layerId: string): void {
  const obj = findObjectByLayerId(canvas, layerId);
  if (obj && obj.selectable) {
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }
}

/**
 * Select multiple layers
 */
export function selectLayers(canvas: fabric.Canvas, layerIds: string[]): void {
  const objects = layerIds
    .map((id) => findObjectByLayerId(canvas, id))
    .filter((obj) => obj !== undefined && obj.selectable);

  if (objects.length === 0) return;

  if (objects.length === 1) {
    canvas.setActiveObject(objects[0]);
  } else {
    const selection = new fabric.ActiveSelection(objects, { canvas });
    canvas.setActiveObject(selection);
  }

  canvas.requestRenderAll();
}

/**
 * Clear selection
 */
export function clearLayerSelection(canvas: fabric.Canvas): void {
  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

/**
 * Generate layer thumbnail
 */
export function generateLayerThumbnail(
  obj: any,
  width: number = 40,
  height: number = 40
): string {
  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;

    const objWidth = (obj.width || 0) * (obj.scaleX || 1);
    const objHeight = (obj.height || 0) * (obj.scaleY || 1);
    const scale = Math.min(width / objWidth, height / objHeight);

    const fabricCanvas = new fabric.StaticCanvas(tempCanvas, {
      width,
      height,
      backgroundColor: 'transparent',
    });

    obj.clone((cloned: any) => {
      cloned.set({
        left: width / 2,
        top: height / 2,
        scaleX: (obj.scaleX || 1) * scale * 0.8,
        scaleY: (obj.scaleY || 1) * scale * 0.8,
        originX: 'center',
        originY: 'center',
      });

      fabricCanvas.add(cloned);
      fabricCanvas.renderAll();
    });

    const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 });
    return dataUrl;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return '';
  }
}

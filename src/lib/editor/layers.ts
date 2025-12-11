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
    // Simple placeholder for now - just return a colored rectangle based on layer type
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');

    if (!ctx) return '';

    // Draw a simple representation based on layer type
    const type = obj.type;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Draw type icon
    ctx.fillStyle = '#666';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (type === 'image' || type === 'FabricImage') {
      ctx.fillText('🖼️', width / 2, height / 2);
    } else if (type === 'text' || type === 'i-text' || type === 'textbox') {
      ctx.fillText('T', width / 2, height / 2);
    } else if (type === 'rect') {
      ctx.strokeStyle = '#666';
      ctx.strokeRect(10, 10, 20, 20);
    } else if (type === 'circle') {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 10, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'path') {
      ctx.fillText('✏️', width / 2, height / 2);
    } else {
      ctx.fillText('▢', width / 2, height / 2);
    }

    return tempCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return '';
  }
}

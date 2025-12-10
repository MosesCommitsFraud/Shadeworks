import { v4 as uuid } from 'uuid';
import type { Layer, BlendMode } from './types';

/**
 * Create a new layer
 */
export function createLayer(
  type: Layer['type'],
  name?: string,
  imageData?: ImageData
): Layer {
  return {
    id: uuid(),
    name: name || `${type} layer`,
    type,
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    imageData,
    transform: {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Duplicate a layer
 */
export function duplicateLayer(layer: Layer): Layer {
  return {
    ...layer,
    id: uuid(),
    name: `${layer.name} copy`,
    imageData: layer.imageData
      ? new ImageData(
          new Uint8ClampedArray(layer.imageData.data),
          layer.imageData.width,
          layer.imageData.height
        )
      : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Update layer properties
 */
export function updateLayer(
  layers: Layer[],
  layerId: string,
  updates: Partial<Layer>
): Layer[] {
  return layers.map((layer) =>
    layer.id === layerId
      ? { ...layer, ...updates, updatedAt: Date.now() }
      : layer
  );
}

/**
 * Delete a layer
 */
export function deleteLayer(layers: Layer[], layerId: string): Layer[] {
  return layers.filter((layer) => layer.id !== layerId);
}

/**
 * Reorder layers
 */
export function reorderLayer(
  layers: Layer[],
  fromIndex: number,
  toIndex: number
): Layer[] {
  const newLayers = [...layers];
  const [removed] = newLayers.splice(fromIndex, 1);
  newLayers.splice(toIndex, 0, removed);
  return newLayers;
}

/**
 * Move layer up (increase z-index)
 */
export function moveLayerUp(layers: Layer[], layerId: string): Layer[] {
  const index = layers.findIndex((l) => l.id === layerId);
  if (index === -1 || index === layers.length - 1) return layers;
  return reorderLayer(layers, index, index + 1);
}

/**
 * Move layer down (decrease z-index)
 */
export function moveLayerDown(layers: Layer[], layerId: string): Layer[] {
  const index = layers.findIndex((l) => l.id === layerId);
  if (index === -1 || index === 0) return layers;
  return reorderLayer(layers, index, index - 1);
}

/**
 * Merge layer with layer below
 */
export function mergeLayerDown(
  layers: Layer[],
  layerId: string,
  canvas: HTMLCanvasElement
): Layer[] {
  const index = layers.findIndex((l) => l.id === layerId);
  if (index === -1 || index === 0) return layers;

  const currentLayer = layers[index];
  const belowLayer = layers[index - 1];

  // For now, just return the layers as-is
  // TODO: Implement actual merging with canvas compositing
  console.log('Merge not yet implemented', currentLayer, belowLayer, canvas);

  return layers;
}

/**
 * Flatten all visible layers
 */
export function flattenLayers(
  layers: Layer[],
  canvas: HTMLCanvasElement
): Layer {
  // TODO: Implement actual flattening
  console.log('Flatten not yet implemented', layers, canvas);

  return createLayer('image', 'Background');
}

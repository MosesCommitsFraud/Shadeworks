// Type extensions for Fabric.js v6 compatibility
// This file provides type-safe wrappers for Fabric.js objects

import type * as fabric from 'fabric';

// Extended fabric object with custom data
export interface FabricObjectWithData extends fabric.FabricObject {
  data?: {
    id?: string;
    name?: string;
    [key: string]: any;
  };
  name?: string;
}

// Type guard to check if object has data
export function hasFabricData(obj: fabric.FabricObject): obj is FabricObjectWithData {
  return true; // All objects can have data in v6
}

// Helper to get object data
export function getObjectData(obj: fabric.FabricObject): { id?: string; name?: string } {
  const objWithData = obj as FabricObjectWithData;
  return objWithData.data || {};
}

// Helper to set object data
export function setObjectData(obj: fabric.FabricObject, data: { id?: string; name?: string }) {
  const objWithData = obj as FabricObjectWithData;
  if (!objWithData.data) {
    objWithData.data = {};
  }
  Object.assign(objWithData.data, data);
}

// Helper to get object name
export function getObjectName(obj: fabric.FabricObject): string | undefined {
  const objWithData = obj as FabricObjectWithData;
  return objWithData.name || objWithData.data?.name;
}

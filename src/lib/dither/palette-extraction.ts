import type { Color, Palette } from './types';

/**
 * Palette extraction algorithms
 *
 * Extract dominant colors from an image using various algorithms:
 * - Median Cut: Divides color space recursively
 * - K-Means: Iterative clustering algorithm
 * - Octree: Tree-based color quantization
 */

/**
 * Extract palette using Median Cut algorithm
 * Recursively divides the color space to find dominant colors
 */
export function extractPaletteMedianCut(
  imageData: ImageData,
  colorCount: number = 16
): Palette {
  // Collect all unique colors
  const colorMap = new Map<string, { color: Color; count: number }>();
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    // Skip fully transparent pixels
    if (data[i + 3] === 0) continue;

    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    const existing = colorMap.get(key);

    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, {
        color: { r: data[i], g: data[i + 1], b: data[i + 2], a: 255 },
        count: 1,
      });
    }
  }

  // Convert to array and sort by frequency
  let colors = Array.from(colorMap.values());

  // If we have fewer unique colors than requested, return them all
  if (colors.length <= colorCount) {
    return {
      name: 'Extracted (Median Cut)',
      type: 'custom',
      colors: colors.map((c) => c.color),
      description: `Extracted ${colors.length} colors from image`,
    };
  }

  // Median cut algorithm
  const buckets: typeof colors[] = [colors];

  while (buckets.length < colorCount) {
    // Find bucket with largest range
    let largestBucket = buckets[0];
    let largestRange = 0;
    let largestChannel: 'r' | 'g' | 'b' = 'r';

    for (const bucket of buckets) {
      const ranges = getColorRanges(bucket);
      const maxRange = Math.max(ranges.r, ranges.g, ranges.b);

      if (maxRange > largestRange) {
        largestRange = maxRange;
        largestBucket = bucket;
        largestChannel =
          ranges.r === maxRange ? 'r' : ranges.g === maxRange ? 'g' : 'b';
      }
    }

    // Split the largest bucket
    const bucketIndex = buckets.indexOf(largestBucket);
    buckets.splice(bucketIndex, 1);

    // Sort by the channel with largest range
    largestBucket.sort((a, b) => a.color[largestChannel] - b.color[largestChannel]);

    // Split at median
    const median = Math.floor(largestBucket.length / 2);
    buckets.push(largestBucket.slice(0, median));
    buckets.push(largestBucket.slice(median));
  }

  // Get average color from each bucket
  const paletteColors = buckets.map((bucket) => getAverageColor(bucket));

  return {
    name: 'Extracted (Median Cut)',
    type: 'custom',
    colors: paletteColors,
    description: `Extracted ${paletteColors.length} colors from image using Median Cut`,
  };
}

/**
 * Extract palette using K-Means clustering
 * Iteratively refines color clusters
 */
export function extractPaletteKMeans(
  imageData: ImageData,
  colorCount: number = 16,
  maxIterations: number = 10
): Palette {
  // Collect all pixels
  const pixels: Color[] = [];
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    // Skip fully transparent pixels
    if (data[i + 3] === 0) continue;

    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: 255,
    });
  }

  if (pixels.length === 0) {
    return {
      name: 'Extracted (K-Means)',
      type: 'custom',
      colors: [{ r: 0, g: 0, b: 0, a: 255 }],
      description: 'No colors found in image',
    };
  }

  // Initialize centroids randomly
  let centroids: Color[] = [];
  for (let i = 0; i < colorCount; i++) {
    const randomIndex = Math.floor(Math.random() * pixels.length);
    centroids.push({ ...pixels[randomIndex] });
  }

  // K-means iterations
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    const clusters: Color[][] = Array.from({ length: colorCount }, () => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let nearestCluster = 0;

      for (let i = 0; i < centroids.length; i++) {
        const dist = colorDistance(pixel, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = i;
        }
      }

      clusters[nearestCluster].push(pixel);
    }

    // Update centroids
    const newCentroids: Color[] = [];
    for (const cluster of clusters) {
      if (cluster.length === 0) {
        // Keep old centroid if cluster is empty
        newCentroids.push(centroids[newCentroids.length]);
      } else {
        newCentroids.push(getAverageColorSimple(cluster));
      }
    }

    centroids = newCentroids;
  }

  return {
    name: 'Extracted (K-Means)',
    type: 'custom',
    colors: centroids,
    description: `Extracted ${centroids.length} colors from image using K-Means`,
  };
}

/**
 * Octree node for color quantization
 */
class OctreeNode {
  isLeaf: boolean;
  pixelCount: number;
  red: number;
  green: number;
  blue: number;
  children: (OctreeNode | null)[];
  level: number;

  constructor(level: number) {
    this.isLeaf = level === 8;
    this.pixelCount = 0;
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.children = Array(8).fill(null);
    this.level = level;
  }

  addColor(color: Color, level: number): void {
    if (this.isLeaf) {
      this.pixelCount++;
      this.red += color.r;
      this.green += color.g;
      this.blue += color.b;
    } else {
      const index = this.getColorIndex(color, level);
      if (!this.children[index]) {
        this.children[index] = new OctreeNode(level + 1);
      }
      this.children[index]!.addColor(color, level + 1);
    }
  }

  getColorIndex(color: Color, level: number): number {
    const shift = 7 - level;
    const rBit = (color.r >> shift) & 1;
    const gBit = (color.g >> shift) & 1;
    const bBit = (color.b >> shift) & 1;
    return (rBit << 2) | (gBit << 1) | bBit;
  }

  getLeafNodes(): OctreeNode[] {
    if (this.isLeaf) {
      return [this];
    }
    const leaves: OctreeNode[] = [];
    for (const child of this.children) {
      if (child) {
        leaves.push(...child.getLeafNodes());
      }
    }
    return leaves;
  }

  getColor(): Color {
    return {
      r: Math.round(this.red / this.pixelCount),
      g: Math.round(this.green / this.pixelCount),
      b: Math.round(this.blue / this.pixelCount),
      a: 255,
    };
  }
}

/**
 * Extract palette using Octree algorithm
 * Tree-based color quantization
 */
export function extractPaletteOctree(
  imageData: ImageData,
  colorCount: number = 16
): Palette {
  const root = new OctreeNode(0);
  const { data } = imageData;

  // Add all pixels to octree
  for (let i = 0; i < data.length; i += 4) {
    // Skip fully transparent pixels
    if (data[i + 3] === 0) continue;

    const color: Color = {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: 255,
    };

    root.addColor(color, 0);
  }

  // Get leaf nodes (colors)
  const leaves = root.getLeafNodes();

  // If we have more leaves than desired, merge similar ones
  let colors = leaves.map((leaf) => ({
    color: leaf.getColor(),
    count: leaf.pixelCount,
  }));

  // Sort by frequency and take top N
  colors.sort((a, b) => b.count - a.count);
  colors = colors.slice(0, colorCount);

  return {
    name: 'Extracted (Octree)',
    type: 'custom',
    colors: colors.map((c) => c.color),
    description: `Extracted ${colors.length} colors from image using Octree`,
  };
}

/**
 * Helper: Get color ranges for a bucket
 */
function getColorRanges(bucket: { color: Color; count: number }[]): {
  r: number;
  g: number;
  b: number;
} {
  let minR = 255,
    maxR = 0;
  let minG = 255,
    maxG = 0;
  let minB = 255,
    maxB = 0;

  for (const item of bucket) {
    minR = Math.min(minR, item.color.r);
    maxR = Math.max(maxR, item.color.r);
    minG = Math.min(minG, item.color.g);
    maxG = Math.max(maxG, item.color.g);
    minB = Math.min(minB, item.color.b);
    maxB = Math.max(maxB, item.color.b);
  }

  return {
    r: maxR - minR,
    g: maxG - minG,
    b: maxB - minB,
  };
}

/**
 * Helper: Get average color from a bucket (weighted by count)
 */
function getAverageColor(bucket: { color: Color; count: number }[]): Color {
  let totalR = 0,
    totalG = 0,
    totalB = 0,
    totalCount = 0;

  for (const item of bucket) {
    totalR += item.color.r * item.count;
    totalG += item.color.g * item.count;
    totalB += item.color.b * item.count;
    totalCount += item.count;
  }

  return {
    r: Math.round(totalR / totalCount),
    g: Math.round(totalG / totalCount),
    b: Math.round(totalB / totalCount),
    a: 255,
  };
}

/**
 * Helper: Get average color from array of colors (simple)
 */
function getAverageColorSimple(colors: Color[]): Color {
  let totalR = 0,
    totalG = 0,
    totalB = 0;

  for (const color of colors) {
    totalR += color.r;
    totalG += color.g;
    totalB += color.b;
  }

  const count = colors.length;
  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
    a: 255,
  };
}

/**
 * Helper: Calculate Euclidean distance between two colors
 */
function colorDistance(c1: Color, c2: Color): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

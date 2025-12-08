'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Dither Editor Documentation</DialogTitle>
          <DialogDescription>
            Complete guide to using the dithering image editor
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Getting Started */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  The Dither Editor is a professional tool for applying dithering effects to images.
                  Dithering creates the illusion of color depth in images with limited color palettes.
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Upload an image using the Upload section</li>
                  <li>Adjust image properties in the Adjust section</li>
                  <li>Choose a color mode in the Mode section</li>
                  <li>Select a dithering algorithm in the Dither section</li>
                  <li>Pick or create a color palette in the Palette section</li>
                  <li>Export your dithered image</li>
                </ol>
              </div>
            </section>

            <Separator />

            {/* File Management */}
            <section>
              <h3 className="text-lg font-semibold mb-3">File Management</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Project Files (.swdither)</h4>
                  <p className="text-muted-foreground">
                    Save your work as a project file to preserve all settings, adjustments, and the original image.
                    Project files include:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2 mt-1">
                    <li>Original image data</li>
                    <li>All dithering settings</li>
                    <li>Image adjustments</li>
                    <li>Color mode and palette</li>
                    <li>View state (zoom/pan)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Unsaved Changes</h4>
                  <p className="text-muted-foreground">
                    The editor tracks unsaved changes and will warn you before navigating away or starting a new project.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Image Adjustments */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Image Adjustments</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Basic</h4>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Exposure (-2 to +2 stops):</strong> Overall image brightness using photographic exposure formula</li>
                    <li><strong>Brightness (-100 to 100):</strong> Linear brightness adjustment</li>
                    <li><strong>Contrast (-100 to 100):</strong> Enhance or reduce difference between light and dark areas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Color</h4>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Hue (-180° to 180°):</strong> Shift the entire color spectrum</li>
                    <li><strong>Saturation (-100 to 100):</strong> Color intensity (-100 = grayscale)</li>
                    <li><strong>Vibrance (-100 to 100):</strong> Smart saturation that protects skin tones</li>
                    <li><strong>Temperature (-100 to 100):</strong> Cool (blue) to warm (yellow/orange)</li>
                    <li><strong>Tint (-100 to 100):</strong> Green to magenta color cast correction</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Tonal</h4>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Highlights (-100 to 100):</strong> Adjust only the bright areas</li>
                    <li><strong>Shadows (-100 to 100):</strong> Adjust only the dark areas</li>
                    <li><strong>Gamma (0.5 to 2.0):</strong> Tonal response curve (1.0 = neutral)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Filters</h4>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Blur (0-20px):</strong> Gaussian blur to soften edges and reduce noise</li>
                    <li><strong>Sharpen (0-100%):</strong> Unsharp mask to enhance edges and details</li>
                    <li><strong>Denoise (0-100%):</strong> Bilateral filter to remove noise while preserving edges</li>
                    <li><strong>Vignette (0-100%):</strong> Darken edges for focus effect</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Color Modes */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Color Modes</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <strong>Mono (Monochrome):</strong> Pure black and white, 2 colors
                </div>
                <div>
                  <strong>Tonal (Grayscale):</strong> Shades of gray (2-256 shades)
                </div>
                <div>
                  <strong>Indexed Color:</strong> Limited color palette with quantization
                </div>
                <div>
                  <strong>RGB (Full Color):</strong> Per-channel dithering with full palette
                </div>
              </div>
            </section>

            <Separator />

            {/* Dithering Algorithms */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Dithering Algorithms</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Error Diffusion (11 algorithms)</h4>
                  <p className="text-muted-foreground mb-2">
                    Distributes color quantization error to neighboring pixels for smooth gradients.
                  </p>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Floyd-Steinberg:</strong> Classic algorithm, excellent quality, best for most images</li>
                    <li><strong>Atkinson:</strong> Mac-style algorithm with softer, artistic results</li>
                    <li><strong>Jarvis-Judice-Ninke:</strong> Wider pattern for smoother gradients</li>
                    <li><strong>Stucki:</strong> Balanced quality and speed</li>
                    <li><strong>Burkes:</strong> Fast with good quality</li>
                    <li><strong>Sierra:</strong> Three-row pattern for excellent gradients</li>
                    <li><strong>Sierra Two-Row:</strong> Lighter variant, faster processing</li>
                    <li><strong>Sierra Lite:</strong> Simplest variant, very fast</li>
                    <li><strong>False Floyd-Steinberg:</strong> Simplified variant, faster but less accurate</li>
                    <li><strong>Fan:</strong> Specialized pattern distribution</li>
                    <li><strong>Shiau-Fan:</strong> Hybrid combining multiple techniques</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Ordered Dithering (6 algorithms)</h4>
                  <p className="text-muted-foreground mb-2">
                    Uses threshold matrices to create consistent patterns. Fast and predictable.
                  </p>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Bayer 2×2, 4×4, 8×8, 16×16:</strong> Classic Bayer matrices of increasing size</li>
                    <li><strong>Ordered 3×3:</strong> Alternative 3×3 pattern for unique texture</li>
                    <li><strong>Simple 2×2:</strong> Minimal pattern, very fast</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Noise-Based (3 algorithms)</h4>
                  <p className="text-muted-foreground mb-2">
                    Random or pseudo-random noise patterns for organic looks.
                  </p>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Random Threshold:</strong> Organic film-grain look, reduces banding</li>
                    <li><strong>Blue Noise:</strong> High-frequency pattern for smooth, natural results</li>
                    <li><strong>White Noise:</strong> Uniform random noise, grainy texture</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Halftone (1 algorithm)</h4>
                  <p className="text-muted-foreground mb-2">
                    Simulates traditional printing techniques.
                  </p>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Clustered Dot:</strong> Creates halftone dots like traditional printing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Error Diffusion Options</h4>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Serpentine:</strong> Alternate scan direction to reduce artifacts</li>
                    <li><strong>Error Attenuation (0-100%):</strong> Reduce error spread for softer results</li>
                    <li><strong>Random Noise (0-100%):</strong> Add controlled noise to break up patterns</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Palettes */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Color Palettes</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Built-in Palettes</h4>
                  <ul className="space-y-1 text-muted-foreground ml-2">
                    <li><strong>Monochrome:</strong> Pure B&W, Warm B&W, Cool B&W</li>
                    <li><strong>Grayscale:</strong> 2, 4, 8, or 16 shades of gray</li>
                    <li><strong>Retro:</strong> CGA, EGA, VGA, Commodore 64, Apple II, Game Boy, NES, ZX Spectrum</li>
                    <li><strong>Modern:</strong> Web-safe 216, Pastel, Vaporwave, Synthwave, Cyberpunk, Nordic</li>
                    <li><strong>Art Styles:</strong> Newspaper, Risograph, Screen Print</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Custom Palettes</h4>
                  <p className="text-muted-foreground">
                    Create custom palettes with the color picker or extract colors from your image using
                    median cut, octree, or k-means algorithms.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Export */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Export Options</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <strong>Formats:</strong> PNG (lossless), JPEG (lossy), WebP (modern)
                </div>
                <div>
                  <strong>DPI Scaling:</strong> 72 DPI (screen), 150 DPI (draft), 300 DPI (high-quality print)
                </div>
                <div>
                  <strong>Color Separation:</strong> Export individual color layers for screen printing
                </div>
                <div>
                  <strong>CMYK Separation:</strong> Simulated CMYK separation for print workflows
                </div>
              </div>
            </section>

            <Separator />

            {/* Tips */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Tips & Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Apply adjustments before dithering for best results</li>
                <li>Use exposure and gamma for overall tonal balance</li>
                <li>Adjust highlights/shadows for selective tonal control</li>
                <li>Use vibrance to boost colors while protecting skin tones</li>
                <li>Temperature and tint correct color casts (cool vs warm lighting)</li>
                <li>Increase contrast for sharper, more defined dithering patterns</li>
                <li>Use blur to smooth gradients and reduce noise before dithering</li>
                <li>Try different algorithms - each has unique characteristics</li>
                <li>Error diffusion works best for photographs and natural images</li>
                <li>Ordered dithering creates retro, stylized looks</li>
                <li>Reduce saturation (-100) for better grayscale conversion</li>
                <li>Save your work as a .swdither project to preserve everything</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

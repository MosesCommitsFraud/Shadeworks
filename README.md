# Shadeworks

A modern .NET 9.0 WPF desktop application for image processing with advanced dithering algorithms and effects.

## Features

### Dithering Algorithms
- **Floyd-Steinberg** - Classic error diffusion dithering
- **Atkinson** - Apple's dithering algorithm from early Mac computers
- **Bayer** - Ordered dithering (2x2, 4x4, 8x8 matrices)
- **Stucki** - High-quality error diffusion
- **Jarvis-Judice-Ninke** - Wide kernel error diffusion
- **Sierra** - Three-row error diffusion
- **Sierra Lite** - Lighter version of Sierra
- **Burkes** - Similar to Stucki with different weights

### Image Adjustments
- **Brightness** - Adjust image brightness (-100 to +100)
- **Contrast** - Adjust image contrast (-100 to +100)
- **Saturation** - Adjust color saturation (-100 to +100)
- **Color Reduction** - Reduce colors to a specific palette (2-256 colors)

### Effects
- **Grayscale** - Convert image to grayscale
- **Invert** - Invert image colors

### Export Options
Supports multiple image formats:
- PNG
- JPEG
- BMP
- TIFF

## Requirements

- .NET 9.0 SDK
- Windows 10/11

## Building

```bash
dotnet restore
dotnet build
```

## Running

```bash
dotnet run
```

## Usage

1. Click **Open** to load an image
2. Select a dithering algorithm from the dropdown
3. Adjust parameters using the sliders and checkboxes
4. Preview changes in real-time
5. Click **Export** to save the processed image

## UI Design

Shadeworks features a modern dark theme with macOS-inspired design elements:
- Rounded corners and smooth transitions
- macOS-style traffic light window controls
- Clean, minimal interface
- Real-time preview

## License

MIT License


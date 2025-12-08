# Dithering Image Editor Implementation Plan

## Overview
Create a comprehensive dithering image editor at `/dither` with real-time preview, multiple dithering algorithms, advanced palette management, print-ready export features, and professional image adjustment controls.

## Architecture & Technology Stack

### Core Technologies
- **Next.js 16** with App Router (already in use)
- **TypeScript** for type safety
- **Canvas API** for real-time image processing and preview
- **Web Workers** for heavy processing (dithering algorithms) to keep UI responsive
- **Client-side only** (use dynamic import with ssr: false like the whiteboard)

### UI Components Needed
The following Radix UI components are already in dependencies but need to be added to `src/components/ui/`:
- **Slider** - for brightness, contrast, blur, sharpen, etc.
- **Select** - for algorithm selection, palette selection, color modes
- **Tabs** - for organizing control sections (Adjustments, Dithering, Palette, Export)
- **Separator** - for visual organization
- **Toggle** / **Toggle Group** - for DPI options, halftone angles
- **Label** - for form controls
- **Input** - for custom values, file upload
- **Dialog** - for export/save dialogs
- **ScrollArea** - for long control lists
- **Progress** - for processing status

## Page Structure

### Route: `/dither`
**File:** `src/app/dither/page.tsx`

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header (with back to home link)                             │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│   Control    │                                               │
│   Sidebar    │           Canvas Preview                      │
│   (300px)    │           (Responsive)                        │
│              │                                               │
│   - Upload   │                                               │
│   - Adjust   │                                               │
│   - Dither   │                                               │
│   - Palette  │                                               │
│   - Export   │                                               │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

## Component Structure

### Main Components

1. **`src/app/dither/page.tsx`**
   - Route entry point
   - Dynamic import for client-side only rendering

2. **`src/components/dither/dither-editor.tsx`**
   - Main editor component
   - Manages global state (image, settings, processed result)
   - Coordinates between sidebar controls and canvas

3. **`src/components/dither/canvas-preview.tsx`**
   - Displays the processed image
   - Zoom and pan controls
   - Before/after comparison slider
   - Real-time updates

4. **`src/components/dither/control-sidebar.tsx`**
   - Container for all control sections
   - Collapsible sections using Accordion
   - Organized into tabs:
     - Image Upload
     - Adjustments (blur, sharpen, brightness, contrast, denoise)
     - Dithering (algorithm, settings)
     - Palette (presets, custom palettes)
     - Export (DPI, format, color separation)

5. **`src/components/dither/sections/`**
   - `upload-section.tsx` - File upload and image selection
   - `adjustments-section.tsx` - Image adjustment controls
   - `dithering-section.tsx` - Algorithm selection and parameters
   - `palette-section.tsx` - Palette management
   - `export-section.tsx` - Export settings and actions

### Library Files

6. **`src/lib/dither/algorithms.ts`**
   - Dithering algorithm implementations:
     - Floyd-Steinberg (error diffusion)
     - Ordered (Bayer) matrices (2x2, 4x4, 8x8)
     - Atkinson
     - Jarvis-Judice-Ninke
     - Stucki
     - Burkes
     - Sierra (3 variants)
     - Ordered dithering with custom thresholds
     - Clustered-dot ordered dithering (for halftones)
   - Each algorithm as a pure function taking ImageData and returning processed ImageData

7. **`src/lib/dither/palettes.ts`**
   - Palette definitions and generators:
     - Monochrome (pure B&W)
     - Grayscale (2, 4, 8, 16 shades)
     - Retro palettes (CGA, EGA, VGA, C64, Apple II, Gameboy, NES)
     - Web-safe (216 colors)
     - Pastel palettes (soft, warm, cool)
     - Vaporwave / Synthwave
     - Custom palette from image (extract dominant colors)
     - User-defined palettes (color picker)
   - Color quantization algorithms (median cut, octree)
   - Palette extraction from uploaded images

8. **`src/lib/dither/adjustments.ts`**
   - Image adjustment functions:
     - Brightness
     - Contrast
     - Saturation
     - Blur (Gaussian blur)
     - Sharpen (unsharp mask)
     - Denoise (bilateral filter or non-local means)
     - Gamma correction
   - All operations on ImageData

9. **`src/lib/dither/color-modes.ts`**
   - Color space conversions:
     - RGB → Grayscale (luminosity method)
     - RGB → Indexed Color (quantization)
     - RGB → Monochrome (threshold or dithered)
     - RGB → Tonal (HSL manipulation)
   - Mode-specific processing pipelines

10. **`src/lib/dither/export.ts`**
    - Export utilities:
      - Canvas to PNG/JPEG/WebP
      - DPI scaling (72, 150, 300)
      - Halftone angle rotation (0°, 22.5°, 45°)
      - Color separation (CMYK simulation)
      - Alpha channel masking
      - Multi-layer export (each color as separate layer)
    - Download triggers

11. **`src/lib/dither/worker.ts`**
    - Web Worker for heavy processing
    - Handles dithering algorithms in background thread
    - Message passing interface
    - Progress reporting

12. **`src/lib/dither/resampling.ts`**
    - Smart resampling algorithms:
      - Nearest neighbor (pixel-perfect)
      - Bilinear interpolation
      - Bicubic interpolation
      - Lanczos resampling
    - Edge handling (rounded vs pixel-perfect)

## Feature Requirements Breakdown

### 1. Image Upload & Management
- Drag-and-drop file upload
- File picker
- Paste from clipboard
- Supported formats: PNG, JPEG, WebP, GIF, BMP
- Image preview with original dimensions
- Reset to original button

### 2. Real-Time Adjustments
All adjustments applied before dithering:
- **Blur**: 0-20px radius (Gaussian)
- **Sharpen**: 0-100% intensity
- **Brightness**: -100 to +100
- **Contrast**: -100 to +100
- **Saturation**: -100 to +100 (for color modes)
- **Denoise**: 0-100% strength
- **Gamma**: 0.5-2.0

Controls:
- Sliders with numeric input
- Real-time preview (debounced)
- Reset individual controls
- Reset all adjustments

### 3. Dithering Algorithms

#### Error Diffusion Methods
- Floyd-Steinberg (classic, best quality)
- Atkinson (Mac-style, softer)
- Jarvis-Judice-Ninke (wider spread)
- Stucki (balanced)
- Burkes (fast, good quality)
- Sierra (3 variants: original, two-row, filter lite)

#### Ordered Dithering
- Bayer 2×2 (checkerboard pattern)
- Bayer 4×4 (standard ordered)
- Bayer 8×8 (fine pattern)
- Bayer 16×16 (very fine)
- Custom threshold matrices

#### Halftone Patterns (for print)
- Clustered-dot ordered dithering
- Variable angles: 0°, 22.5°, 45°
- Variable dot shapes: round, ellipse, square, line

#### Settings per Algorithm
- **Serpentine scanning** (left-right-left for error diffusion)
- **Error attenuation** (0-100%, reduce error spread)
- **Random noise** (0-100%, add controlled noise)

### 4. Palette System

#### Built-in Palettes
**Monochrome:**
- Pure Black & White
- Warm B&W (sepia-toned)
- Cool B&W (blue-toned)

**Grayscale:**
- 2, 4, 8, 16 shades

**Retro Gaming:**
- CGA (4 colors)
- EGA (16 colors)
- VGA (256 colors)
- Commodore 64
- Apple II
- Game Boy (4 greens)
- NES (56 colors)
- ZX Spectrum

**Modern:**
- Web-safe 216
- Pastel (16 colors)
- Vaporwave (pink/cyan/purple)
- Synthwave (dark neon)
- Cyberpunk
- Nordic (muted earth tones)

**Art Styles:**
- Newspaper (B&W with gray)
- Risograph (limited bright colors)
- Screen print (3-6 spot colors)

#### Custom Palettes
- Color picker to add colors manually
- Extract palette from any uploaded image
  - Number of colors: 2-256
  - Algorithm: median cut, octree, k-means
- Save/load custom palettes (localStorage or JSON export)
- Palette preview swatches
- Reorder colors (affects dithering for ordered methods)

### 5. Color Modes

**Mono (Monochrome):**
- Pure black and white
- Single threshold or dithered
- Best for: Line art, text, high-contrast images

**Tonal (Grayscale):**
- Shades of gray
- 2-256 levels
- Best for: Photos, continuous tone images

**Indexed Color:**
- Limited color palette (2-256 colors)
- Color quantization + dithering
- Best for: Retro graphics, GIF-style images

**RGB (Full Color):**
- Dither each channel independently
- Simulate limited bit depth (e.g., 5-6-5 RGB)
- Best for: Print separations, web graphics

### 6. Print-Perfect Export

#### DPI Scaling
- 72 DPI (screen)
- 150 DPI (draft print)
- 300 DPI (high-quality print)
- Custom DPI input
- Automatic size calculation (e.g., 300 DPI → 3x pixel dimensions)

#### Halftone Angles
- 0° (horizontal)
- 22.5° (slight angle)
- 45° (traditional, minimizes moiré)
- Custom angle input
- Per-color angle control (CMYK simulation)

#### Color Separation
- Export each color as separate layer
- CMYK simulation (convert RGB to approximate CMYK)
- Spot color separation (for screen printing)
- Alpha channel mask (for transparency)
- Export as ZIP with multiple PNG files
- Export as layered PSD (if possible, or multi-PNG)

#### Export Formats
- PNG (lossless, supports transparency)
- JPEG (lossy, smaller file size)
- WebP (modern, efficient)
- SVG (for vector-style exports with flat colors)
- PDF (print-ready with embedded images)

#### Export Options
- Filename input
- Format selection
- Quality slider (for JPEG/WebP)
- Include metadata (DPI, color profile)
- Download button

### 7. Smart Resampling

**Resampling Algorithms:**
- Nearest neighbor (pixel-perfect, no blur)
- Bilinear (smooth, slight blur)
- Bicubic (smoother, better quality)
- Lanczos (sharpest, best quality)

**Edge Handling:**
- **Pixel edges**: Sharp, aliased edges (nearest neighbor or after upscale)
- **Rounded edges**: Anti-aliased, smooth edges (bicubic/Lanczos)

**Scaling Options:**
- Scale before or after dithering
- Percentage scaling (25%, 50%, 200%, etc.)
- Dimension input (width/height in pixels)
- Maintain aspect ratio toggle

### 8. UI/UX Features

**Performance:**
- Debounced real-time preview (300ms delay)
- Web Worker for heavy computations
- Progress indicator for long operations
- Cancel button for processing

**Preview:**
- Zoom controls (25%, 50%, 100%, 200%, 400%, Fit)
- Pan canvas (drag to move)
- Before/After split view (vertical slider)
- Actual pixels view (100% zoom)
- Grid overlay toggle (for alignment)

**Presets:**
- Save current settings as preset
- Load presets (e.g., "Newspaper", "Retro Game", "Print Ready")
- Quick preset buttons in UI

**Keyboard Shortcuts:**
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo
- Ctrl/Cmd + O: Open file
- Ctrl/Cmd + S: Save/Export
- Ctrl/Cmd + 0: Reset zoom
- Ctrl/Cmd + +/-: Zoom in/out

**History:**
- Undo/Redo stack (last 20 states)
- Visual history thumbnails (optional)

## Styling & Design

### Design Principles
- Match existing Shadeworks design system
- Use Tailwind CSS with custom oklch colors
- Light and dark mode support
- Space-efficient but not cramped
- Clear visual hierarchy
- Professional, tool-like appearance

### Color Scheme
- Background: `bg-background`
- Sidebar: `bg-card` with `border-border`
- Accent: Red theme (`accent` color)
- Text: `text-foreground` and `text-muted-foreground`

### Layout Details
- **Sidebar width**: 320px (slightly wider than whiteboard sidebar for controls)
- **Sidebar sections**: Collapsible accordions or tabs
- **Control spacing**: Generous padding (p-4, p-6)
- **Canvas**: Centered, responsive, with checkerboard background for transparency
- **Control groups**: Clear labels, grouped logically
- **Sliders**: Show value next to slider
- **Buttons**: Use existing button variants (default, outline, ghost)

### Responsive Design
- Desktop (>1024px): Sidebar + Canvas side-by-side
- Tablet (768-1024px): Collapsible sidebar
- Mobile (<768px): Full-screen canvas, bottom sheet for controls

## Implementation Phases

### Phase 1: Foundation & Basic Dithering
1. Create route and page structure (`/dither`)
2. Implement basic UI components (Slider, Select, Tabs, etc.)
3. Set up main editor component with state management
4. Implement image upload (drag-drop, file picker)
5. Create canvas preview component with zoom/pan
6. Implement basic dithering algorithms:
   - Floyd-Steinberg
   - Bayer 2×2, 4×4, 8×8
7. Create basic palette system (B&W, grayscale)
8. Basic export (PNG download)

### Phase 2: Advanced Adjustments & Palettes
1. Implement image adjustments:
   - Brightness, Contrast, Saturation
   - Blur, Sharpen, Denoise
2. Add more dithering algorithms:
   - Atkinson, Jarvis-Judice-Ninke, Stucki, Burkes, Sierra variants
3. Expand palette system:
   - Retro palettes (CGA, EGA, VGA, C64, Game Boy, NES)
   - Pastel, Vaporwave, Synthwave
4. Custom palette creator:
   - Color picker
   - Extract from image
   - Save/load palettes

### Phase 3: Color Modes & Advanced Features
1. Implement color modes:
   - Mono, Tonal, Indexed Color, RGB
2. Add color space conversions
3. Implement resampling algorithms
4. Before/After comparison view
5. Preset system (save/load settings)
6. Keyboard shortcuts

### Phase 4: Print Features & Export
1. DPI scaling system
2. Halftone pattern generation
3. Halftone angle rotation
4. Color separation:
   - CMYK simulation
   - Per-color layer export
   - Alpha channel masking
5. Multi-format export:
   - PNG, JPEG, WebP
   - PDF (print-ready)
6. Export with metadata

### Phase 5: Performance & Polish
1. Implement Web Worker for heavy processing
2. Add progress indicators
3. Optimize algorithms for speed
4. Add undo/redo system
5. Visual history (optional)
6. Polish UI/UX
7. Add loading states
8. Error handling and validation
9. Responsive design refinements
10. Accessibility improvements (ARIA labels, keyboard nav)

## Technical Considerations

### Performance Optimization
- **Debouncing**: Real-time preview with 300ms debounce
- **Web Workers**: Move heavy computations off main thread
- **Canvas Pooling**: Reuse canvas elements
- **Lazy Loading**: Load algorithms on demand
- **Memoization**: Cache processed results for unchanged settings
- **Progressive Rendering**: Show low-res preview while processing

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Canvas API (widely supported)
- Web Workers (widely supported)
- File API (widely supported)
- No need for older browser support

### State Management
Use React hooks for state management:
- `useState` for local state
- `useReducer` for complex state (settings object)
- `useCallback` and `useMemo` for performance
- `useRef` for canvas refs and worker refs
- Consider Zustand or Jotai if state becomes too complex

### Type Safety
- Define TypeScript interfaces for:
  - Settings object
  - Palette structure
  - Algorithm parameters
  - Export options
- Use discriminated unions for color modes
- Strict null checks

### Testing Strategy
- Unit tests for algorithms (pure functions)
- Integration tests for processing pipeline
- E2E tests for user flows (upload → adjust → dither → export)
- Visual regression tests for dithering output

## Files to Create

### Pages
- `src/app/dither/page.tsx`

### Components
- `src/components/dither/dither-editor.tsx`
- `src/components/dither/canvas-preview.tsx`
- `src/components/dither/control-sidebar.tsx`
- `src/components/dither/sections/upload-section.tsx`
- `src/components/dither/sections/adjustments-section.tsx`
- `src/components/dither/sections/dithering-section.tsx`
- `src/components/dither/sections/palette-section.tsx`
- `src/components/dither/sections/export-section.tsx`
- `src/components/dither/components/before-after-slider.tsx`
- `src/components/dither/components/zoom-controls.tsx`
- `src/components/dither/components/palette-picker.tsx`
- `src/components/dither/components/color-swatch.tsx`

### UI Components (to be created)
- `src/components/ui/slider.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/toggle.tsx`
- `src/components/ui/toggle-group.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/accordion.tsx`

### Library Files
- `src/lib/dither/types.ts` (TypeScript interfaces)
- `src/lib/dither/algorithms.ts`
- `src/lib/dither/palettes.ts`
- `src/lib/dither/adjustments.ts`
- `src/lib/dither/color-modes.ts`
- `src/lib/dither/export.ts`
- `src/lib/dither/resampling.ts`
- `src/lib/dither/worker.ts`
- `src/lib/dither/utils.ts` (helper functions)

## Estimated Complexity

**Total Estimated Time:** 3-5 days of focused development

**Complexity Breakdown:**
- **High Complexity:**
  - Dithering algorithms (many to implement)
  - Color separation and CMYK simulation
  - Web Worker implementation
  - Resampling algorithms

- **Medium Complexity:**
  - Image adjustments (blur, sharpen, denoise)
  - Palette extraction from images
  - Canvas rendering with zoom/pan
  - Export with DPI scaling

- **Low Complexity:**
  - UI components (already have design system)
  - File upload
  - Basic state management
  - Color pickers

## Success Criteria

1. ✅ User can upload images via drag-drop or file picker
2. ✅ Real-time preview updates as settings change
3. ✅ At least 10 dithering algorithms implemented
4. ✅ At least 15 built-in palettes
5. ✅ Custom palette creation (picker + extract from image)
6. ✅ All image adjustments working (blur, sharpen, brightness, contrast, denoise)
7. ✅ Color modes working (Mono, Tonal, Indexed, RGB)
8. ✅ Export at multiple DPI levels (72, 150, 300)
9. ✅ Color separation for print (multi-layer export)
10. ✅ Responsive design works on desktop, tablet, mobile
11. ✅ Performance is smooth (no UI blocking during processing)
12. ✅ Design matches existing Shadeworks style
13. ✅ Light and dark mode both work correctly

## Open Questions for User

1. **Processing Power**: Should we limit image size for performance? (e.g., max 4096×4096 pixels)
2. **Default Algorithm**: What should be the default dithering algorithm? (Floyd-Steinberg is most common)
3. **Palette Priority**: Which retro palettes are most important to you? Should we focus on specific ones?
4. **Export Formats**: PDF export is complex - is it essential, or can we start with PNG/JPEG/WebP?
5. **Preset System**: Would you like to share presets with others (export/import JSON), or just save locally?
6. **Advanced Features**: Any specific halftone patterns (e.g., custom dot shapes) you need?
7. **Color Separation**: For print, do you need true CMYK conversion, or is RGB approximation okay?

## Next Steps

1. **Review & Approve Plan**: User reviews this plan and provides feedback
2. **Clarify Open Questions**: Address any uncertainties
3. **Begin Phase 1**: Start with foundation and basic dithering
4. **Iterative Development**: Build phase by phase, testing as we go
5. **User Testing**: Get feedback at key milestones
6. **Polish & Deploy**: Final refinements and deployment

---

**Notes:**
- This is a comprehensive plan for a professional-grade dithering tool
- Implementation can be adjusted based on priorities and time constraints
- The phased approach allows for incremental delivery
- Web Workers ensure the UI stays responsive during heavy processing
- The design will match the existing Shadeworks aesthetic perfectly

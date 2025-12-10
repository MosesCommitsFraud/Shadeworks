# Image Editor Implementation Plan
## Comprehensive Photoshop/Lightroom-style Editor for Shadeworks

### Executive Summary
This plan outlines the implementation of a professional-grade image editor accessible via `/editor` route, combining features from Adobe Photoshop and Lightroom. The editor will leverage existing canvas infrastructure from the whiteboard and dither editor while introducing advanced image manipulation capabilities.

---

## 1. Technology Stack & Libraries

### Core Canvas/Rendering Library
**Selected: Fabric.js** (primary) with **Konva.js** as alternative consideration

**Rationale:**
- **Fabric.js** provides object-oriented canvas API with extensive features for:
  - Complex shapes and image manipulation
  - Built-in filters and effects (blur, emboss, gradients, etc.)
  - Custom filter creation capability
  - Rich interaction model for layers and transformations
  - Larger community and more comprehensive documentation
  - Better for applications requiring complex image manipulation

**Alternative: Konva.js**
- Higher performance for animations
- Native React integration via react-konva
- Lighter weight
- Consider if performance becomes critical

### Image Processing Libraries

1. **Core Image Adjustments**
   - Leverage existing dither library infrastructure (`/lib/dither/adjustments.ts`)
   - **canvas-plus** - Universal canvas manipulation (brightness, contrast, saturation, hue)
   - Native Canvas API for pixel-level operations

2. **Advanced Effects & Filters**
   - **CamanJS** - Advanced filters and presets
   - Custom WebGL shaders for performance-critical operations
   - Leverage existing `/lib/dither/algorithms.ts` for dithering effects

3. **Histogram & Analytics**
   - **photo-histogram** - Photoshop-style histogram UI (TypeScript, no dependencies)
   - **node-histogram** - RGB histogram data extraction
   - **canvas-plus** histogram() method for pixel analysis

4. **Specialized Features**
   - **@imgly/background-removal** (already installed) - AI background removal
   - **Cropper.js** - Advanced cropping with aspect ratios
   - Custom implementation for layers, masks, and blend modes

### UI Components
- Leverage existing shadcn/ui components (Slider, Tabs, Dialog, etc.)
- Framer Motion (already installed) for smooth transitions
- React Hook Form for settings management
- Custom canvas-based layer thumbnail renderer

---

## 2. Feature Set - Photoshop Capabilities

### Layer System
**Priority: HIGH**
- [ ] Layer stack with visibility toggles
- [ ] Layer opacity control (0-100%)
- [ ] Layer blend modes (Normal, Multiply, Screen, Overlay, etc.)
- [ ] Layer ordering (z-index management)
- [ ] Layer groups/folders
- [ ] Layer thumbnails in sidebar
- [ ] Smart objects (non-destructive transforms)
- [ ] Layer lock (position, transparency, pixels)

### Selection Tools
**Priority: HIGH**
- [ ] Rectangle selection
- [ ] Ellipse selection
- [ ] Lasso (freehand) selection
- [ ] Magic wand (color-based selection)
- [ ] Select by color range
- [ ] Feather selection edges
- [ ] Selection transformations (move, scale, rotate)
- [ ] Save/load selections as alpha channels

### Masks
**Priority: MEDIUM**
- [ ] Layer masks (black/white/gray)
- [ ] Vector masks
- [ ] Clipping masks
- [ ] Quick mask mode for editing
- [ ] Mask from selection
- [ ] Invert mask
- [ ] Mask density/feather controls

### Drawing & Painting Tools
**Priority: MEDIUM**
- [ ] Brush tool with customizable size, hardness, opacity
- [ ] Pencil tool
- [ ] Eraser tool (brush-based)
- [ ] Paint bucket (fill tool)
- [ ] Gradient tool (linear, radial, angular)
- [ ] Eyedropper (color picker from image)
- [ ] Clone stamp tool
- [ ] Healing brush

### Text Tools
**Priority: MEDIUM**
- [ ] Text layers with font selection
- [ ] Font size, weight, style controls
- [ ] Text alignment (left, center, right, justify)
- [ ] Letter spacing, line height
- [ ] Text color and stroke
- [ ] Text effects (shadow, glow, etc.)
- [ ] Text along path

### Transform Tools
**Priority: HIGH**
- [ ] Free transform (scale, rotate, skew)
- [ ] Perspective transform
- [ ] Warp transform
- [ ] Flip horizontal/vertical
- [ ] Rotate 90° CW/CCW
- [ ] Maintain aspect ratio (Shift key)
- [ ] Transform from center (Alt key)

### Filters & Effects
**Priority: MEDIUM-HIGH**

**Blur Filters:**
- [ ] Gaussian blur
- [ ] Motion blur
- [ ] Radial blur
- [ ] Box blur

**Artistic Filters:**
- [ ] Oil painting
- [ ] Posterize
- [ ] Pixelate
- [ ] Mosaic

**Distortion:**
- [ ] Pinch/bulge
- [ ] Twirl
- [ ] Wave
- [ ] Ripple

**Stylize:**
- [ ] Emboss
- [ ] Find edges
- [ ] Solarize
- [ ] Glowing edges

**Sharpen:**
- [ ] Sharpen
- [ ] Unsharp mask
- [ ] High pass

**Noise:**
- [ ] Add noise
- [ ] Median filter
- [ ] Dust & scratches

### Adjustment Layers (Non-destructive)
**Priority: HIGH**
- [ ] Brightness/Contrast
- [ ] Levels (histogram-based)
- [ ] Curves (RGB and individual channels)
- [ ] Hue/Saturation
- [ ] Color Balance
- [ ] Vibrance
- [ ] Exposure
- [ ] Black & White
- [ ] Photo Filter (color tinting)
- [ ] Channel Mixer
- [ ] Selective Color
- [ ] Threshold
- [ ] Posterize
- [ ] Gradient Map
- [ ] Invert

### Blend Modes (18+ modes)
**Priority: MEDIUM**

**Darken Group:**
- Darken, Multiply, Color Burn, Linear Burn, Darker Color

**Lighten Group:**
- Lighten, Screen, Color Dodge, Linear Dodge, Lighter Color

**Contrast Group:**
- Overlay, Soft Light, Hard Light, Vivid Light, Linear Light, Pin Light, Hard Mix

**Comparison Group:**
- Difference, Exclusion, Subtract, Divide

**HSL Group:**
- Hue, Saturation, Color, Luminosity

---

## 3. Feature Set - Lightroom Capabilities

### Develop Module - Basic Adjustments
**Priority: HIGH**
- [ ] Exposure slider (-5.00 to +5.00)
- [ ] Contrast (-100 to +100)
- [ ] Highlights (-100 to +100)
- [ ] Shadows (-100 to +100)
- [ ] Whites (-100 to +100)
- [ ] Blacks (-100 to +100)
- [ ] Temperature (2000K to 50000K) - White Balance
- [ ] Tint (-100 to +100) - White Balance
- [ ] Presence: Clarity (-100 to +100)
- [ ] Presence: Vibrance (-100 to +100)
- [ ] Presence: Saturation (-100 to +100)

### Tone Curve
**Priority: MEDIUM-HIGH**
- [ ] Parametric curve (Highlights, Lights, Darks, Shadows sliders)
- [ ] Point curve (direct control points on curve)
- [ ] RGB composite curve
- [ ] Individual R/G/B channel curves
- [ ] Curve presets (Linear, Medium Contrast, Strong Contrast)

### HSL / Color Mixer
**Priority: HIGH**
- [ ] Hue adjustments per color (Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta)
- [ ] Saturation adjustments per color
- [ ] Luminance adjustments per color
- [ ] Color picker tool to target specific color ranges
- [ ] Before/after preview

### Color Grading (Split Toning 2.0)
**Priority: MEDIUM**
- [ ] Shadows color wheel and controls
- [ ] Midtones color wheel and controls
- [ ] Highlights color wheel and controls
- [ ] Balance slider (shadows to highlights)
- [ ] Blending slider
- [ ] Global saturation control

### Detail Panel
**Priority: MEDIUM**
- [ ] Sharpening: Amount (0-150)
- [ ] Sharpening: Radius (0.5-3.0)
- [ ] Sharpening: Detail (0-100)
- [ ] Sharpening: Masking (0-100)
- [ ] Noise Reduction: Luminance (0-100)
- [ ] Noise Reduction: Detail (0-100)
- [ ] Noise Reduction: Contrast (0-100)
- [ ] Noise Reduction: Color (0-100)

### Effects
**Priority: LOW-MEDIUM**
- [ ] Post-Crop Vignetting: Amount (-100 to +100)
- [ ] Vignette: Midpoint, Roundness, Feather, Highlights
- [ ] Grain: Amount, Size, Roughness
- [ ] Dehaze (-100 to +100)

### Local Adjustments (Masks)
**Priority: MEDIUM**
- [ ] Linear Gradient tool
- [ ] Radial Gradient tool
- [ ] Brush tool (paint mask)
- [ ] Range mask (Color, Luminance, Depth)
- [ ] All basic adjustments available per mask
- [ ] Multiple masks per image
- [ ] Mask overlay visualization

### Presets System
**Priority: HIGH**
- [ ] Save custom presets
- [ ] Load/apply presets
- [ ] Preset categories (User, Built-in, Imported)
- [ ] Preset preview thumbnails
- [ ] Import .xmp presets (optional)
- [ ] Partial preset application (choose which adjustments)
- [ ] Leverage existing `/lib/dither/presets.ts` structure

### Histogram Display
**Priority: HIGH**
- [ ] Live RGB histogram with all channels
- [ ] Luminosity histogram
- [ ] Clipping warnings (highlights/shadows)
- [ ] Interactive histogram (click to adjust exposure)
- [ ] Display above/below image canvas

---

## 4. Architecture & File Structure

### New Directory Structure
```
src/
├── app/
│   └── editor/
│       └── page.tsx                    # Main editor route
│
├── components/
│   └── editor/
│       ├── editor.tsx                  # Main editor component
│       ├── canvas-area.tsx             # Canvas rendering area
│       ├── layers-panel.tsx            # Layers sidebar
│       ├── tools-panel.tsx             # Tool selection sidebar
│       ├── adjustments-panel.tsx       # Adjustment controls
│       ├── histogram.tsx               # Histogram display
│       ├── presets-panel.tsx           # Presets browser
│       ├── toolbar.tsx                 # Top toolbar
│       │
│       ├── tools/
│       │   ├── brush-tool.tsx
│       │   ├── selection-tool.tsx
│       │   ├── transform-tool.tsx
│       │   ├── text-tool.tsx
│       │   ├── crop-tool.tsx
│       │   └── ...
│       │
│       ├── panels/
│       │   ├── basic-panel.tsx         # Lightroom basic adjustments
│       │   ├── tone-curve-panel.tsx
│       │   ├── hsl-panel.tsx
│       │   ├── color-grading-panel.tsx
│       │   ├── detail-panel.tsx
│       │   ├── effects-panel.tsx
│       │   ├── layers-panel.tsx
│       │   ├── masks-panel.tsx
│       │   └── blend-modes-panel.tsx
│       │
│       └── dialogs/
│           ├── export-dialog.tsx
│           ├── preset-save-dialog.tsx
│           └── help-dialog.tsx
│
├── lib/
│   └── editor/
│       ├── fabric-manager.ts           # Fabric.js canvas manager
│       ├── layer-manager.ts            # Layer stack management
│       ├── selection-manager.ts        # Selection tools logic
│       ├── adjustment-processor.ts     # Image adjustment algorithms
│       ├── filter-processor.ts         # Filter implementations
│       ├── blend-modes.ts              # Blend mode calculations
│       ├── histogram-generator.ts      # Histogram data generation
│       ├── preset-manager.ts           # Preset save/load
│       ├── export-manager.ts           # Export functionality
│       ├── keyboard-shortcuts.ts       # Keyboard shortcut definitions
│       ├── undo-redo.ts               # History management
│       │
│       ├── tools/
│       │   ├── brush.ts
│       │   ├── selection.ts
│       │   ├── transform.ts
│       │   ├── text.ts
│       │   └── ...
│       │
│       ├── adjustments/
│       │   ├── basic.ts                # Exposure, contrast, etc.
│       │   ├── tone-curve.ts
│       │   ├── hsl.ts
│       │   ├── color-grading.ts
│       │   └── ...
│       │
│       ├── filters/
│       │   ├── blur.ts
│       │   ├── sharpen.ts
│       │   ├── artistic.ts
│       │   └── ...
│       │
│       └── types.ts                    # TypeScript definitions
│
└── hooks/
    └── editor/
        ├── use-editor-state.ts
        ├── use-canvas.ts
        ├── use-layers.ts
        ├── use-history.ts
        └── use-keyboard-shortcuts.ts
```

### State Management Architecture
Leverage React hooks and context for state management:

```typescript
// Editor state structure
interface EditorState {
  // Canvas
  canvas: fabric.Canvas | null;
  canvasSize: { width: number; height: number };
  zoom: number;
  pan: { x: number; y: number };

  // Image & Layers
  originalImage: ImageData | null;
  layers: Layer[];
  activeLayerId: string | null;

  // Tools
  activeTool: Tool;
  toolSettings: ToolSettings;

  // Adjustments (Lightroom-style)
  adjustments: {
    basic: BasicAdjustments;
    toneCurve: ToneCurveData;
    hsl: HSLAdjustments;
    colorGrading: ColorGradingSettings;
    detail: DetailSettings;
    effects: EffectsSettings;
  };

  // Selection & Masks
  selection: Selection | null;
  activeMask: Mask | null;

  // History
  history: HistoryState;

  // UI State
  panels: {
    layers: boolean;
    adjustments: boolean;
    tools: boolean;
    histogram: boolean;
    presets: boolean;
  };

  // Processing
  isProcessing: boolean;
  processingProgress: number;
}
```

---

## 5. Reusable Code from Existing Codebase

### From Dither Editor (`/src/components/dither/`)
**Reusable Components & Logic:**
1. **Canvas Preview System** (`canvas-preview.tsx`)
   - Zoom controls (zoom in/out/fit)
   - Pan/drag functionality
   - Wheel zoom with Ctrl/Cmd
   - Comparison mode slider (before/after)
   - Processing indicator with progress bar
   - Canvas rendering infrastructure

2. **Adjustment Settings** (`/lib/dither/adjustments.ts`)
   - Brightness, contrast, saturation algorithms
   - Exposure adjustments
   - Image data manipulation utilities
   - Debounced processing pattern

3. **Export System** (`/lib/dither/export.ts`)
   - Multi-format export (PNG, JPEG, etc.)
   - DPI settings
   - Quality settings
   - Color separation export
   - Download trigger logic

4. **Keyboard Shortcuts** (`/lib/dither/keyboard-shortcuts.ts`)
   - Shortcut registration system
   - Modifier key detection
   - Platform-specific key handling
   - preventDefault management

5. **Undo/Redo System** (`/lib/dither/undo-redo.ts`)
   - History state management
   - State snapshot system
   - Stack-based undo/redo

6. **Project Management** (`/lib/dither/project.ts`)
   - Save/load project structure
   - Settings serialization
   - Unsaved changes detection
   - Project state management

7. **Utility Functions** (`/lib/dither/utils.ts`)
   - `copyImageData()` - Deep copy ImageData
   - `debounce()` - Debounce helper
   - Canvas utilities

### From Whiteboard (`/src/components/board/`)
**Reusable Components & Logic:**
1. **Canvas System** (`canvas.tsx`)
   - SVG-based drawing (can adapt to Fabric.js)
   - Tool switching infrastructure
   - Mouse event handling (mouseDown, mouseMove, mouseUp)
   - Pan and zoom with trackpad
   - Keyboard shortcut handling (Delete, Escape, Shift)
   - Element selection system
   - Transform handles (resize, rotate)

2. **Layer/Element Management**
   - Element stack (`BoardElement[]`)
   - Element selection (single/multi)
   - Bounding box calculations (`getBoundingBox()`)
   - Element update/delete callbacks
   - Z-index management

3. **Drawing Tools**
   - Pen tool (freehand drawing with perfect-freehand)
   - Shape tools (rectangle, ellipse)
   - Text input system with textarea overlay
   - Eraser with hover preview
   - Lasso selection

4. **Collaboration** (`/lib/collaboration.ts`)
   - Can be leveraged for real-time collaboration (future)
   - Cursor tracking system
   - Remote state synchronization

### Existing UI Components (shadcn/ui)
- Slider - for all adjustment controls
- Tabs - for panel switching
- Dialog - for export, save, help dialogs
- Button, Toggle, Switch
- Accordion - for collapsible sections
- ScrollArea - for long panels
- Separator - for UI dividers
- Tooltip - for tool hints
- Popover - for color pickers, dropdowns

### Existing Utilities
- `/lib/utils/platform.ts` - Platform detection (Mac/Windows)
- `/lib/utils.ts` - `cn()` classname utility
- Framer Motion - Already installed for animations

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal: Basic editor with canvas and layer system**

**Tasks:**
1. Create `/editor` route and basic layout
2. Integrate Fabric.js and create canvas manager
3. Implement layer system (add, delete, reorder, visibility)
4. Image upload and display
5. Basic zoom/pan controls (reuse from dither editor)
6. Layer panel UI with thumbnails
7. Basic toolbar with tool selection

**Deliverables:**
- Functional canvas with image loading
- Working layer stack
- Zoom/pan controls
- Tool selection infrastructure

### Phase 2: Core Tools (Week 2)
**Goal: Essential drawing and selection tools**

**Tasks:**
1. Selection tools (rectangle, ellipse, lasso)
2. Transform tool (move, scale, rotate)
3. Brush tool with size/opacity
4. Eraser tool
5. Crop tool integration (Cropper.js)
6. Text tool with font controls
7. Eyedropper (color picker)

**Deliverables:**
- Working selection system
- Transform with handles
- Drawing tools functional
- Text layers working

### Phase 3: Lightroom Adjustments (Week 3)
**Goal: Non-destructive adjustment system**

**Tasks:**
1. Basic adjustments panel (exposure, contrast, highlights, shadows, etc.)
2. HSL/Color Mixer panel with 8 color sliders
3. Tone curve panel (parametric + point curve)
4. Histogram display with clipping warnings
5. Color grading panel (shadows/midtones/highlights)
6. Real-time preview system
7. Adjustment layer architecture

**Deliverables:**
- Complete Lightroom-style adjustment panel
- Live histogram
- Non-destructive adjustments
- Before/after comparison

### Phase 4: Filters & Effects (Week 4)
**Goal: Photoshop-style filters**

**Tasks:**
1. Blur filters (Gaussian, motion, radial)
2. Sharpen filters
3. Artistic filters (posterize, pixelate)
4. Distortion filters (pinch, twirl, wave)
5. Stylize filters (emboss, find edges)
6. Noise filters
7. Filter preview system
8. Filter intensity control

**Deliverables:**
- 20+ working filters
- Filter preview UI
- Filter stacking capability

### Phase 5: Advanced Features (Week 5)
**Goal: Masks, blend modes, advanced layer features**

**Tasks:**
1. Layer masks (create, edit, invert)
2. Blend modes (18+ modes)
3. Clipping masks
4. Layer opacity control
5. Layer groups
6. Smart objects
7. Adjustment layers
8. Layer effects (shadow, glow, stroke)

**Deliverables:**
- Full mask system
- Complete blend mode library
- Advanced layer controls
- Layer groups

### Phase 6: Presets & Export (Week 6)
**Goal: Workflow efficiency features**

**Tasks:**
1. Preset system (save/load/apply)
2. Preset browser with thumbnails
3. Built-in preset library (10-20 presets)
4. Export dialog with format options
5. Batch export capability
6. Project save/load
7. Auto-save functionality
8. Export profiles (web, print, etc.)

**Deliverables:**
- Working preset system
- Comprehensive export options
- Project management
- Auto-save

### Phase 7: Polish & Optimization (Week 7)
**Goal: Performance, UX, keyboard shortcuts**

**Tasks:**
1. Performance optimization (debouncing, memoization)
2. Keyboard shortcuts (comprehensive map)
3. Help dialog with shortcuts
4. Onboarding/tutorial
5. Responsive design adjustments
6. Loading states and error handling
7. Accessibility improvements
8. Documentation

**Deliverables:**
- Smooth performance
- Complete keyboard shortcuts
- Help documentation
- Production-ready app

---

## 7. Key Technical Decisions

### Canvas Rendering Strategy
- **Primary: Fabric.js Canvas** for layer management and object manipulation
- **Secondary: Raw Canvas API** for pixel-level adjustments and histogram
- **Hybrid approach**: Fabric.js for layers/UI, raw canvas for processing

### Non-Destructive Editing
- Store original image data
- Apply adjustments as pipelines
- Re-render on demand (debounced)
- Save adjustment stack with project

### Performance Optimization
- **Web Workers** for heavy processing (filters, histogram calculation)
- **OffscreenCanvas** for background rendering
- **RequestAnimationFrame** for smooth updates
- **Debouncing** slider inputs (300ms like dither editor)
- **Memoization** for repeated calculations
- **Lazy loading** for filter libraries

### Undo/Redo Strategy
- **Snapshot-based** for layer operations
- **Command pattern** for adjustments
- **Configurable history depth** (default 50 states)
- Leverage existing `/lib/dither/undo-redo.ts`

### Export Formats
- PNG (lossless, transparency)
- JPEG (lossy, quality slider)
- WebP (modern, smaller files)
- TIFF (print, high quality)
- PDF (vector + raster)
- PSD (future: layer export)

---

## 8. UI/UX Layout

### Main Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Image Editor          [Help] [Keyboard] [Export]    │ ← Header
├────┬────────────────────────────────────────────────────┬───┤
│    │                                                    │   │
│ T  │                  CANVAS AREA                       │ A │
│ O  │              [Image Display]                       │ D │
│ O  │         [Histogram - RGB overlay]                  │ J │
│ L  │         [Zoom: 100%] [Fit] [+-]                   │ U │
│ S  │                                                    │ S │
│    │                                                    │ T │
│ [  │                                                    │   │
│ 📝 │                                                    │ P │ ← Adjustment
│ 🖌️ │                                                    │ A │   Panels
│ 🔲 │                                                    │ N │   (Tabs)
│ ✂️  │                                                    │ E │
│ 🎨 │                                                    │ L │
│ ]  │                                                    │   │
│    │                                                    │   │
├────┴────────────────────────────────────────────────────┴───┤
│  LAYERS PANEL                                                │
│  [Layer 1] [👁] [🔒] [Opacity: 100%] [Blend: Normal]       │
│  [Layer 2] [👁] [🔒] [Opacity: 75%]  [Blend: Multiply]     │ ← Layers
│  [Background] [👁] [🔒]                                     │   Panel
│  [+ Add Layer] [Delete] [Duplicate] [Group]                 │
└──────────────────────────────────────────────────────────────┘
```

### Panel Organization

**Left Sidebar - Tools (36-48px wide)**
- Selection tools
- Drawing tools (brush, pencil, eraser)
- Shape tools
- Text tool
- Transform tools
- Crop tool
- Eyedropper
- Hand (pan) tool
- Zoom tool

**Right Sidebar - Adjustments (300-400px wide, collapsible)**
Tabs:
1. **Adjust** - Lightroom-style sliders
   - Basic (exposure, contrast, etc.)
   - Tone Curve
   - HSL / Color Mixer
   - Color Grading
   - Detail (sharpening, noise reduction)
   - Effects (vignette, grain)

2. **Filters** - Photoshop-style filters
   - Blur
   - Sharpen
   - Artistic
   - Distortion
   - Stylize
   - Noise

3. **Presets** - Preset browser
   - User presets
   - Built-in presets
   - Imported presets
   - [Apply] [Save] [Delete]

**Bottom Panel - Layers (150-200px tall, collapsible)**
- Layer thumbnails (60x60px)
- Layer name (editable)
- Visibility toggle
- Lock toggle
- Opacity slider
- Blend mode dropdown
- Layer controls (add, delete, duplicate, group, merge)

**Top Bar - Main Actions**
- Project name (editable)
- Upload new image
- Export button (primary CTA)
- Undo/Redo buttons
- Help button
- Keyboard shortcuts button
- Settings

### Histogram Display
- Positioned above canvas OR in adjustments panel
- RGB composite + individual channels toggle
- Clipping warnings (red/blue highlights)
- Click-to-adjust exposure (optional advanced feature)

---

## 9. Keyboard Shortcuts Map

### Tools (Single Key)
- `V` - Select/Move tool
- `B` - Brush tool
- `E` - Eraser tool
- `T` - Text tool
- `C` - Crop tool
- `I` - Eyedropper
- `H` - Hand (pan) tool
- `Z` - Zoom tool
- `M` - Rectangular selection
- `L` - Lasso selection
- `W` - Magic wand

### Layer Operations
- `Cmd/Ctrl + J` - Duplicate layer
- `Cmd/Ctrl + G` - Group layers
- `Cmd/Ctrl + Shift + G` - Ungroup layers
- `Cmd/Ctrl + E` - Merge down
- `Cmd/Ctrl + Shift + E` - Flatten image
- `Delete/Backspace` - Delete layer
- `Cmd/Ctrl + [` - Move layer down
- `Cmd/Ctrl + ]` - Move layer up
- `Cmd/Ctrl + Shift + N` - New layer

### Adjustments
- `Cmd/Ctrl + L` - Levels
- `Cmd/Ctrl + M` - Curves
- `Cmd/Ctrl + U` - Hue/Saturation
- `Cmd/Ctrl + B` - Color Balance
- `Cmd/Ctrl + I` - Invert

### View
- `Cmd/Ctrl + 0` - Fit to screen
- `Cmd/Ctrl + +` - Zoom in
- `Cmd/Ctrl + -` - Zoom out
- `Cmd/Ctrl + 1` - 100% zoom
- `Space + drag` - Pan (hand tool)
- `F` - Toggle fullscreen
- `Tab` - Toggle panels

### Selection
- `Cmd/Ctrl + A` - Select all
- `Cmd/Ctrl + D` - Deselect
- `Cmd/Ctrl + Shift + I` - Invert selection
- `Cmd/Ctrl + Shift + D` - Reselect

### Edit
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + C` - Copy
- `Cmd/Ctrl + V` - Paste
- `Cmd/Ctrl + X` - Cut
- `Cmd/Ctrl + T` - Free transform

### File
- `Cmd/Ctrl + O` - Open image
- `Cmd/Ctrl + S` - Save project
- `Cmd/Ctrl + Shift + S` - Save as
- `Cmd/Ctrl + Shift + E` - Export

### Comparison
- `C` - Toggle before/after comparison (reuse from dither editor)

---

## 10. Dependencies to Install

### Required NPM Packages
```json
{
  "fabric": "^6.x",              // Canvas manipulation library
  "canvas-plus": "^1.x",         // Image adjustments (optional)
  "photo-histogram": "^1.x",     // Histogram widget
  "cropperjs": "^1.x",          // Crop tool
  "@types/fabric": "^5.x"       // TypeScript definitions
}
```

### Already Installed (Reuse)
- `@imgly/background-removal` - Background removal
- `framer-motion` - Animations
- `lucide-react` - Icons
- All shadcn/ui components
- `uuid` - ID generation
- `react-hook-form` - Form management
- `zod` - Validation
- `jszip` - For layered exports (future)

### Optional (Consider Later)
- `gl-matrix` - WebGL matrix operations
- `tinycolor2` - Color manipulation
- `file-saver` - Enhanced file downloads
- `pica` - High-quality image resize

---

## 11. Critical Implementation Details

### Layer Data Structure
```typescript
interface Layer {
  id: string;
  name: string;
  type: 'image' | 'adjustment' | 'text' | 'shape' | 'group';
  visible: boolean;
  locked: boolean;
  opacity: number; // 0-100
  blendMode: BlendMode;
  fabricObject?: fabric.Object; // Reference to Fabric.js object

  // For image layers
  imageData?: ImageData;

  // For adjustment layers
  adjustments?: AdjustmentSettings;

  // Mask
  mask?: {
    data: ImageData;
    enabled: boolean;
  };

  // Transform
  transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number; // degrees
  };

  // Metadata
  createdAt: number;
  updatedAt: number;
}
```

### Adjustment Pipeline
```typescript
// Process image through adjustment stack
function processImage(
  originalImage: ImageData,
  adjustments: Adjustments,
  layers: Layer[]
): ImageData {
  let result = copyImageData(originalImage);

  // 1. Apply basic adjustments
  result = applyBasicAdjustments(result, adjustments.basic);

  // 2. Apply tone curve
  result = applyToneCurve(result, adjustments.toneCurve);

  // 3. Apply HSL
  result = applyHSL(result, adjustments.hsl);

  // 4. Apply color grading
  result = applyColorGrading(result, adjustments.colorGrading);

  // 5. Apply sharpening/noise reduction
  result = applyDetail(result, adjustments.detail);

  // 6. Apply effects
  result = applyEffects(result, adjustments.effects);

  // 7. Composite with layers
  result = compositeLayers(result, layers);

  return result;
}
```

### Histogram Calculation
```typescript
function generateHistogram(imageData: ImageData): HistogramData {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const l = new Array(256).fill(0); // Luminance

  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    r[data[i]]++;
    g[data[i + 1]]++;
    b[data[i + 2]]++;

    // Calculate luminance (rec. 709)
    const lum = Math.round(
      0.2126 * data[i] +
      0.7152 * data[i + 1] +
      0.0722 * data[i + 2]
    );
    l[lum]++;
  }

  return { r, g, b, luminance: l };
}
```

### Blend Mode Implementation
```typescript
// Example: Multiply blend mode
function blendMultiply(base: number, blend: number): number {
  return (base * blend) / 255;
}

// Example: Screen blend mode
function blendScreen(base: number, blend: number): number {
  return 255 - (((255 - base) * (255 - blend)) / 255);
}

// Apply blend mode to layers
function applyBlendMode(
  base: ImageData,
  blend: ImageData,
  mode: BlendMode,
  opacity: number
): ImageData {
  const result = copyImageData(base);
  const blendFn = getBlendFunction(mode);

  for (let i = 0; i < base.data.length; i += 4) {
    const r = blendFn(base.data[i], blend.data[i]);
    const g = blendFn(base.data[i + 1], blend.data[i + 1]);
    const b = blendFn(base.data[i + 2], blend.data[i + 2]);

    // Apply opacity
    result.data[i] = lerp(base.data[i], r, opacity / 100);
    result.data[i + 1] = lerp(base.data[i + 1], g, opacity / 100);
    result.data[i + 2] = lerp(base.data[i + 2], b, opacity / 100);
  }

  return result;
}
```

---

## 12. Testing Strategy

### Unit Tests
- Adjustment algorithms (brightness, contrast, etc.)
- Histogram calculation
- Blend mode calculations
- Color space conversions
- Layer operations

### Integration Tests
- Canvas rendering
- Layer compositing
- Adjustment pipeline
- Export functionality
- Undo/redo system

### Manual Testing Checklist
- [ ] Load various image formats (PNG, JPEG, WebP)
- [ ] Test on different screen sizes
- [ ] Verify keyboard shortcuts on Mac/Windows
- [ ] Test with large images (10MP+)
- [ ] Test with many layers (20+)
- [ ] Performance test with real-time adjustments
- [ ] Export verification (format, quality, size)
- [ ] Undo/redo stress test (50+ operations)
- [ ] Preset save/load verification
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

---

## 13. Performance Targets

### Responsiveness
- Initial load: < 2s
- Tool switch: < 100ms
- Adjustment slider: < 50ms (debounced to 300ms processing)
- Layer operation: < 200ms
- Histogram update: < 100ms
- Export: < 5s for 4K image

### Memory Management
- Efficient ImageData copying
- Dispose unused Fabric.js objects
- Limit undo history depth
- Clear filter caches periodically

### Optimization Techniques
- Debounce slider inputs (300ms)
- Throttle canvas renders (60fps max)
- Lazy load filter modules
- Use OffscreenCanvas for processing
- Memoize histogram calculations
- Virtualize layer list for 100+ layers

---

## 14. Future Enhancements (Post-MVP)

### Advanced Features
- [ ] AI-powered features (auto-enhance, subject selection)
- [ ] Batch processing
- [ ] Actions/macros recording
- [ ] Plugins system
- [ ] Camera Raw support
- [ ] 16-bit color depth
- [ ] CMYK color mode
- [ ] Video editing (extend to video like dither editor)
- [ ] 3D LUT support
- [ ] Layer styles (drop shadow, inner glow, etc.)
- [ ] Vector shapes and paths
- [ ] Content-aware fill
- [ ] Liquify tool
- [ ] Perspective correction
- [ ] HDR merging
- [ ] Focus stacking

### Collaboration
- [ ] Real-time collaboration (leverage existing collaboration.ts)
- [ ] Comments and annotations
- [ ] Version history
- [ ] Shared presets library

### Integration
- [ ] Cloud storage (save to cloud)
- [ ] Social media export presets
- [ ] Print lab integration
- [ ] Mobile companion app
- [ ] Desktop app (Electron wrapper)

---

## 15. Documentation Requirements

### User Documentation
- [ ] Getting started guide
- [ ] Tool reference
- [ ] Keyboard shortcuts cheat sheet
- [ ] Workflow tutorials
- [ ] Video walkthroughs
- [ ] FAQ

### Developer Documentation
- [ ] Architecture overview
- [ ] API reference
- [ ] Contributing guide
- [ ] Custom filter development
- [ ] Plugin development guide

---

## 16. Success Metrics

### User Engagement
- Time spent in editor
- Number of exports
- Preset usage
- Tool usage distribution
- Feature adoption rate

### Performance Metrics
- Page load time
- Time to first interaction
- Adjustment latency
- Export completion time
- Memory usage

### Quality Metrics
- Bug reports
- User feedback score
- Export quality satisfaction
- Feature request trends

---

## 17. Risk Mitigation

### Technical Risks
**Risk:** Fabric.js performance issues with many layers
**Mitigation:** Implement layer virtualization, lazy rendering, consider Konva.js switch

**Risk:** Browser compatibility issues
**Mitigation:** Progressive enhancement, feature detection, polyfills

**Risk:** Large file handling crashes browser
**Mitigation:** File size limits, chunked processing, Web Workers

### UX Risks
**Risk:** Too complex for beginners
**Mitigation:** Onboarding tutorial, presets, simplified mode toggle

**Risk:** Keyboard shortcuts conflict with browser
**Mitigation:** Customizable shortcuts, preventDefault judiciously

---

## 18. Go-to-Market Strategy

### Initial Release (MVP)
- Basic adjustments (Lightroom-style)
- Core tools (selection, brush, transform)
- Layer system
- Export functionality
- 10 built-in presets

### Marketing
- Blog post announcement
- Demo video
- Sample presets for download
- Before/after gallery
- Integration with existing Shadeworks tools

---

## Summary & Next Steps

This comprehensive plan outlines a full-featured image editor combining the best of Photoshop and Lightroom. The implementation is structured in 7 phases over approximately 7 weeks, reusing significant infrastructure from the existing dither editor and whiteboard components.

**Immediate Next Steps:**
1. Get user approval on plan and feature priorities
2. Install required dependencies (fabric, photo-histogram, cropperjs)
3. Create base `/editor` route and layout structure
4. Begin Phase 1 implementation (Foundation)

**Key Success Factors:**
- Leverage existing canvas infrastructure from dither/board components
- Maintain non-destructive editing workflow
- Focus on performance (debouncing, Web Workers, memoization)
- Comprehensive keyboard shortcuts for power users
- Intuitive preset system for quick edits

**Libraries Summary:**
- **Fabric.js** - Primary canvas/layer management
- **photo-histogram** - Histogram display
- **cropperjs** - Crop tool
- **canvas-plus** - Image adjustments (optional)
- Reuse existing: framer-motion, shadcn/ui, @imgly/background-removal

---

## Research Sources

### Image Editing Libraries:
- [Top 5 Open Source JavaScript Image Manipulation Libraries | IMG.LY Blog](https://img.ly/blog/the-top-5-open-source-javascript-image-manipulation-libraries/)
- [12 JavaScript Image Manipulation Libraries for Your Next Web App](https://flatlogic.com/blog/12-javascript-image-manipulation-libraries-for-your-next-web-app/)
- [Pintura Image Editor](https://pqina.nl/pintura)
- [8 Best Free and Open-Source JavaScript Image Editors | Envato Tuts+](https://code.tutsplus.com/best-free-and-open-source-javascript-image-editors--cms-39897a)

### Fabric.js vs Konva.js:
- [React: Comparison of JS Canvas Libraries (Konvajs vs Fabricjs) - DEV Community](https://dev.to/lico/react-comparison-of-js-canvas-libraries-konvajs-vs-fabricjs-1dan)
- [Fabric.js vs Konva | What are the differences?](https://stackshare.io/stackups/fabricjs-vs-konva)
- [konva vs fabric | Canvas Libraries for Web Development Comparison](https://npm-compare.com/fabric,konva)
- [How I choose Fabric.js again](https://0ro.github.io/posts/how-i-choose-fabricjs-again/)

### Image Adjustments:
- [@syncfusion/ej2-image-editor - npm](https://www.npmjs.com/package/@syncfusion/ej2-image-editor)
- [canvas-plus - GitHub](https://github.com/jhuckaby/canvas-plus)
- [editpix - npm](https://www.npmjs.com/package/editpix)

### Photoshop Features:
- [Layer opacity and blending modes in Adobe Photoshop](https://helpx.adobe.com/photoshop/using/layer-opacity-blending.html)
- [Create adjustment and fill layers in Photoshop](https://helpx.adobe.com/photoshop/using/adjustment-fill-layers.html)
- [Edit layer masks in Photoshop](https://helpx.adobe.com/photoshop/using/editing-layer-masks.html)
- [Blending modes in Adobe Photoshop](https://helpx.adobe.com/photoshop/using/blending-modes.html)

### Lightroom Features:
- [How to adjust image tone and color in Lightroom Classic](https://helpx.adobe.com/lightroom-classic/help/image-tone-color.html)
- [Adobe Lightroom Classic Develop Module and Colour Edits](https://www.colourphil.co.uk/lightroom-cc-develop-2.shtml)
- [How to Use HSL in Lightroom Classic](https://www.tourboxtech.com/en/news/hsl-lightroom.html)
- [10 Essential Panels in Lightroom Develop Module](https://www.psdstack.com/photography/panels-lightroom/)

### Histogram Implementation:
- [node-histogram - GitHub](https://github.com/Munter/node-histogram)
- [histogram - npm](https://www.npmjs.com/package/histogram)
- [photo-histogram - GitHub](https://github.com/zackee12/photo-histogram)
- [canvas-plus - GitHub](https://github.com/jhuckaby/canvas-plus)

---

**Plan Status:** ✅ READY FOR REVIEW
**Estimated Timeline:** 7 weeks (phased approach)
**Priority Level:** HIGH - Comprehensive feature set
**Dependencies:** Fabric.js, photo-histogram, cropperjs

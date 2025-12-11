# Image Editor Implementation Plan
## Photoshop/Figma-inspired Editor for /editor Route

---

## Executive Summary

Build a comprehensive image editor at `/editor` that combines the best features of Photoshop (image manipulation, filters, adjustments) and Figma (vector tools, layers, intuitive UI) while maintaining the Shadeworks design language.

---

## 1. Research Findings

### Photoshop 2025 Core Features
- **Layers System**: Non-destructive editing with adjustment layers
- **Selection Tools**: Marquee, Lasso, Magic Wand, Pen tool
- **Filters**: Blur, sharpen, distortion, stylize effects
- **Adjustments**: Brightness, contrast, levels, curves, hue/saturation
- **Color Management**: Color balance, color grading
- **Blending Modes**: Multiply, screen, overlay, etc.
- **Brush Tools**: Various brush types with size/opacity controls
- **Transform Tools**: Scale, rotate, skew, warp
- **Remove/Healing**: Object removal, healing brush, clone stamp

### Figma 2025 Core Features
- **Vector Editing**: Advanced path editing with shape builder
- **Text Tools**: Text on path, rich typography controls
- **Layers & Groups**: Hierarchical organization
- **Auto Layout**: Grid and flex-like layouts
- **Boolean Operations**: Union, subtract, intersect
- **Frames & Artboards**: Multiple canvas areas
- **Real-time Collaboration**: (Out of scope for MVP)

### Canvas Library Analysis
- **Fabric.js** (✓ Already in package.json): Best for image manipulation + vector editing
  - Object model with transformation
  - Image filters built-in
  - SVG support
  - Text rendering
  - Active development
- **Alternative considered**: Konva.js (better for animations, but Fabric.js is superior for image editing)

---

## 2. Existing Codebase Analysis

### Design System
- **Color Palette**:
  - Light mode: Warm background (oklch), red accent (#d84040 range)
  - Dark mode: Deep blacks with same accent
  - Design follows minimalist, professional aesthetic
- **UI Components**: Full shadcn/ui suite available
- **Typography**: Exo font family, clean sans-serif
- **Layout Pattern**: Sidebar + main canvas (see dither editor)

### Reusable Patterns from Dither Editor
- ✅ **Sidebar Architecture**: Collapsible sections with icons
- ✅ **Canvas Preview**: Pan, zoom, fit controls
- ✅ **Keyboard Shortcuts**: System in place
- ✅ **Project Management**: Save/load/unsaved changes flow
- ✅ **Export System**: Multi-format export
- ✅ **Image Processing Pipeline**: ImageData manipulation
- ✅ **Undo/Redo**: Not in dither, but in whiteboard (can copy)

### Whiteboard Features to Reuse
- ✅ **Canvas rendering**: Native HTML canvas with transform
- ✅ **Selection system**: Multi-select with bounding box
- ✅ **Undo/Redo stack**: Snapshot-based history
- ✅ **Tool system**: Tool switching architecture
- ✅ **Color picker integration**

---

## 3. Architecture Design

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Canvas Library**: Fabric.js 6.9.0 (already installed)
- **State Management**: React hooks (useState, useReducer for complex state)
- **UI Components**: shadcn/ui + Radix UI
- **Image Processing**: Canvas API + Fabric.js filters
- **File Handling**: File API for upload/export

### File Structure
```
src/
├── app/
│   └── editor/
│       └── page.tsx                    # Main editor page (dynamic import)
├── components/
│   └── editor/
│       ├── image-editor.tsx            # Main editor component
│       ├── editor-canvas.tsx           # Fabric.js canvas wrapper
│       ├── layers-panel.tsx            # Layers sidebar
│       ├── tools-panel.tsx             # Tool selection panel
│       ├── properties-panel.tsx        # Context-sensitive properties
│       ├── top-toolbar.tsx             # File/Edit/View menus
│       ├── sections/
│       │   ├── upload-section.tsx      # Image upload
│       │   ├── layers-section.tsx      # Layer management
│       │   ├── adjustments-section.tsx # Image adjustments
│       │   ├── filters-section.tsx     # Filters
│       │   ├── tools-section.tsx       # Drawing tools
│       │   └── export-section.tsx      # Export options
│       └── components/
│           ├── layer-item.tsx          # Single layer component
│           ├── color-picker.tsx        # Color selection
│           └── transform-controls.tsx  # Transform handles
└── lib/
    └── editor/
        ├── fabric-helpers.ts           # Fabric.js utilities
        ├── filters.ts                  # Custom filter implementations
        ├── adjustments.ts              # Image adjustments (reuse from dither)
        ├── layers.ts                   # Layer management logic
        ├── export.ts                   # Export functionality
        ├── keyboard-shortcuts.ts       # Keyboard shortcuts
        ├── history.ts                  # Undo/redo implementation
        └── types.ts                    # TypeScript types
```

---

## 4. Feature Set (Prioritized)

### MVP - Phase 1 (Core Functionality)
1. **Image Upload & Canvas**
   - Upload single image
   - Fabric.js canvas initialization
   - Pan/zoom/fit controls (reuse from dither)

2. **Layers System**
   - Layer list panel (left sidebar)
   - Add/delete/reorder layers
   - Show/hide layers (visibility toggle)
   - Layer opacity control
   - Rename layers

3. **Basic Selection Tools**
   - Select/Move tool (Fabric.js built-in)
   - Rectangle selection
   - Free transform (scale, rotate)

4. **Image Adjustments** (reuse from dither)
   - Brightness
   - Contrast
   - Saturation
   - Hue
   - Blur filter

5. **Drawing Tools**
   - Brush (free draw)
   - Eraser
   - Shapes (rectangle, circle, line)
   - Text tool

6. **Export**
   - PNG/JPG export
   - Download current canvas
   - Export all layers or flattened

### Phase 2 (Enhanced Features)
7. **Advanced Filters**
   - Gaussian blur
   - Sharpen
   - Pixelate
   - Grayscale
   - Sepia
   - Vintage/film effects

8. **Color Tools**
   - Color picker with eyedropper
   - Gradient fills
   - Pattern fills

9. **Advanced Selection**
   - Lasso tool
   - Magic wand (color-based selection)
   - Selection refinement

10. **Transform Tools**
    - Precise rotation input
    - Skew/distort
    - Flip horizontal/vertical

### Phase 3 (Professional Features)
11. **Vector Tools**
    - Pen tool (bezier paths)
    - Shape builder
    - Boolean operations

12. **Blending Modes**
    - Normal, multiply, screen, overlay
    - Layer blend mode selector

13. **Advanced Text**
    - Font family selection
    - Text styles (bold, italic)
    - Text on path
    - Rich text formatting

14. **History Panel**
    - Visual undo/redo history
    - Named snapshots

---

## 5. UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] File Edit View Image Layer    [User] [Export]  │ ← Top bar
├──────┬────────────────────────────────────┬─────────────┤
│      │                                    │             │
│ Tool │         Main Canvas Area          │  Properties │
│ Bar  │    (Fabric.js canvas)              │  Panel      │
│      │    - Pan/Zoom                      │  - Layers   │
│      │    - Grid/Guides                   │  - Adjust   │
│ [🎯] │                                    │  - Filters  │
│ [✏️] │                                    │             │
│ [🔲] │                                    │             │
│ [A]  │                                    │             │
│      │                                    │             │
└──────┴────────────────────────────────────┴─────────────┘
   60px              Flexible                   320px
```

### Design Language (Matching Shadeworks)
- **Spacing**: Consistent with dither editor (16px base)
- **Borders**: `border-border` with subtle dividers
- **Backgrounds**:
  - Sidebar: `bg-card`
  - Main canvas: `bg-muted/10` for contrast
  - Panels: `bg-background`
- **Typography**:
  - Headers: `text-sm font-semibold`
  - Labels: `text-xs text-muted-foreground`
- **Interactive Elements**:
  - Hover states on all clickable items
  - Active tool highlighted with `bg-primary text-primary-foreground`
  - Tooltips for all tools

### Unique Design Elements
- **Floating toolbar** for transform controls (when object selected)
- **Context menu** on right-click (layer/object options)
- **Collapsible panels** for better space management
- **Visual layer thumbnails** (small preview of each layer)
- **Color palette picker** with recently used colors
- **Draggable panels** (optional enhancement)

---

## 6. Technical Implementation Details

### Fabric.js Integration
```typescript
// Initialize canvas
const canvas = new fabric.Canvas('editor-canvas', {
  width: 1200,
  height: 800,
  backgroundColor: '#ffffff',
  preserveObjectStacking: true,
  selection: true,
});

// Add image layer
fabric.Image.fromURL(imageUrl, (img) => {
  img.set({
    selectable: true,
    hasControls: true,
  });
  canvas.add(img);
});

// Apply filters
const filter = new fabric.Image.filters.Brightness({
  brightness: 0.2,
});
image.filters.push(filter);
image.applyFilters();
canvas.renderAll();
```

### State Management
```typescript
interface EditorState {
  canvas: fabric.Canvas | null;
  layers: Layer[];
  selectedLayerId: string | null;
  tool: Tool;
  history: HistoryState;
  viewport: { zoom: number; pan: Point };
  settings: EditorSettings;
}

type Tool =
  | 'select'
  | 'brush'
  | 'eraser'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'pen'
  | 'eyedropper';

interface Layer {
  id: string;
  name: string;
  type: 'image' | 'shape' | 'text' | 'group';
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  fabricObject: fabric.Object;
}
```

### Filters Library (Extending Dither)
- Reuse existing adjustment functions from `@/lib/dither/adjustments.ts`
- Wrap Fabric.js filters for consistent API
- Custom filter implementations for advanced effects

### Performance Optimizations
- **Canvas caching**: Cache layer thumbnails
- **Debounced rendering**: Debounce slider changes
- **Object pooling**: Reuse fabric objects when possible
- **Lazy loading**: Load tools/filters on demand
- **Web Workers**: Offload heavy image processing (future)

---

## 7. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `B` | Brush tool |
| `E` | Eraser |
| `T` | Text tool |
| `R` | Rectangle |
| `O` | Circle |
| `P` | Pen tool |
| `H` | Hand (pan) |
| `Z` | Zoom |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Cmd/Ctrl + S` | Save project |
| `Cmd/Ctrl + E` | Export |
| `Cmd/Ctrl + D` | Duplicate layer |
| `Delete/Backspace` | Delete selected |
| `Cmd/Ctrl + T` | Free transform |
| `Cmd/Ctrl + 0` | Fit to screen |
| `Cmd/Ctrl + +` | Zoom in |
| `Cmd/Ctrl + -` | Zoom out |
| `]` | Increase brush size |
| `[` | Decrease brush size |
| `Space + Drag` | Pan canvas |

---

## 8. Implementation Steps

### Step 1: Project Setup
1. Create `/editor` route with dynamic import
2. Set up base `ImageEditor` component
3. Initialize Fabric.js canvas
4. Implement basic layout (toolbar + canvas + sidebar)

### Step 2: Core Canvas & Upload
1. File upload component
2. Canvas pan/zoom controls (copy from dither)
3. Fit to screen functionality
4. Background grid/pattern

### Step 3: Layers System
1. Layer data structure
2. Layers panel UI
3. Add/delete/reorder layers
4. Layer visibility toggle
5. Layer selection sync with canvas

### Step 4: Selection & Transform
1. Select tool implementation
2. Multi-select support
3. Transform controls (Fabric.js built-in)
4. Bounding box rendering
5. Keyboard shortcuts for transform

### Step 5: Drawing Tools
1. Brush tool with Fabric.js free draw
2. Shape tools (rectangle, circle, line)
3. Text tool with editable text
4. Tool properties panel (stroke, fill, size)

### Step 6: Adjustments & Filters
1. Port adjustments from dither editor
2. Integrate Fabric.js filters
3. Adjustment sliders in properties panel
4. Real-time preview
5. Non-destructive editing (filter stack)

### Step 7: Export & Project Management
1. Export to PNG/JPG
2. Project save/load (JSON serialization)
3. Unsaved changes warning
4. Export options modal

### Step 8: Polish & Enhancement
1. Keyboard shortcuts
2. Undo/redo system
3. Context menus
4. Tooltips and help
5. Loading states
6. Error handling

---

## 9. Libraries & Dependencies

### Already Installed (package.json)
- ✅ `fabric` ^6.9.0 - Canvas library
- ✅ `lucide-react` - Icons
- ✅ `@radix-ui/*` - UI primitives
- ✅ `framer-motion` - Animations (optional)
- ✅ `cropperjs` - Could be useful for crop tool

### Additional Libraries (if needed)
- `color` - Color manipulation utilities
- `hotkeys-js` - Keyboard shortcut management (or use existing pattern)

---

## 10. Testing Strategy

### Manual Testing Checklist
- [ ] Upload images (various formats: PNG, JPG, WebP)
- [ ] Layer operations (add, delete, reorder, hide, opacity)
- [ ] All drawing tools work correctly
- [ ] Adjustments apply correctly
- [ ] Filters render properly
- [ ] Export produces correct output
- [ ] Undo/redo works across all operations
- [ ] Keyboard shortcuts function
- [ ] Pan/zoom smooth and accurate
- [ ] Responsive at different screen sizes
- [ ] Dark/light theme compatibility

### Browser Compatibility
- Chrome/Edge (primary)
- Firefox
- Safari

---

## 11. Future Enhancements (Post-MVP)

1. **AI Features**
   - Background removal (could use existing `@imgly/background-removal`)
   - AI-powered object selection
   - Style transfer
   - Generative fill

2. **Collaboration**
   - Real-time multi-user editing (using existing Y.js infrastructure from board)
   - Comments and annotations
   - Version history

3. **Advanced Tools**
   - Clone stamp tool
   - Healing brush
   - Content-aware fill
   - Liquify/warp tool
   - Perspective transform

4. **Templates & Assets**
   - Template library
   - Stock photo integration
   - Icon library
   - Shape library

5. **Performance**
   - Web Workers for filters
   - Progressive image loading
   - GPU acceleration for filters

---

## 12. Design Differentiation

While inspired by Photoshop/Figma, our editor will be unique through:

1. **Minimalist Interface**: Less cluttered than Photoshop, cleaner than Figma
2. **Integrated Workflow**: Seamless connection with dither editor and whiteboard
3. **Web-First**: Optimized for browser use, not desktop port
4. **Smart Defaults**: Opinionated, user-friendly defaults
5. **Shadeworks Aesthetic**: Red accent, clean typography, modern spacing
6. **Quick Actions**: Common tasks accessible in 1-2 clicks
7. **Contextual UI**: Properties panel changes based on selected object/layer
8. **Mobile Consideration**: Touch-friendly controls (future)

---

## 13. Success Metrics

- ✅ Can upload and edit images
- ✅ Layers system functional
- ✅ At least 5 working tools
- ✅ 5+ adjustment/filter options
- ✅ Export works reliably
- ✅ Undo/redo covers all operations
- ✅ Keyboard shortcuts implemented
- ✅ Design matches Shadeworks aesthetic
- ✅ Intuitive enough for first-time use
- ✅ Performance: <100ms for common operations

---

## 14. Timeline Estimate

**Phase 1 (MVP)**:
- Project setup & canvas: 1-2 sessions
- Layers system: 1-2 sessions
- Tools (selection + basic drawing): 2-3 sessions
- Adjustments & filters: 1-2 sessions
- Export & polish: 1 session

**Total MVP**: ~8-10 development sessions

**Phase 2 & 3**: Additional features added iteratively

---

## 15. Open Questions for User

1. **Primary Use Case**: Is this more for photo editing or graphic design?
   - Photo editing → Prioritize filters, adjustments, healing tools
   - Graphic design → Prioritize vector tools, text, shapes

2. **Target Users**: Professionals or casual users?
   - Affects complexity and feature depth

3. **Integration**: Should this integrate with the dither editor?
   - E.g., "Edit in image editor" button from dither?

4. **Mobile Support**: Priority for touch/mobile or desktop-first?

5. **Cloud Storage**: Local-only or should we add cloud save?

---

## Implementation Philosophy

- **Start Simple**: Get basic functionality working first
- **Iterate Fast**: Ship MVP, then enhance
- **Copy Smart**: Reuse patterns from dither/whiteboard extensively
- **User-Centric**: Prioritize intuitive UX over feature completeness
- **Performance First**: Ensure smooth interactions before adding complexity

---

## Resources & References

### Photoshop Features Research
- [Photoshop 2025: Top 7 New Features](https://photoshoptrainingchannel.com/photoshop-2025-top-7-new-features-and-updates/)
- [10 Photoshop Features Beginners Should Know](https://www.nobledesktop.com/classes-near-me/blog/photoshop-features-beginners-should-know)

### Figma Features Research
- [Config 2025: Pushing Design Further](https://www.figma.com/blog/config-2025-recap/)
- [Figma Draw Announcement](https://www.figma.com/blog/introducing-figma-draw/)

### Canvas Library Comparison
- [Konva vs Fabric Comparison](https://dev.to/lico/react-comparison-of-js-canvas-libraries-konvajs-vs-fabricjs-1dan)
- [Fabric.js Official Docs](https://fabricjs.com/)
- [Konva Official Docs](https://konvajs.org/)

### Technical Documentation
- [Fabric.js API](http://fabricjs.com/docs/)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

*Plan created: 2025-12-11*
*Target route: `/editor`*
*Status: Ready for review and approval*

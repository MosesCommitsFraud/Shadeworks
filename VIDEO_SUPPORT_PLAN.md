# Video Support Implementation Plan for Dither Editor

## Overview
Add comprehensive video processing capabilities to the existing dither editor, allowing users to apply dithering effects, adjustments, and color modes to video files with keyframe animation support for dynamic effects.

## Current Architecture Analysis

### Existing Components
- **Main Editor**: `dither-editor.tsx` - React component managing state and processing pipeline
- **Canvas Preview**: `canvas-preview.tsx` - Displays processed images with zoom/pan controls
- **Upload Section**: `upload-section.tsx` - Handles image file uploads (drag & drop)
- **Processing Pipeline**:
  - Adjustments → Color Mode → Dithering
  - All processing done on `ImageData` objects
  - Settings: `DitheringSettings`, `AdjustmentSettings`, `ColorModeSettings`
- **Export System**: `export.ts` - PNG/JPEG/WebP export with DPI scaling and color separation

### Key Patterns
1. **State Management**: Local React state with callbacks
2. **Settings Architecture**: Separate interfaces for each processing stage
3. **Processing Flow**: Sequential application of adjustments, color modes, then dithering
4. **Presets System**: Complete snapshots of all settings (dithering + adjustments + color mode)
5. **Project System**: Save/load functionality for complete editor state

## Implementation Plan

### Phase 1: Video Type Detection & Mode System

#### 1.1 Type System Extensions
**File**: `src/lib/dither/types.ts`

Add new types:
```typescript
export type MediaType = 'image' | 'video';

export interface VideoSettings {
  fps: number;
  duration: number;
  totalFrames: number;
}

export interface Keyframe<T> {
  frame: number;
  time: number;
  settings: T;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface AnimatedSettings<T> {
  keyframes: Keyframe<T>[];
  enabled: boolean;
}

export interface TimelineState {
  currentFrame: number;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: 1 | 0.5 | 0.25 | 2;
}
```

#### 1.2 Editor State Updates
**File**: `src/components/dither/dither-editor.tsx`

Add state variables:
- `mediaType: MediaType` - Determines if we're in image or video mode
- `videoSettings: VideoSettings | null`
- `videoFrames: ImageData[]` - Array of extracted frames
- `processedFrames: ImageData[]` - Array of processed frames
- `timelineState: TimelineState`
- `animatedAdjustments: AnimatedSettings<AdjustmentSettings>`
- `animatedDithering: AnimatedSettings<DitheringSettings>`
- `animatedColorMode: AnimatedSettings<ColorModeSettings>`

### Phase 2: Video Upload & Frame Extraction

#### 2.1 Video Upload Handler
**File**: `src/lib/dither/video-utils.ts` (new file)

Create utilities for:
- Video file validation (mp4, webm, mov)
- Frame extraction using canvas
- FPS detection
- Duration calculation

```typescript
export async function loadVideoFromFile(file: File): Promise<HTMLVideoElement>
export function extractFramesFromVideo(
  video: HTMLVideoElement,
  fps: number
): Promise<ImageData[]>
export function getVideoMetadata(video: HTMLVideoElement): VideoSettings
```

**Approach**: Use `<video>` element + canvas to extract frames
- Load video into memory
- Seek through video at calculated intervals based on FPS
- Draw each frame to canvas and extract ImageData
- Store frames in array for processing

#### 2.2 Upload Section Updates
**File**: `src/components/dither/sections/upload-section.tsx`

- Update file input to accept `video/*` in addition to `image/*`
- Add video-specific UI feedback (duration, FPS, frame count)
- Handle larger file sizes gracefully
- Show progress during frame extraction

### Phase 3: Video Preview & Timeline

#### 3.1 Timeline Component
**File**: `src/components/dither/timeline.tsx` (new component)

Features:
- Horizontal timeline scrubber
- Current time indicator
- Playback controls (play/pause, frame forward/back)
- Playback speed control (0.25x, 0.5x, 1x, 2x)
- Keyframe markers on timeline
- Click to seek
- Keyboard shortcuts (Space: play/pause, Arrow keys: frame navigation)

UI Design:
```
[◀◀] [▶/⏸] [▶▶] [Speed: 1x]
═══════⬤═══════════════════════
0:00                    0:10.5
Frame: 45 / 315
```

#### 3.2 Canvas Preview for Video
**File**: `src/components/dither/canvas-preview.tsx`

Modifications:
- Conditional rendering based on `mediaType`
- For video mode: Display current frame from `processedFrames[currentFrame]`
- Update frame when timeline changes
- Keep existing zoom/pan functionality
- Maintain comparison mode (show original frame vs processed frame)

#### 3.3 Video Playback System
**File**: `src/lib/dither/video-playback.ts` (new file)

Handle:
- Frame-by-frame playback at specified FPS
- Synchronization between timeline UI and display
- Playback state management
- RAF-based animation loop for smooth playback

### Phase 4: Keyframe Animation System

#### 4.1 Keyframe Manager
**File**: `src/lib/dither/keyframes.ts` (new file)

Core functions:
```typescript
// Add/remove/update keyframes
export function addKeyframe<T>(
  animation: AnimatedSettings<T>,
  frame: number,
  settings: T
): AnimatedSettings<T>

export function removeKeyframe<T>(
  animation: AnimatedSettings<T>,
  frame: number
): AnimatedSettings<T>

// Interpolate settings between keyframes
export function interpolateSettings<T>(
  animation: AnimatedSettings<T>,
  frame: number
): T

// Easing functions
export function applyEasing(
  progress: number,
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
): number
```

**Interpolation Strategy**:
- Numeric values: Linear interpolation between keyframes
- Enums/strings: Use previous keyframe value (step interpolation)
- Example: Brightness 0 at frame 0, brightness 50 at frame 100 → frame 50 = brightness 25

#### 4.2 Keyframe UI Components
**File**: `src/components/dither/sections/keyframe-controls.tsx` (new component)

Features:
- Toggle animation on/off for each settings group
- "Add Keyframe" button (adds keyframe at current frame)
- List of existing keyframes with frame numbers
- Jump to keyframe
- Delete keyframe
- Easing curve selector per keyframe
- Visual indicators on timeline

UI Design:
```
[Toggle Animation: ON]

Keyframes:
• Frame 0 (0:00) [Delete] [Jump]
• Frame 120 (4:00) [Delete] [Jump]
• Frame 240 (8:00) [Delete] [Jump]

[+ Add Keyframe at Current Frame]
```

### Phase 5: Video Processing Pipeline

#### 5.1 Frame Processing System
**File**: `src/lib/dither/video-processor.ts` (new file)

```typescript
export interface VideoProcessingOptions {
  frames: ImageData[];
  videoSettings: VideoSettings;
  animatedAdjustments: AnimatedSettings<AdjustmentSettings>;
  animatedDithering: AnimatedSettings<DitheringSettings>;
  animatedColorMode: AnimatedSettings<ColorModeSettings>;
  palette: Palette;
  onProgress?: (frame: number, total: number) => void;
}

export async function processVideoFrames(
  options: VideoProcessingOptions
): Promise<ImageData[]>
```

**Processing Strategy**:
1. Iterate through each frame
2. Calculate interpolated settings for current frame number
3. Apply processing pipeline: adjustments → color mode → dithering
4. Report progress to UI
5. Use Web Workers for parallel processing (optional optimization)

#### 5.2 Processing UI Updates
- Show progress bar during video processing
- Display: "Processing frame 45 of 315 (14%)"
- Allow cancellation
- Process on debounced settings changes (similar to image mode)

### Phase 6: Video Export System

#### 6.1 Video Encoding
**File**: `src/lib/dither/video-export.ts` (new file)

**Primary Format: MP4**

Approach A - **MediaRecorder API** (Recommended):
```typescript
export async function exportVideoMP4(
  frames: ImageData[],
  fps: number,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void>
```

- Draw frames to canvas sequentially
- Use MediaRecorder to capture canvas stream
- Record at specified FPS
- Export as MP4 (H.264 codec if supported)
- Fallback to WebM if MP4 not supported

Approach B - **FFmpeg.wasm** (Alternative):
- More control over codec/quality
- Larger bundle size (~25MB)
- Better browser compatibility
- Use if MediaRecorder insufficient

#### 6.2 GIF Conversion
**File**: `src/lib/dither/video-export.ts`

```typescript
export async function exportVideoAsGIF(
  frames: ImageData[],
  fps: number,
  filename: string,
  options: GIFExportOptions
): Promise<void>
```

Use library: `gif.js` or `gifenc`
- Convert processed frames to GIF
- Options: fps, quality, loop count
- Max frame limit (GIFs are large)
- Dithering already applied, so native GIF quantization not needed

#### 6.3 Export Section Updates
**File**: `src/components/dither/sections/export-section.tsx`

Add video-specific options:
- Format selector: MP4 (default) or GIF
- FPS override (match source or custom)
- Quality/bitrate settings for MP4
- GIF options: loop count, frame limit
- Estimated file size indicator

### Phase 7: Integration & Polish

#### 7.1 Mode Detection & Switching
- Automatically detect media type on upload
- Clear UI indication of current mode (Image Mode / Video Mode badge)
- Disable incompatible features per mode
- Warn before switching modes if unsaved work

#### 7.2 Presets for Video
- Presets should work for both images and videos
- Applying preset creates keyframes at frame 0
- Option to apply preset across all existing keyframes

#### 7.3 Project System Updates
**File**: `src/lib/dither/project.ts`

Extend project save/load:
- Save video metadata
- Save keyframes for all animated settings
- Save timeline state
- Don't save raw video (too large) - require re-upload
- Option: Save reference to original file path/name

#### 7.4 Keyboard Shortcuts
**File**: `src/lib/dither/keyboard-shortcuts.ts`

Add video-specific shortcuts:
- `Space`: Play/pause
- `Left/Right Arrow`: Previous/next frame
- `K`: Add keyframe at current position
- `Home/End`: Jump to start/end
- `,/.`: Previous/next keyframe

#### 7.5 Performance Optimizations
- Lazy frame processing (only process visible/needed frames)
- Frame caching strategy
- Web Workers for parallel frame processing
- Virtual scrolling for long videos
- Memory management (limit max frames in memory)

### Phase 8: UI/UX Considerations

#### 8.1 Layout Changes
- Timeline appears at bottom when in video mode
- Timeline height: ~120px
- Collapsible for more canvas space
- Timeline shows keyframe markers

#### 8.2 Settings Panels
- All existing adjustment sections remain unchanged
- Add keyframe indicator next to each section title when animated
- Visual feedback when on a keyframe (highlight settings panel)

#### 8.3 Loading States
- Video upload progress
- Frame extraction progress
- Processing progress with frame counter
- Export progress

#### 8.4 Error Handling
- Unsupported video format
- Video too long (frame limit: e.g., 600 frames = 20 seconds at 30fps)
- Out of memory during processing
- Export failures

## Technical Architecture Decisions

### 1. Frame Storage Strategy
**Decision**: Store all frames in memory as `ImageData[]`

**Pros**:
- Fast access for scrubbing
- Simple implementation
- No I/O during playback

**Cons**:
- Memory intensive for long videos
- Limit: ~10-20 seconds of video at 30fps

**Mitigation**:
- Enforce frame count limit (e.g., 600 frames max)
- Option to reduce FPS during extraction (extract at 15fps instead of 30fps)

### 2. Processing Strategy
**Decision**: Process all frames upfront (not real-time)

**Pros**:
- Smooth playback after processing
- Consistent with existing image processing flow
- Simpler implementation

**Cons**:
- Processing time before preview
- Need to reprocess on settings change

**Mitigation**:
- Show progress indicator
- Debounce processing (only reprocess after user stops adjusting)
- Optional: Process only visible frame range

### 3. Export Codec Choice
**Decision**: Primary MP4 (MediaRecorder), fallback WebM, optional GIF

**Pros**:
- MP4 widely supported
- No external dependencies
- Browser-native encoding

**Cons**:
- Limited codec control
- Quality/compression not perfect

**Alternative**: FFmpeg.wasm if needed (adds 25MB to bundle)

### 4. Keyframe Interpolation
**Decision**: Linear interpolation for numeric values, step for enums

**Pros**:
- Simple to implement
- Predictable behavior
- Sufficient for most use cases

**Cons**:
- No custom curves (can add later)

**Future Enhancement**: Bezier curve editor for advanced users

## Dependencies to Add

```json
{
  "dependencies": {
    // For GIF export
    "gifenc": "^1.0.3",

    // Optional: If MediaRecorder insufficient
    "@ffmpeg/ffmpeg": "^0.12.0",
    "@ffmpeg/util": "^0.12.0"
  }
}
```

## File Structure

New files to create:
```
src/
├── lib/dither/
│   ├── video-utils.ts          # Video loading & frame extraction
│   ├── video-processor.ts      # Frame processing pipeline
│   ├── video-export.ts         # MP4/GIF export
│   ├── video-playback.ts       # Playback state management
│   └── keyframes.ts            # Keyframe interpolation logic
├── components/dither/
│   ├── timeline.tsx            # Timeline UI component
│   └── sections/
│       └── keyframe-controls.tsx  # Keyframe management UI
```

Modified files:
```
src/
├── lib/dither/
│   ├── types.ts                # Add video types
│   └── project.ts              # Support video projects
├── components/dither/
│   ├── dither-editor.tsx       # Add video mode state
│   ├── canvas-preview.tsx      # Support frame display
│   └── sections/
│       ├── upload-section.tsx  # Accept video files
│       └── export-section.tsx  # Video export options
```

## Estimated Complexity

### By Phase:
1. **Phase 1** (Types): 1-2 hours - Straightforward
2. **Phase 2** (Upload/Extract): 3-4 hours - Moderate (canvas frame extraction)
3. **Phase 3** (Timeline/Preview): 6-8 hours - Complex UI component
4. **Phase 4** (Keyframes): 4-6 hours - Moderate logic complexity
5. **Phase 5** (Processing): 3-4 hours - Leverage existing pipeline
6. **Phase 6** (Export): 6-8 hours - Complex (video encoding)
7. **Phase 7** (Integration): 4-5 hours - Many small changes
8. **Phase 8** (Polish): 3-4 hours - UX refinements

**Total Estimate**: 30-41 hours of development

## Critical Path

Must complete in order:
1. Phase 1 → Phase 2 → Phase 3 (Can preview video frames)
2. Phase 5 (Can process frames)
3. Phase 4 (Can animate adjustments)
4. Phase 6 (Can export results)
5. Phase 7 & 8 (Polish)

## Testing Strategy

### Manual Testing Checklist:
- [ ] Upload various video formats (mp4, webm, mov)
- [ ] Verify frame extraction accuracy
- [ ] Test timeline scrubbing performance
- [ ] Test playback at different speeds
- [ ] Add/remove/edit keyframes
- [ ] Verify interpolation is smooth
- [ ] Process video with various settings
- [ ] Export MP4 and verify playback
- [ ] Export GIF and verify animation
- [ ] Test with long videos (approaching frame limit)
- [ ] Test memory usage
- [ ] Verify all keyboard shortcuts work

## Open Questions / Decisions Needed

1. **Frame Limit**: What's the maximum video length/frame count we should support?
   - Suggestion: 600 frames (~20 seconds at 30fps)

2. **FPS Handling**: Should we:
   - Match source video FPS?
   - Allow custom FPS selection?
   - Reduce FPS automatically for long videos?
   - Suggestion: Default to source FPS, allow override, max 30fps

3. **Export Quality**: What default bitrate/quality for MP4?
   - Suggestion: High quality default (aim for visual quality over file size)

4. **GIF Limitations**: GIFs can be very large. Should we:
   - Limit GIF export to first N frames?
   - Reduce resolution automatically?
   - Just warn user about file size?
   - Suggestion: Warn + offer resolution reduction

5. **Keyframe UX**: Should adjustments automatically create keyframes, or explicit only?
   - Suggestion: Explicit only (user must click "Add Keyframe")

6. **Processing Trigger**: When should we reprocess frames?
   - On every settings change (with debounce)?
   - Only on explicit "Apply" button?
   - Suggestion: Debounced automatic processing

## Summary

This plan provides a comprehensive approach to adding video support to the dither editor. The implementation leverages the existing processing pipeline and maintains consistency with the current architecture. The keyframe animation system allows for dynamic effects while remaining intuitive for users familiar with video editing tools.

Key design principles:
- **Reuse existing code**: Leverage current processing pipeline
- **Progressive enhancement**: Video mode is additive, doesn't break image mode
- **Performance-conscious**: Frame limits and optimization strategies
- **User-friendly**: Clear UI, keyboard shortcuts, progress indicators
- **Export flexibility**: Multiple formats (MP4, GIF) with quality options

The modular phase structure allows for incremental implementation and testing, with each phase building on the previous ones.

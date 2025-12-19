# Shadeworks

A collection of web-based creative tools built with Next.js. Features real-time collaboration with optional end-to-end encryption.

## Features

### Whiteboard

A collaborative drawing and design tool with real-time sync.

**Drawing Tools**
- Pen, Line, Arrow, Rectangle, Diamond, Ellipse
- Text with multiple font families and sizes
- Eraser and Laser pointer
- Hand tool for panning

**Styling**
- 16 preset colors + custom color picker
- Stroke width, style (solid/dashed/dotted), and line caps
- Fill color, opacity, and corner radius
- Connector styles (sharp/curved/elbow) with multiple arrow types

**Editing**
- Multi-select with alignment tools
- Copy, duplicate, delete
- Layer management (bring to front, send to back)
- Undo/Redo

**Collaboration**
- Real-time sync via [PartyKit](https://www.partykit.io/) + [Yjs](https://yjs.dev/)
- Optional E2E encryption (key shared via URL hash, never sent to server)
- Live cursors and user presence
- Follow/spectate other users

**File Operations**
- Save/load `.shadeworks` files
- Export as PNG, JPEG, or WebP

### Dither Editor (WIP)

Image and video dithering tool with multiple algorithms and palettes.

- Multiple dithering algorithms (Floyd-Steinberg, Atkinson, Bayer, etc.)
- 50+ built-in color palettes
- Palette extraction from images
- Image adjustments (brightness, contrast, saturation, blur, sharpen)
- Export to PNG, JPEG, WebP, SVG, PDF
- Video frame processing support

### Background Remover

Remove backgrounds from images using AI-powered detection.

### Image Editor (WIP)

Work in progress. Not ready for use.

## Running Locally

**Prerequisites**
- Node.js 18+
- npm

**Setup**

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_PARTYKIT_HOST

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Available Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

**Environment Variables**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PARTYKIT_HOST` | PartyKit server URL for real-time collaboration |

## Tech Stack

- [Next.js](https://nextjs.org/) 16 with App Router
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/)
- [Yjs](https://yjs.dev/) for CRDT-based collaboration
- [PartyKit](https://www.partykit.io/) for real-time sync

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

### Reporting Issues

When opening an issue, please include:

1. **Description** - Clear summary of the problem or suggestion
2. **Steps to Reproduce** - For bugs, list the exact steps to trigger the issue
3. **Expected Behavior** - What you expected to happen
4. **Actual Behavior** - What actually happened
5. **Environment** - Browser, OS, and any relevant details
6. **Screenshots** - If applicable

Use the appropriate issue template if available.

## License

[MIT](LICENSE)

---

## Why

I built these tools because I didn't want to pay premium prices for things I could build myself.

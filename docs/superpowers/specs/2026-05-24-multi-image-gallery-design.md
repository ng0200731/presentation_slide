---
name: multi-image-gallery
date: 2026-05-24
status: approved
---

# Multi-Image Gallery Element — Design Spec

## Summary

Replace the existing single-image `ImageElement` with a multi-image gallery element that supports drag-drop, clipboard paste, and file browse for adding images. Display images in a grid or linear layout with preset thumbnail sizes (Small/Medium/Large).

## Requirements

- Multiple images per element (gallery)
- Three input methods: drag-drop, Ctrl+V paste, file browse button
- Two layout modes: Grid (multi-column) and Linear (one image per line)
- Three thumbnail size presets: Small, Medium, Large
- Toggle buttons in toolbar to switch layout mode
- Server-side image upload and storage
- Backward compatible with existing single-image elements

## Data Model

**Element type:** `image` (reuses existing type)

**content** — JSON array of image objects:
```json
[
  { "url": "/uploads/abc123.jpg", "caption": "" },
  { "url": "/uploads/def456.png", "caption": "" }
]
```

**styles:**
```json
{
  "layout": "grid",
  "thumbSize": "medium",
  "gap": 8,
  "columns": 3
}
```

| Field | Type | Values | Default |
|-------|------|--------|---------|
| layout | string | `"grid"`, `"linear"` | `"grid"` |
| thumbSize | string | `"small"`, `"medium"`, `"large"` | `"medium"` |
| gap | number | px | `8` |
| columns | number | grid columns | `3` |

**Backward compatibility:** If content is a string (old format), auto-wrap to `[{url: content, caption: ""}]`.

## Thumbnail Size Presets

| Size | Grid Thumbnail | Linear Height |
|------|---------------|---------------|
| Small | 80px | 60px |
| Medium | 140px | 100px |
| Large | 220px | 160px |

## Input Methods

### Drag & Drop
- Drop zone on empty gallery with visual prompt
- Accepts image files (image/*)
- Shows hover highlight border on dragenter
- Works on existing gallery too (append images)

### Ctrl+V Paste
- Listen for `paste` event when the image element is active
- Extract images from `clipboardData.items` using Clipboard API
- Handles screenshot pastes and copied image files
- Upload each pasted image via the upload endpoint

### Browse Button
- Hidden `<input type="file" accept="image/*" multiple />` triggered by "Add Image" button in ImageToolbar
- Multiple file selection enabled
- Uploads all selected files

## Upload Endpoint

**POST /api/upload** — multipart/form-data

- Field name: `images`
- Accepts single or multiple files
- Validates: image/* mime type, max 10MB per file
- Saves to `server/uploads/` with unique filename (timestamp + random suffix)
- Returns: `{ urls: ["/uploads/abc123.jpg", ...] }`

**Static serving:** Express serves `/uploads/*` mapped to `server/uploads/`

## Component Structure

```
components/
  Elements/
    ImageElement.tsx      ← rewritten: multi-image gallery
  Toolbar/
    ImageToolbar.tsx      ← NEW: layout toggle + size presets + add button
```

### ImageElement.tsx Responsibilities
- Render grid or linear layout based on `styles.layout`
- Empty state: centered drop zone with "Drop images, paste, or browse" prompt
- Image thumbnails with hover overlay showing delete button
- Drop zone highlight overlay on dragenter (even with existing images)
- Paste listener when element is the active element
- Handle backward-compatible content (string → array)
- Grid: CSS Grid with `grid-template-columns: repeat(columns, 1fr)`, thumbnails with `object-fit: cover`
- Linear: full-width images with constrained height

### ImageToolbar.tsx Responsibilities
- Grid/Linear toggle buttons (icon buttons with grid/list icons)
- Small/Medium/Large size selector (button group)
- "Add Image" button that triggers hidden file input
- Rendered inside ImageElement when active (same pattern as TitleToolbar)

## Interaction Details

### Adding Images
1. User adds image element via existing "Add Image" button in app
2. Empty gallery shows drop zone
3. User drops/pastes/browses images
4. Each image is uploaded to `/api/upload`
5. Returned URLs are appended to element content array
6. Element updates via `updateElement(elementId, { content: [...existing, ...newImages] })`

### Removing Images
- Hover over thumbnail shows delete (x) button
- Click removes image from content array and updates element

### Switching Layout
- Click grid/list toggle in ImageToolbar
- Updates `styles.layout` on the element

### Changing Thumbnail Size
- Click Small/Medium/Large in ImageToolbar
- Updates `styles.thumbSize` on the element

## Store Changes (presentationStore.js)

No new store actions needed. Existing `addElement`, `updateElement`, `deleteElement` handle the gallery. The `content` field just holds an array instead of a string.

Minor change: `addElement('image')` should default content to `[]` (empty array) instead of `''`.

## Canvas Changes (Canvas.tsx)

No changes needed. `renderElement` already handles `case 'image'`. ImageToolbar is rendered inside ImageElement when the element is active, following the same pattern as TitleToolbar in TitleElement/TextElement.

## Files to Change

1. **server/index.js** — Add `/api/upload` endpoint + static serving for `/uploads`
2. **server/uploads/** — New directory for uploaded images
3. **client/src/components/Elements/ImageElement.tsx** — Rewrite as multi-image gallery with ImageToolbar
4. **client/src/components/Toolbar/ImageToolbar.tsx** — New toolbar component
5. **client/src/stores/presentationStore.js** — Change default image content from `''` to `[]`
import { useState, useRef, useEffect, useCallback } from 'react'
import { usePresentationStore } from '../../stores/presentationStore'
import { ImageToolbar } from '../Toolbar/ImageToolbar'

const API = 'http://localhost:3001'
const DEFAULT_HEIGHT = 200

function normalizeContent(content) {
  if (!content) return []
  if (typeof content === 'string') return [{ url: content, caption: '' }]
  if (Array.isArray(content)) return content
  return []
}

function imgUrl(url) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/')) return `${API}${url}`
  return url
}

export function ImageElement({ element }) {
  const { updateElement, activeElementId, setActiveElement } = usePresentationStore()
  const isActive = activeElementId === element.id
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const dragCountRef = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const styles = element.styles || {}
  const layout = styles.layout || 'grid'
  const gap = styles.gap ?? 8
  const columns = styles.columns ?? 3
  const height = styles.height || DEFAULT_HEIGHT
  const images = normalizeContent(element.content)

  const uploadFiles = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    setUploading(true)
    const formData = new FormData()
    imageFiles.forEach(f => formData.append('images', f))

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        body: formData,
      })
      const { urls } = await res.json()
      const newImages = urls.map(url => ({ url, caption: '' }))
      const current = normalizeContent(element.content)
      updateElement(element.id, { content: [...current, ...newImages] })
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }, [element.id, element.content, updateElement])

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index)
    updateElement(element.id, { content: updated })
  }

  const closePopup = () => {
    setHoveredIndex(null)
    setActiveElement(null)
  }

  useEffect(() => {
    if (!isActive) return
    const handler = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files = []
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
      if (files.length > 0) {
        e.preventDefault()
        uploadFiles(files)
      }
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [isActive, uploadFiles])

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current++
    if (dragCountRef.current === 1) setDragging(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current--
    if (dragCountRef.current <= 0) {
      dragCountRef.current = 0
      setDragging(false)
    }
  }
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current = 0
    setDragging(false)
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files)
  }

  if (images.length === 0) {
    return (
      <>
        {isActive && <ImageToolbar element={element} containerRef={containerRef} />}
        <div
          ref={containerRef}
          className={`border-2 border-dashed rounded transition-colors ${
            dragging ? 'border-black bg-neutral-50' : 'border-neutral-300'
          } ${uploading ? 'opacity-60' : ''}`}
          style={{ height }}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-sm">Drop images, paste (Ctrl+V), or browse</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-3 py-1 text-xs bg-black text-white hover:bg-neutral-700 rounded"
            >
              Browse Files
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { uploadFiles(e.target.files); e.target.value = '' }}
          />
        </div>
      </>
    )
  }

  return (
    <>
      {isActive && hoveredIndex === null && <ImageToolbar element={element} containerRef={containerRef} />}
      <div
        ref={containerRef}
        className={`relative bg-white ${uploading ? 'opacity-60' : ''}`}
        style={{ height }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dragging && (
          <div className="absolute inset-0 bg-black/5 border-2 border-dashed border-black rounded z-10 flex items-center justify-center">
            <span className="text-sm font-medium">Drop to add</span>
          </div>
        )}

        <div className="flex h-full" style={{ gap: `${gap}px` }}>
            {images.map((img, i) => (
              <div
                key={i}
                className="relative group rounded overflow-hidden bg-neutral-100 shrink-0 cursor-pointer"
                style={{ width: height, height }}
                onClick={(e) => { e.stopPropagation(); setHoveredIndex(i) }}
              >
                <img
                  src={imgUrl(img.url)}
                  alt={img.caption || `Image ${i + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                {isActive && (
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); handleRemove(i) }}
                    className="absolute top-1 right-1 w-5 h-5 bg-black text-white text-[11px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-30 cursor-pointer"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        {/* Single popup for hovered image */}
        {hoveredIndex !== null && images[hoveredIndex] && images.length > 1 && (
          <div className="fixed z-[9999] inset-0 flex items-center justify-center bg-black/30 pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); closePopup() }}
          >
            <div className="relative flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {hoveredIndex > 0 && (
                <button
                  onClick={() => setHoveredIndex(hoveredIndex - 1)}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl shrink-0"
                >
                  ‹
                </button>
              )}
              <div className="bg-white border border-neutral-300 shadow-2xl rounded p-1 max-w-[90vw] max-h-[90vh]">
                <img
                  src={imgUrl(images[hoveredIndex].url)}
                  alt={images[hoveredIndex].caption || `Image ${hoveredIndex + 1}`}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </div>
              {hoveredIndex < images.length - 1 && (
                <button
                  onClick={() => setHoveredIndex(hoveredIndex + 1)}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl shrink-0"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        )}
        {hoveredIndex !== null && images[hoveredIndex] && images.length <= 1 && (
          <div className="fixed z-[9999] inset-0 flex items-center justify-center bg-black/30 pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); closePopup() }}
          >
            <div className="bg-white border border-neutral-300 shadow-2xl rounded p-1 max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={imgUrl(images[hoveredIndex].url)}
                alt={images[hoveredIndex].caption || `Image ${hoveredIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

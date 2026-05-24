import { usePresentationStore } from '../../stores/presentationStore'
import { SortableElement } from './SortableElement'
import { TitleElement } from '../Elements/TitleElement'
import { TextElement } from '../Elements/TextElement'
import { ImageElement } from '../Elements/ImageElement'
import { useEffect, useState } from 'react'

function renderElement(element) {
  switch (element.type) {
    case 'title': return <TitleElement element={element} />
    case 'text': return <TextElement element={element} />
    case 'image': return <ImageElement element={element} />
    default: return null
  }
}

export function Canvas() {
  const { elements, background, canvasPadding, canvasMargin, setActiveElement } = usePresentationStore()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const isFullscreen = document.fullscreenElement !== null
      if (isFullscreen) {
        const viewWidth = window.innerWidth
        const viewHeight = window.innerHeight
        const canvasWidth = 960
        const sx = viewWidth / canvasWidth
        setScale(Math.min(sx, 2))
      } else {
        setScale(1)
      }
    }
    updateScale()
    document.addEventListener('fullscreenchange', updateScale)
    window.addEventListener('resize', updateScale)
    return () => {
      document.removeEventListener('fullscreenchange', updateScale)
      window.removeEventListener('resize', updateScale)
    }
  }, [])

  const bgStyle = background.type === 'solid'
    ? { backgroundColor: background.color }
    : background.type === 'linear'
      ? { background: `linear-gradient(${background.angle || 0}deg, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')})` }
      : background.type === 'radial'
        ? { background: `radial-gradient(circle, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')})` }
        : {}

  const isFullscreen = typeof document !== 'undefined' && document.fullscreenElement !== null

  return (
    <div
      className={
        isFullscreen
          ? 'bg-black flex items-start justify-center overflow-auto min-h-screen'
          : ''
      }
    >
      <div
        className="bg-white border border-neutral-200 min-h-[800px] w-canvas"
        data-canvas
        style={{
          ...bgStyle,
          padding: `${canvasPadding?.top || 32}px ${canvasPadding?.right || 32}px ${canvasPadding?.bottom || 32}px ${canvasPadding?.left || 32}px`,
          margin: `${canvasMargin?.top || 0}px ${canvasMargin?.right || 0}px ${canvasMargin?.bottom || 0}px ${canvasMargin?.left || 0}px`,
          ...(isFullscreen ? {
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            border: 'none',
          } : {}),
        }}
        onClick={() => setActiveElement(null)}
      >
        {elements.length === 0 ? (
          <div className="text-center text-neutral-400 text-sm py-20">
            Click "Add Title" or "Add Text" to start your presentation
          </div>
        ) : (
          elements.map((element) => (
            <SortableElement key={element.id} element={element}>
              {renderElement(element)}
            </SortableElement>
          ))
        )}
      </div>
    </div>
  )
}
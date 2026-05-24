import { usePresentationStore } from '../../stores/presentationStore'
import { SortableElement } from './SortableElement'
import { TitleElement } from '../Elements/TitleElement'
import { TextElement } from '../Elements/TextElement'
import { ImageElement } from '../Elements/ImageElement'

function renderElement(element) {
  switch (element.type) {
    case 'title': return <TitleElement element={element} />
    case 'text': return <TextElement element={element} />
    case 'image': return <ImageElement element={element} />
    default: return null
  }
}

export function Canvas({ isFullscreen, onExitFullscreen }) {
  const { elements, background, canvasPadding, canvasMargin, setActiveElement } = usePresentationStore()

  const bgStyle = background.type === 'solid'
    ? { backgroundColor: background.color }
    : background.type === 'linear'
      ? { background: `linear-gradient(${background.angle || 0}deg, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')})` }
      : background.type === 'radial'
        ? { background: `radial-gradient(circle, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')})` }
        : {}

  const canvasStyle = {
    ...bgStyle,
    padding: `${canvasPadding?.top || 32}px ${canvasPadding?.right || 32}px ${canvasPadding?.bottom || 32}px ${canvasPadding?.left || 32}px`,
    margin: `${canvasMargin?.top || 0}px ${canvasMargin?.right || 0}px ${canvasMargin?.bottom || 0}px ${canvasMargin?.left || 0}px`,
    width: '960px',
    minHeight: isFullscreen ? '100vh' : undefined,
    border: isFullscreen ? 'none' : undefined,
  }

  const content = (
    <div
      data-canvas
      className="bg-white border border-neutral-200 w-canvas"
      style={canvasStyle}
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
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto flex justify-center fullscreen-canvas" style={bgStyle}>
        <button
          onClick={onExitFullscreen}
          className="fixed top-4 right-4 z-[10000] bg-white text-black px-3 py-1.5 text-sm border border-neutral-300 hover:bg-neutral-100"
        >
          Esc
        </button>
        {content}
      </div>
    )
  }

  return content
}

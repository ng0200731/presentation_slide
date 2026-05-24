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

export function Canvas() {
  const { elements, background, reorderElements, setActiveElement } = usePresentationStore()

  const bgStyle = background.type === 'solid'
    ? { backgroundColor: background.color }
    : background.type === 'linear'
      ? { background: `linear-gradient(${background.angle || 0}deg, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')})` }
      : background.type === 'radial'
        ? { background: `radial-gradient(circle, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')})` }
        : {}

  return (
    <div
      className="w-canvas bg-white border border-neutral-200 min-h-[800px] p-8"
      data-canvas
      style={bgStyle}
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
}
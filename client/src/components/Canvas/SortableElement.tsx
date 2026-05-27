import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePresentationStore } from '../../stores/presentationStore'

export function SortableElement({ element, children, isFullscreen }) {
  const { activeElementId, setActiveElement, deleteElement, customStyles } = usePresentationStore()
  const isActive = !isFullscreen && activeElementId === element.id

  const appliedStyle = element.style_id ? customStyles.find(s => s.id === element.style_id) : null

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const s = element.styles || {}
  const margin = `${s.marginTop || 0}px ${s.marginRight || 0}px ${s.marginBottom || 0}px ${s.marginLeft || 0}px`
  const padding = `${s.paddingTop || 0}px ${s.paddingRight || 0}px ${s.paddingBottom || 0}px ${s.paddingLeft || 0}px`

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, margin, padding }}
      className={`relative mb-2 ${isFullscreen ? '' : 'group'} ${
        isActive ? 'ring-2 ring-black' : isFullscreen ? '' : 'hover:ring-1 hover:ring-neutral-300'
      }`}
      onClick={(e) => {
        if (isFullscreen) return
        e.stopPropagation()
        setActiveElement(element.id)
      }}
    >
      {/* Drag handle */}
      {!isFullscreen && (
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-0 h-full w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-black transition-opacity"
        title="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5"/>
          <circle cx="11" cy="3" r="1.5"/>
          <circle cx="5" cy="8" r="1.5"/>
          <circle cx="11" cy="8" r="1.5"/>
          <circle cx="5" cy="13" r="1.5"/>
          <circle cx="11" cy="13" r="1.5"/>
        </svg>
      </div>
      )}

      {/* Element type label + style name - always show when active */}
      {!isFullscreen && (
      <div className={`absolute -top-5 left-0 text-[10px] text-neutral-400 flex items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <span>{element.type}</span>
        {appliedStyle && <span className="bg-neutral-200 px-1 rounded">{appliedStyle.name}</span>}
      </div>
      )}

      {/* Active controls */}
      {isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('Delete this element?')) deleteElement(element.id)
          }}
          className="absolute right-0 top-0 translate-x-full text-xs w-6 h-full bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center"
          title="Delete"
        >
          ×
        </button>
      )}

      {children}
    </div>
  )
}
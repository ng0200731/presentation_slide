import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePresentationStore } from '../../stores/presentationStore'

export function SortableElement({ element, children }) {
  const { activeElementId, setActiveElement, deleteElement, customStyles } = usePresentationStore()
  const isActive = activeElementId === element.id

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

  const margin = element.styles?.margin || '0px'
  const padding = element.styles?.padding || '0px'

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, margin, padding }}
      className={`relative group mb-2 ${
        isActive ? 'ring-2 ring-black' : 'hover:ring-1 hover:ring-neutral-300'
      }`}
      onClick={(e) => {
        e.stopPropagation()
        setActiveElement(element.id)
      }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-neutral-400 hover:text-black transition-opacity"
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

      {/* Element type label + style name - always show when active */}
      <div className={`absolute -top-5 left-0 text-[10px] text-neutral-400 flex items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <span>{element.type}</span>
        {appliedStyle && <span className="bg-neutral-200 px-1 rounded">{appliedStyle.name}</span>}
      </div>

      {/* Active controls */}
      {isActive && (
        <div className="absolute -top-6 right-0 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteElement(element.id)
            }}
            className="text-xs px-1.5 py-0.5 bg-black text-white hover:bg-neutral-700 transition-colors"
            title="Delete"
          >
            x
          </button>
        </div>
      )}

      {children}
    </div>
  )
}
import { useEffect } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { usePresentationStore } from './stores/presentationStore'
import { Canvas } from './components/Canvas/Canvas'
import { Sidebar } from './components/Sidebar/Sidebar'

function App() {
  const { isLoading, error, load, elements, reorderElements } = usePresentationStore()

  useEffect(() => {
    load()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <span className="text-sm text-neutral-400">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center gap-4">
        <span className="text-sm text-red-600">{error}</span>
        <button
          onClick={() => load()}
          className="px-4 py-2 bg-black text-white text-sm hover:bg-neutral-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event.active
    if (over && active.id !== over.id) {
      const elementIds = elements.map(el => el.id)
      const oldIndex = elementIds.indexOf(active.id as string)
      const newIndex = elementIds.indexOf(over.id as string)

      const reordered = [...elementIds]
      reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, active.id as string)

      reorderElements(reordered)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header */}
      <header className="h-12 bg-white border-b border-black flex items-center px-4 shrink-0">
        <h1 className="text-sm font-medium tracking-tight">PPT Style</h1>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Canvas area */}
        <main className="flex-1 overflow-auto flex justify-center py-8 bg-neutral-200">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
              <Canvas />
            </SortableContext>
          </DndContext>
        </main>
      </div>
    </div>
  )
}

export default App
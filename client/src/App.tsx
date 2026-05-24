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
        <button onClick={() => load()} className="px-4 py-2 bg-black text-white text-sm hover:bg-neutral-700">
          Retry
        </button>
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
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

  const enterFullscreen = () => {
    const el = document.querySelector('[data-canvas]') as HTMLElement
    if (el) el.requestFullscreen()
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <header className="h-12 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0">
        <h1 className="text-sm font-medium tracking-tight">PPT Style</h1>
        <button
          onClick={enterFullscreen}
          className="w-8 h-8 border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 flex items-center justify-center transition-colors"
          title="Fullscreen presentation (Esc to exit)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" />
          </svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto flex justify-center py-8 bg-neutral-200">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={elements.map((el: any) => el.id)} strategy={verticalListSortingStrategy}>
              <Canvas />
            </SortableContext>
          </DndContext>
        </main>
      </div>
    </div>
  )
}

export default App
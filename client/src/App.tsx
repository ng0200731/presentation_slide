import { useEffect, useState } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { usePresentationStore } from './stores/presentationStore'
import { Canvas } from './components/Canvas/Canvas'
import { Sidebar } from './components/Sidebar/Sidebar'

function App() {
  const { isLoading, error, load, elements, reorderElements, background } = usePresentationStore()
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  const bgStyle = background.type === 'solid'
    ? { backgroundColor: background.color }
    : background.type === 'linear'
      ? { background: `linear-gradient(${background.angle || 0}deg, ${(background.stops || []).map((s: any) => `${s.color} ${s.position}%`).join(', ')})` }
      : background.type === 'radial'
        ? { background: `radial-gradient(circle, ${(background.stops || []).map((s: any) => `${s.color} ${s.position}%`).join(', ')})` }
        : {}

  // Fullscreen presentation mode
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto" style={bgStyle} onClick={() => setFullscreen(false)}>
        <button
          onClick={() => setFullscreen(false)}
          className="fixed top-4 right-4 z-50 w-8 h-8 bg-black/20 hover:bg-black/40 flex items-center justify-center text-white text-sm transition-colors"
          title="Exit (Esc)"
        >
          ✕
        </button>
        <div className="max-w-4xl mx-auto p-8 md:p-16">
          {elements.map((element: any) => {
            const text = element.content?.[0]?.children?.[0]?.text || ''
            const src = element.content || ''
            const styles = element.styles || {}
            const style: any = {
              fontFamily: styles.fontFamily || 'inherit',
              fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
              color: styles.color || '#000000',
              textAlign: styles.textAlign || 'left',
              lineHeight: styles.lineHeight || undefined,
            }

            if (element.type === 'title') {
              return <h1 key={element.id} className="text-4xl md:text-5xl font-bold mb-6" style={style}>{text}</h1>
            }
            if (element.type === 'text') {
              return <p key={element.id} className="text-lg md:text-xl mb-6" style={style}>{text}</p>
            }
            if (element.type === 'image' && src) {
              return (
                <div key={element.id} className="mb-6">
                  <img src={src} alt="" style={{ width: styles.width || '100%', height: styles.height || 'auto' }} />
                  {styles.caption && <p className="text-xs text-neutral-500 mt-1 text-center">{styles.caption}</p>}
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    )
  }

  // Editor mode
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <header className="h-12 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0">
        <h1 className="text-sm font-medium tracking-tight">PPT Style</h1>
        <button
          onClick={() => setFullscreen(true)}
          className="w-8 h-8 border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 flex items-center justify-center transition-colors"
          title="Fullscreen presentation (click to exit)"
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
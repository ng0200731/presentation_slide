import { useState } from 'react'
import { usePresentationStore } from '../../stores/presentationStore'
import { exportJSON, exportHTML, exportPNG, exportPDF } from '../../utils/exportUtils'

function Section({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs font-medium uppercase tracking-wide"
      >
        {title}
        <span className="text-[10px]">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}

export function Sidebar() {
  const { addElement, clearAllElements } = usePresentationStore()

  return (
    <aside className="w-56 bg-white border-r border-neutral-200 p-4 flex flex-col gap-4 shrink-0">
      <Section title="Background" defaultOpen={true}>
        <BackgroundControls />
      </Section>

      <Section title="Add Element" defaultOpen={true}>
        <div className="space-y-1">
          <button
            onClick={() => addElement('title')}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 border border-transparent hover:border-black transition-colors"
          >
            + Title
          </button>
          <button
            onClick={() => addElement('text')}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 border border-transparent hover:border-black transition-colors"
          >
            + Text Block
          </button>
          <button
            onClick={() => addElement('image')}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 border border-transparent hover:border-black transition-colors"
          >
            + Image
          </button>
        </div>
      </Section>

      <Section title="Actions" defaultOpen={false}>
        <button
          onClick={() => {
            if (confirm('Delete all elements?')) {
              clearAllElements()
            }
          }}
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 border border-neutral-300 hover:border-red-400 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </Section>

      <Section title="CSS" defaultOpen={false}>
        <CssSection />
      </Section>

      <Section title="Export" defaultOpen={false}>
        <div className="space-y-1">
          <button onClick={exportJSON} className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 border border-neutral-300 hover:border-neutral-400 transition-colors">
            JSON
          </button>
          <button onClick={exportHTML} className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 border border-neutral-300 hover:border-neutral-400 transition-colors">
            HTML
          </button>
          <button onClick={exportPNG} className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 border border-neutral-300 hover:border-neutral-400 transition-colors">
            PNG Image
          </button>
          <button onClick={exportPDF} className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-100 border border-neutral-300 hover:border-neutral-400 transition-colors">
            PDF
          </button>
        </div>
      </Section>
    </aside>
  )
}

function BackgroundControls() {
  const { background, setBackground, canvasPadding, setCanvasPadding, canvasMargin, setCanvasMargin } = usePresentationStore()

  return (
    <div className="space-y-3 pl-3">
      {/* Padding Controls */}
      <div>
        <label className="text-xs text-neutral-500 mb-1 block">Padding</label>
        <div className="grid grid-cols-4 gap-1 text-[10px] text-neutral-400 text-center mb-0.5">
          <span>Top</span><span>Right</span><span>Bottom</span><span>Left</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <input
            type="number"
            value={canvasPadding?.top || 0}
            onChange={(e) => setCanvasPadding({ ...canvasPadding, top: parseInt(e.target.value) || 0 })}
            className="w-full px-1 py-1 text-xs border border-neutral-300 text-center"
          />
          <input
            type="number"
            value={canvasPadding?.right || 0}
            onChange={(e) => setCanvasPadding({ ...canvasPadding, right: parseInt(e.target.value) || 0 })}
            className="w-full px-1 py-1 text-xs border border-neutral-300 text-center"
          />
          <input
            type="number"
            value={canvasPadding?.bottom || 0}
            onChange={(e) => setCanvasPadding({ ...canvasPadding, bottom: parseInt(e.target.value) || 0 })}
            className="w-full px-1 py-1 text-xs border border-neutral-300 text-center"
          />
          <input
            type="number"
            value={canvasPadding?.left || 0}
            onChange={(e) => setCanvasPadding({ ...canvasPadding, left: parseInt(e.target.value) || 0 })}
            className="w-full px-1 py-1 text-xs border border-neutral-300 text-center"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-neutral-500 mb-1 block">Margin</label>
        <div className="grid grid-cols-4 gap-1 text-[10px] text-neutral-400 text-center mb-0.5">
          <span>Top</span><span>Right</span><span>Bottom</span><span>Left</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <input
            type="number"
            value={canvasMargin?.top || 0}
            onChange={(e) => setCanvasMargin({ ...canvasMargin, top: parseInt(e.target.value) || 0 })}
            className="w-full px-1 py-1 text-xs border border-neutral-300 text-center"
          />
          <input
            type="number"
            value={canvasMargin?.right || 0}
            onChange={(e) => setCanvasMargin({ ...canvasMargin, right: parseInt(e.target.value) || 0 })}
            className="w-full px-1 py-1 text-xs border border-neutral-300 text-center"
          />
          <input
            type="number"
            value={canvasMargin?.bottom || 0}
            onChange={(e) => setCanvasMargin({ ...canvasMargin, bottom: parseInt(e.target.value) || 0 })}
            className="w-full px-1 py-1 text-xs border border-neutral-300 text-center"
          />
          <input
            type="number"
            value={canvasMargin?.left || 0}
            onChange={(e) => setCanvasMargin({ ...canvasMargin, left: parseInt(e.target.value) || 0 })}
            className="w-full px-1 py-1 text-xs border border-neutral-300 text-center"
          />
        </div>
      </div>

      {/* Background Type */}
      <div className="flex gap-1">
        <button
          onClick={() => setBackground({ type: 'solid', color: '#ffffff' })}
          className={`px-2 py-1 text-xs border ${background.type === 'solid' ? 'border-black bg-neutral-100' : 'border-neutral-300'}`}
        >
          Solid
        </button>
        <button
          onClick={() => setBackground({ type: 'linear', angle: 90, stops: [{ color: '#ffffff', position: 0 }, { color: '#000000', position: 100 }] })}
          className={`px-2 py-1 text-xs border ${background.type === 'linear' ? 'border-black bg-neutral-100' : 'border-neutral-300'}`}
        >
          Linear
        </button>
        <button
          onClick={() => setBackground({ type: 'radial', stops: [{ color: '#ffffff', position: 0 }, { color: '#000000', position: 100 }] })}
          className={`px-2 py-1 text-xs border ${background.type === 'radial' ? 'border-black bg-neutral-100' : 'border-neutral-300'}`}
        >
          Radial
        </button>
      </div>

      {background.type === 'solid' && (
        <input
          type="color"
          value={background.color}
          onChange={(e) => setBackground({ ...background, color: e.target.value })}
          className="w-full h-8 cursor-pointer border border-neutral-300"
        />
      )}

      {background.type === 'linear' && (
        <div className="space-y-1">
          <label className="text-xs text-neutral-500">Angle: {background.angle || 0}&deg;</label>
          <input
            type="range"
            min="0"
            max="360"
            value={background.angle || 0}
            onChange={(e) => setBackground({ ...background, angle: parseInt(e.target.value) })}
            className="w-full"
          />
          {(background.stops || []).map((stop, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => {
                  const stops = [...background.stops]
                  stops[i] = { ...stops[i], color: e.target.value }
                  setBackground({ ...background, stops })
                }}
                className="w-6 h-6 cursor-pointer border border-neutral-300"
              />
              <span className="text-xs text-neutral-500">{stop.position}%</span>
            </div>
          ))}
        </div>
      )}

      {background.type === 'radial' && (
        <div className="space-y-1">
          {(background.stops || []).map((stop, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => {
                  const stops = [...background.stops]
                  stops[i] = { ...stops[i], color: e.target.value }
                  setBackground({ ...background, stops })
                }}
                className="w-6 h-6 cursor-pointer border border-neutral-300"
              />
              <span className="text-xs text-neutral-500">{stop.position}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CssSection() {
  const { customStyles, activeElementId, elements, deleteCustomStyle, renameCustomStyle, applyCustomStyle } = usePresentationStore()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const activeElement = elements.find(e => e.id === activeElementId)

  const groups = [
    { type: 'title', label: 'Title' },
    { type: 'text', label: 'Text' },
  ]

  const handleRename = (id) => {
    if (editName.trim()) renameCustomStyle(id, editName.trim())
    setEditingId(null)
  }

  const handleClick = (style) => {
    if (!activeElement || activeElement.type !== style.type) return
    applyCustomStyle(style.id, activeElement.id)
  }

  return (
    <div className="space-y-2 pl-2">
      {groups.map(({ type, label }) => {
        const items = customStyles.filter(s => s.type === type)
        return (
          <div key={type}>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wide">{label}</div>
            {items.length === 0 ? (
              <div className="text-[10px] text-neutral-300 pl-2">No saved styles</div>
            ) : (
              <div className="space-y-0.5">
                {items.map(style => (
                  <div key={style.id} className="flex items-center gap-1 group pl-1">
                    {editingId === style.id ? (
                      <input
                        type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(style.id); if (e.key === 'Escape') setEditingId(null) }}
                        onBlur={() => handleRename(style.id)}
                        className="flex-1 min-w-0 px-1 py-0 text-xs border border-neutral-300" autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => handleClick(style)}
                        className={`flex-1 min-w-0 text-left text-xs px-1 py-0 truncate hover:bg-neutral-100 transition-colors ${activeElement?.type === style.type ? 'text-neutral-700' : 'text-neutral-400'}`}
                        title={`Apply "${style.name}"`}
                      >
                        {style.name}
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingId(style.id); setEditName(style.name) }}
                      className="text-[10px] text-neutral-300 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Rename"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${style.name}"?`)) deleteCustomStyle(style.id) }}
                      className="text-[10px] text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
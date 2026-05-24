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

      <Section title="Background" defaultOpen={false}>
        <BackgroundControls />
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
  const { background, setBackground } = usePresentationStore()

  return (
    <div className="space-y-2">
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
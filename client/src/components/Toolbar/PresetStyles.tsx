import { useState, useRef, useEffect } from 'react'
import { usePresentationStore } from '../../stores/presentationStore'
import { PRESET_STYLES } from '../../utils/slateUtils'

export function PresetStyles({ element }) {
  const { updateElement } = usePresentationStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const applyStyle = (preset) => {
    const currentStyles = element.styles || {}
    updateElement(element.id, {
      styles: { ...currentStyles, ...preset.styles },
    })
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          setOpen(!open)
        }}
        className="px-1.5 py-0.5 text-xs hover:bg-neutral-100 transition-colors"
      >
        Style ▾
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-300 shadow-lg rounded py-1 w-40 z-50 max-h-64 overflow-auto">
          <StyleGroup label="Headings" presets={PRESET_STYLES.headings} onSelect={applyStyle} />
          <StyleGroup label="Blocks" presets={PRESET_STYLES.blocks} onSelect={applyStyle} />
          <StyleGroup label="Special" presets={PRESET_STYLES.special} onSelect={applyStyle} />
        </div>
      )}
    </div>
  )
}

function StyleGroup({ label, presets, onSelect }) {
  return (
    <div>
      <div className="px-2 py-1 text-[10px] text-neutral-400 uppercase tracking-wide">{label}</div>
      {presets.map((preset) => (
        <button
          key={preset.name}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(preset)
          }}
          className="w-full text-left px-3 py-1 text-xs hover:bg-neutral-100 transition-colors"
        >
          {preset.name}
        </button>
      ))}
    </div>
  )
}

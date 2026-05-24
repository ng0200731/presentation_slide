import { useState, useRef, useEffect } from 'react'
import { usePresentationStore } from '../../stores/presentationStore'

const FONT_FAMILIES = [
  { value: 'inherit', label: 'Default' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times' },
  { value: 'Courier New, monospace', label: 'Courier' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
]

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]

function SpacingGroup({ label, topKey, bottomKey, leftKey, rightKey, element, onToolbarFocus, onToolbarBlur }) {
  const { updateElement } = usePresentationStore()
  const styles = element.styles || {}
  const [linkTB, setLinkTB] = useState(false)
  const [linkLR, setLinkLR] = useState(false)

  const handleChange = (key, value) => {
    let newStyles = { ...styles }
    if (key === topKey || key === bottomKey) {
      if (linkTB) { newStyles[topKey] = value; newStyles[bottomKey] = value }
      else newStyles[key] = value
    } else {
      if (linkLR) { newStyles[leftKey] = value; newStyles[rightKey] = value }
      else newStyles[key] = value
    }
    updateElement(element.id, { styles: newStyles })
  }

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <span className="text-[10px] text-neutral-500 shrink-0 font-medium">{label}</span>
      <input type="number" value={styles[topKey] ?? 0} onChange={(e) => handleChange(topKey, parseInt(e.target.value) || 0)} onFocus={onToolbarFocus} onBlur={onToolbarBlur} className="flex-1 min-w-0 px-1 py-0.5 text-xs border border-neutral-300 text-center" title={`${label} Top`} />
      <input type="number" value={styles[bottomKey] ?? 0} onChange={(e) => handleChange(bottomKey, parseInt(e.target.value) || 0)} onFocus={onToolbarFocus} onBlur={onToolbarBlur} className="flex-1 min-w-0 px-1 py-0.5 text-xs border border-neutral-300 text-center" title={`${label} Bottom`} />
      <button onClick={() => setLinkTB(!linkTB)} className={`w-4 h-4 flex items-center justify-center text-[8px] border rounded shrink-0 ${linkTB ? 'bg-black text-white border-black' : 'border-neutral-300 text-neutral-400'}`} title="Link Top/Bottom">TB</button>
      <input type="number" value={styles[rightKey] ?? 0} onChange={(e) => handleChange(rightKey, parseInt(e.target.value) || 0)} onFocus={onToolbarFocus} onBlur={onToolbarBlur} className="flex-1 min-w-0 px-1 py-0.5 text-xs border border-neutral-300 text-center" title={`${label} Right`} />
      <input type="number" value={styles[leftKey] ?? 0} onChange={(e) => handleChange(leftKey, parseInt(e.target.value) || 0)} onFocus={onToolbarFocus} onBlur={onToolbarBlur} className="flex-1 min-w-0 px-1 py-0.5 text-xs border border-neutral-300 text-center" title={`${label} Left`} />
      <button onClick={() => setLinkLR(!linkLR)} className={`w-4 h-4 flex items-center justify-center text-[8px] border rounded shrink-0 ${linkLR ? 'bg-black text-white border-black' : 'border-neutral-300 text-neutral-400'}`} title="Link Left/Right">LR</button>
    </div>
  )
}

export function TitleToolbar({ element, editorRef, onToolbarFocus, onToolbarBlur }) {
  const { updateElement, customStyles, saveCustomStyle, applyCustomStyle, updateCustomStyle } = usePresentationStore()
  const styles = element.styles || {}
  const [saving, setSaving] = useState(false)
  const [styleName, setStyleName] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)
  const applyRef = useRef(null)

  const appliedStyle = element.style_id ? customStyles.find(s => s.id === element.style_id) : null
  const matchingStyles = customStyles.filter(s => s.type === element.type)

  const updateStyle = (key, value) => {
    updateElement(element.id, { styles: { ...styles, [key]: value } })
  }

  useEffect(() => {
    if (!applyOpen) return
    const onClick = (e) => {
      if (applyRef.current && !applyRef.current.contains(e.target)) setApplyOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [applyOpen])

  const handleSave = () => {
    const name = styleName.trim()
    if (!name) return

    // Check if style name already exists for this type
    const existing = customStyles.find(s => s.name === name && s.type === element.type)
    if (existing) {
      if (!confirm(`"${name}" already exists. Overwrite?`)) return
      updateCustomStyle(existing.id, styles)
    } else {
      saveCustomStyle({ name, type: element.type, styles })
    }
    setStyleName('')
    setSaving(false)
  }

  // Check if element already has a CSS applied
  const handleSaveClick = () => {
    if (appliedStyle) {
      if (confirm(`Update "${appliedStyle.name}" with current styles?`)) {
        updateCustomStyle(appliedStyle.id, styles)
        return
      }
    }
    setSaving(true)
    setStyleName('')
  }

  if (!editorRef?.current) return null
  const rect = editorRef.current.getBoundingClientRect()

  return (
    <div
      className="fixed z-50 bg-white border border-neutral-300 shadow-lg rounded px-2 py-1 flex flex-col gap-1"
      style={{ top: rect.top - 60, left: rect.left, width: rect.width }}
    >
      <div className="flex items-center gap-2">
        {/* Element type + applied style name */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-neutral-400 uppercase">{element.type}</span>
          {appliedStyle && <span className="text-[10px] bg-neutral-200 px-1 rounded">{appliedStyle.name}</span>}
        </div>

        <div className="w-px h-5 bg-neutral-200 shrink-0" />

        {/* Alignment */}
        <div className="flex items-center shrink-0">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle('textAlign', 'left')} className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 ${styles.textAlign === 'left' || !styles.textAlign ? 'bg-neutral-200' : ''}`} title="Align Left">←</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle('textAlign', 'center')} className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 ${styles.textAlign === 'center' ? 'bg-neutral-200' : ''}`} title="Align Center">↔</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => updateStyle('textAlign', 'right')} className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 ${styles.textAlign === 'right' ? 'bg-neutral-200' : ''}`} title="Align Right">→</button>
        </div>

        <div className="w-px h-5 bg-neutral-200 shrink-0" />

        <select value={styles.fontFamily || 'inherit'} onChange={(e) => updateStyle('fontFamily', e.target.value)} className="flex-1 min-w-0 px-1 py-0.5 text-xs border border-neutral-300 bg-white rounded">
          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <div className="w-px h-5 bg-neutral-200 shrink-0" />

        <select value={styles.fontSize || (element.type === 'title' ? 32 : 16)} onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))} className="shrink-0 px-1 py-0.5 text-xs border border-neutral-300 bg-white rounded w-14">
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>

        <div className="w-px h-5 bg-neutral-200 shrink-0" />

        <input type="color" value={styles.color || '#000000'} onChange={(e) => updateStyle('color', e.target.value)} className="shrink-0 w-6 h-6 cursor-pointer border border-neutral-300 rounded" title="Font Color" />

        <div className="w-px h-5 bg-neutral-200 shrink-0" />

        {/* Save */}
        {saving ? (
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="text" value={styleName} onChange={(e) => setStyleName(e.target.value)} placeholder="Name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') setSaving(false)
              }}
              onFocus={onToolbarFocus} onBlur={onToolbarBlur}
              className="w-16 px-1 py-0.5 text-xs border border-neutral-300" autoFocus
            />
            <button onMouseDown={(e) => e.preventDefault()} onClick={handleSave} className="px-1.5 py-0.5 text-xs bg-black text-white hover:bg-neutral-700">OK</button>
          </div>
        ) : (
          <button onMouseDown={(e) => e.preventDefault()} onClick={handleSaveClick} className="px-1.5 py-0.5 text-xs hover:bg-neutral-100" title="Save style">Save</button>
        )}

        <div className="w-px h-5 bg-neutral-200 shrink-0" />

        {/* Apply */}
        <div ref={applyRef} className="relative shrink-0">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => setApplyOpen(!applyOpen)} className="px-1.5 py-0.5 text-xs hover:bg-neutral-100" title="Apply saved style">Apply ▾</button>
          {applyOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-300 shadow-lg rounded py-1 w-40 z-50 max-h-48 overflow-auto">
              {matchingStyles.length === 0 ? (
                <div className="px-3 py-1 text-xs text-neutral-400">No saved styles</div>
              ) : matchingStyles.map(s => (
                <button key={s.id} onMouseDown={(e) => e.preventDefault()} onClick={() => { applyCustomStyle(s.id, element.id); setApplyOpen(false) }} className={`w-full text-left px-3 py-1 text-xs hover:bg-neutral-100 ${s.id === element.style_id ? 'bg-neutral-100 font-medium' : ''}`}>{s.name}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SpacingGroup label="Pad" topKey="paddingTop" bottomKey="paddingBottom" leftKey="paddingLeft" rightKey="paddingRight" element={element} onToolbarFocus={onToolbarFocus} onToolbarBlur={onToolbarBlur} />
        <div className="w-px h-5 bg-neutral-200 shrink-0" />
        <SpacingGroup label="Mar" topKey="marginTop" bottomKey="marginBottom" leftKey="marginLeft" rightKey="marginRight" element={element} onToolbarFocus={onToolbarFocus} onToolbarBlur={onToolbarBlur} />
      </div>
    </div>
  )
}
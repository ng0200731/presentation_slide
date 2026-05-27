import { useRef, useState, useEffect } from 'react'
import { usePresentationStore } from '../../stores/presentationStore'

const API = 'http://localhost:3001'

function SpacingGroup({ label, topKey, bottomKey, leftKey, rightKey, element }) {
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

  const toggleLinkTB = () => {
    if (!linkTB) {
      const synced = styles[topKey] ?? 0
      updateElement(element.id, { styles: { ...styles, [topKey]: synced, [bottomKey]: synced } })
    }
    setLinkTB(!linkTB)
  }

  const toggleLinkLR = () => {
    if (!linkLR) {
      const synced = styles[leftKey] ?? 0
      updateElement(element.id, { styles: { ...styles, [leftKey]: synced, [rightKey]: synced } })
    }
    setLinkLR(!linkLR)
  }

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <span className="text-[10px] text-neutral-500 shrink-0 font-medium">{label}</span>
      <input type="number" value={styles[topKey] ?? 0} onChange={(e) => handleChange(topKey, parseInt(e.target.value) || 0)} className="w-8 px-1 py-0.5 text-xs border border-neutral-300 text-center" title={`${label} Top`} />
      <input type="number" value={styles[bottomKey] ?? 0} onChange={(e) => handleChange(bottomKey, parseInt(e.target.value) || 0)} className="w-8 px-1 py-0.5 text-xs border border-neutral-300 text-center" title={`${label} Bottom`} />
      <button onClick={toggleLinkTB} className={`w-5 h-5 flex items-center justify-center text-[9px] border rounded shrink-0 ${linkTB ? 'bg-black text-white border-black' : 'border-neutral-300 text-neutral-400'}`} title="Link Top/Bottom">↕</button>
      <input type="number" value={styles[rightKey] ?? 0} onChange={(e) => handleChange(rightKey, parseInt(e.target.value) || 0)} className="w-8 px-1 py-0.5 text-xs border border-neutral-300 text-center" title={`${label} Right`} />
      <input type="number" value={styles[leftKey] ?? 0} onChange={(e) => handleChange(leftKey, parseInt(e.target.value) || 0)} className="w-8 px-1 py-0.5 text-xs border border-neutral-300 text-center" title={`${label} Left`} />
      <button onClick={toggleLinkLR} className={`w-5 h-5 flex items-center justify-center text-[9px] border rounded shrink-0 ${linkLR ? 'bg-black text-white border-black' : 'border-neutral-300 text-neutral-400'}`} title="Link Left/Right">↔</button>
    </div>
  )
}

export function ImageToolbar({ element, containerRef }) {
  const { updateElement, customStyles, saveCustomStyle, applyCustomStyle, updateCustomStyle } = usePresentationStore()
  const styles = element.styles || {}
  const fileInputRef = useRef(null)
  const applyRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [styleName, setStyleName] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)

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

  const handleFiles = async (files) => {
    const formData = new FormData()
    const images = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (images.length === 0) return

    images.forEach(f => formData.append('images', f))

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        body: formData,
      })
      const { urls } = await res.json()
      const current = normalizeContent(element.content)
      const newImages = urls.map(url => ({ url, caption: '' }))
      updateElement(element.id, { content: [...current, ...newImages] })
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  if (!containerRef?.current) return null
  const rect = containerRef.current.getBoundingClientRect()

  return (
    <div
      className="fixed bg-white border border-neutral-300 shadow-lg rounded px-2 py-1 flex flex-col gap-1 pointer-events-auto"
      style={{ top: rect.top - 100, left: rect.left, width: Math.min(rect.width, 500), zIndex: 10001 }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-neutral-400 uppercase">image</span>
          {appliedStyle && <span className="text-[10px] bg-neutral-200 px-1 rounded">{appliedStyle.name}</span>}
        </div>

        <div className="w-px h-5 bg-neutral-200" />

        <div className="flex items-center">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateStyle('layout', 'grid')}
            className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 ${styles.layout !== 'linear' ? 'bg-neutral-200' : ''}`}
            title="Grid layout"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="0" y="0" width="6" height="6" rx="1"/>
              <rect x="8" y="0" width="6" height="6" rx="1"/>
              <rect x="0" y="8" width="6" height="6" rx="1"/>
              <rect x="8" y="8" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateStyle('layout', 'linear')}
            className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 ${styles.layout === 'linear' ? 'bg-neutral-200' : ''}`}
            title="Linear layout"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="0" y="0" width="14" height="3" rx="1"/>
              <rect x="0" y="5.5" width="14" height="3" rx="1"/>
              <rect x="0" y="11" width="14" height="3" rx="1"/>
            </svg>
          </button>
        </div>

        <div className="w-px h-5 bg-neutral-200" />

        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-0.5 text-xs bg-black text-white hover:bg-neutral-700 rounded"
          title="Add images"
        >
          + Add
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
        />

        <div className="w-px h-5 bg-neutral-200" />

        {/* Save */}
        {saving ? (
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="text" value={styleName} onChange={(e) => setStyleName(e.target.value)} placeholder="Name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') setSaving(false)
              }}
              className="w-16 px-1 py-0.5 text-xs border border-neutral-300" autoFocus
            />
            <button onMouseDown={(e) => e.preventDefault()} onClick={handleSave} className="px-1.5 py-0.5 text-xs bg-black text-white hover:bg-neutral-700">OK</button>
          </div>
        ) : (
          <button onMouseDown={(e) => e.preventDefault()} onClick={handleSaveClick} className="px-1.5 py-0.5 text-xs hover:bg-neutral-100" title="Save style">Save</button>
        )}

        <div className="w-px h-5 bg-neutral-200" />

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
        <SpacingGroup label="Mar" topKey="marginTop" bottomKey="marginBottom" leftKey="marginLeft" rightKey="marginRight" element={element} />
      </div>
    </div>
  )
}

function normalizeContent(content) {
  if (!content) return []
  if (typeof content === 'string') return [{ url: content, caption: '' }]
  if (Array.isArray(content)) return content
  return []
}
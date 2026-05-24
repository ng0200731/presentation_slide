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

export function TitleToolbar({ element, editorRef, onToolbarFocus, onToolbarBlur }) {
  const { updateElement } = usePresentationStore()
  const styles = element.styles || {}

  const updateStyle = (key, value) => {
    updateElement(element.id, { styles: { ...styles, [key]: value } })
  }

  if (!editorRef?.current) return null
  const rect = editorRef.current.getBoundingClientRect()

  return (
    <div
      className="fixed z-50 bg-white border border-neutral-300 shadow-lg rounded px-2 py-0.5 flex items-center gap-2"
      style={{
        top: rect.top - 36,
        left: rect.left,
        width: rect.width,
      }}
    >
      {/* Alignment */}
      <div className="flex items-center shrink-0">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => updateStyle('textAlign', 'left')}
          className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 ${styles.textAlign === 'left' || !styles.textAlign ? 'bg-neutral-200' : ''}`}
          title="Align Left"
        >
          ←
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => updateStyle('textAlign', 'center')}
          className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 ${styles.textAlign === 'center' ? 'bg-neutral-200' : ''}`}
          title="Align Center"
        >
          ↔
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => updateStyle('textAlign', 'right')}
          className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 ${styles.textAlign === 'right' ? 'bg-neutral-200' : ''}`}
          title="Align Right"
        >
          →
        </button>
      </div>

      <div className="w-px h-5 bg-neutral-200 shrink-0" />

      {/* Font Family - expands */}
      <select
        value={styles.fontFamily || 'inherit'}
        onChange={(e) => updateStyle('fontFamily', e.target.value)}
        className="flex-1 min-w-0 px-1 py-0.5 text-xs border border-neutral-300 bg-white rounded"
      >
        {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      <div className="w-px h-5 bg-neutral-200 shrink-0" />

      {/* Font Size */}
      <select
        value={styles.fontSize || 32}
        onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
        className="shrink-0 px-1 py-0.5 text-xs border border-neutral-300 bg-white rounded w-14"
      >
        {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
      </select>

      <div className="w-px h-5 bg-neutral-200 shrink-0" />

      {/* Color */}
      <input
        type="color"
        value={styles.color || '#000000'}
        onChange={(e) => updateStyle('color', e.target.value)}
        className="shrink-0 w-6 h-6 cursor-pointer border border-neutral-300 rounded"
        title="Font Color"
      />

      <div className="w-px h-5 bg-neutral-200 shrink-0" />

      {/* Padding - expands */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <span className="text-[10px] text-neutral-400 shrink-0">PT</span>
        <input
          type="number"
          value={styles.paddingTop ?? 0}
          onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value) || 0)}
          onFocus={onToolbarFocus}
          onBlur={onToolbarBlur}
          className="flex-1 min-w-0 px-1 py-0.5 text-xs border border-neutral-300 text-center"
          title="Padding Top"
        />
        <span className="text-[10px] text-neutral-400 shrink-0">PB</span>
        <input
          type="number"
          value={styles.paddingBottom ?? 0}
          onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value) || 0)}
          onFocus={onToolbarFocus}
          onBlur={onToolbarBlur}
          className="flex-1 min-w-0 px-1 py-0.5 text-xs border border-neutral-300 text-center"
          title="Padding Bottom"
        />
      </div>
    </div>
  )
}
import { useRef, useEffect, useState } from 'react'
import { usePresentationStore } from '../../stores/presentationStore'
import { TitleToolbar } from '../Toolbar/TitleToolbar'

export function TitleElement({ element }) {
  const { updateElement, activeElementId, setActiveElement } = usePresentationStore()
  const ref = useRef(null)
  const [toolbarActive, setToolbarActive] = useState(false)
  const isActive = activeElementId === element.id
  const styles = element.styles || {}
  const text = element.content?.[0]?.children?.[0]?.text || ''

  useEffect(() => {
    if (ref.current) ref.current.textContent = text
  }, [])

  return (
    <>
      {isActive && <TitleToolbar element={element} editorRef={ref} onToolbarFocus={() => setToolbarActive(true)} onToolbarBlur={() => setToolbarActive(false)} />}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="outline-none text-3xl font-bold empty:before:content-['Title'] empty:before:text-neutral-300"
        style={{
          fontFamily: styles.fontFamily || 'inherit',
          fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
          color: styles.color || '#000000',
          textAlign: styles.textAlign || 'left',
          lineHeight: styles.lineHeight || 1.2,
          paddingTop: styles.paddingTop ? `${styles.paddingTop}px` : undefined,
          paddingBottom: styles.paddingBottom ? `${styles.paddingBottom}px` : undefined,
        }}
        onClick={(e) => {
          e.stopPropagation()
          setActiveElement(element.id)
        }}
        onBlur={() => {
          if (toolbarActive) return
          const newText = ref.current?.textContent || ''
          updateElement(element.id, {
            content: [{ children: [{ text: newText }] }],
          })
        }}
      />
    </>
  )
}
import { useRef, useEffect, useState } from 'react'
import { usePresentationStore } from '../../stores/presentationStore'

export function TitleElement({ element }) {
  const { updateElement } = usePresentationStore()
  const ref = useRef(null)
  const styles = element.styles || {}
  const text = element.content?.[0]?.children?.[0]?.text || ''

  useEffect(() => {
    if (ref.current) ref.current.textContent = text
  }, [])

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className="outline-none text-3xl font-bold empty:before:content-['Title'] empty:before:text-neutral-300"
      style={{
        fontFamily: styles.fontFamily || 'inherit',
        fontSize: styles.fontSize || undefined,
        color: styles.color || '#000000',
        textAlign: styles.textAlign || 'left',
        lineHeight: styles.lineHeight || 1.2,
      }}
      onBlur={() => {
        const newText = ref.current?.textContent || ''
        updateElement(element.id, {
          content: [{ children: [{ text: newText }] }],
        })
      }}
    />
  )
}
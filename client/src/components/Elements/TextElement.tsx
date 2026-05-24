import { useRef, useEffect, useState } from 'react'
import { usePresentationStore } from '../../stores/presentationStore'
import { TitleToolbar } from '../Toolbar/TitleToolbar'

function htmlToContent(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  const blocks = []
  let currentText = ''
  for (const node of div.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      currentText += node.textContent
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        blocks.push({ children: [{ text: currentText }] })
        currentText = ''
      } else if (node.tagName === 'DIV') {
        if (currentText) { blocks.push({ children: [{ text: currentText }] }); currentText = '' }
        blocks.push({ children: [{ text: node.textContent || '' }] })
      } else {
        currentText += node.textContent
      }
    }
  }
  if (currentText || blocks.length === 0) blocks.push({ children: [{ text: currentText }] })
  return blocks
}

function contentToHtml(content) {
  if (!Array.isArray(content) || content.length === 0) return ''
  return content.map(block => {
    const text = block?.children?.map(c => c.text || '').join('') || ''
    return `<div>${text || '<br>'}</div>`
  }).join('')
}

export function TextElement({ element }) {
  const { updateElement, activeElementId, setActiveElement } = usePresentationStore()
  const ref = useRef(null)
  const [toolbarActive, setToolbarActive] = useState(false)
  const isActive = activeElementId === element.id
  const styles = element.styles || {}

  useEffect(() => {
    if (ref.current && !isActive) {
      ref.current.innerHTML = contentToHtml(element.content)
    }
  }, [element.id, isActive])

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = contentToHtml(element.content)
    }
  }, [])

  return (
    <>
      {isActive && <TitleToolbar element={element} editorRef={ref} onToolbarFocus={() => setToolbarActive(true)} onToolbarBlur={() => setToolbarActive(false)} />}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="outline-none text-base empty:before:content-['Content'] empty:before:text-neutral-300"
        style={{
          fontFamily: styles.fontFamily || 'inherit',
          fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
          color: styles.color || '#000000',
          textAlign: styles.textAlign || 'left',
          lineHeight: styles.lineHeight || 1.6,
          paddingTop: styles.paddingTop ? `${styles.paddingTop}px` : undefined,
          paddingBottom: styles.paddingBottom ? `${styles.paddingBottom}px` : undefined,
          paddingLeft: styles.paddingLeft ? `${styles.paddingLeft}px` : undefined,
          paddingRight: styles.paddingRight ? `${styles.paddingRight}px` : undefined,
          marginTop: styles.marginTop ? `${styles.marginTop}px` : undefined,
          marginBottom: styles.marginBottom ? `${styles.marginBottom}px` : undefined,
          marginLeft: styles.marginLeft ? `${styles.marginLeft}px` : undefined,
          marginRight: styles.marginRight ? `${styles.marginRight}px` : undefined,
        }}
        onClick={(e) => {
          e.stopPropagation()
          setActiveElement(element.id)
        }}
        onBlur={() => {
          if (toolbarActive) return
          const content = htmlToContent(ref.current?.innerHTML || '')
          updateElement(element.id, { content })
        }}
      />
    </>
  )
}
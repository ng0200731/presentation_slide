import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { createEditor, Transforms, Editor, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { usePresentationStore } from '../../stores/presentationStore'
import { FloatingToolbar } from '../Toolbar/FloatingToolbar'
import { elementStylesToCSS } from '../../utils/slateUtils'

const LIST_TYPES = ['numbered-list', 'bulleted-list']

export function SlateEditor({ element, placeholder = 'Type here...' }) {
  const { updateElement, activeElementId, setActiveElement } = usePresentationStore()
  const editor = useMemo(() => withReact(createEditor()), [])
  const editorRef = useRef(null)
  const [toolbarPosition, setToolbarPosition] = useState(null)
  const isActive = activeElementId === element.id
  const styles = element.styles || {}

  // Initialize editor value from element content
  const initialValue = useMemo(() => {
    if (Array.isArray(element.content) && element.content.length > 0) {
      return element.content
    }
    return [{ type: 'paragraph', children: [{ text: '' }] }]
  }, [element.id])

  // Handle rich text rendering
  const renderElement = useCallback((props) => {
    const { attributes, children, element: node } = props
    switch (node.type) {
      case 'heading-one': return <h1 {...attributes}>{children}</h1>
      case 'heading-two': return <h2 {...attributes}>{children}</h2>
      case 'heading-three': return <h3 {...attributes}>{children}</h3>
      case 'block-quote': return <blockquote {...attributes}>{children}</blockquote>
      case 'bulleted-list': return <ul {...attributes}>{children}</ul>
      case 'numbered-list': return <ol {...attributes}>{children}</ol>
      case 'list-item': return <li {...attributes}>{children}</li>
      default: return <p {...attributes}>{children}</p>
    }
  }, [])

  const renderLeaf = useCallback((props) => {
    let { attributes, children, leaf } = props
    if (leaf.bold) children = <strong>{children}</strong>
    if (leaf.italic) children = <em>{children}</em>
    if (leaf.underline) children = <u>{children}</u>
    if (leaf.code) children = <code>{children}</code>
    return <span {...attributes}>{children}</span>
  }, [])

  // Save content on change
  const handleChange = useCallback((value) => {
    // Update toolbar position on selection change
    updateToolbarPosition()

    // Save content
    if (editor.operations.some(op => op.type !== 'set_selection')) {
      updateElement(element.id, { content: value })
    }
  }, [element.id, updateElement])

  const updateToolbarPosition = useCallback(() => {
    try {
      const domSelection = window.getSelection()
      if (!domSelection || domSelection.rangeCount === 0 || domSelection.isCollapsed) {
        setToolbarPosition(null)
        return
      }
      const domRange = domSelection.getRangeAt(0)
      const rect = domRange.getBoundingClientRect()
      setToolbarPosition({
        top: rect.top + window.scrollY - 44,
        left: rect.left + window.scrollX + rect.width / 2,
      })
    } catch {
      setToolbarPosition(null)
    }
  }, [])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    if (!event.ctrlKey && !event.metaKey) return

    switch (event.key) {
      case 'b':
        event.preventDefault()
        toggleMark(editor, 'bold')
        break
      case 'i':
        event.preventDefault()
        toggleMark(editor, 'italic')
        break
      case 'u':
        event.preventDefault()
        toggleMark(editor, 'underline')
        break
    }
  }, [editor])

  const cssStyles = elementStylesToCSS(styles)

  return (
    <div
      ref={editorRef}
      className="slate-editor"
      onClick={(e) => {
        e.stopPropagation()
        setActiveElement(element.id)
      }}
    >
      {isActive && <FloatingToolbar editor={editor} position={toolbarPosition} element={element} editorRef={editorRef} />}
      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={cssStyles}
          className="outline-none"
        />
      </Slate>
    </div>
  )
}

// Mark toggles
function toggleMark(editor, format) {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

function isMarkActive(editor, format) {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

// Block toggles
export function toggleBlock(editor, format) {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  })

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

function isBlockActive(editor, format) {
  const { selection } = editor
  if (!selection) return false
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
  )
  return !!match
}

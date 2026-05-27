import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { createEditor, Transforms, Editor, Element as SlateElement, Text } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { withHistory } from 'slate-history'
import { usePresentationStore } from '../../stores/presentationStore'
import { FloatingToolbar } from '../Toolbar/FloatingToolbar'
import { elementStylesToCSS } from '../../utils/slateUtils'

const LIST_TYPES = ['numbered-list', 'bulleted-list']

export function SlateEditor({ element, placeholder = 'Type here...', editor: externalEditor }) {
  const { updateElement, activeElementId, setActiveElement, isFullscreen } = usePresentationStore()
  const internalEditor = useMemo(() => {
    const e = withHistory(withReact(createEditor()))
    const { isInline } = e
    e.isInline = (element) => element.type === 'link' ? true : isInline(element)
    return e
  }, [])
  const editor = externalEditor || internalEditor
  const editorRef = useRef(null)
  const [toolbarPosition, setToolbarPosition] = useState(null)
  const isActive = !isFullscreen && activeElementId === element.id
  const styles = element.styles || {}

  const initialValue = useMemo(() => {
    if (Array.isArray(element.content) && element.content.length > 0) {
      return element.content
    }
    return [{ type: 'paragraph', children: [{ text: '' }] }]
  }, [element.id])

  const renderElement = useCallback((props) => {
    const { attributes, children, element: node } = props
    switch (node.type) {
      case 'heading-one': return <h1 {...attributes}>{children}</h1>
      case 'heading-two': return <h2 {...attributes}>{children}</h2>
      case 'heading-three': return <h3 {...attributes}>{children}</h3>
      case 'block-quote': return <blockquote {...attributes}>{children}</blockquote>
      case 'bulleted-list': return <ul {...attributes} className="list-disc pl-5">{children}</ul>
      case 'numbered-list': return <ol {...attributes} className="list-decimal pl-5">{children}</ol>
      case 'list-item': return <li {...attributes}>{children}</li>
      case 'link':
        return (
          <a {...attributes} href={node.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline cursor-pointer">
            {children}
          </a>
        )
      case 'table':
        return (
          <table {...attributes} className="border-collapse w-full border border-neutral-300">
            <tbody>{children}</tbody>
          </table>
        )
      case 'table-row':
        return <tr {...attributes}>{children}</tr>
      case 'table-cell':
        return (
          <td {...attributes} className="border border-neutral-300 px-2 py-1 min-w-[60px]">
            {children}
          </td>
        )
      default: return <p {...attributes}>{children}</p>
    }
  }, [])

  const renderLeaf = useCallback((props) => {
    let { attributes, children, leaf } = props
    if (leaf.bold) children = <strong>{children}</strong>
    if (leaf.italic) children = <em>{children}</em>
    if (leaf.underline) children = <u>{children}</u>
    if (leaf.code) children = <code className="bg-neutral-100 px-1 rounded text-sm">{children}</code>
    return <span {...attributes}>{children}</span>
  }, [])

  const handleChange = useCallback((value) => {
    updateToolbarPosition()
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
      case 'k':
        event.preventDefault()
        insertLink(editor, window.prompt('URL:', 'https://') || '')
        break
    }
  }, [editor])

  // Auto-focus when active
  useEffect(() => {
    if (isActive) {
      ReactEditor.focus(editor)
    }
  }, [isActive])

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
          onKeyDown={isFullscreen ? (e) => e.preventDefault() : handleKeyDown}
          placeholder={placeholder}
          style={cssStyles}
          className="outline-none"
          readOnly={isFullscreen}
          onClick={(e) => {
            const link = e.target.closest('a')
            if (link && link.href) {
              e.preventDefault()
              window.open(link.href, '_blank', 'noopener,noreferrer')
            }
          }}
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

// Link
export function insertLink(editor, url) {
  if (!url) return
  const { selection } = editor

  if (!selection || Editor.isCollapsed(editor, selection || {})) {
    Transforms.insertNodes(editor, {
      type: 'link',
      url,
      children: [{ text: url }],
    })
  } else {
    Transforms.wrapNodes(editor, {
      type: 'link',
      url,
      children: [],
    }, { split: true })
  }
}

export function isLinkActive(editor) {
  const [link] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    })
  )
  return !!link
}

export function unwrapLink(editor) {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
}

// Table
export function insertTable(editor, rows = 3, cols = 3) {
  const table = {
    type: 'table',
    children: Array.from({ length: rows }, () => ({
      type: 'table-row',
      children: Array.from({ length: cols }, () => ({
        type: 'table-cell',
        children: [{ text: '' }],
      })),
    })),
  }
  Transforms.insertNodes(editor, table)
  Transforms.move(editor)
}

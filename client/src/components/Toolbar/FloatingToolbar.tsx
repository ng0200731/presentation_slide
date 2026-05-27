import { Editor } from 'slate'
import { toggleBlock, insertLink, isLinkActive, unwrapLink, insertTable } from '../Elements/SlateEditor'
import { PresetStyles } from './PresetStyles'

export function FloatingToolbar({ editor, position, element, editorRef }) {
  if (!position) return null

  const toolbarStyle = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    transform: 'translateX(-50%)',
  }

  const handleLink = () => {
    if (isLinkActive(editor)) {
      unwrapLink(editor)
    } else {
      const url = window.prompt('Enter URL:', 'https://')
      if (url) insertLink(editor, url)
    }
  }

  return (
    <div
      className="fixed z-50 bg-white border border-neutral-300 shadow-lg rounded px-1 py-0.5 flex items-center gap-0.5"
      style={toolbarStyle}
      onMouseDown={(e) => e.preventDefault()}
    >
      <MarkButton editor={editor} format="bold" label="B" shortcut="Ctrl+B" />
      <MarkButton editor={editor} format="italic" label="I" shortcut="Ctrl+I" />
      <MarkButton editor={editor} format="underline" label="U" shortcut="Ctrl+U" />

      <div className="w-px h-5 bg-neutral-200 mx-0.5" />

      <BlockButton editor={editor} format="heading-one" label="H1" />
      <BlockButton editor={editor} format="heading-two" label="H2" />
      <BlockButton editor={editor} format="heading-three" label="H3" />

      <div className="w-px h-5 bg-neutral-200 mx-0.5" />

      <BlockButton editor={editor} format="bulleted-list" label="• List" />
      <BlockButton editor={editor} format="numbered-list" label="1. List" />
      <BlockButton editor={editor} format="block-quote" label="Q" />

      <div className="w-px h-5 bg-neutral-200 mx-0.5" />

      {/* Link */}
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          handleLink()
        }}
        className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 transition-colors ${isLinkActive(editor) ? 'bg-neutral-200' : ''}`}
        title="Link (Ctrl+K)"
      >
        🔗
      </button>

      {/* Table */}
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          insertTable(editor)
        }}
        className="px-1.5 py-0.5 text-xs hover:bg-neutral-100 transition-colors"
        title="Insert Table"
      >
        ⊞
      </button>

      <div className="w-px h-5 bg-neutral-200 mx-0.5" />

      <PresetStyles element={element} />
    </div>
  )
}

function MarkButton({ editor, format, label, shortcut }) {
  const active = Editor.marks(editor)?.[format]
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault()
        const isActive = Editor.marks(editor)?.[format]
        if (isActive) {
          Editor.removeMark(editor, format)
        } else {
          Editor.addMark(editor, format, true)
        }
      }}
      className={`px-1.5 py-0.5 text-xs hover:bg-neutral-100 transition-colors ${
        active ? 'bg-neutral-200 font-bold' : ''
      }`}
      title={shortcut}
    >
      {label}
    </button>
  )
}

function BlockButton({ editor, format, label }) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault()
        toggleBlock(editor, format)
      }}
      className="px-1.5 py-0.5 text-xs hover:bg-neutral-100 transition-colors"
    >
      {label}
    </button>
  )
}

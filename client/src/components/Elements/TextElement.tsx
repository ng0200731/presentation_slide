import { useRef, useState, useMemo } from 'react'
import { createEditor } from 'slate'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { usePresentationStore } from '../../stores/presentationStore'
import { TitleToolbar } from '../Toolbar/TitleToolbar'
import { SlateEditor } from './SlateEditor'

export function TextElement({ element }) {
  const ref = useRef(null)
  const [toolbarActive, setToolbarActive] = useState(false)
  const isActive = usePresentationStore((state) => !state.isFullscreen && state.activeElementId === element.id)
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()))
    const { isInline } = e
    e.isInline = (el) => el.type === 'link' ? true : isInline(el)
    return e
  }, [])

  return (
    <>
      {isActive && <TitleToolbar element={element} editorRef={ref} onToolbarFocus={() => setToolbarActive(true)} onToolbarBlur={() => setToolbarActive(false)} slateEditor={editor} />}
      <div ref={ref}>
        <SlateEditor element={element} placeholder="Content" editor={editor} />
      </div>
    </>
  )
}
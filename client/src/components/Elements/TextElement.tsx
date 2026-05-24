import { usePresentationStore } from '../../stores/presentationStore'

export function TextElement({ element }) {
  const { updateElement } = usePresentationStore()
  const styles = element.styles || {}
  const content = element.content
  const text = content?.[0]?.children?.[0]?.text || ''

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className="outline-none text-base"
      style={{
        fontFamily: styles.fontFamily || 'inherit',
        fontSize: styles.fontSize || undefined,
        color: styles.color || '#000000',
        textAlign: styles.textAlign || 'left',
        lineHeight: styles.lineHeight || 1.6,
      }}
      onBlur={(e) => {
        const newText = e.currentTarget.textContent
        updateElement(element.id, {
          content: [{ children: [{ text: newText }] }],
        })
      }}
    >
      {text}
    </div>
  )
}
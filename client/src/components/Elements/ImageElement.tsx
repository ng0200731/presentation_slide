import { usePresentationStore } from '../../stores/presentationStore'

export function ImageElement({ element }) {
  const { updateElement } = usePresentationStore()
  const styles = element.styles || {}
  const src = element.content || ''
  const width = styles.width || '100%'
  const caption = styles.caption || ''

  if (!src) {
    return (
      <div className="border border-dashed border-neutral-400 p-8 text-center text-neutral-400 text-sm">
        Image placeholder
      </div>
    )
  }

  return (
    <div>
      <img
        src={src}
        alt={caption || 'Presentation image'}
        className="max-w-full"
        style={{ width, height: styles.height || 'auto' }}
      />
      {caption && (
        <div className="text-xs text-neutral-500 mt-1 text-center">{caption}</div>
      )}
    </div>
  )
}
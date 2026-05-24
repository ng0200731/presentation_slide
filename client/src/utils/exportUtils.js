import { usePresentationStore } from '../stores/presentationStore'

export function exportJSON() {
  const { title, background, elements } = usePresentationStore.getState()
  const data = {
    title,
    background,
    elements: elements.map(el => ({
      id: el.id,
      type: el.type,
      position: el.position,
      content: el.content,
      styles: el.styles,
    })),
    exportedAt: new Date().toISOString(),
  }
  downloadFile(JSON.stringify(data, null, 2), `${title || 'presentation'}.json`, 'application/json')
}

function contentToPlainText(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map(block => {
    if (block?.children) return block.children.map(c => c.text || '').join('')
    return ''
  }).join('\n')
}

export function exportHTML() {
  const { title, background, canvasPadding, canvasMargin, elements } = usePresentationStore.getState()

  const bgStyle = background.type === 'solid'
    ? `background-color: ${background.color};`
    : background.type === 'linear'
      ? `background: linear-gradient(${background.angle || 0}deg, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')});`
      : background.type === 'radial'
        ? `background: radial-gradient(circle, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')});`
        : ''

  const pad = canvasPadding || { top: 32, right: 32, bottom: 32, left: 32 }
  const mar = canvasMargin || { top: 0, right: 0, bottom: 0, left: 0 }

  const elementsHTML = elements.map(el => {
    const text = contentToPlainText(el.content)
    const styles = el.styles || {}
    const css = [
      styles.fontFamily && styles.fontFamily !== 'inherit' ? `font-family: ${styles.fontFamily};` : '',
      styles.fontSize ? `font-size: ${styles.fontSize}px;` : '',
      styles.color ? `color: ${styles.color};` : '',
      styles.textAlign ? `text-align: ${styles.textAlign};` : '',
      styles.lineHeight ? `line-height: ${styles.lineHeight};` : '',
      styles.paddingTop ? `padding-top: ${styles.paddingTop}px;` : '',
      styles.paddingBottom ? `padding-bottom: ${styles.paddingBottom}px;` : '',
      styles.paddingLeft ? `padding-left: ${styles.paddingLeft}px;` : '',
      styles.paddingRight ? `padding-right: ${styles.paddingRight}px;` : '',
      styles.marginTop ? `margin-top: ${styles.marginTop}px;` : '',
      styles.marginBottom ? `margin-bottom: ${styles.marginBottom}px;` : '',
      styles.marginLeft ? `margin-left: ${styles.marginLeft}px;` : '',
      styles.marginRight ? `margin-right: ${styles.marginRight}px;` : '',
    ].filter(Boolean).join(' ')

    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')

    if (el.type === 'title') {
      return `<h1 style="font-size: 28px; font-weight: bold; ${css}">${escaped || 'Title'}</h1>`
    }
    if (el.type === 'text') {
      return `<p style="font-size: 16px; ${css}">${escaped || 'Content'}</p>`
    }
    if (el.type === 'image') {
      const src = el.content || ''
      const caption = styles.caption || ''
      const imgTag = src ? `<img src="${src}" alt="${caption}" style="max-width: 100%; width: ${styles.width || '100%'};" />` : ''
      const captionTag = caption ? `<p style="text-align: center; font-size: 12px; color: #666;">${caption}</p>` : ''
      return `<div>${imgTag}${captionTag}</div>`
    }
    return ''
  }).join('\n    ')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Presentation'}</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; display: flex; justify-content: center; }
    .canvas { width: 960px; min-height: 800px; margin: ${mar.top}px ${mar.right}px ${mar.bottom}px ${mar.left}px; padding: ${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px; ${bgStyle} box-sizing: border-box; }
  </style>
</head>
<body>
  <div class="canvas">
    ${elementsHTML}
  </div>
</body>
</html>`

  downloadFile(html, `${title || 'presentation'}.html`, 'text/html')
}

async function captureCanvas() {
  const html2canvas = (await import('html2canvas')).default
  const canvasEl = document.querySelector('[data-canvas]')
  if (!canvasEl) return null

  return html2canvas(canvasEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  })
}

export async function exportPNG() {
  const canvas = await captureCanvas()
  if (!canvas) return

  const link = document.createElement('a')
  link.download = `${usePresentationStore.getState().title || 'presentation'}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportPDF() {
  const canvas = await captureCanvas()
  if (!canvas) return

  const { jsPDF } = await import('jspdf')

  const imgData = canvas.toDataURL('image/png')
  const imgWidth = 960
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const pdf = new jsPDF({
    orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
    unit: 'px',
    format: [imgWidth + 64, Math.max(imgHeight + 64, 1200)],
  })

  pdf.addImage(imgData, 'PNG', 32, 32, imgWidth, imgHeight)
  pdf.save(`${usePresentationStore.getState().title || 'presentation'}.pdf`)
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
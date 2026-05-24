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

export function exportHTML() {
  const { title, background, elements } = usePresentationStore.getState()

  const bgStyle = background.type === 'solid'
    ? `background-color: ${background.color};`
    : background.type === 'linear'
      ? `background: linear-gradient(${background.angle || 0}deg, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')});`
      : background.type === 'radial'
        ? `background: radial-gradient(circle, ${(background.stops || []).map(s => `${s.color} ${s.position}%`).join(', ')});`
        : ''

  const elementsHTML = elements.map(el => {
    const text = el.content?.[0]?.children?.[0]?.text || ''
    const styles = el.styles || {}
    const css = [
      styles.fontFamily ? `font-family: ${styles.fontFamily};` : '',
      styles.fontSize ? `font-size: ${styles.fontSize}px;` : '',
      styles.color ? `color: ${styles.color};` : '',
      styles.textAlign ? `text-align: ${styles.textAlign};` : '',
      styles.lineHeight ? `line-height: ${styles.lineHeight};` : '',
      el.margin ? `margin: ${el.margin};` : '',
      el.padding ? `padding: ${el.padding};` : '',
    ].filter(Boolean).join(' ')

    if (el.type === 'title') {
      return `<h1 style="font-size: 28px; font-weight: bold; ${css}">${text}</h1>`
    }
    if (el.type === 'text') {
      return `<p style="font-size: 16px; ${css}">${text}</p>`
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
    .canvas { width: 960px; min-height: 800px; margin: 40px auto; padding: 32px; ${bgStyle} box-sizing: border-box; }
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

export async function exportPNG() {
  const html2canvas = (await import('html2canvas')).default
  const canvasEl = document.querySelector('[data-canvas]')
  if (!canvasEl) return

  const canvas = await html2canvas(canvasEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  })
  const link = document.createElement('a')
  link.download = `${usePresentationStore.getState().title || 'presentation'}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportPDF() {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  const canvasEl = document.querySelector('[data-canvas]')
  if (!canvasEl) return

  const canvas = await html2canvas(canvasEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  })

  const imgData = canvas.toDataURL('image/png')
  const imgWidth = 960
  const pageHeight = 1200
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const pdf = new jsPDF({
    orientation: imgHeight > pageHeight ? 'portrait' : 'landscape',
    unit: 'px',
    format: [imgWidth + 64, Math.max(imgHeight + 64, pageHeight)],
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

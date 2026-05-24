// Preset style definitions for the rich text editor

export const PRESET_STYLES = {
  headings: [
    { name: 'H1', styles: { fontSize: 36, fontWeight: 'bold', lineHeight: 1.2 } },
    { name: 'H2', styles: { fontSize: 28, fontWeight: 'bold', lineHeight: 1.3 } },
    { name: 'H3', styles: { fontSize: 22, fontWeight: 'bold', lineHeight: 1.4 } },
    { name: 'Subtitle', styles: { fontSize: 18, fontWeight: 'normal', color: '#666666', lineHeight: 1.5 } },
    { name: 'Body', styles: { fontSize: 16, fontWeight: 'normal', lineHeight: 1.6 } },
    { name: 'Caption', styles: { fontSize: 12, fontWeight: 'normal', color: '#999999', lineHeight: 1.4 } },
  ],
  blocks: [
    {
      name: 'Dark Block',
      styles: {
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '4px',
      },
    },
    {
      name: 'Light Block',
      styles: {
        backgroundColor: '#f5f5f5',
        padding: '16px',
        borderLeft: '3px solid #333333',
      },
    },
    {
      name: 'Bordered Card',
      styles: {
        border: '1px solid #dddddd',
        padding: '16px',
        borderRadius: '4px',
      },
    },
    {
      name: 'Quote',
      styles: {
        borderLeft: '3px solid #333333',
        paddingLeft: '16px',
        fontStyle: 'italic',
        color: '#555555',
      },
    },
  ],
  special: [
    {
      name: 'CTA Button',
      styles: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '12px 24px',
        textAlign: 'center',
        fontWeight: 'bold',
        borderRadius: '4px',
      },
    },
    {
      name: 'Code Block',
      styles: {
        fontFamily: 'monospace',
        backgroundColor: '#f5f5f5',
        padding: '12px',
        fontSize: 14,
        borderRadius: '4px',
      },
    },
    {
      name: 'Warning',
      styles: {
        borderLeft: '3px solid #e5a100',
        backgroundColor: '#fff8e1',
        padding: '12px',
        borderRadius: '0 4px 4px 0',
      },
    },
    {
      name: 'Note',
      styles: {
        borderLeft: '3px solid #0066cc',
        backgroundColor: '#e6f0ff',
        padding: '12px',
        borderRadius: '0 4px 4px 0',
      },
    },
  ],
}

// Convert preset styles to CSS style object
export function presetToStyleObj(preset) {
  return preset.styles || {}
}

// Apply inline styles to CSS for the Slate editor
export function elementStylesToCSS(styles = {}) {
  const css = {}
  if (styles.fontFamily) css.fontFamily = styles.fontFamily
  if (styles.fontSize) css.fontSize = `${styles.fontSize}px`
  if (styles.fontWeight) css.fontWeight = styles.fontWeight
  if (styles.fontStyle) css.fontStyle = styles.fontStyle
  if (styles.color) css.color = styles.color
  if (styles.textAlign) css.textAlign = styles.textAlign
  if (styles.lineHeight) css.lineHeight = styles.lineHeight
  if (styles.backgroundColor) css.backgroundColor = styles.backgroundColor
  if (styles.padding) css.padding = styles.padding
  if (styles.paddingLeft) css.paddingLeft = styles.paddingLeft
  if (styles.border) css.border = styles.border
  if (styles.borderLeft) css.borderLeft = styles.borderLeft
  if (styles.borderRadius) css.borderRadius = styles.borderRadius
  return css
}

// Serialize Slate nodes to HTML
export function slateToHTML(nodes, styles = {}) {
  if (!Array.isArray(nodes)) return ''
  return nodes.map(node => nodeToHTML(node, styles)).join('')
}

function nodeToHTML(node, styles) {
  if (node.text !== undefined) {
    let text = escapeHTML(node.text)
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    if (node.code) text = `<code>${text}</code>`
    return text
  }

  const children = node.children ? node.children.map(c => nodeToHTML(c, styles)).join('') : ''
  const styleAttr = styles ? ` style="${Object.entries(elementStylesToCSS(styles)).map(([k, v]) => `${camelToKebab(k)}:${v}`).join(';')}"` : ''

  switch (node.type) {
    case 'heading-one': return `<h1>${children}</h1>`
    case 'heading-two': return `<h2>${children}</h2>`
    case 'heading-three': return `<h3>${children}</h3>`
    case 'block-quote': return `<blockquote>${children}</blockquote>`
    case 'bulleted-list': return `<ul>${children}</ul>`
    case 'numbered-list': return `<ol>${children}</ol>`
    case 'list-item': return `<li>${children}</li>`
    case 'paragraph':
    default: return `<p>${children}</p>`
  }
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

import { create } from 'zustand'

const API = 'http://localhost:3001/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${text}`)
  }
  if (!text) {
    throw new Error('Empty response from server')
  }
  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error(`Invalid JSON: ${text.substring(0, 100)}`)
  }
}

export const usePresentationStore = create((set, get) => ({
  presentationId: null,
  title: 'Untitled Presentation',
  background: { type: 'solid', color: '#ffffff' },
  canvasPadding: { top: 32, right: 32, bottom: 32, left: 32 },
  canvasMargin: { top: 0, right: 0, bottom: 0, left: 0 },
  elements: [],
  activeElementId: null,
  isLoading: true,
  error: null,
  copiedStyle: null,
  customStyles: [],

  load: async (retryCount = 0) => {
    set({ isLoading: true, error: null })
    try {
      const list = await apiFetch('/presentations')
      let id
      if (list.length > 0) {
        id = list[0].id
      } else {
        const created = await apiFetch('/presentations', {
          method: 'POST',
          body: JSON.stringify({ title: 'Untitled Presentation' }),
        })
        id = created.id
      }
      const data = await apiFetch(`/presentations/${id}`)
      const elements = (data.elements || []).map((el) => ({
        ...el,
        content: typeof el.content === 'string' && el.content ? JSON.parse(el.content) : el.content || '',
        styles: typeof el.styles === 'string' && el.styles ? JSON.parse(el.styles) : el.styles || {},
      }))
      set({
        presentationId: id,
        title: data.title,
        background: typeof data.background === 'string' ? JSON.parse(data.background) : data.background,
        elements,
        isLoading: false,
        error: null,
      })
      get().loadCustomStyles()
    } catch (err) {
      console.error('Failed to load:', err.message)
      if (retryCount < 3) {
        console.log(`Retrying load (${retryCount + 1}/3)...`)
        setTimeout(() => get().load(retryCount + 1), 1000)
      } else {
        set({ isLoading: false, error: 'Failed to connect to server. Please restart.' })
      }
    }
  },

  savePresentation: async () => {
    const { presentationId, title, background } = get()
    if (!presentationId) return
    try {
      await apiFetch(`/presentations/${presentationId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, background }),
      })
    } catch (err) {
      console.error('Failed to save presentation:', err.message)
    }
  },

  addElement: async (type) => {
    const { presentationId, elements } = get()
    if (!presentationId) {
      console.error('No presentationId, attempting reload...')
      await get().load()
      if (!get().presentationId) return
    }

    const defaultContent = type === 'title'
      ? [{ children: [{ text: '' }] }]
      : type === 'text'
        ? [{ children: [{ text: '' }] }]
        : type === 'image'
          ? []
          : ''

    try {
      const result = await apiFetch('/elements', {
        method: 'POST',
        body: JSON.stringify({
          presentation_id: get().presentationId,
          type,
          content: defaultContent,
          styles: {},
        }),
      })

      set({
        elements: [...get().elements, {
          id: result.id,
          presentation_id: get().presentationId,
          type,
          position: result.position,
          content: defaultContent,
          styles: {},
        }],
        activeElementId: result.id,
        error: null,
      })
    } catch (err) {
      console.error('Failed to add element:', err.message)
      set({ error: `Failed to add ${type}: ${err.message}` })
    }
  },

  updateElement: async (elementId, updates) => {
    const { elements } = get()
    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const merged = { ...element, ...updates }
    set({ elements: elements.map((el) => (el.id === elementId ? merged : el)) })

    try {
      await apiFetch(`/elements/${elementId}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: merged.content,
          styles: merged.styles,
          style_id: merged.style_id,
        }),
      })
    } catch (err) {
      console.error('Failed to update element:', err.message)
    }
  },

  deleteElement: async (elementId) => {
    try {
      await apiFetch(`/elements/${elementId}`, { method: 'DELETE' })
      const { elements, activeElementId } = get()
      set({
        elements: elements.filter((el) => el.id !== elementId),
        activeElementId: activeElementId === elementId ? null : activeElementId,
      })
    } catch (err) {
      console.error('Failed to delete element:', err.message)
    }
  },

  clearAllElements: async () => {
    const { elements, presentationId } = get()
    if (!presentationId) return
    try {
      for (const el of elements) {
        await apiFetch(`/elements/${el.id}`, { method: 'DELETE' })
      }
      set({ elements: [], activeElementId: null })
    } catch (err) {
      console.error('Failed to clear elements:', err.message)
    }
  },

  reorderElements: async (elementIds) => {
    const { presentationId, elements } = get()
    try {
      await apiFetch(`/elements/reorder/${presentationId}`, {
        method: 'PUT',
        body: JSON.stringify({ elementIds }),
      })
      const reordered = elementIds
        .map((id, index) => {
          const el = elements.find((e) => e.id === id)
          return el ? { ...el, position: index } : null
        })
        .filter(Boolean)
      set({ elements: reordered })
    } catch (err) {
      console.error('Failed to reorder:', err.message)
    }
  },

  setActiveElement: (elementId) => set({ activeElementId: elementId }),

  setBackground: (background) => {
    set({ background })
    get().savePresentation()
  },

  setCanvasPadding: (padding) => {
    set({ canvasPadding: padding })
  },

  setCanvasMargin: (margin) => {
    set({ canvasMargin: margin })
  },

  copyStyle: (elementId) => {
    const el = get().elements.find((e) => e.id === elementId)
    if (el) set({ copiedStyle: { ...el.styles } })
  },

  pasteStyle: (elementId) => {
    const { copiedStyle } = get()
    if (!copiedStyle) return
    get().updateElement(elementId, { styles: { ...copiedStyle } })
  },

  loadCustomStyles: async () => {
    try {
      const rows = await apiFetch('/styles')
      const parsed = rows.map(s => ({
        ...s,
        styles: typeof s.styles === 'string' ? JSON.parse(s.styles) : s.styles || {},
      }))
      set({ customStyles: parsed })
    } catch (err) {
      console.error('Failed to load custom styles:', err.message)
    }
  },

  saveCustomStyle: async ({ name, type, styles }) => {
    try {
      const result = await apiFetch('/styles', {
        method: 'POST',
        body: JSON.stringify({ name, type, styles }),
      })
      set({ customStyles: [...get().customStyles, { id: result.id, name, type, styles }] })
    } catch (err) {
      console.error('Failed to save custom style:', err.message)
    }
  },

  deleteCustomStyle: async (styleId) => {
    try {
      await apiFetch(`/styles/${styleId}`, { method: 'DELETE' })
      set({ customStyles: get().customStyles.filter(s => s.id !== styleId) })
    } catch (err) {
      console.error('Failed to delete custom style:', err.message)
    }
  },

  renameCustomStyle: async (styleId, newName) => {
    try {
      const style = get().customStyles.find(s => s.id === styleId)
      if (!style) return
      await apiFetch(`/styles/${styleId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName, styles: style.styles }),
      })
      set({ customStyles: get().customStyles.map(s => s.id === styleId ? { ...s, name: newName } : s) })
    } catch (err) {
      console.error('Failed to rename custom style:', err.message)
    }
  },

  updateCustomStyle: async (styleId, newStyles) => {
    try {
      const style = get().customStyles.find(s => s.id === styleId)
      if (!style) return
      await apiFetch(`/styles/${styleId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: style.name, styles: newStyles }),
      })
      set({ customStyles: get().customStyles.map(s => s.id === styleId ? { ...s, styles: newStyles } : s) })
    } catch (err) {
      console.error('Failed to update custom style:', err.message)
    }
  },

  applyCustomStyle: (styleId, elementId) => {
    const { customStyles, elements } = get()
    const style = customStyles.find(s => s.id === styleId)
    const element = elements.find(e => e.id === elementId)
    if (!style || !element || style.type !== element.type) return
    get().updateElement(elementId, { styles: { ...style.styles }, style_id: styleId })
  },
}))
import { Router } from 'express'
import { getDb, saveDb } from '../db/init.js'
import { queryAll, queryFirst, run } from '../db/helpers.js'
import { nanoid } from 'nanoid'

export const elementsRouter = Router()

// List elements for a presentation
elementsRouter.get('/presentation/:presentationId', async (req, res) => {
  try {
    const db = await getDb()
    const rows = queryAll(db, 'SELECT * FROM elements WHERE presentation_id = ? ORDER BY position', [req.params.presentationId])
    res.json(rows)
  } catch (err) {
    console.error('GET elements error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Add element
elementsRouter.post('/', async (req, res) => {
  try {
    const db = await getDb()
    const id = nanoid()
    const { presentation_id, type, content, styles, style_id } = req.body

    const maxPosRow = queryFirst(db, 'SELECT COALESCE(MAX(position), -1) as maxPos FROM elements WHERE presentation_id = ?', [presentation_id])
    const position = Number(maxPosRow.maxPos) + 1

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content)

    run(db, 'INSERT INTO elements (id, presentation_id, type, position, content, styles, style_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      id,
      presentation_id,
      type,
      position,
      contentStr,
      JSON.stringify(styles || {}),
      style_id || null
    ])
    saveDb()
    res.status(201).json({ id, position })
  } catch (err) {
    console.error('POST element error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Reorder elements - MUST be before /:id routes
elementsRouter.put('/reorder/:presentationId', async (req, res) => {
  try {
    const db = await getDb()
    const { elementIds } = req.body

    elementIds.forEach((id, index) => {
      run(db, 'UPDATE elements SET position = ? WHERE id = ?', [index, id])
    })
    saveDb()
    res.json({ ok: true })
  } catch (err) {
    console.error('REORDER error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Update element
elementsRouter.put('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const { content, styles, style_id } = req.body
    run(db, 'UPDATE elements SET content = ?, styles = ?, style_id = ? WHERE id = ?', [
      typeof content === 'string' ? content : JSON.stringify(content),
      JSON.stringify(styles || {}),
      style_id || null,
      req.params.id
    ])
    saveDb()
    res.json({ ok: true })
  } catch (err) {
    console.error('PUT element error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Delete element
elementsRouter.delete('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const element = queryFirst(db, 'SELECT presentation_id, position FROM elements WHERE id = ?', [req.params.id])
    if (!element) return res.status(404).json({ error: 'Not found' })

    run(db, 'DELETE FROM elements WHERE id = ?', [req.params.id])
    run(db, 'UPDATE elements SET position = position - 1 WHERE presentation_id = ? AND position > ?', [
      element.presentation_id,
      Number(element.position)
    ])
    saveDb()
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE element error:', err)
    res.status(500).json({ error: err.message })
  }
})
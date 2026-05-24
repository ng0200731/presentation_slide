import { Router } from 'express'
import { getDb, saveDb } from '../db/init.js'
import { queryAll, queryFirst, run } from '../db/helpers.js'
import { nanoid } from 'nanoid'

export const presentationsRouter = Router()

// List all presentations
presentationsRouter.get('/', async (_req, res) => {
  try {
    const db = await getDb()
    const rows = queryAll(db, 'SELECT * FROM presentations ORDER BY updated_at DESC')
    res.json(rows)
  } catch (err) {
    console.error('GET presentations error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Get single presentation with elements
presentationsRouter.get('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const presentation = queryFirst(db, 'SELECT * FROM presentations WHERE id = ?', [req.params.id])
    if (!presentation) return res.status(404).json({ error: 'Not found' })

    const elements = queryAll(db, 'SELECT * FROM elements WHERE presentation_id = ? ORDER BY position', [req.params.id])
    res.json({ ...presentation, elements })
  } catch (err) {
    console.error('GET presentation error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Create presentation
presentationsRouter.post('/', async (req, res) => {
  try {
    const db = await getDb()
    const id = nanoid()
    const { title, background } = req.body
    run(db, 'INSERT INTO presentations (id, title, background) VALUES (?, ?, ?)', [
      id,
      title || 'Untitled Presentation',
      JSON.stringify(background || { type: 'solid', color: '#ffffff' })
    ])
    saveDb()
    res.status(201).json({ id })
  } catch (err) {
    console.error('POST presentation error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Update presentation
presentationsRouter.put('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const { title, background } = req.body
    run(db, 'UPDATE presentations SET title = ?, background = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      title,
      background ? JSON.stringify(background) : undefined,
      req.params.id
    ])
    saveDb()
    res.json({ ok: true })
  } catch (err) {
    console.error('PUT presentation error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Delete presentation
presentationsRouter.delete('/:id', async (req, res) => {
  try {
    const db = await getDb()
    run(db, 'DELETE FROM elements WHERE presentation_id = ?', [req.params.id])
    run(db, 'DELETE FROM presentations WHERE id = ?', [req.params.id])
    saveDb()
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE presentation error:', err)
    res.status(500).json({ error: err.message })
  }
})
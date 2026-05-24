import { Router } from 'express'
import { getDb, saveDb } from '../db/init.js'
import { queryAll, run } from '../db/helpers.js'
import { nanoid } from 'nanoid'

export const stylesRouter = Router()

// List all custom styles
stylesRouter.get('/', async (_req, res) => {
  try {
    const db = await getDb()
    const rows = queryAll(db, 'SELECT * FROM custom_styles ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    console.error('GET styles error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Create style
stylesRouter.post('/', async (req, res) => {
  try {
    const db = await getDb()
    const id = nanoid()
    const { name, type, styles } = req.body
    run(db, 'INSERT INTO custom_styles (id, name, type, styles) VALUES (?, ?, ?, ?)', [
      id,
      name,
      type,
      JSON.stringify(styles)
    ])
    saveDb()
    res.status(201).json({ id })
  } catch (err) {
    console.error('POST style error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Update style
stylesRouter.put('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const { name, styles } = req.body
    run(db, 'UPDATE custom_styles SET name = ?, styles = ? WHERE id = ?', [
      name,
      JSON.stringify(styles),
      req.params.id
    ])
    saveDb()
    res.json({ ok: true })
  } catch (err) {
    console.error('PUT style error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Delete style
stylesRouter.delete('/:id', async (req, res) => {
  try {
    const db = await getDb()
    run(db, 'UPDATE elements SET style_id = NULL WHERE style_id = ?', [req.params.id])
    run(db, 'DELETE FROM custom_styles WHERE id = ?', [req.params.id])
    saveDb()
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE style error:', err)
    res.status(500).json({ error: err.message })
  }
})
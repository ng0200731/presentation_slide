import express from 'express'
import cors from 'cors'
import { initDb } from './db/init.js'
import { presentationsRouter } from './routes/presentations.js'
import { elementsRouter } from './routes/elements.js'
import { stylesRouter } from './routes/styles.js'

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message)
})
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err)
})

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

await initDb()

app.use('/api/presentations', presentationsRouter)
app.use('/api/elements', elementsRouter)
app.use('/api/styles', stylesRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
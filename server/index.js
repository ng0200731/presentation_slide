import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, 'uploads')

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    cb(null, `${unique}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files allowed'), false)
  },
})

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(uploadsDir))

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

await initDb()

app.use('/api/presentations', presentationsRouter)
app.use('/api/elements', elementsRouter)
app.use('/api/styles', stylesRouter)

app.post('/api/upload', upload.array('images', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' })
  }
  const urls = req.files.map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
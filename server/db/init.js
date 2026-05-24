import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DB_DIR = join(__dirname, '../../.tmp')
const DB_PATH = join(DB_DIR, 'ppt_style.db')
const SCHEMA_PATH = join(__dirname, '../../sql/schema.sql')

let db
let saveTimer = null

export async function getDb() {
  if (db) return db

  const SQL = await initSqlJs()

  try {
    if (existsSync(DB_PATH)) {
      const buffer = readFileSync(DB_PATH)
      if (buffer.length > 0) {
        db = new SQL.Database(buffer)
      } else {
        db = new SQL.Database()
      }
    } else {
      db = new SQL.Database()
    }
  } catch (e) {
    console.error('Failed to load DB file, creating fresh:', e.message)
    if (existsSync(DB_PATH)) {
      try { unlinkSync(DB_PATH) } catch (_) {}
    }
    db = new SQL.Database()
  }

  db.run('PRAGMA foreign_keys = ON')
  return db
}

export function saveDb() {
  if (!db) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true })
      const data = db.export()
      writeFileSync(DB_PATH, Buffer.from(data))
    } catch (e) {
      console.error('Failed to save DB:', e.message)
    }
  }, 300)
}

export async function initDb() {
  try {
    const database = await getDb()
    const schema = readFileSync(SCHEMA_PATH, 'utf-8')
    database.exec(schema)
    saveDb()
    console.log('Database initialized')
  } catch (e) {
    console.error('Database init failed:', e)
    throw e
  }
}
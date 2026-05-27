-- Presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  background TEXT DEFAULT '{"type":"solid","color":"#ffffff"}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Elements table (ordered vertically within a presentation)
CREATE TABLE IF NOT EXISTS elements (
  id TEXT PRIMARY KEY,
  presentation_id TEXT NOT NULL,
  type TEXT NOT NULL,
  position INTEGER NOT NULL,
  content TEXT NOT NULL,
  styles TEXT DEFAULT '{}',
  style_id TEXT,
  FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE,
  FOREIGN KEY (style_id) REFERENCES custom_styles(id) ON DELETE SET NULL
);

-- Custom styles (global library)
CREATE TABLE IF NOT EXISTS custom_styles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  styles TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_elements_presentation ON elements(presentation_id, position);
CREATE INDEX IF NOT EXISTS idx_elements_style ON elements(style_id);
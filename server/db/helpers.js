// Helper to run a query and get rows as objects
export function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

// Helper to run a query and get first row
export function queryFirst(db, sql, params = []) {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  let row = null
  if (stmt.step()) {
    row = stmt.getAsObject()
  }
  stmt.free()
  return row
}

// Helper to run a write statement
export function run(db, sql, params = []) {
  db.run(sql, params)
}
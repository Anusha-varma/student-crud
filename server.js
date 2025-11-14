// server.js
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database (file-based SQLite)
const db = new Database(path.join(__dirname, 'students.db'));
db.prepare(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    age INTEGER
  )
`).run();

const insertStudent = db.prepare('INSERT INTO students (name, email, age) VALUES (?, ?, ?)');
const getAll = db.prepare('SELECT * FROM students ORDER BY id DESC');
const getOne = db.prepare('SELECT * FROM students WHERE id = ?');
const updateStudent = db.prepare('UPDATE students SET name = ?, email = ?, age = ? WHERE id = ?');
const deleteStudent = db.prepare('DELETE FROM students WHERE id = ?');

const rowCount = db.prepare('SELECT COUNT(*) as c FROM students').get().c;
if (rowCount === 0) {
  insertStudent.run('Alice Johnson', 'alice@example.com', 20);
  insertStudent.run('Bob Kumar', 'bob@example.com', 22);
}

// Routes
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/students', (req, res) => {
  const rows = getAll.all();
  res.json(rows);
});

app.get('/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const student = getOne.get(id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.post('/students', (req, res) => {
  const { name, email = '', age = null } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required and must be a string' });
  }
  const info = insertStudent.run(name, email, age);
  const newStudent = getOne.get(info.lastInsertRowid);
  res.status(201).json(newStudent);
});

app.put('/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = getOne.get(id);
  if (!existing) return res.status(404).json({ error: 'Student not found' });

  const { name = existing.name, email = existing.email, age = existing.age } = req.body;
  updateStudent.run(name, email, age, id);
  const updated = getOne.get(id);
  res.json(updated);
});

app.delete('/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = deleteStudent.run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Student not found' });
  res.json({ ok: true });
});

// Export app (for tests)
module.exports = app;

// Start server only when run directly (not when required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

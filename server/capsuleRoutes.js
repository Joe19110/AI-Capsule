import express from 'express';
import db from './db.js';
import { requireAuth } from './auth.js';

const router = express.Router();

// Every capsule route is protected: the JWT must be valid, and the owner is
// always taken from the verified token (req.user.sub), never from the body.
router.use(requireAuth);

function toBool01(value) {
  // Accept true/false, "Yes"/"No", 1/0 and normalise to 0 or 1.
  if (value === true || value === 1 || value === '1') return 1;
  if (typeof value === 'string' && value.trim().toLowerCase() === 'yes') return 1;
  return 0;
}

function serialize(row) {
  if (!row) return row;
  return {
    ...row,
    reviewed: !!row.reviewed,
    improved: !!row.improved,
  };
}

// READ - list only the authenticated user's records.
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM capsules WHERE user_id = ? ORDER BY datetime(created_at) DESC, id DESC')
    .all(req.user.sub);
  res.json(rows.map(serialize));
});

// CREATE - owner is the authenticated user.
router.post('/', (req, res) => {
  const b = req.body || {};

  if (!b.project_name || !b.prompt_title || !b.prompt_text) {
    return res
      .status(400)
      .json({ error: 'project_name, prompt_title and prompt_text are required.' });
  }

  const info = db
    .prepare(
      `INSERT INTO capsules
        (user_id, project_name, prompt_title, prompt_version, prompt_text,
         response_summary, category, usefulness, reviewed, improved,
         screenshot_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.sub,
      b.project_name,
      b.prompt_title,
      b.prompt_version || null,
      b.prompt_text,
      b.response_summary || null,
      b.category || null,
      b.usefulness || null,
      toBool01(b.reviewed),
      toBool01(b.improved),
      b.screenshot_url || null,
      b.notes || null
    );

  const created = db.prepare('SELECT * FROM capsules WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(serialize(created));
});

// UPDATE - only if the record belongs to the authenticated user.
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM capsules WHERE id = ?').get(id);

  if (!existing || existing.user_id !== req.user.sub) {
    // Do not reveal whether the record exists for another user.
    return res.status(404).json({ error: 'Record not found.' });
  }

  const b = req.body || {};
  db.prepare(
    `UPDATE capsules SET
        project_name = ?, prompt_title = ?, prompt_version = ?, prompt_text = ?,
        response_summary = ?, category = ?, usefulness = ?, reviewed = ?,
        improved = ?, screenshot_url = ?, notes = ?
       WHERE id = ? AND user_id = ?`
  ).run(
    b.project_name ?? existing.project_name,
    b.prompt_title ?? existing.prompt_title,
    b.prompt_version ?? existing.prompt_version,
    b.prompt_text ?? existing.prompt_text,
    b.response_summary ?? existing.response_summary,
    b.category ?? existing.category,
    b.usefulness ?? existing.usefulness,
    b.reviewed === undefined ? existing.reviewed : toBool01(b.reviewed),
    b.improved === undefined ? existing.improved : toBool01(b.improved),
    b.screenshot_url ?? existing.screenshot_url,
    b.notes ?? existing.notes,
    id,
    req.user.sub
  );

  const updated = db.prepare('SELECT * FROM capsules WHERE id = ?').get(id);
  res.json(serialize(updated));
});

// DELETE - only if the record belongs to the authenticated user.
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db
    .prepare('DELETE FROM capsules WHERE id = ? AND user_id = ?')
    .run(id, req.user.sub);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'Record not found.' });
  }
  res.json({ ok: true, id });
});

export default router;

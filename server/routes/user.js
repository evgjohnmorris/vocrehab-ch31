import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get user state value by key
router.get('/:key', (req, res) => {
  const { key } = req.params;
  db.get('SELECT value FROM user_state WHERE key = ?', [key], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: `State not found for key: ${key}` });
    }
    try {
      res.json(JSON.parse(row.value));
    } catch (parseErr) {
      res.json(row.value);
    }
  });
});

// Update/insert user state value by key
router.post('/:key', (req, res) => {
  const { key } = req.params;
  
  // Serialize body to string if it is an object
  const value = typeof req.body === 'object' ? JSON.stringify(req.body) : String(req.body);

  db.run(`
    INSERT INTO user_state (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `, [key, value], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, key });
  });
});

export default router;

import express from 'express';
import db from '../db.js';
import {
  assertAllowedUserStateKey,
  getRequestScope,
  validateUserStateValue
} from '../lib/userState.js';

const router = express.Router();

// Get user state value by key
router.get('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const scope = getRequestScope(req);
    assertAllowedUserStateKey(key);

    db.get(
      'SELECT value FROM user_state_scoped WHERE scope = ? AND key = ?',
      [scope, key],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ error: `State not found for key: ${key}` });
        }
        try {
          res.json(JSON.parse(row.value));
        } catch {
          res.json(row.value);
        }
      }
    );
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Update/insert user state value by key
router.post('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const scope = getRequestScope(req);
    assertAllowedUserStateKey(key);
    validateUserStateValue(key, req.body);

    const value = JSON.stringify(req.body);

    db.run(`
      INSERT INTO user_state_scoped (scope, key, value, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(scope, key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `, [scope, key, value], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, key });
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export default router;

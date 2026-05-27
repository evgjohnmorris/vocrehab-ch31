import express from 'express';
import db from '../db.js';
import { createPlanDraftId, assertValidDraftType, validatePlanDraftPayload, validatePlanDraftTitle } from '../lib/planDrafts.js';
import { getRequestScope } from '../lib/userState.js';

const router = express.Router();

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        changes: this.changes,
        lastID: this.lastID
      });
    });
  });
}

function parseJsonPayload(serializedPayload) {
  try {
    return JSON.parse(serializedPayload);
  } catch {
    return null;
  }
}

function mapPlanDraft(row) {
  return {
    id: row.id,
    draftType: row.draft_type,
    title: row.title,
    payload: parseJsonPayload(row.payload),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPlanDraftSummary(row) {
  return {
    id: row.id,
    draftType: row.draft_type,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parseLimit(limitParam) {
  const parsed = Number.parseInt(limitParam, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 10;
  }

  return Math.min(parsed, 20);
}

router.get('/', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const draftType = typeof req.query.draftType === 'string' ? req.query.draftType.trim() : '';
    const limit = parseLimit(req.query.limit);

    const params = [scope];
    let sql = `
      SELECT id, draft_type, title, created_at, updated_at
      FROM plan_drafts
      WHERE scope = ?
    `;

    if (draftType) {
      assertValidDraftType(draftType);
      sql += ' AND draft_type = ?';
      params.push(draftType);
    }

    sql += ' ORDER BY updated_at DESC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map(mapPlanDraftSummary));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/current/:draftType', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const { draftType } = req.params;
    assertValidDraftType(draftType);

    const row = await dbGet(`
      SELECT id, draft_type, title, payload, created_at, updated_at
      FROM plan_drafts
      WHERE scope = ? AND draft_type = ?
      LIMIT 1
    `, [scope, draftType]);

    if (!row) {
      res.status(404).json({ error: `No draft found for type: ${draftType}` });
      return;
    }

    res.json(mapPlanDraft(row));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.put('/current/:draftType', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const { draftType } = req.params;
    assertValidDraftType(draftType);

    const title = validatePlanDraftTitle(req.body?.title);
    const payload = validatePlanDraftPayload(draftType, req.body?.payload);
    const serializedPayload = JSON.stringify(payload);

    const existing = await dbGet(`
      SELECT id
      FROM plan_drafts
      WHERE scope = ? AND draft_type = ?
      LIMIT 1
    `, [scope, draftType]);

    let draftId = existing?.id;
    const statusCode = existing ? 200 : 201;

    if (existing) {
      await dbRun(`
        UPDATE plan_drafts
        SET title = ?, payload = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND scope = ?
      `, [title, serializedPayload, existing.id, scope]);
    } else {
      draftId = createPlanDraftId();
      await dbRun(`
        INSERT INTO plan_drafts (id, scope, draft_type, title, payload, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [draftId, scope, draftType, title, serializedPayload]);
    }

    const row = await dbGet(`
      SELECT id, draft_type, title, payload, created_at, updated_at
      FROM plan_drafts
      WHERE id = ? AND scope = ?
    `, [draftId, scope]);

    res.status(statusCode).json(mapPlanDraft(row));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const { id } = req.params;

    const row = await dbGet(`
      SELECT id, draft_type, title, payload, created_at, updated_at
      FROM plan_drafts
      WHERE id = ? AND scope = ?
    `, [id, scope]);

    if (!row) {
      res.status(404).json({ error: `Draft not found: ${id}` });
      return;
    }

    res.json(mapPlanDraft(row));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const scope = getRequestScope(req);
    const { id } = req.params;
    const result = await dbRun('DELETE FROM plan_drafts WHERE id = ? AND scope = ?', [id, scope]);

    if (!result.changes) {
      res.status(404).json({ error: `Draft not found: ${id}` });
      return;
    }

    res.status(204).end();
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export default router;

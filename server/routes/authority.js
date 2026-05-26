import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get manifest (returns consolidated list formatted as index.json)
router.get('/manifest', (req, res) => {
  db.all(`
    SELECT id, type, citation, title, hash, status
    FROM authority_records
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const manifest = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString().split('T')[0],
      statutes: [],
      regulations: [],
      m28c: [],
      publicLaws: [],
      federalRegister: []
    };

    rows.forEach(row => {
      const item = {
        id: row.id,
        citation: row.citation,
        title: row.title,
        hash: row.hash,
        status: row.status
      };

      if (row.type === 'usc') manifest.statutes.push(item);
      else if (row.type === 'cfr') manifest.regulations.push(item);
      else if (row.type === 'm28c') manifest.m28c.push(item);
      else if (row.type === 'public-law') manifest.publicLaws.push(item);
      else if (row.type === 'federal-register') manifest.federalRegister.push(item);
    });

    res.json(manifest);
  });
});

// Get crosswalk
router.get('/crosswalk', (req, res) => {
  try {
    const crosswalkPath = path.resolve(__dirname, '../../client/src/data/authority/topic-crosswalk.json');
    const raw = fs.readFileSync(crosswalkPath, 'utf8');
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read crosswalk file: ' + err.message });
  }
});

// Get coverage report
router.get('/coverage', (req, res) => {
  try {
    const coveragePath = path.resolve(__dirname, '../../client/public/authority/coverage-report.json');
    const raw = fs.readFileSync(coveragePath, 'utf8');
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read coverage report file: ' + err.message });
  }
});

// Search documents
router.get('/search', (req, res) => {
  const query = req.query.q || '';
  if (!query) {
    return res.json([]);
  }

  // Try FTS5 first
  db.all(`
    SELECT id, citation, title, full_text, type
    FROM authority_records
    WHERE id IN (
      SELECT id FROM authority_search_idx WHERE authority_search_idx MATCH ?
    )
  `, [query], (err, rows) => {
    if (!err) {
      return res.json(rows);
    }

    // Fallback standard LIKE query
    const matchText = `%${query}%`;
    db.all(`
      SELECT id, citation, title, full_text, type
      FROM authority_records
      WHERE citation LIKE ? OR title LIKE ? OR full_text LIKE ?
    `, [matchText, matchText, matchText], (fallbackErr, fallbackRows) => {
      if (fallbackErr) {
        return res.status(500).json({ error: fallbackErr.message });
      }
      res.json(fallbackRows);
    });
  });
});

// Get specific document by type and id
router.get('/:type/:id', (req, res) => {
  const { id } = req.params;
  db.get(`
    SELECT * FROM authority_records WHERE id = ?
  `, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: `Record not found: ${id}` });
    }

    // Format back to JSON object matching schema
    res.json({
      id: row.id,
      type: row.type,
      canonicalCitation: row.citation,
      citation: row.citation,
      title: row.title,
      fullText: row.full_text,
      text: row.full_text,
      topics: JSON.parse(row.topics || '[]'),
      hash: row.hash,
      authorityLevel: row.authority_level,
      status: row.status,
      sourceUrl: row.source_url,
      plainEnglish: row.plain_english,
      veteranUse: row.veteran_use
    });
  });
});

export default router;

import express from 'express';
import db from '../db.js';
import {
  getCoverageReport,
  getManifestMetadata,
  getTopicCrosswalk
} from '../lib/authorityStaticData.js';

const router = express.Router();

const AUTHORITY_TYPES = new Set([
  'usc',
  'cfr',
  'm28c',
  'public-law',
  'federal-register'
]);

function parseTopics(rawTopics) {
  if (!rawTopics) {
    return [];
  }

  try {
    return JSON.parse(rawTopics);
  } catch {
    return [];
  }
}

function normalizeSearchQuery(query) {
  const tokens = String(query || '')
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/"/g, '""'))
    .filter(Boolean);

  if (tokens.length === 0) {
    return '';
  }

  return tokens.map((token) => `"${token}"`).join(' AND ');
}

function getSearchLimit(limitParam) {
  const parsed = Number.parseInt(limitParam, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }

  return Math.min(parsed, 50);
}

// Get manifest (returns consolidated list formatted as index.json)
router.get('/manifest', (req, res) => {
  db.all(`
    SELECT id, type, citation, title, hash, status
    FROM authority_records
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    try {
      const manifestMeta = getManifestMetadata();
      const manifest = {
        version: manifestMeta.version,
        lastUpdated: manifestMeta.lastUpdated,
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
    } catch (assetError) {
      res.status(500).json({ error: assetError.message });
    }
  });
});

// Get crosswalk
router.get('/crosswalk', (req, res) => {
  try {
    res.json(getTopicCrosswalk());
  } catch (err) {
    res.status(500).json({ error: `Failed to read crosswalk file: ${err.message}` });
  }
});

// Get coverage report
router.get('/coverage', (req, res) => {
  try {
    res.json(getCoverageReport());
  } catch (err) {
    res.status(500).json({ error: `Failed to read coverage report file: ${err.message}` });
  }
});

// Search documents
router.get('/search', (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.json([]);
  }

  const limit = getSearchLimit(req.query.limit);
  const ftsQuery = normalizeSearchQuery(query);

  // Try FTS5 first
  db.all(`
    SELECT
      authority_records.id,
      authority_records.citation,
      authority_records.title,
      authority_records.type,
      snippet(authority_search_idx, 3, '', '', ' ... ', 24) AS snippet,
      substr(authority_records.full_text, 1, 320) AS previewText
    FROM authority_search_idx
    JOIN authority_records ON authority_records.rowid = authority_search_idx.rowid
    WHERE authority_search_idx MATCH ?
    ORDER BY bm25(authority_search_idx)
    LIMIT ?
  `, [ftsQuery, limit], (err, rows) => {
    if (!err) {
      return res.json(rows);
    }

    // Fallback standard LIKE query
    const matchText = `%${query}%`;
    db.all(`
      SELECT
        id,
        citation,
        title,
        type,
        substr(full_text, 1, 320) AS previewText
      FROM authority_records
      WHERE citation LIKE ? OR title LIKE ? OR full_text LIKE ?
      ORDER BY
        CASE
          WHEN citation LIKE ? THEN 0
          WHEN title LIKE ? THEN 1
          ELSE 2
        END,
        citation
      LIMIT ?
    `, [matchText, matchText, matchText, matchText, matchText, limit], (fallbackErr, fallbackRows) => {
      if (fallbackErr) {
        return res.status(500).json({ error: fallbackErr.message });
      }
      res.json(fallbackRows);
    });
  });
});

// Get specific document by type and id
router.get('/:type/:id', (req, res) => {
  const { type, id } = req.params;

  if (!AUTHORITY_TYPES.has(type)) {
    return res.status(400).json({ error: `Unsupported authority type: ${type}` });
  }

  db.get(`
    SELECT * FROM authority_records WHERE type = ? AND id = ?
  `, [type, id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: `Record not found: ${type}/${id}` });
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
      topics: parseTopics(row.topics),
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

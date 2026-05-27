import express from 'express';
import db from '../db.js';
import { CODE_LIBRARY_CHAIN } from '../lib/referenceCatalog.js';

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

function parseLimit(limitParam, defaultLimit = 50, maxLimit = 200) {
  const parsed = Number.parseInt(limitParam, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultLimit;
  }

  return Math.min(parsed, maxLimit);
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

router.get('/overview', async (req, res) => {
  try {
    const [fieldCount, trackCount, occupationCount, industryCount, programCount, crosswalkCount, formCount, officeCount, authorityVersionCount, relationships] = await Promise.all([
      dbGet('SELECT COUNT(*) AS count FROM reference_field_library'),
      dbGet('SELECT COUNT(*) AS count FROM vrne_tracks'),
      dbGet('SELECT COUNT(*) AS count FROM occupation_profiles'),
      dbGet('SELECT COUNT(*) AS count FROM industry_profiles'),
      dbGet('SELECT COUNT(*) AS count FROM training_program_profiles'),
      dbGet('SELECT COUNT(*) AS count FROM cip_soc_crosswalks'),
      dbGet('SELECT COUNT(*) AS count FROM form_catalog'),
      dbGet('SELECT COUNT(*) AS count FROM regional_offices'),
      dbGet('SELECT COUNT(*) AS count FROM authority_versions'),
      dbAll('SELECT relationship_key, title, chain_json, rationale FROM reference_relationships ORDER BY title ASC')
    ]);

    res.json({
      chain: CODE_LIBRARY_CHAIN,
      counts: {
        fields: fieldCount.count,
        tracks: trackCount.count,
        occupations: occupationCount.count,
        industries: industryCount.count,
        trainingPrograms: programCount.count,
        crosswalks: crosswalkCount.count,
        forms: formCount.count,
        regionalOffices: officeCount.count,
        authorityVersions: authorityVersionCount.count
      },
      relationships: relationships.map((row) => ({
        relationshipKey: row.relationship_key,
        title: row.title,
        chain: parseJson(row.chain_json, []),
        rationale: row.rationale
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fields', async (req, res) => {
  try {
    const params = [];
    let sql = `
      SELECT field_key, category, label, what_it_does, why_it_matters, implementation_status
      FROM reference_field_library
      WHERE 1 = 1
    `;

    if (typeof req.query.category === 'string' && req.query.category.trim()) {
      sql += ' AND category = ?';
      params.push(req.query.category.trim());
    }

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(label) LIKE ? OR LOWER(what_it_does) LIKE ? OR LOWER(why_it_matters) LIKE ?)';
      params.push(q, q, q);
    }

    sql += ' ORDER BY category ASC, label ASC';

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      fieldKey: row.field_key,
      category: row.category,
      label: row.label,
      whatItDoes: row.what_it_does,
      whyItMatters: row.why_it_matters,
      implementationStatus: row.implementation_status
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tracks', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT id, title, summary, evidence_focus
      FROM vrne_tracks
      ORDER BY title ASC
    `);

    res.json(rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      evidenceFocus: row.evidence_focus
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/occupations', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 25, 100);
    const params = [];
    let sql = `
      SELECT *
      FROM occupation_profiles
      WHERE 1 = 1
    `;

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(ooh_group) LIKE ? OR LOWER(naics_code) LIKE ? OR LOWER(soc_code) LIKE ?)';
      params.push(q, q, q, q);
    }

    if (typeof req.query.naics === 'string' && req.query.naics.trim()) {
      sql += ' AND naics_code = ?';
      params.push(req.query.naics.trim());
    }

    if (typeof req.query.demand === 'string' && req.query.demand.trim()) {
      sql += ' AND physical_demand = ?';
      params.push(req.query.demand.trim());
    }

    sql += ' ORDER BY median_pay DESC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      id: row.id,
      title: row.title,
      socCode: row.soc_code,
      onetSocCode: row.onet_soc_code,
      oohGroup: row.ooh_group,
      educationLevel: row.education_level,
      dotCode: row.dot_code,
      svpLevel: row.svp_level,
      physicalDemand: row.physical_demand,
      sicCode: row.sic_code,
      naicsCode: row.naics_code,
      medianPay: row.median_pay,
      outlookText: row.outlook_text,
      dutiesText: row.duties_text,
      compatibilityTags: parseJson(row.compatibility_tags_json, []),
      sourceFreshnessTag: row.source_freshness_tag,
      authorityLevelTag: row.authority_level_tag
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/industries', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 25, 200);
    const params = [];
    let sql = `
      SELECT *
      FROM industry_profiles
      WHERE 1 = 1
    `;

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(keyword) LIKE ? OR LOWER(naics_code) LIKE ? OR LOWER(sic_code) LIKE ?)';
      params.push(q, q, q, q, q);
    }

    sql += ' ORDER BY title ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      id: row.id,
      title: row.title,
      sicCode: row.sic_code,
      naicsCode: row.naics_code,
      summary: row.summary,
      keyword: row.keyword,
      sourceFreshnessTag: row.source_freshness_tag
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/programs', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 25, 100);
    const params = [];
    let sql = `
      SELECT *
      FROM training_program_profiles
      WHERE 1 = 1
    `;

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(cip_code) LIKE ? OR LOWER(certification_focus) LIKE ?)';
      params.push(q, q, q);
    }

    sql += ' ORDER BY cip_code ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      id: row.id,
      cipCode: row.cip_code,
      title: row.title,
      credentialLevel: row.credential_level,
      programLengthHint: row.program_length_hint,
      licensureRequirement: row.licensure_requirement,
      certificationFocus: row.certification_focus,
      sourceFreshnessTag: row.source_freshness_tag,
      evidenceStatus: row.evidence_status
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/crosswalks', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 25, 100);
    const params = [];
    let sql = `
      SELECT *
      FROM cip_soc_crosswalks
      WHERE 1 = 1
    `;

    if (typeof req.query.cip === 'string' && req.query.cip.trim()) {
      sql += ' AND cip_code = ?';
      params.push(req.query.cip.trim());
    }

    if (typeof req.query.soc === 'string' && req.query.soc.trim()) {
      sql += ' AND soc_code = ?';
      params.push(req.query.soc.trim());
    }

    sql += ' ORDER BY cip_code ASC, soc_code ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      id: row.id,
      cipCode: row.cip_code,
      socCode: row.soc_code,
      occupationTitle: row.occupation_title,
      relationType: row.relation_type,
      evidenceStatus: row.evidence_status,
      sourceFreshnessTag: row.source_freshness_tag,
      notes: row.notes
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/forms', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 50, 200);
    const params = [];
    let sql = `
      SELECT *
      FROM form_catalog
      WHERE 1 = 1
    `;

    if (typeof req.query.categoryId === 'string' && req.query.categoryId.trim()) {
      sql += ' AND category_id = ?';
      params.push(req.query.categoryId.trim());
    }

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(form_number) LIKE ? OR LOWER(when_to_use) LIKE ?)';
      params.push(q, q, q);
    }

    sql += ' ORDER BY category_id ASC, title ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      id: row.id,
      formNumber: row.form_number,
      title: row.title,
      categoryId: row.category_id,
      categoryLabel: row.category_label,
      whoUses: row.who_uses,
      whenToUse: row.when_to_use,
      revisionDate: row.revision_date,
      sourceUrl: row.source_url,
      relatedWorkflow: row.related_workflow,
      formStatus: row.form_status,
      sourceFreshnessTag: row.source_freshness_tag
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/offices', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 50, 100);
    const params = [];
    let sql = `
      SELECT *
      FROM regional_offices
      WHERE 1 = 1
    `;

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(office_name) LIKE ? OR LOWER(address) LIKE ? OR LOWER(officer_name) LIKE ? OR LOWER(email) LIKE ?)';
      params.push(q, q, q, q);
    }

    sql += ' ORDER BY office_name ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      id: row.id,
      officeName: row.office_name,
      officerName: row.officer_name,
      address: row.address,
      phone: row.phone,
      email: row.email,
      jurisdictionNotes: row.jurisdiction_notes,
      outstations: parseJson(row.outstations_json, []),
      sourceFreshnessTag: row.source_freshness_tag
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/authority-versions', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 50, 200);
    const params = [];
    let sql = `
      SELECT authority_versions.*, authority_records.citation, authority_records.title
      FROM authority_versions
      LEFT JOIN authority_records ON authority_records.id = authority_versions.authority_id
      WHERE 1 = 1
    `;

    if (typeof req.query.authorityId === 'string' && req.query.authorityId.trim()) {
      sql += ' AND authority_versions.authority_id = ?';
      params.push(req.query.authorityId.trim());
    }

    sql += ' ORDER BY authority_versions.updated_at DESC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      id: row.id,
      authorityId: row.authority_id,
      citation: row.citation,
      title: row.title,
      versionLabel: row.version_label,
      sourceUrl: row.source_url,
      contentHash: row.content_hash,
      authorityLevel: row.authority_level,
      effectiveDate: row.effective_date,
      lastCheckedDate: row.last_checked_date,
      sourceFreshnessTag: row.source_freshness_tag,
      isCurrent: Boolean(row.is_current)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

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

function parseListParam(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(','))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function mapReferenceIndex(row) {
  return {
    id: row.id,
    namespace: row.namespace,
    code: row.code,
    title: row.title,
    description: row.description,
    parentCode: row.parent_code,
    hierarchyLevel: row.hierarchy_level,
    effectiveDate: row.effective_date,
    retiredDate: row.retired_date,
    sourceName: row.source_name,
    officialSourceLink: row.official_source_link,
    lastCheckedAt: row.last_checked_at,
    version: row.version,
    authorityLevel: row.authority_level,
    refreshFrequency: row.refresh_frequency
  };
}

function mapReferenceCrosswalk(row) {
  return {
    id: row.id,
    sourceNamespace: row.source_namespace,
    sourceCode: row.source_code,
    targetNamespace: row.target_namespace,
    targetCode: row.target_code,
    relationshipType: row.relationship_type,
    confidence: row.confidence,
    sourceLink: row.source_link,
    version: row.version,
    lastCheckedAt: row.last_checked_at
  };
}

function mapBusinessStrategy(row) {
  return {
    id: row.id,
    strategyCode: row.strategy_code,
    strategyName: row.strategy_name,
    parentFamily: row.parent_family,
    strategyLevel: row.strategy_level,
    definition: row.definition,
    whenToUse: row.when_to_use,
    whenNotToUse: row.when_not_to_use,
    relatedFramework: row.related_framework,
    upstreamIndexes: parseJson(row.upstream_indexes, []),
    downstreamIndexes: parseJson(row.downstream_indexes, []),
    keyMetrics: parseJson(row.key_metrics, []),
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    sourceType: row.source_type,
    evidenceRequired: row.evidence_required,
    exampleUseCase: row.example_use_case
  };
}

function mapWorkforceProgram(row) {
  return {
    id: row.id,
    programCode: row.program_code,
    programName: row.program_name,
    programFamily: row.program_family,
    programBucket: row.program_bucket,
    agency: row.agency,
    federalDepartment: row.federal_department,
    authority: row.authority,
    assistanceListingNumber: row.assistance_listing_number,
    targetPopulation: row.target_population,
    eligibilitySummary: row.eligibility_summary,
    benefitTypes: parseJson(row.benefit_types_json, []),
    trainingTypes: parseJson(row.training_types_json, []),
    administeredBy: row.administered_by,
    officialSource: row.official_source,
    stateSource: row.state_source,
    applicationPath: row.application_path,
    relatedIndexes: parseJson(row.related_indexes_json, []),
    relatedForms: parseJson(row.related_forms_json, []),
    deadlineRules: row.deadline_rules,
    evidenceRequired: row.evidence_required,
    lastVerifiedAt: row.last_verified_at,
    serviceScope: row.service_scope,
    priorityRank: row.priority_rank,
    matchFlags: parseJson(row.match_flags_json, { required: [], preferred: [], excluded: [] })
  };
}

function scoreWorkforceProgram(program, requestedFlags, requestedBenefitTypes, requestedTrainingTypes) {
  const requiredFlags = new Set(program.matchFlags.required || []);
  const preferredFlags = new Set(program.matchFlags.preferred || []);
  const excludedFlags = new Set(program.matchFlags.excluded || []);

  const matchedExcludedFlags = [...excludedFlags].filter((flag) => requestedFlags.has(flag));
  if (matchedExcludedFlags.length > 0) {
    return null;
  }

  const missingRequiredFlags = [...requiredFlags].filter((flag) => !requestedFlags.has(flag));
  if (missingRequiredFlags.length > 0) {
    return null;
  }

  const matchedRequiredFlags = [...requiredFlags].filter((flag) => requestedFlags.has(flag));
  const matchedPreferredFlags = [...preferredFlags].filter((flag) => requestedFlags.has(flag));
  const matchedBenefitTypes = program.benefitTypes.filter((benefitType) => requestedBenefitTypes.has(benefitType));
  const matchedTrainingTypes = program.trainingTypes.filter((trainingType) => requestedTrainingTypes.has(trainingType));
  const hasRequestedSignal = requestedFlags.size > 0 || requestedBenefitTypes.size > 0 || requestedTrainingTypes.size > 0;
  const hasMatchSignal =
    matchedRequiredFlags.length > 0 ||
    matchedPreferredFlags.length > 0 ||
    matchedBenefitTypes.length > 0 ||
    matchedTrainingTypes.length > 0;

  if (hasRequestedSignal && !hasMatchSignal) {
    return null;
  }

  const score =
    (matchedRequiredFlags.length * 30) +
    (matchedPreferredFlags.length * 12) +
    (matchedBenefitTypes.length * 6) +
    (matchedTrainingTypes.length * 5) +
    program.priorityRank;

  const reasons = [];
  if (matchedRequiredFlags.length > 0) {
    reasons.push(`Matches core eligibility flags: ${matchedRequiredFlags.join(', ')}`);
  }

  if (matchedPreferredFlags.length > 0) {
    reasons.push(`Matches supporting profile flags: ${matchedPreferredFlags.join(', ')}`);
  }

  if (matchedBenefitTypes.length > 0) {
    reasons.push(`Covers requested benefit types: ${matchedBenefitTypes.join(', ')}`);
  }

  if (matchedTrainingTypes.length > 0) {
    reasons.push(`Supports requested training modes: ${matchedTrainingTypes.join(', ')}`);
  }

  return {
    program,
    score,
    matchedRequiredFlags,
    matchedPreferredFlags,
    matchedBenefitTypes,
    matchedTrainingTypes,
    missingRequiredFlags,
    recommendationTier: score >= 55 ? 'primary' : score >= 28 ? 'secondary' : 'supportive',
    reasons
  };
}

router.get('/overview', async (req, res) => {
  try {
    const [
      fieldCount,
      trackCount,
      occupationCount,
      industryCount,
      programCount,
      crosswalkCount,
      formCount,
      officeCount,
      authorityVersionCount,
      referenceIndexCount,
      referenceCrosswalkCount,
      businessStrategyCount,
      workforceBenefitTypeCount,
      workforceTrainingTypeCount,
      workforceProfileFlagCount,
      workforceProgramCount,
      relationships,
      namespaceBreakdown,
      businessStrategyFamilies,
      workforceProgramBuckets
    ] = await Promise.all([
      dbGet('SELECT COUNT(*) AS count FROM reference_field_library'),
      dbGet('SELECT COUNT(*) AS count FROM vrne_tracks'),
      dbGet('SELECT COUNT(*) AS count FROM occupation_profiles'),
      dbGet('SELECT COUNT(*) AS count FROM industry_profiles'),
      dbGet('SELECT COUNT(*) AS count FROM training_program_profiles'),
      dbGet('SELECT COUNT(*) AS count FROM cip_soc_crosswalks'),
      dbGet('SELECT COUNT(*) AS count FROM form_catalog'),
      dbGet('SELECT COUNT(*) AS count FROM regional_offices'),
      dbGet('SELECT COUNT(*) AS count FROM authority_versions'),
      dbGet('SELECT COUNT(*) AS count FROM reference_indexes'),
      dbGet('SELECT COUNT(*) AS count FROM reference_crosswalks'),
      dbGet('SELECT COUNT(*) AS count FROM business_strategy_index'),
      dbGet('SELECT COUNT(*) AS count FROM workforce_benefit_types'),
      dbGet('SELECT COUNT(*) AS count FROM workforce_training_types'),
      dbGet('SELECT COUNT(*) AS count FROM workforce_profile_flags'),
      dbGet('SELECT COUNT(*) AS count FROM workforce_programs'),
      dbAll('SELECT relationship_key, title, chain_json, rationale FROM reference_relationships ORDER BY title ASC'),
      dbAll(`
        SELECT namespace, COUNT(*) AS count
        FROM reference_indexes
        GROUP BY namespace
        ORDER BY namespace ASC
      `),
      dbAll(`
        SELECT parent_family, COUNT(*) AS count
        FROM business_strategy_index
        GROUP BY parent_family
        ORDER BY parent_family ASC
      `),
      dbAll(`
        SELECT program_bucket, COUNT(*) AS count
        FROM workforce_programs
        GROUP BY program_bucket
        ORDER BY program_bucket ASC
      `)
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
        authorityVersions: authorityVersionCount.count,
        referenceIndexes: referenceIndexCount.count,
        referenceCrosswalks: referenceCrosswalkCount.count,
        businessStrategies: businessStrategyCount.count,
        workforceBenefitTypes: workforceBenefitTypeCount.count,
        workforceTrainingTypes: workforceTrainingTypeCount.count,
        workforceProfileFlags: workforceProfileFlagCount.count,
        workforcePrograms: workforceProgramCount.count
      },
      namespaceBreakdown: namespaceBreakdown.map((row) => ({
        namespace: row.namespace,
        count: row.count
      })),
      businessStrategyFamilies: businessStrategyFamilies.map((row) => ({
        parentFamily: row.parent_family,
        count: row.count
      })),
      workforceProgramBuckets: workforceProgramBuckets.map((row) => ({
        programBucket: row.program_bucket,
        count: row.count
      })),
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

router.get('/business-strategies', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 100, 300);
    const params = [];
    let sql = `
      SELECT *
      FROM business_strategy_index
      WHERE 1 = 1
    `;

    if (typeof req.query.parentFamily === 'string' && req.query.parentFamily.trim()) {
      sql += ' AND parent_family = ?';
      params.push(req.query.parentFamily.trim());
    }

    if (typeof req.query.strategyLevel === 'string' && req.query.strategyLevel.trim()) {
      sql += ' AND strategy_level = ?';
      params.push(req.query.strategyLevel.trim());
    }

    if (typeof req.query.sourceType === 'string' && req.query.sourceType.trim()) {
      sql += ' AND source_type = ?';
      params.push(req.query.sourceType.trim());
    }

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(strategy_code) LIKE ? OR LOWER(strategy_name) LIKE ? OR LOWER(definition) LIKE ? OR LOWER(related_framework) LIKE ?)';
      params.push(q, q, q, q);
    }

    sql += ' ORDER BY parent_family ASC, strategy_name ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map(mapBusinessStrategy));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/business-strategies/:strategyCode', async (req, res) => {
  try {
    const strategyCode = req.params.strategyCode.trim();
    const [strategyRow, relatedRows] = await Promise.all([
      dbGet(`
        SELECT *
        FROM business_strategy_index
        WHERE strategy_code = ?
      `, [strategyCode]),
      dbAll(`
        SELECT
          reference_crosswalks.*,
          reference_indexes.title AS target_title,
          reference_indexes.description AS target_description,
          reference_indexes.authority_level AS target_authority_level,
          reference_indexes.official_source_link AS target_source_link
        FROM reference_crosswalks
        LEFT JOIN reference_indexes
          ON reference_indexes.namespace = reference_crosswalks.target_namespace
         AND reference_indexes.code = reference_crosswalks.target_code
        WHERE reference_crosswalks.source_namespace = 'BIZ_STRATEGY'
          AND reference_crosswalks.source_code = ?
        ORDER BY reference_crosswalks.target_namespace ASC, reference_crosswalks.target_code ASC
      `, [strategyCode])
    ]);

    if (!strategyRow) {
      res.status(404).json({ error: `Business strategy not found for ${strategyCode}` });
      return;
    }

    res.json({
      strategy: mapBusinessStrategy(strategyRow),
      relatedIndexes: relatedRows.map((row) => ({
        ...mapReferenceCrosswalk(row),
        targetTitle: row.target_title || '',
        targetDescription: row.target_description || '',
        targetAuthorityLevel: row.target_authority_level || '',
        targetSourceLink: row.target_source_link || ''
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workforce-benefit-types', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT code, label, description
      FROM workforce_benefit_types
      ORDER BY label ASC
    `);

    res.json(rows.map((row) => ({
      code: row.code,
      label: row.label,
      description: row.description
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workforce-training-types', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT code, label, description
      FROM workforce_training_types
      ORDER BY label ASC
    `);

    res.json(rows.map((row) => ({
      code: row.code,
      label: row.label,
      description: row.description
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workforce-profile-flags', async (req, res) => {
  try {
    const params = [];
    let sql = `
      SELECT flag_key, label, category, question_prompt, description
      FROM workforce_profile_flags
      WHERE 1 = 1
    `;

    if (typeof req.query.category === 'string' && req.query.category.trim()) {
      sql += ' AND category = ?';
      params.push(req.query.category.trim());
    }

    sql += ' ORDER BY category ASC, label ASC';

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      flagKey: row.flag_key,
      label: row.label,
      category: row.category,
      questionPrompt: row.question_prompt,
      description: row.description
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workforce-program-crosswalks', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 100, 600);
    const params = [];
    let sql = `
      SELECT
        workforce_program_crosswalks.*,
        reference_indexes.title AS target_title,
        reference_indexes.description AS target_description,
        reference_indexes.authority_level AS target_authority_level,
        reference_indexes.official_source_link AS target_source_link
      FROM workforce_program_crosswalks
      LEFT JOIN reference_indexes
        ON reference_indexes.namespace = workforce_program_crosswalks.target_namespace
       AND reference_indexes.code = workforce_program_crosswalks.target_code
      WHERE 1 = 1
    `;

    if (typeof req.query.programCode === 'string' && req.query.programCode.trim()) {
      sql += ' AND workforce_program_crosswalks.program_code = ?';
      params.push(req.query.programCode.trim());
    }

    if (typeof req.query.relationType === 'string' && req.query.relationType.trim()) {
      sql += ' AND workforce_program_crosswalks.relation_type = ?';
      params.push(req.query.relationType.trim());
    }

    if (typeof req.query.targetNamespace === 'string' && req.query.targetNamespace.trim()) {
      sql += ' AND workforce_program_crosswalks.target_namespace = ?';
      params.push(req.query.targetNamespace.trim().toUpperCase());
    }

    if (typeof req.query.targetCode === 'string' && req.query.targetCode.trim()) {
      sql += ' AND workforce_program_crosswalks.target_code = ?';
      params.push(req.query.targetCode.trim());
    }

    sql += ' ORDER BY workforce_program_crosswalks.program_code ASC, workforce_program_crosswalks.relation_type ASC, workforce_program_crosswalks.target_namespace ASC, workforce_program_crosswalks.target_code ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map((row) => ({
      id: row.id,
      programCode: row.program_code,
      relationType: row.relation_type,
      targetNamespace: row.target_namespace,
      targetCode: row.target_code,
      notes: row.notes,
      confidence: row.confidence,
      targetTitle: row.target_title || '',
      targetDescription: row.target_description || '',
      targetAuthorityLevel: row.target_authority_level || '',
      targetSourceLink: row.target_source_link || ''
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workforce-programs', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 50, 200);
    const params = [];
    let sql = `
      SELECT workforce_programs.*
      FROM workforce_programs
      WHERE 1 = 1
    `;

    if (typeof req.query.programBucket === 'string' && req.query.programBucket.trim()) {
      sql += ' AND workforce_programs.program_bucket = ?';
      params.push(req.query.programBucket.trim());
    }

    if (typeof req.query.programFamily === 'string' && req.query.programFamily.trim()) {
      sql += ' AND workforce_programs.program_family = ?';
      params.push(req.query.programFamily.trim());
    }

    if (typeof req.query.federalDepartment === 'string' && req.query.federalDepartment.trim()) {
      sql += ' AND workforce_programs.federal_department = ?';
      params.push(req.query.federalDepartment.trim());
    }

    if (typeof req.query.agency === 'string' && req.query.agency.trim()) {
      sql += ' AND workforce_programs.agency = ?';
      params.push(req.query.agency.trim());
    }

    if (typeof req.query.serviceScope === 'string' && req.query.serviceScope.trim()) {
      sql += ' AND workforce_programs.service_scope = ?';
      params.push(req.query.serviceScope.trim());
    }

    if (typeof req.query.benefitType === 'string' && req.query.benefitType.trim()) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM workforce_program_crosswalks AS benefit_crosswalk
          WHERE benefit_crosswalk.program_code = workforce_programs.program_code
            AND benefit_crosswalk.target_namespace = 'BENEFIT_TYPE'
            AND benefit_crosswalk.target_code = ?
        )
      `;
      params.push(req.query.benefitType.trim());
    }

    if (typeof req.query.trainingType === 'string' && req.query.trainingType.trim()) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM workforce_program_crosswalks AS training_crosswalk
          WHERE training_crosswalk.program_code = workforce_programs.program_code
            AND training_crosswalk.target_namespace = 'TRAINING_TYPE'
            AND training_crosswalk.target_code = ?
        )
      `;
      params.push(req.query.trainingType.trim());
    }

    if (typeof req.query.profileFlag === 'string' && req.query.profileFlag.trim()) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM workforce_program_crosswalks AS flag_crosswalk
          WHERE flag_crosswalk.program_code = workforce_programs.program_code
            AND flag_crosswalk.target_namespace = 'PROFILE_FLAG'
            AND flag_crosswalk.target_code = ?
        )
      `;
      params.push(req.query.profileFlag.trim());
    }

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += `
        AND (
          LOWER(workforce_programs.program_code) LIKE ?
          OR LOWER(workforce_programs.program_name) LIKE ?
          OR LOWER(workforce_programs.program_family) LIKE ?
          OR LOWER(workforce_programs.target_population) LIKE ?
          OR LOWER(workforce_programs.eligibility_summary) LIKE ?
          OR EXISTS (
            SELECT 1
            FROM workforce_program_aliases
            WHERE workforce_program_aliases.program_code = workforce_programs.program_code
              AND LOWER(workforce_program_aliases.alias) LIKE ?
          )
        )
      `;
      params.push(q, q, q, q, q, q);
    }

    sql += ' ORDER BY workforce_programs.program_bucket ASC, workforce_programs.priority_rank DESC, workforce_programs.program_name ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map(mapWorkforceProgram));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workforce-programs/:programCode', async (req, res) => {
  try {
    const programCode = req.params.programCode.trim();
    const [programRow, aliasRows, crosswalkRows] = await Promise.all([
      dbGet(`
        SELECT *
        FROM workforce_programs
        WHERE program_code = ?
      `, [programCode]),
      dbAll(`
        SELECT alias
        FROM workforce_program_aliases
        WHERE program_code = ?
        ORDER BY alias ASC
      `, [programCode]),
      dbAll(`
        SELECT
          workforce_program_crosswalks.*,
          reference_indexes.title AS target_title,
          reference_indexes.description AS target_description,
          reference_indexes.authority_level AS target_authority_level,
          reference_indexes.official_source_link AS target_source_link
        FROM workforce_program_crosswalks
        LEFT JOIN reference_indexes
          ON reference_indexes.namespace = workforce_program_crosswalks.target_namespace
         AND reference_indexes.code = workforce_program_crosswalks.target_code
        WHERE workforce_program_crosswalks.program_code = ?
        ORDER BY workforce_program_crosswalks.relation_type ASC, workforce_program_crosswalks.target_namespace ASC, workforce_program_crosswalks.target_code ASC
      `, [programCode])
    ]);

    if (!programRow) {
      res.status(404).json({ error: `Workforce program not found for ${programCode}` });
      return;
    }

    res.json({
      program: mapWorkforceProgram(programRow),
      aliases: aliasRows.map((row) => row.alias),
      crosswalks: crosswalkRows.map((row) => ({
        id: row.id,
        programCode: row.program_code,
        relationType: row.relation_type,
        targetNamespace: row.target_namespace,
        targetCode: row.target_code,
        notes: row.notes,
        confidence: row.confidence,
        targetTitle: row.target_title || '',
        targetDescription: row.target_description || '',
        targetAuthorityLevel: row.target_authority_level || '',
        targetSourceLink: row.target_source_link || ''
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function handleWorkforceProgramMatch(source, res) {
  try {
    const requestedFlags = new Set(parseListParam(source.flags));
    const requestedBenefitTypes = new Set(parseListParam(source.benefitTypes));
    const requestedTrainingTypes = new Set(parseListParam(source.trainingTypes));
    const limit = parseLimit(source.limit, 10, 50);
    const rows = await dbAll(`
      SELECT *
      FROM workforce_programs
      ORDER BY priority_rank DESC, program_name ASC
    `);

    const matches = rows
      .map(mapWorkforceProgram)
      .map((program) => scoreWorkforceProgram(program, requestedFlags, requestedBenefitTypes, requestedTrainingTypes))
      .filter(Boolean)
      .sort((left, right) => right.score - left.score || right.program.priorityRank - left.program.priorityRank || left.program.programName.localeCompare(right.program.programName))
      .slice(0, limit);

    res.json({
      requestedFlags: [...requestedFlags],
      requestedBenefitTypes: [...requestedBenefitTypes],
      requestedTrainingTypes: [...requestedTrainingTypes],
      matches
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

router.get('/workforce-program-match', async (req, res) => {
  await handleWorkforceProgramMatch(req.query, res);
});

router.post('/workforce-program-match', async (req, res) => {
  await handleWorkforceProgramMatch(req.body || {}, res);
});

router.get('/indexes', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 100, 400);
    const params = [];
    let sql = `
      SELECT *
      FROM reference_indexes
      WHERE 1 = 1
    `;

    if (typeof req.query.namespace === 'string' && req.query.namespace.trim()) {
      sql += ' AND namespace = ?';
      params.push(req.query.namespace.trim().toUpperCase());
    }

    if (typeof req.query.code === 'string' && req.query.code.trim()) {
      sql += ' AND code = ?';
      params.push(req.query.code.trim());
    }

    if (typeof req.query.parentCode === 'string' && req.query.parentCode.trim()) {
      sql += ' AND parent_code = ?';
      params.push(req.query.parentCode.trim());
    }

    if (typeof req.query.authorityLevel === 'string' && req.query.authorityLevel.trim()) {
      sql += ' AND authority_level = ?';
      params.push(req.query.authorityLevel.trim());
    }

    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const q = `%${req.query.q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(code) LIKE ? OR LOWER(title) LIKE ? OR LOWER(description) LIKE ?)';
      params.push(q, q, q);
    }

    sql += ' ORDER BY namespace ASC, hierarchy_level ASC, title ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map(mapReferenceIndex));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/indexes/:namespace/:code', async (req, res) => {
  try {
    const namespace = req.params.namespace.trim().toUpperCase();
    const code = req.params.code.trim();
    const [row, outboundRows, inboundRows] = await Promise.all([
      dbGet(`
        SELECT *
        FROM reference_indexes
        WHERE namespace = ? AND code = ?
      `, [namespace, code]),
      dbAll(`
        SELECT *
        FROM reference_crosswalks
        WHERE source_namespace = ? AND source_code = ?
        ORDER BY target_namespace ASC, target_code ASC
      `, [namespace, code]),
      dbAll(`
        SELECT *
        FROM reference_crosswalks
        WHERE target_namespace = ? AND target_code = ?
        ORDER BY source_namespace ASC, source_code ASC
      `, [namespace, code])
    ]);

    if (!row) {
      res.status(404).json({ error: `Reference index not found for ${namespace}:${code}` });
      return;
    }

    res.json({
      index: mapReferenceIndex(row),
      outboundCrosswalks: outboundRows.map(mapReferenceCrosswalk),
      inboundCrosswalks: inboundRows.map(mapReferenceCrosswalk)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reference-crosswalks', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 100, 500);
    const params = [];
    let sql = `
      SELECT *
      FROM reference_crosswalks
      WHERE 1 = 1
    `;

    if (typeof req.query.sourceNamespace === 'string' && req.query.sourceNamespace.trim()) {
      sql += ' AND source_namespace = ?';
      params.push(req.query.sourceNamespace.trim().toUpperCase());
    }

    if (typeof req.query.sourceCode === 'string' && req.query.sourceCode.trim()) {
      sql += ' AND source_code = ?';
      params.push(req.query.sourceCode.trim());
    }

    if (typeof req.query.targetNamespace === 'string' && req.query.targetNamespace.trim()) {
      sql += ' AND target_namespace = ?';
      params.push(req.query.targetNamespace.trim().toUpperCase());
    }

    if (typeof req.query.targetCode === 'string' && req.query.targetCode.trim()) {
      sql += ' AND target_code = ?';
      params.push(req.query.targetCode.trim());
    }

    if (typeof req.query.relationshipType === 'string' && req.query.relationshipType.trim()) {
      sql += ' AND relationship_type = ?';
      params.push(req.query.relationshipType.trim());
    }

    sql += ' ORDER BY source_namespace ASC, source_code ASC, target_namespace ASC, target_code ASC LIMIT ?';
    params.push(limit);

    const rows = await dbAll(sql, params);
    res.json(rows.map(mapReferenceCrosswalk));
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

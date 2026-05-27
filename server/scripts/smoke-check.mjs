import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const smokeDbPath = path.join(tmpdir(), `vocrehab-smoke-${randomUUID()}.db`);
process.env.DATABASE_PATH = smokeDbPath;

const { default: db } = await import('../db.js');

const REQUIRED_TABLES = [
  'authority_records',
  'user_state',
  'user_state_scoped',
  'plan_drafts',
  'case_issue_taxonomy',
  'case_records',
  'case_deadlines',
  'case_activities',
  'case_documents',
  'reference_field_library',
  'reference_relationships',
  'reference_indexes',
  'reference_crosswalks',
  'business_strategy_index',
  'workforce_benefit_types',
  'workforce_training_types',
  'workforce_profile_flags',
  'workforce_programs',
  'workforce_program_aliases',
  'workforce_program_crosswalks',
  'vrne_tracks',
  'occupation_profiles',
  'industry_profiles',
  'training_program_profiles',
  'cip_soc_crosswalks',
  'form_catalog',
  'regional_offices',
  'authority_versions'
];

const REQUIRED_SEEDED_TABLES = [
  ['case_issue_taxonomy', 1],
  ['reference_field_library', 1],
  ['reference_indexes', 1],
  ['reference_crosswalks', 1],
  ['business_strategy_index', 1],
  ['workforce_benefit_types', 1],
  ['workforce_training_types', 1],
  ['workforce_profile_flags', 1],
  ['workforce_programs', 1],
  ['workforce_program_crosswalks', 1],
  ['vrne_tracks', 1],
  ['occupation_profiles', 1],
  ['industry_profiles', 1],
  ['form_catalog', 1],
  ['regional_offices', 1]
];

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

function closeDb() {
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

try {
  const tableRows = await dbAll(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
  `);
  const tableNames = new Set(tableRows.map((row) => row.name));
  const missingTables = REQUIRED_TABLES.filter((tableName) => !tableNames.has(tableName));

  if (missingTables.length > 0) {
    throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
  }

  const seededCounts = {};
  for (const [tableName, minimumCount] of REQUIRED_SEEDED_TABLES) {
    const row = await dbGet(`SELECT COUNT(*) AS count FROM ${tableName}`);
    seededCounts[tableName] = row.count;

    if (row.count < minimumCount) {
      throw new Error(`Expected at least ${minimumCount} row(s) in ${tableName}, found ${row.count}.`);
    }
  }

  const authorityRow = await dbGet('SELECT COUNT(*) AS count FROM authority_records');

  console.log(JSON.stringify({
    ok: true,
    databasePath: smokeDbPath,
    authorityRecords: authorityRow.count,
    seededCounts
  }, null, 2));
} finally {
  await closeDb();
  await Promise.allSettled([
    fs.rm(smokeDbPath, { force: true }),
    fs.rm(`${smokeDbPath}-wal`, { force: true }),
    fs.rm(`${smokeDbPath}-shm`, { force: true })
  ]);
}

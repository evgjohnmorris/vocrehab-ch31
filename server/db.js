import sqlite3 from 'sqlite3';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { seedCaseIssueTaxonomy } from './lib/caseManagement.js';
import { seedWorkforceProgramCatalog } from './lib/programCatalog.js';
import { seedReferenceCatalog } from './lib/referenceCatalog.js';
import { LEGACY_USER_SCOPE } from './lib/userState.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, process.env.DATABASE_PATH || 'm28c_guide.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Serialize database initializations
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA synchronous = NORMAL');
  db.run('PRAGMA busy_timeout = 5000');

  // 1. Create authority_records table
  db.run(`
    CREATE TABLE IF NOT EXISTS authority_records (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      citation TEXT NOT NULL,
      title TEXT NOT NULL,
      full_text TEXT,
      topics TEXT, -- stored as JSON string
      hash TEXT,
      authority_level TEXT,
      status TEXT,
      source_url TEXT,
      plain_english TEXT,
      veteran_use TEXT
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_authority_records_type ON authority_records(type)');

  // 2. Preserve the legacy user_state table if it exists, but write all new data to a scoped table.
  db.run(`
    CREATE TABLE IF NOT EXISTS user_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_state_scoped (
      scope TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (scope, key)
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_user_state_scoped_updated_at ON user_state_scoped(updated_at)');
  db.run(`
    INSERT OR IGNORE INTO user_state_scoped (scope, key, value, updated_at)
    SELECT '${LEGACY_USER_SCOPE}', key, value, updated_at
    FROM user_state
  `);

  // 3. Persist scoped workspace drafts.
  db.run(`
    CREATE TABLE IF NOT EXISTS plan_drafts (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL,
      draft_type TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(scope, draft_type)
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_plan_drafts_scope_updated_at ON plan_drafts(scope, updated_at DESC)');
  db.run('CREATE INDEX IF NOT EXISTS idx_plan_drafts_scope_type ON plan_drafts(scope, draft_type)');

  // 4. Create case-management tables for structured veteran records and workflow taxonomy.
  db.run(`
    CREATE TABLE IF NOT EXISTS case_issue_taxonomy (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL,
      track TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      dashboard_enabled INTEGER NOT NULL DEFAULT 0,
      workflow_json TEXT NOT NULL,
      authority_refs TEXT NOT NULL,
      last_reviewed_at TEXT NOT NULL,
      source_status TEXT NOT NULL DEFAULT 'maintainer_verified',
      content_version INTEGER NOT NULL DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_case_issue_taxonomy_dashboard ON case_issue_taxonomy(dashboard_enabled, title)');

  db.run(`
    CREATE TABLE IF NOT EXISTS case_records (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      veteran_name TEXT NOT NULL DEFAULT '',
      claimant_reference TEXT NOT NULL DEFAULT '',
      counselor_name TEXT NOT NULL DEFAULT '',
      regional_office TEXT NOT NULL DEFAULT '',
      school_name TEXT NOT NULL DEFAULT '',
      issue_type_id TEXT NOT NULL,
      case_stage TEXT NOT NULL,
      track TEXT NOT NULL DEFAULT '',
      ipe_status TEXT NOT NULL DEFAULT '',
      issue_summary TEXT NOT NULL DEFAULT '',
      dispute_history TEXT NOT NULL DEFAULT '',
      escalation_history TEXT NOT NULL DEFAULT '',
      evidence_summary TEXT NOT NULL DEFAULT '',
      decision_notice_date TEXT NOT NULL DEFAULT '',
      follow_up_deadline_date TEXT NOT NULL DEFAULT '',
      created_from_workflow_id TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(issue_type_id) REFERENCES case_issue_taxonomy(id) ON DELETE RESTRICT
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_case_records_issue_stage ON case_records(issue_type_id, case_stage)');
  db.run('CREATE INDEX IF NOT EXISTS idx_case_records_updated_at ON case_records(updated_at DESC)');

  db.run(`
    CREATE TABLE IF NOT EXISTS case_deadlines (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      source TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(case_id) REFERENCES case_records(id) ON DELETE CASCADE
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_case_deadlines_case_due_date ON case_deadlines(case_id, due_date)');

  db.run(`
    CREATE TABLE IF NOT EXISTS case_activities (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      activity_type TEXT NOT NULL DEFAULT 'note',
      occurred_at TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL,
      response_status TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(case_id) REFERENCES case_records(id) ON DELETE CASCADE
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_case_activities_case_occurred_at ON case_activities(case_id, occurred_at DESC, created_at DESC)');

  db.run(`
    CREATE TABLE IF NOT EXISTS case_documents (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      document_type TEXT NOT NULL,
      title TEXT NOT NULL,
      template_id TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      generated_body TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(case_id) REFERENCES case_records(id) ON DELETE CASCADE
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_case_documents_case_created_at ON case_documents(case_id, created_at DESC)');

  // 5. Create backend code-library tables for occupations, programs, forms, contacts, and authority versions.
  db.run(`
    CREATE TABLE IF NOT EXISTS reference_field_library (
      field_key TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      label TEXT NOT NULL,
      what_it_does TEXT NOT NULL,
      why_it_matters TEXT NOT NULL,
      implementation_status TEXT NOT NULL DEFAULT 'planned',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_reference_field_library_category ON reference_field_library(category, label)');

  db.run(`
    CREATE TABLE IF NOT EXISTS reference_relationships (
      relationship_key TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      chain_json TEXT NOT NULL,
      rationale TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reference_indexes (
      id TEXT PRIMARY KEY,
      namespace TEXT NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      parent_code TEXT NOT NULL DEFAULT '',
      hierarchy_level INTEGER NOT NULL DEFAULT 0,
      effective_date TEXT NOT NULL DEFAULT '',
      retired_date TEXT NOT NULL DEFAULT '',
      source_name TEXT NOT NULL DEFAULT '',
      official_source_link TEXT NOT NULL DEFAULT '',
      last_checked_at TEXT NOT NULL DEFAULT '',
      version TEXT NOT NULL DEFAULT '',
      authority_level TEXT NOT NULL DEFAULT 'federal_data',
      refresh_frequency TEXT NOT NULL DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(namespace, code)
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_reference_indexes_namespace_code ON reference_indexes(namespace, code)');
  db.run('CREATE INDEX IF NOT EXISTS idx_reference_indexes_parent_code ON reference_indexes(parent_code)');

  db.run(`
    CREATE TABLE IF NOT EXISTS reference_crosswalks (
      id TEXT PRIMARY KEY,
      source_namespace TEXT NOT NULL,
      source_code TEXT NOT NULL,
      target_namespace TEXT NOT NULL,
      target_code TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0,
      source_link TEXT NOT NULL DEFAULT '',
      version TEXT NOT NULL DEFAULT '',
      last_checked_at TEXT NOT NULL DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(source_namespace, source_code, target_namespace, target_code, relationship_type)
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_reference_crosswalks_source ON reference_crosswalks(source_namespace, source_code)');
  db.run('CREATE INDEX IF NOT EXISTS idx_reference_crosswalks_target ON reference_crosswalks(target_namespace, target_code)');

  db.run(`
    CREATE TABLE IF NOT EXISTS business_strategy_index (
      id TEXT PRIMARY KEY,
      strategy_code TEXT NOT NULL UNIQUE,
      strategy_name TEXT NOT NULL,
      parent_family TEXT NOT NULL,
      strategy_level TEXT NOT NULL,
      definition TEXT NOT NULL,
      when_to_use TEXT NOT NULL DEFAULT '',
      when_not_to_use TEXT NOT NULL DEFAULT '',
      related_framework TEXT NOT NULL DEFAULT '',
      upstream_indexes TEXT NOT NULL DEFAULT '[]',
      downstream_indexes TEXT NOT NULL DEFAULT '[]',
      key_metrics TEXT NOT NULL DEFAULT '[]',
      source_name TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL DEFAULT '',
      source_type TEXT NOT NULL DEFAULT 'practitioner',
      evidence_required TEXT NOT NULL DEFAULT '',
      example_use_case TEXT NOT NULL DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_business_strategy_family_level ON business_strategy_index(parent_family, strategy_level, strategy_name)');

  db.run(`
    CREATE TABLE IF NOT EXISTS workforce_benefit_types (
      code TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS workforce_training_types (
      code TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS workforce_profile_flags (
      flag_key TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      category TEXT NOT NULL,
      question_prompt TEXT NOT NULL,
      description TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_workforce_profile_flags_category ON workforce_profile_flags(category, label)');

  db.run(`
    CREATE TABLE IF NOT EXISTS workforce_programs (
      id TEXT PRIMARY KEY,
      program_code TEXT NOT NULL UNIQUE,
      program_name TEXT NOT NULL,
      program_family TEXT NOT NULL,
      program_bucket TEXT NOT NULL,
      agency TEXT NOT NULL,
      federal_department TEXT NOT NULL,
      authority TEXT NOT NULL,
      assistance_listing_number TEXT NOT NULL DEFAULT '',
      target_population TEXT NOT NULL,
      eligibility_summary TEXT NOT NULL,
      benefit_types_json TEXT NOT NULL DEFAULT '[]',
      training_types_json TEXT NOT NULL DEFAULT '[]',
      administered_by TEXT NOT NULL DEFAULT '',
      official_source TEXT NOT NULL DEFAULT '',
      state_source TEXT NOT NULL DEFAULT '',
      application_path TEXT NOT NULL DEFAULT '',
      related_indexes_json TEXT NOT NULL DEFAULT '[]',
      related_forms_json TEXT NOT NULL DEFAULT '[]',
      deadline_rules TEXT NOT NULL DEFAULT '',
      evidence_required TEXT NOT NULL DEFAULT '',
      last_verified_at TEXT NOT NULL DEFAULT '',
      service_scope TEXT NOT NULL DEFAULT 'federal',
      priority_rank INTEGER NOT NULL DEFAULT 5,
      match_flags_json TEXT NOT NULL DEFAULT '{"required":[],"preferred":[],"excluded":[]}',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_workforce_programs_bucket_family ON workforce_programs(program_bucket, program_family, program_name)');
  db.run('CREATE INDEX IF NOT EXISTS idx_workforce_programs_department ON workforce_programs(federal_department, agency)');

  db.run(`
    CREATE TABLE IF NOT EXISTS workforce_program_aliases (
      id TEXT PRIMARY KEY,
      program_code TEXT NOT NULL,
      alias TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(program_code, alias),
      FOREIGN KEY(program_code) REFERENCES workforce_programs(program_code) ON DELETE CASCADE
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_workforce_program_aliases_alias ON workforce_program_aliases(alias)');

  db.run(`
    CREATE TABLE IF NOT EXISTS workforce_program_crosswalks (
      id TEXT PRIMARY KEY,
      program_code TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      target_namespace TEXT NOT NULL,
      target_code TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      confidence REAL NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(program_code, relation_type, target_namespace, target_code),
      FOREIGN KEY(program_code) REFERENCES workforce_programs(program_code) ON DELETE CASCADE
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_workforce_program_crosswalks_program ON workforce_program_crosswalks(program_code, relation_type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_workforce_program_crosswalks_target ON workforce_program_crosswalks(target_namespace, target_code)');

  db.run(`
    CREATE TABLE IF NOT EXISTS vrne_tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      evidence_focus TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS occupation_profiles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      soc_code TEXT NOT NULL,
      onet_soc_code TEXT NOT NULL,
      ooh_group TEXT NOT NULL,
      education_level TEXT NOT NULL,
      dot_code TEXT NOT NULL,
      svp_level INTEGER NOT NULL,
      physical_demand TEXT NOT NULL,
      sic_code TEXT NOT NULL,
      naics_code TEXT NOT NULL,
      median_pay INTEGER NOT NULL DEFAULT 0,
      outlook_text TEXT NOT NULL,
      duties_text TEXT NOT NULL,
      compatibility_tags_json TEXT NOT NULL,
      source_freshness_tag TEXT NOT NULL DEFAULT 'repo_curated',
      authority_level_tag TEXT NOT NULL DEFAULT 'occupational_evidence',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_occupation_profiles_soc ON occupation_profiles(soc_code)');
  db.run('CREATE INDEX IF NOT EXISTS idx_occupation_profiles_naics ON occupation_profiles(naics_code)');

  db.run(`
    CREATE TABLE IF NOT EXISTS industry_profiles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      sic_code TEXT NOT NULL,
      naics_code TEXT NOT NULL,
      summary TEXT NOT NULL,
      keyword TEXT NOT NULL DEFAULT '',
      source_freshness_tag TEXT NOT NULL DEFAULT 'repo_curated',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_industry_profiles_naics ON industry_profiles(naics_code)');

  db.run(`
    CREATE TABLE IF NOT EXISTS training_program_profiles (
      id TEXT PRIMARY KEY,
      cip_code TEXT NOT NULL,
      title TEXT NOT NULL,
      credential_level TEXT NOT NULL,
      program_length_hint TEXT NOT NULL DEFAULT '',
      licensure_requirement TEXT NOT NULL DEFAULT '',
      certification_focus TEXT NOT NULL DEFAULT '',
      source_freshness_tag TEXT NOT NULL DEFAULT 'needs_verification',
      evidence_status TEXT NOT NULL DEFAULT 'curated_example',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_training_program_profiles_cip ON training_program_profiles(cip_code)');

  db.run(`
    CREATE TABLE IF NOT EXISTS cip_soc_crosswalks (
      id TEXT PRIMARY KEY,
      cip_code TEXT NOT NULL,
      soc_code TEXT NOT NULL,
      occupation_title TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      evidence_status TEXT NOT NULL DEFAULT 'curated_example',
      source_freshness_tag TEXT NOT NULL DEFAULT 'needs_verification',
      notes TEXT NOT NULL DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_cip_soc_crosswalks_cip ON cip_soc_crosswalks(cip_code, soc_code)');

  db.run(`
    CREATE TABLE IF NOT EXISTS form_catalog (
      id TEXT PRIMARY KEY,
      form_number TEXT NOT NULL,
      title TEXT NOT NULL,
      category_id TEXT NOT NULL,
      category_label TEXT NOT NULL,
      who_uses TEXT NOT NULL DEFAULT '',
      when_to_use TEXT NOT NULL DEFAULT '',
      revision_date TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL DEFAULT '',
      related_workflow TEXT NOT NULL DEFAULT '',
      form_status TEXT NOT NULL DEFAULT '',
      source_freshness_tag TEXT NOT NULL DEFAULT 'repo_curated',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_form_catalog_category ON form_catalog(category_id, title)');

  db.run(`
    CREATE TABLE IF NOT EXISTS regional_offices (
      id TEXT PRIMARY KEY,
      office_name TEXT NOT NULL,
      officer_name TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      jurisdiction_notes TEXT NOT NULL DEFAULT '',
      outstations_json TEXT NOT NULL DEFAULT '[]',
      source_freshness_tag TEXT NOT NULL DEFAULT 'repo_curated',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_regional_offices_name ON regional_offices(office_name)');

  db.run(`
    CREATE TABLE IF NOT EXISTS authority_versions (
      id TEXT PRIMARY KEY,
      authority_id TEXT NOT NULL,
      version_label TEXT NOT NULL,
      source_url TEXT NOT NULL DEFAULT '',
      content_hash TEXT NOT NULL DEFAULT '',
      authority_level TEXT NOT NULL DEFAULT '',
      effective_date TEXT NOT NULL DEFAULT '',
      last_checked_date TEXT NOT NULL DEFAULT '',
      source_freshness_tag TEXT NOT NULL DEFAULT 'current',
      is_current INTEGER NOT NULL DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(authority_id) REFERENCES authority_records(id) ON DELETE CASCADE
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_authority_versions_authority_current ON authority_versions(authority_id, is_current)');

  seedCaseIssueTaxonomy(db);
  seedReferenceCatalog(db);
  seedWorkforceProgramCatalog(db);
  db.run(`
    INSERT OR IGNORE INTO authority_versions (
      id,
      authority_id,
      version_label,
      source_url,
      content_hash,
      authority_level,
      effective_date,
      last_checked_date,
      source_freshness_tag,
      is_current,
      updated_at
    )
    SELECT
      id || ':seed-v1',
      id,
      'seed-v1',
      COALESCE(source_url, ''),
      COALESCE(hash, ''),
      COALESCE(authority_level, ''),
      '',
      DATE('now'),
      'repo_curated',
      1,
      CURRENT_TIMESTAMP
    FROM authority_records
  `);

  // 6. Create FTS5 virtual table for searching if supported
  db.run(`
    CREATE VIRTUAL TABLE IF NOT EXISTS authority_search_idx USING fts5(
      id,
      citation,
      title,
      full_text,
      content='authority_records',
      content_rowid='rowid'
    )
  `, (err) => {
    if (err) {
      console.warn('FTS5 virtual search index creation skipped/not supported, fallback to standard queries:', err.message);
    } else {
      console.log('FTS5 search index table created/verified.');
    }
  });
});

export default db;
export { dbPath };

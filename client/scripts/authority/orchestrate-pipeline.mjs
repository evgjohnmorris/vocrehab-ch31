import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CACHE_DIR = path.join(PROJECT_ROOT, '.tmp/cache');

// Parse CLI Arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isClean = args.includes('--clean');
const stageIndex = args.indexOf('--stage');
const selectedStage = stageIndex !== -1 ? args[stageIndex + 1] : null;

// Pipeline definition
const INGESTION_SCRIPTS = [
  { name: 'U.S. Code Ingestion', path: 'scripts/authority/ingest-usc-ch31.mjs' },
  { name: 'CFR Ingestion', path: 'scripts/authority/ingest-cfr-part21-subpart-a.mjs' },
  { name: 'M28C Ingestion', path: 'scripts/authority/ingest-m28c-knowva.mjs' },
  { name: 'Generate Manifest', path: 'scripts/authority/generate-manifest.mjs' },
  { name: 'Distribute Corpus', path: 'scripts/legal/distribute-corpus.mjs' },
  { name: 'Build eCFR Title Directory', path: 'scripts/authority/build-ecfr-title-directory.mjs' }
];

const VALIDATION_SCRIPTS = [
  { name: 'Schema Validation', path: 'scripts/legal/validate-authority-schema.mjs' },
  { name: 'Topic Coverage Check', path: 'scripts/legal/check-topic-coverage.mjs' },
  { name: 'Audit Citations', path: 'scripts/legal/audit-citations.mjs' },
  { name: 'Audit Modal Verbs', path: 'scripts/legal/audit-modal-verbs.mjs' },
  { name: 'Audit Workflows', path: 'scripts/legal/audit-workflows.mjs' }
];

const DIFF_SCRIPTS = [
  { name: 'Source Diff Generator', path: 'scripts/authority/diff/build-source-diff.mjs' }
];

function cleanCache() {
  logger.info(`Cleaning cache directory: ${CACHE_DIR}...`);
  if (isDryRun) {
    logger.info(`[DRY RUN] Would delete cache files in ${CACHE_DIR}`);
    return;
  }
  if (fs.existsSync(CACHE_DIR)) {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
    logger.success('Cache cleared successfully.');
  } else {
    logger.info('No cache directory found to clear.');
  }
}

function runScript(script) {
  logger.info(`Running stage: ${script.name}...`);
  const fullPath = path.join(PROJECT_ROOT, script.path);

  if (isDryRun) {
    logger.info(`[DRY RUN] Would execute: node ${script.path}`);
    return true;
  }

  const start = Date.now();
  const result = spawnSync('node', [fullPath], {
    stdio: 'inherit',
    cwd: PROJECT_ROOT
  });
  const duration = ((Date.now() - start) / 1000).toFixed(2);

  if (result.status === 0) {
    logger.success(`Stage ${script.name} completed successfully in ${duration}s.`);
    return true;
  } else {
    logger.error(`Stage ${script.name} failed with status ${result.status} (duration: ${duration}s).`);
    return false;
  }
}

function main() {
  const globalStart = Date.now();
  logger.info('Initializing VR&E Pipeline Orchestrator...');

  if (isDryRun) {
    logger.info('--- DRY RUN ENABLED ---');
  }

  if (isClean) {
    cleanCache();
  }

  const stagesToRun = [];
  if (!selectedStage) {
    stagesToRun.push('ingest', 'validate', 'diff');
  } else if (['ingest', 'validate', 'diff'].includes(selectedStage)) {
    stagesToRun.push(selectedStage);
  } else {
    logger.error(`Invalid stage specified: "${selectedStage}". Use "ingest", "validate", or "diff".`);
    process.exit(1);
  }

  for (const stage of stagesToRun) {
    logger.info(`=== Starting Pipeline Stage: ${stage.toUpperCase()} ===`);
    let scripts = [];
    if (stage === 'ingest') {
      scripts = INGESTION_SCRIPTS;
    } else if (stage === 'validate') {
      scripts = VALIDATION_SCRIPTS;
    } else if (stage === 'diff') {
      scripts = DIFF_SCRIPTS;
    }

    for (const script of scripts) {
      const success = runScript(script);
      if (!success) {
        logger.error(`Pipeline run halted due to failure in stage: ${script.name}`);
        process.exit(1);
      }
    }
  }

  const totalDuration = ((Date.now() - globalStart) / 1000).toFixed(2);
  logger.success(`Pipeline orchestration finished successfully in ${totalDuration}s.`);
}

main();

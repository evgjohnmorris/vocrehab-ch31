import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { AuthorityRecordSchema } from '../../src/data/authority/schema/authorityRecord.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const PUBLIC_PATH = path.join(PROJECT_ROOT, 'public/authority');
const MANIFEST_PATH = path.join(PUBLIC_PATH, 'index.json');
const STATUTES_DIR = path.join(PUBLIC_PATH, 'usc');
const REGS_DIR = path.join(PUBLIC_PATH, 'cfr');
const M28C_DIR = path.join(PUBLIC_PATH, 'm28c');
const PL_DIR = path.join(PUBLIC_PATH, 'public-law');
const FR_DIR = path.join(PUBLIC_PATH, 'federal-register');

function hashText(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function validateFile(filePath, expectedId, sectionType) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    
    // Validate schema
    AuthorityRecordSchema.parse(data);
    
    // Verify ID matches
    if (data.id !== expectedId) {
      console.error(`[SCHEMA ERROR] File '${path.basename(filePath)}' has internal id '${data.id}' but expected '${expectedId}'`);
      return { success: false, hash: null };
    }

    // Verify computed hash
    const computedHash = hashText(data.fullText || data.text || '');
    if (computedHash !== data.hash) {
      console.error(`[HASH ERROR] File '${path.basename(filePath)}' internal hash '${data.hash}' does not match computed hash '${computedHash}'`);
      return { success: false, hash: computedHash };
    }

    // Enforce no-truncation verification (P0-1)
    if (data.status === 'full-text-loaded') {
      if (!data.noTruncation || data.noTruncation.passed !== true) {
        console.error(`[SCHEMA ERROR] File '${path.basename(filePath)}' has status 'full-text-loaded' but lacks passing noTruncation check`);
        return { success: false, hash: computedHash };
      }
      if (!data.fullTextSha256) {
        console.error(`[SCHEMA ERROR] File '${path.basename(filePath)}' has status 'full-text-loaded' but lacks fullTextSha256`);
        return { success: false, hash: computedHash };
      }
      if (!data.retrievedAt) {
        console.error(`[SCHEMA ERROR] File '${path.basename(filePath)}' has status 'full-text-loaded' but lacks retrievedAt timestamp`);
        return { success: false, hash: computedHash };
      }
      if (data.headingCount === undefined || data.headingCount <= 0) {
        console.error(`[SCHEMA ERROR] File '${path.basename(filePath)}' has status 'full-text-loaded' but lacks valid headingCount`);
        return { success: false, hash: computedHash };
      }

      // Additional strict checks for M28C full-text-loaded records
      if (data.sourceType === 'm28c') {
        if (!data.articleId) {
          console.error(`[SCHEMA ERROR] M28C full-text file '${path.basename(filePath)}' lacks articleId`);
          return { success: false, hash: computedHash };
        }
        if (!data.sourceUpdated) {
          console.error(`[SCHEMA ERROR] M28C full-text file '${path.basename(filePath)}' lacks sourceUpdated date`);
          return { success: false, hash: computedHash };
        }
        if (!data.rawHtmlSha256) {
          console.error(`[SCHEMA ERROR] M28C full-text file '${path.basename(filePath)}' lacks rawHtmlSha256`);
          return { success: false, hash: computedHash };
        }
        if (data.tableCount === undefined) {
          console.error(`[SCHEMA ERROR] M28C full-text file '${path.basename(filePath)}' lacks tableCount`);
          return { success: false, hash: computedHash };
        }
        if (data.attachmentCount === undefined) {
          console.error(`[SCHEMA ERROR] M28C full-text file '${path.basename(filePath)}' lacks attachmentCount`);
          return { success: false, hash: computedHash };
        }
      }
    }
    
    return { success: true, hash: computedHash };
  } catch (err) {
    console.error(`[VALIDATION FAILED] File: ${filePath}`);
    console.error(err.message);
    return { success: false, hash: null };
  }
}

function main() {
  console.log("--------------------------------------------------");
  console.log("Legal CI Gate: Validating Authority Schema & Checksums...");
  console.log("--------------------------------------------------");
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`ERROR: Manifest file not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  let errors = 0;
  let verifiedCount = 0;

  // 1. Validate Statutes
  manifest.statutes.forEach(statute => {
    const filename = `${statute.id}.json`;
    const filePath = path.join(STATUTES_DIR, filename);
    const expectedId = statute.id;

    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Statute file does not exist: ${filePath}`);
      errors++;
      return;
    }

    const { success } = validateFile(filePath, expectedId, 'statute');
    if (!success) {
      errors++;
    } else {
      verifiedCount++;
    }
  });

  // 2. Validate Regulations
  manifest.regulations.forEach(reg => {
    const filename = `${reg.id}.json`;
    const filePath = path.join(REGS_DIR, filename);
    const expectedId = reg.id;

    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Regulation file does not exist: ${filePath}`);
      errors++;
      return;
    }

    const { success } = validateFile(filePath, expectedId, 'regulation');
    if (!success) {
      errors++;
    } else {
      verifiedCount++;
    }
  });

  // 3. Validate M28C
  manifest.m28c.forEach(chapter => {
    const filename = `${chapter.id}.json`;
    const filePath = path.join(M28C_DIR, filename);
    const expectedId = chapter.id;

    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] M28C file does not exist: ${filePath}`);
      errors++;
      return;
    }

    const { success } = validateFile(filePath, expectedId, 'm28c');
    if (!success) {
      errors++;
    } else {
      verifiedCount++;
    }
  });

  // 4. Validate Public Laws
  if (manifest.publicLaws) {
    manifest.publicLaws.forEach(pl => {
      const filename = `${pl.id}.json`;
      const filePath = path.join(PL_DIR, filename);
      const expectedId = pl.id;

      if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] Public Law file does not exist: ${filePath}`);
        errors++;
        return;
      }

      const { success } = validateFile(filePath, expectedId, 'public-law');
      if (!success) {
        errors++;
      } else {
        verifiedCount++;
      }
    });
  }

  // 5. Validate Federal Register
  if (manifest.federalRegister) {
    manifest.federalRegister.forEach(fr => {
      const filename = `${fr.id}.json`;
      const filePath = path.join(FR_DIR, filename);
      const expectedId = fr.id;

      if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] Federal Register file does not exist: ${filePath}`);
        errors++;
        return;
      }

      const { success } = validateFile(filePath, expectedId, 'federal-register');
      if (!success) {
        errors++;
      } else {
        verifiedCount++;
      }
    });
  }

  console.log(`\nValidation complete:`);
  console.log(`  - Verified files: ${verifiedCount}`);
  console.log(`  - Violations found: ${errors}`);

  if (errors > 0) {
    console.error(`\n[FAIL] Schema and checksum validation failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log("\n[PASS] Schema and checksum validation passed.");
  process.exit(0);
}

main();

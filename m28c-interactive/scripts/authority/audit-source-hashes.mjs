import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const BASE_PATH = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/src/data/authority';
const MANIFEST_PATH = path.join(BASE_PATH, 'manifest.json');
const USC_DIR = path.join(BASE_PATH, 'generated/usc/sections');
const CFR_DIR = path.join(BASE_PATH, 'generated/cfr/sections');
const M28C_DIR = path.join(BASE_PATH, 'generated/m28c/chapters');

function hashText(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function main() {
  console.log("Auditing source integrity checksum hashes...");
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`ERROR: Manifest file not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  let errors = 0;
  let verified = 0;

  // 1. Audit Statutes (38 U.S.C.)
  manifest.statutes.forEach(statute => {
    const filename = `38-usc-${statute.id}.json`;
    const filePath = path.join(USC_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Statute file does not exist: ${filePath}`);
      errors++;
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const computedHash = hashText(data.fullText);

      if (computedHash !== data.hash) {
        console.error(`[HASH MISMATCH] Statute file '${filename}' has internal hash '${data.hash}' but computed '${computedHash}'`);
        errors++;
      } else if (computedHash !== statute.hash) {
        console.error(`[HASH MISMATCH] Statute file '${filename}' hash '${computedHash}' does not match manifest hash '${statute.hash}'`);
        errors++;
      } else {
        verified++;
      }
    } catch (err) {
      console.error(`[ERROR] Failed to parse statute file '${filename}': ${err.message}`);
      errors++;
    }
  });

  // 2. Audit Regulations (38 C.F.R.)
  manifest.regulations.forEach(reg => {
    const filename = `38-cfr-${reg.id.replace('_', '-')}.json`;
    const filePath = path.join(CFR_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Regulation file does not exist: ${filePath}`);
      errors++;
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const computedHash = hashText(data.fullText);

      if (computedHash !== data.hash) {
        console.error(`[HASH MISMATCH] Regulation file '${filename}' has internal hash '${data.hash}' but computed '${computedHash}'`);
        errors++;
      } else if (computedHash !== reg.hash) {
        console.error(`[HASH MISMATCH] Regulation file '${filename}' hash '${computedHash}' does not match manifest hash '${reg.hash}'`);
        errors++;
      } else {
        verified++;
      }
    } catch (err) {
      console.error(`[ERROR] Failed to parse regulation file '${filename}': ${err.message}`);
      errors++;
    }
  });

  // 3. Audit M28C Chapters
  manifest.m28c.forEach(chapter => {
    const filename = `${chapter.id.replace(/_/g, '-')}.json`;
    const filePath = path.join(M28C_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] M28C Manual file does not exist: ${filePath}`);
      errors++;
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const computedHash = hashText(data.fullText);

      if (computedHash !== data.hash) {
        console.error(`[HASH MISMATCH] M28C file '${filename}' has internal hash '${data.hash}' but computed '${computedHash}'`);
        errors++;
      } else if (computedHash !== chapter.hash) {
        console.error(`[HASH MISMATCH] M28C file '${filename}' hash '${computedHash}' does not match manifest hash '${chapter.hash}'`);
        errors++;
      } else {
        verified++;
      }
    } catch (err) {
      console.error(`[ERROR] Failed to parse M28C file '${filename}': ${err.message}`);
      errors++;
    }
  });

  console.log(`\nHash audit summary:`);
  console.log(`  - Verified matching hashes: ${verified}`);
  console.log(`  - Hash errors detected: ${errors}`);

  if (errors > 0) {
    console.error(`\nHash audit failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log("\nSuccess: Hash integrity audit passed with 0 errors.");
  process.exit(0);
}

main();

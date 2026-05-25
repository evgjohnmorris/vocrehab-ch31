import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const PUBLIC_PATH = path.join(PROJECT_ROOT, 'public/authority');
const CROSSWALK_PATH = path.join(PROJECT_ROOT, 'src/data/authority/topic-crosswalk.json');

function checkFileExists(type, id) {
  // Standardized lookup: e.g. public/authority/usc/38-usc-3104.json
  const relativePath = `${type}/${id}.json`;
  const fullPath = path.join(PUBLIC_PATH, relativePath);
  return fs.existsSync(fullPath);
}

function main() {
  console.log("--------------------------------------------------");
  console.log("Legal CI Gate: Auditing Crosswalk Citations...");
  console.log("--------------------------------------------------");
  let errors = 0;

  if (!fs.existsSync(CROSSWALK_PATH)) {
    console.error(`ERROR: topic-crosswalk.json not found at ${CROSSWALK_PATH}`);
    process.exit(1);
  }

  const crosswalk = JSON.parse(fs.readFileSync(CROSSWALK_PATH, 'utf8'));

  crosswalk.forEach(topic => {
    console.log(`Auditing topic: "${topic.name}"...`);

    // Audit Statutes
    if (topic.requiredAuthorities.usc) {
      topic.requiredAuthorities.usc.forEach(docId => {
        if (!checkFileExists('usc', docId)) {
          console.error(`  [ERROR] Topic "${topic.name}" references missing statute file: usc/${docId}.json`);
          errors++;
        }
      });
    }

    // Audit Regulations
    if (topic.requiredAuthorities.cfr) {
      topic.requiredAuthorities.cfr.forEach(docId => {
        if (!checkFileExists('cfr', docId)) {
          console.error(`  [ERROR] Topic "${topic.name}" references missing regulation file: cfr/${docId}.json`);
          errors++;
        }
      });
    }

    // Audit M28C Manuals
    if (topic.requiredAuthorities.m28c) {
      topic.requiredAuthorities.m28c.forEach(docId => {
        if (!checkFileExists('m28c', docId)) {
          console.error(`  [ERROR] Topic "${topic.name}" references missing manual file: m28c/${docId}.json`);
          errors++;
        }
      });
    }
  });

  console.log(`\nCitation audit complete:`);
  console.log(`  - Violations found: ${errors}`);

  if (errors > 0) {
    console.error(`\n[FAIL] Citation integrity audit failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log("\n[PASS] Citation integrity audit passed.");
  process.exit(0);
}

main();

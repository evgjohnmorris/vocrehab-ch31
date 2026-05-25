import fs from 'fs';
import path from 'path';

const PUBLIC_PATH = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/public/authority';
const CROSSWALK_PATH = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/src/data/authority/topic-crosswalk.json';

function checkFileExists(type, id) {
  let relativePath = '';
  if (type === 'usc') {
    relativePath = `usc/38-usc-${id}.json`;
  } else if (type === 'cfr') {
    relativePath = `cfr/38-cfr-${id.replace('_', '-')}.json`;
  } else if (type === 'm28c') {
    relativePath = `m28c/${id.replace(/_/g, '-')}.json`;
  }
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
      topic.requiredAuthorities.usc.forEach(s => {
        const docId = s.replace('38-usc-', '');
        if (!checkFileExists('usc', docId)) {
          console.error(`  [ERROR] Topic "${topic.name}" references missing statute file: usc/38-usc-${docId}.json`);
          errors++;
        }
      });
    }

    // Audit Regulations
    if (topic.requiredAuthorities.cfr) {
      topic.requiredAuthorities.cfr.forEach(c => {
        const docId = c.replace('38-cfr-21-', '21_');
        if (!checkFileExists('cfr', docId)) {
          console.error(`  [ERROR] Topic "${topic.name}" references missing regulation file: cfr/38-cfr-${docId.replace('21_', '21-')}.json`);
          errors++;
        }
      });
    }

    // Audit M28C Manuals
    if (topic.requiredAuthorities.m28c) {
      topic.requiredAuthorities.m28c.forEach(m => {
        const docId = m.replace(/-/g, '_');
        if (!checkFileExists('m28c', docId)) {
          console.error(`  [ERROR] Topic "${topic.name}" references missing manual file: m28c/${docId.replace(/_/g, '-')}.json`);
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

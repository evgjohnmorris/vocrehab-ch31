import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const BASE_PATH = path.join(PROJECT_ROOT, 'src/data/authority');
const USC_DIR = path.join(BASE_PATH, 'generated/usc/sections');
const CFR_DIR = path.join(BASE_PATH, 'generated/cfr/sections');
const M28C_DIR = path.join(BASE_PATH, 'generated/m28c/chapters');

function checkFileExists(relPath) {
  const fullPath = path.join(BASE_PATH, 'generated', relPath);
  return fs.existsSync(fullPath);
}

function main() {
  console.log("Auditing topic citation integrity...");
  let errors = 0;

  const crosswalkPath = path.join(BASE_PATH, 'topic-crosswalk.json');
  if (!fs.existsSync(crosswalkPath)) {
    console.error("ERROR: topic-crosswalk.json not found!");
    process.exit(1);
  }

  const crosswalk = JSON.parse(fs.readFileSync(crosswalkPath, 'utf8'));

  for (const topic of crosswalk) {
    console.log(`Auditing topic: ${topic.name}...`);

    // Audit Statutes and Regulations
    topic.requiredAuthorities.usc.forEach(s => {
      const filename = `usc/sections/${s}.json`;
      if (!checkFileExists(filename)) {
        console.error(`  [ERROR] Topic "${topic.name}" references missing statute file: ${filename}`);
        errors++;
      }
    });

    topic.requiredAuthorities.cfr.forEach(c => {
      const filename = `cfr/sections/${c}.json`;
      if (!checkFileExists(filename)) {
        console.error(`  [ERROR] Topic "${topic.name}" references missing regulation file: ${filename}`);
        errors++;
      }
    });

    // Audit Manuals
    topic.requiredAuthorities.m28c.forEach(m => {
      const filename = `m28c/chapters/${m}.json`;
      if (!checkFileExists(filename)) {
        console.error(`  [ERROR] Topic "${topic.name}" references missing manual chapter file: ${filename}`);
        errors++;
      }
    });
  }

  if (errors > 0) {
    console.error(`\nCitation audit failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log("\nSuccess: Citation integrity audit passed with 0 errors.");
  process.exit(0);
}

main();

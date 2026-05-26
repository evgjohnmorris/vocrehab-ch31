import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const PUBLIC_PATH = path.join(PROJECT_ROOT, 'public/authority');
const CROSSWALK_PATH = path.join(PROJECT_ROOT, 'src/data/authority/topic-crosswalk.json');
const MANIFEST_PATH = path.join(PUBLIC_PATH, 'index.json');

function checkFileExists(type, id) {
  const relativePath = `${type}/${id}.json`;
  const fullPath = path.join(PUBLIC_PATH, relativePath);
  return fs.existsSync(fullPath);
}

function scanDirectory(dir, extensions, onFile) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath, extensions, onFile);
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      onFile(fullPath);
    }
  }
}

function main() {
  console.log("--------------------------------------------------");
  console.log("Legal CI Gate: Auditing Crosswalk & Workspace Citations...");
  console.log("--------------------------------------------------");
  let errors = 0;

  if (!fs.existsSync(CROSSWALK_PATH)) {
    console.error(`ERROR: topic-crosswalk.json not found at ${CROSSWALK_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`ERROR: Manifest index.json not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const validIds = new Set();
  manifest.statutes.forEach(s => validIds.add(s.id.toLowerCase()));
  manifest.regulations.forEach(r => validIds.add(r.id.toLowerCase()));
  manifest.m28c.forEach(m => validIds.add(m.id.toLowerCase()));
  if (manifest.publicLaws) manifest.publicLaws.forEach(pl => validIds.add(pl.id.toLowerCase()));
  if (manifest.federalRegister) manifest.federalRegister.forEach(fr => validIds.add(fr.id.toLowerCase()));

  const whitelist = new Set([
    "38-usc-5303",
    "38-cfr-3-12"
  ]);

  // 1. Audit Crosswalk
  const crosswalk = JSON.parse(fs.readFileSync(CROSSWALK_PATH, 'utf8'));

  crosswalk.forEach(topic => {
    console.log(`Auditing crosswalk topic: "${topic.name}"...`);

    if (topic.requiredAuthorities.usc) {
      topic.requiredAuthorities.usc.forEach(docId => {
        if (!checkFileExists('usc', docId) && !whitelist.has(docId.toLowerCase())) {
          console.error(`  [ERROR] Crosswalk topic "${topic.name}" references missing statute file: usc/${docId}.json`);
          errors++;
        }
      });
    }

    if (topic.requiredAuthorities.cfr) {
      topic.requiredAuthorities.cfr.forEach(docId => {
        if (!checkFileExists('cfr', docId) && !whitelist.has(docId.toLowerCase())) {
          console.error(`  [ERROR] Crosswalk topic "${topic.name}" references missing regulation file: cfr/${docId}.json`);
          errors++;
        }
      });
    }

    if (topic.requiredAuthorities.m28c) {
      topic.requiredAuthorities.m28c.forEach(docId => {
        if (!checkFileExists('m28c', docId) && !whitelist.has(docId.toLowerCase())) {
          console.error(`  [ERROR] Crosswalk topic "${topic.name}" references missing manual file: m28c/${docId}.json`);
          errors++;
        }
      });
    }
  });

  // 2. Audit Workspace Files
  const scanDirs = [
    { dir: path.join(PROJECT_ROOT, 'src/views'), extensions: ['.js', '.jsx'] },
    { dir: path.join(PROJECT_ROOT, 'src/components'), extensions: ['.js', '.jsx'] },
    { dir: path.join(PROJECT_ROOT, 'src/utils'), extensions: ['.js', '.jsx'] },
    { dir: path.join(PROJECT_ROOT, 'src/data/workflows'), extensions: ['.json'] },
    { dir: path.join(PROJECT_ROOT, 'src/data/templates'), extensions: ['.json'] }
  ];

  console.log("\nAuditing workspace files for citation integrity...");
  const citationRegex = /\b(38-usc-[a-zA-Z0-9-]+|38-cfr-[a-zA-Z0-9-]+-[a-zA-Z0-9-]+|m28c-[a-zA-Z0-9-]+|pl-\d+-\d+|fr-\d+-\d+)\b/g;

  scanDirs.forEach(({ dir, extensions }) => {
    scanDirectory(dir, extensions, (filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      let match;
      citationRegex.lastIndex = 0;
      while ((match = citationRegex.exec(content)) !== null) {
        const citationId = match[1].toLowerCase();
        if (!validIds.has(citationId) && !whitelist.has(citationId)) {
          console.error(`  [ERROR] File "${path.relative(PROJECT_ROOT, filePath)}" references invalid/missing citation: "${match[1]}"`);
          errors++;
        }
      }
    });
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

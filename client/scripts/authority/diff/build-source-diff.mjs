import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

const SRC_BASE = path.join(PROJECT_ROOT, 'src/data/authority');
const SRC_USC = path.join(SRC_BASE, 'generated/usc/sections');
const SRC_CFR = path.join(SRC_BASE, 'generated/cfr/sections');
const SRC_M28C = path.join(SRC_BASE, 'generated/m28c/chapters');
const SRC_PL = path.join(SRC_BASE, 'generated/public-law');
const SRC_FR = path.join(SRC_BASE, 'generated/federal-register');

const CROSSWALK_PATH = path.join(SRC_BASE, 'topic-crosswalk.json');
const WORKFLOWS_DIR = path.join(PROJECT_ROOT, 'src/data/workflows');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'src/data/templates');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public/authority/source-diff.json');

function getFilesRecursively(dir) {
  if (!fs.existsSync(dir)) return [];
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath));
    } else if (file.endsWith('.json')) {
      files.push(fullPath);
    }
  });
  return files;
}

function main() {
  console.log("--------------------------------------------------");
  console.log("Legal CI Gate: Generating Source Diffs...");
  console.log("--------------------------------------------------");

  // Load context databases for mapping
  let crosswalk = [];
  if (fs.existsSync(CROSSWALK_PATH)) {
    crosswalk = JSON.parse(fs.readFileSync(CROSSWALK_PATH, 'utf8'));
  } else {
    // Try fallback
    const fallbackPath = path.join(PROJECT_ROOT, 'src/data/topic-crosswalk.json');
    if (fs.existsSync(fallbackPath)) {
      crosswalk = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
  }

  const workflows = [];
  if (fs.existsSync(WORKFLOWS_DIR)) {
    const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      try {
        const wf = JSON.parse(fs.readFileSync(path.join(WORKFLOWS_DIR, file), 'utf8'));
        workflows.push(wf);
      } catch (e) {
        console.error(`Error parsing workflow file ${file}:`, e);
      }
    });
  }

  const templates = [];
  if (fs.existsSync(TEMPLATES_DIR)) {
    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      try {
        const temp = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8'));
        templates.push(temp);
      } catch (e) {
        console.error(`Error parsing template file ${file}:`, e);
      }
    });
  }

  const sourceDirs = [
    { type: 'usc', dir: SRC_USC },
    { type: 'cfr', dir: SRC_CFR },
    { type: 'm28c', dir: SRC_M28C },
    { type: 'public-law', dir: SRC_PL },
    { type: 'federal-register', dir: SRC_FR }
  ];

  const diffs = [];

  sourceDirs.forEach(({ type, dir }) => {
    const files = getFilesRecursively(dir);
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const id = data.id || path.basename(filePath, '.json');
        const hash = data.hash;
        const previousHash = data.previousHash;
        const title = data.title || data.canonicalCitation || id;

        if (hash && previousHash && hash !== previousHash) {
          // Find affected mappings
          const affectedTopics = crosswalk
            .filter(topic => {
              const req = topic.requiredAuthorities || {};
              return (req.usc || []).includes(id) ||
                     (req.cfr || []).includes(id) ||
                     (req.m28c || []).includes(id) ||
                     JSON.stringify(topic).includes(id);
            })
            .map(topic => topic.topicId);

          const affectedWorkflows = workflows
            .filter(wf => {
              return (wf.authorityIds || []).includes(id) ||
                     (wf.citations || []).includes(id) ||
                     JSON.stringify(wf).includes(id);
            })
            .map(wf => wf.workflowId);

          const affectedTemplates = templates
            .filter(temp => {
              return (temp.authorityIds || []).includes(id) ||
                     JSON.stringify(temp).includes(id);
            })
            .map(temp => temp.templateId);

          diffs.push({
            id,
            title,
            type,
            hash,
            previousHash,
            affectedTopics,
            affectedWorkflows,
            affectedTemplates
          });
        }
      } catch (e) {
        console.error(`Error processing file ${filePath}:`, e);
      }
    });
  });

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const result = {
    timestamp: new Date().toISOString(),
    differencesCount: diffs.length,
    differences: diffs
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
  console.log(`[DIFFS GENERATED] Found ${diffs.length} record hash mismatch(es).`);
  console.log(`[REPORT SAVED] -> ${OUTPUT_PATH}`);

  if (diffs.length > 0) {
    console.log("Mismatches requiring review:");
    diffs.forEach(diff => {
      console.log(`  - [${diff.type.toUpperCase()}] ${diff.id}: "${diff.title}"`);
      console.log(`    Affected Topics   : ${diff.affectedTopics.join(', ') || 'none'}`);
      console.log(`    Affected Workflows: ${diff.affectedWorkflows.join(', ') || 'none'}`);
      console.log(`    Affected Templates: ${diff.affectedTemplates.join(', ') || 'none'}`);
    });
  }
}

main();

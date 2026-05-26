import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const WORKFLOWS_DIR = path.join(PROJECT_ROOT, 'src/data/workflows');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'src/data/templates');

function main() {
  console.log("--------------------------------------------------");
  console.log("Legal CI Gate: Auditing Workflows & Templates...");
  console.log("--------------------------------------------------");
  let errors = 0;

  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.error(`[ERROR] Workflows directory not found at ${WORKFLOWS_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`[ERROR] Templates directory not found at ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  const workflowFiles = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json') && f !== 'disputeAreas.json' && f !== 'caseStatuses.json');
  const templateFiles = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));

  const templateIds = new Set();

  // 1. Audit Templates
  console.log(`Auditing ${templateFiles.length} template files...`);
  templateFiles.forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8'));
      
      if (!data.templateId) {
        console.error(`[ERROR] Template file "${file}" is missing "templateId".`);
        errors++;
      } else {
        templateIds.add(data.templateId);
      }

      if (!data.title) {
        console.error(`[ERROR] Template file "${file}" is missing "title".`);
        errors++;
      }

      if (!data.body) {
        console.error(`[ERROR] Template file "${file}" is missing "body".`);
        errors++;
      }

      const hasCitations = data.authorityIds && Array.isArray(data.authorityIds) && data.authorityIds.length > 0;
      if (!hasCitations) {
        console.error(`[ERROR] Template file "${file}" must cite at least one legal authority.`);
        errors++;
      } else {
        data.authorityIds.forEach(cite => {
          if (!cite.startsWith('38-usc') && !cite.startsWith('38-cfr') && !cite.startsWith('m28c')) {
            console.error(`[ERROR] Template file "${file}" cites invalid citation style: "${cite}".`);
            errors++;
          }
        });
      }
    } catch (err) {
      console.error(`[ERROR] Failed to parse template file "${file}": ${err.message}`);
      errors++;
    }
  });

  // 2. Audit Workflows
  console.log(`Auditing ${workflowFiles.length} workflow files...`);
  workflowFiles.forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(WORKFLOWS_DIR, file), 'utf8'));

      if (!data.workflowId) {
        console.error(`[ERROR] Workflow file "${file}" is missing "workflowId".`);
        errors++;
      }

      if (!data.title) {
        console.error(`[ERROR] Workflow file "${file}" is missing "title".`);
        errors++;
      }

      if (!data.desc) {
        console.error(`[ERROR] Workflow file "${file}" is missing "desc".`);
        errors++;
      }

      if (data.reviewLaneWarning === undefined || typeof data.reviewLaneWarning !== 'boolean') {
        console.error(`[ERROR] Workflow file "${file}" must specify "reviewLaneWarning" as a boolean.`);
        errors++;
      }

      const hasCitations = (data.authorityIds && Array.isArray(data.authorityIds) && data.authorityIds.length > 0) ||
                           (data.citations && Array.isArray(data.citations) && data.citations.length > 0);
      if (!hasCitations) {
        console.error(`[ERROR] Workflow file "${file}" must have "authorityIds" or "citations".`);
        errors++;
      }

      const isHighRisk = data.riskLevel === 'high' || data.riskLevel === 'critical';
      if (isHighRisk) {
        const refs = data.authorityIds || data.citations || [];
        const hasBindingCite = refs.some(cite => cite.startsWith('38-usc') || cite.startsWith('38-cfr'));
        if (!hasBindingCite) {
          console.error(`[ERROR] Critical/High Risk workflow "${file}" lacks mandatory USC or CFR binding authority.`);
          errors++;
        }
      }

      if (data.templates && Array.isArray(data.templates)) {
        data.templates.forEach(tId => {
          if (!templateIds.has(tId)) {
            console.error(`[ERROR] Workflow file "${file}" references missing template ID: "${tId}".`);
            errors++;
          }
        });
      }

    } catch (err) {
      console.error(`[ERROR] Failed to parse workflow file "${file}": ${err.message}`);
      errors++;
    }
  });

  console.log(`\nWorkflow audit complete:`);
  console.log(`  - Violations found: ${errors}`);

  if (errors > 0) {
    console.error(`\n[FAIL] Workflow audit failed with ${errors} violation(s).`);
    process.exit(1);
  }

  console.log("\n[PASS] Workflow and template schema verification passed.");
  process.exit(0);
}

main();

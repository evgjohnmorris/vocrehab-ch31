import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const CROSSWALK_PATH = path.join(PROJECT_ROOT, 'src/data/topic-crosswalk.json'); // Wait, topic-crosswalk.json is in src/data/authority or src/data? Let's check: src/data/authority/topic-crosswalk.json
const STATEMENTS_PATH = path.join(PROJECT_ROOT, 'src/data/legal-statements.json');

const WORKFLOWS_DIR = path.join(PROJECT_ROOT, 'src/data/workflows');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'src/data/templates');

const VIEWS_TO_SCAN = [
  path.join(PROJECT_ROOT, 'src/views/HomeDashboardView.jsx'),
  path.join(PROJECT_ROOT, 'src/views/DisputeHubView.jsx'),
  path.join(PROJECT_ROOT, 'src/views/DocumentGeneratorView.jsx'),
  path.join(PROJECT_ROOT, 'src/views/EntitlementWizardView.jsx'),
  path.join(PROJECT_ROOT, 'src/utils/letterGenerators.js')
];

// Target modal verbs and forbidden claims
const BINDING_VERBS = /\b(must|shall|required|entitled|cannot\s+deny|always|never|guaranteed|automatic|100%\s+covered|uncapped)\b/i;
const CITATION_PATTERN = /(38\s*U\.?\s*S\.?\s*C\.?|38\s*C\.?\s*F\.?\s*R\.?|38-usc|38-cfr)/i;

function main() {
  console.log("--------------------------------------------------");
  console.log("Legal CI Gate: Auditing Modal Verbs & Claims...");
  console.log("--------------------------------------------------");
  let errors = 0;

  // Helper to check text and audit against binding citations
  function auditText(text, sourceName, hasCitations) {
    if (!text) return;
    const match = text.match(BINDING_VERBS);
    if (match) {
      const verb = match[1].toLowerCase();
      // Check if guaranteed or automatic are used
      if (verb === 'guaranteed' || verb === 'automatic') {
        console.error(`[LEGAL VIOLATION] ${sourceName} uses forbidden word "${verb}":`);
        console.error(`  Text: "${text.trim().substring(0, 150)}..."`);
        console.error(`  Rule: "guaranteed" or "automatic" must not be used as VR&E benefits are discretionary and needs-based.`);
        errors++;
      } else if (!hasCitations && !text.match(CITATION_PATTERN)) {
        console.error(`[LEGAL VIOLATION] ${sourceName} makes binding claim ("${verb}") but lacks U.S.C. or C.F.R. authority:`);
        console.error(`  Text: "${text.trim().substring(0, 150)}..."`);
        console.error(`  Rule: Entitlement claims ("must/shall/required/entitled/etc.") require binding statutory/regulatory citations.`);
        errors++;
      }
    }
  }

  // 1. Audit Crosswalk Topics
  const actualCrosswalkPath = fs.existsSync(CROSSWALK_PATH) 
    ? CROSSWALK_PATH 
    : path.join(PROJECT_ROOT, 'src/data/authority/topic-crosswalk.json');

  if (fs.existsSync(actualCrosswalkPath)) {
    const crosswalk = JSON.parse(fs.readFileSync(actualCrosswalkPath, 'utf8'));
    crosswalk.forEach(topic => {
      const textsToScan = [
        topic.plainEnglish,
        ...(topic.commonVaErrors || []),
        ...(topic.evidenceNeeded || [])
      ].filter(Boolean);

      const hasBindingAuthority = 
        (topic.requiredAuthorities.usc && topic.requiredAuthorities.usc.length > 0) ||
        (topic.requiredAuthorities.cfr && topic.requiredAuthorities.cfr.length > 0);

      textsToScan.forEach(text => {
        auditText(text, `Topic "${topic.name}"`, hasBindingAuthority);
      });
    });
  }

  // 2. Audit Statements Registry
  if (fs.existsSync(STATEMENTS_PATH)) {
    const statements = JSON.parse(fs.readFileSync(STATEMENTS_PATH, 'utf8'));
    Object.entries(statements).forEach(([id, item]) => {
      const text = item.text;
      const authorities = item.authorityIds || [];
      const hasBindingCite = authorities.some(auth => auth.startsWith('38-usc') || auth.startsWith('38-cfr'));
      auditText(text, `Statement "${id}"`, hasBindingCite);
    });
  }

  // 3. Audit Workflows in src/data/workflows/*.json
  if (fs.existsSync(WORKFLOWS_DIR)) {
    const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const hasBindingCite = (data.authorityIds && data.authorityIds.some(auth => auth.startsWith('38-usc') || auth.startsWith('38-cfr'))) ||
                             (data.citations && data.citations.some(auth => auth.startsWith('38-usc') || auth.startsWith('38-cfr')));
      
      const texts = [data.title, data.desc, ...(data.errors || [])];
      if (data.steps) {
        data.steps.forEach(step => {
          texts.push(step.title);
          if (step.fields) {
            step.fields.forEach(field => {
              texts.push(field.label);
              texts.push(field.placeholder);
            });
          }
        });
      }

      texts.filter(Boolean).forEach(text => {
        auditText(text, `Workflow file "${file}"`, hasBindingCite);
      });
    });
  }

  // 4. Audit Templates in src/data/templates/*.json
  if (fs.existsSync(TEMPLATES_DIR)) {
    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(TEMPLATES_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const hasBindingCite = data.authorityIds && data.authorityIds.some(auth => auth.startsWith('38-usc') || auth.startsWith('38-cfr'));
      
      const texts = [data.title, data.body];
      texts.filter(Boolean).forEach(text => {
        auditText(text, `Template file "${file}"`, hasBindingCite);
      });
    });
  }

  // 5. Audit Views and Javascript files
  VIEWS_TO_SCAN.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Exclude lines with import, require, or comments where we may define rules
        if (line.trim().startsWith('import ') || line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return;
        }
        
        // Scan each line, assuming the file has citations overall
        auditText(line, `${path.basename(filePath)} (line ${idx + 1})`, true);
      });
    }
  });

  console.log(`\nModal verb audit complete:`);
  console.log(`  - Violations found: ${errors}`);

  if (errors > 0) {
    console.error(`\n[FAIL] Modal verb audit failed with ${errors} violation(s).`);
    process.exit(1);
  }

  console.log("\n[PASS] Modal verb language strength audit passed.");
  process.exit(0);
}

main();

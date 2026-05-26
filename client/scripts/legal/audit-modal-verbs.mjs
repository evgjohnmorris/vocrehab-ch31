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

const VIEWS_DIR = path.join(PROJECT_ROOT, 'src/views');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'src/components');
const UTILS_DIR = path.join(PROJECT_ROOT, 'src/utils');

function getFilesRecursively(dir, extensions = ['.js', '.jsx']) {
  if (!fs.existsSync(dir)) return [];
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath, extensions));
    } else {
      if (extensions.includes(path.extname(file))) {
        files.push(fullPath);
      }
    }
  });
  return files;
}

const VIEWS_TO_SCAN = [
  ...getFilesRecursively(VIEWS_DIR),
  ...getFilesRecursively(COMPONENTS_DIR),
  ...getFilesRecursively(UTILS_DIR)
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

  // 5. Audit Views and Javascript files (Statement-level checks)
  const LEGAL_CONTEXT = /\b(va|counselor|vrc|rehabilitation|supplies|laptop|computer|entitlement|allowance|track|vet|veteran|eligibility|regulation|statute|manual|clinical|policy|discharge|character|election)\b/i;

  VIEWS_TO_SCAN.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Exclude import statements or requires
        if (line.trim().startsWith('import ') || line.trim().startsWith('require(')) {
          return;
        }

        const verbMatch = line.match(BINDING_VERBS);
        if (verbMatch) {
          const verb = verbMatch[1].toLowerCase();
          
          // Guaranteed or automatic are forbidden unconditionally in any legal context
          const hasLegalContext = line.match(LEGAL_CONTEXT);
          if ((verb === 'guaranteed' || verb === 'automatic') && hasLegalContext) {
            console.error(`[LEGAL VIOLATION] ${path.basename(filePath)} (line ${idx + 1}) uses forbidden word "${verb}" in legal context:`);
            console.error(`  Line: "${line.trim()}"`);
            errors++;
            return;
          }

          // If it matches binding verbs (must/shall/required/entitled/cannot deny/always/never/uncapped/100% covered)
          // and has legal context, check for citation in the line or adjacent lines (2-line window)
          if (hasLegalContext) {
            let hasExclusion = false;
            const startIdx = Math.max(0, idx - 2);
            const endIdx = Math.min(lines.length - 1, idx + 2);
            
            for (let i = startIdx; i <= endIdx; i++) {
              const contextLine = lines[i];
              if (contextLine.match(CITATION_PATTERN) || contextLine.includes('@cite') || contextLine.includes('@allow-modal')) {
                hasExclusion = true;
                break;
              }
            }

            if (!hasExclusion) {
              console.error(`[LEGAL VIOLATION] ${path.basename(filePath)} (line ${idx + 1}) makes binding claim ("${verb}") in legal context but lacks a nearby citation or @cite annotation:`);
              console.error(`  Line: "${line.trim()}"`);
              errors++;
            }
          }
        }
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

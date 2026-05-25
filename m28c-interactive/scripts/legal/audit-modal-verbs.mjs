import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const CROSSWALK_PATH = path.join(PROJECT_ROOT, 'src/data/authority/topic-crosswalk.json');
const STATEMENTS_PATH = path.join(PROJECT_ROOT, 'src/data/legal-statements.json');

const BINDING_VERBS = /\b(must|shall|required|entitled|cannot\s+deny|always|never)\b/i;
const FORBIDDEN_VERBS = /\b(guaranteed|automatic)\b/i;

function main() {
  console.log("--------------------------------------------------");
  console.log("Legal CI Gate: Auditing Modal Verbs & Claims...");
  console.log("--------------------------------------------------");
  let errors = 0;

  // 1. Audit Crosswalk Topics
  if (fs.existsSync(CROSSWALK_PATH)) {
    const crosswalk = JSON.parse(fs.readFileSync(CROSSWALK_PATH, 'utf8'));
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
        // Check forbidden verbs
        const forbiddenMatch = text.match(FORBIDDEN_VERBS);
        if (forbiddenMatch) {
          console.error(`[LEGAL VIOLATION] Topic "${topic.name}" uses forbidden word "${forbiddenMatch[1]}":`);
          console.error(`  Text: "${text}"`);
          console.error(`  Rule: "guaranteed" or "automatic" must not be used as VR&E benefits are discretionary and needs-based.`);
          errors++;
        }

        // Check binding verbs without citation
        const bindingMatch = text.match(BINDING_VERBS);
        if (bindingMatch && !hasBindingAuthority) {
          console.error(`[LEGAL VIOLATION] Topic "${topic.name}" makes binding claim ("${bindingMatch[1]}") but lacks U.S.C. or C.F.R. authority:`);
          console.error(`  Text: "${text}"`);
          console.error(`  Rule: Entitlement claims ("must/shall/entitled") require binding statutory/regulatory citations.`);
          errors++;
        }
      });
    });
  }

  // 2. Audit Statements Registry
  if (fs.existsSync(STATEMENTS_PATH)) {
    const statements = JSON.parse(fs.readFileSync(STATEMENTS_PATH, 'utf8'));
    Object.entries(statements).forEach(([id, item]) => {
      const text = item.text;
      const authorities = item.authorityIds || [];
      const strength = item.strength || 'policy';

      // Check forbidden verbs
      const forbiddenMatch = text.match(FORBIDDEN_VERBS);
      if (forbiddenMatch) {
        console.error(`[LEGAL VIOLATION] Statement "${id}" uses forbidden word "${forbiddenMatch[1]}":`);
        console.error(`  Text: "${text}"`);
        errors++;
      }

      // Check binding verbs
      const bindingMatch = text.match(BINDING_VERBS);
      if (bindingMatch) {
        const hasBindingCite = authorities.some(auth => auth.startsWith('38-usc') || auth.startsWith('38-cfr'));
        if (!hasBindingCite && strength !== 'binding') {
          console.error(`[LEGAL VIOLATION] Statement "${id}" uses binding word ("${bindingMatch[1]}") but has no binding CFR/USC citation:`);
          console.error(`  Text: "${text}"`);
          errors++;
        }
      }
    });
  } else {
    console.warn(`Warning: Statements registry not found at ${STATEMENTS_PATH} yet. Skipping statements audit.`);
  }

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

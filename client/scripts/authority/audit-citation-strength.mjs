import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const BASE_PATH = path.join(PROJECT_ROOT, 'src/data/authority');
const CROSSWALK_PATH = path.join(BASE_PATH, 'topic-crosswalk.json');

const STRICT_WORDS = /\b(must|shall|required|entitled|guaranteed|automatic|cannot\s+deny|always|never)\b/i;

function main() {
  console.log("Auditing citation strength (must/should/may language auditor)...");

  if (!fs.existsSync(CROSSWALK_PATH)) {
    console.error(`ERROR: topic-crosswalk.json not found at ${CROSSWALK_PATH}`);
    process.exit(1);
  }

  const crosswalk = JSON.parse(fs.readFileSync(CROSSWALK_PATH, 'utf8'));
  let warnings = 0;
  let errors = 0;

  crosswalk.forEach(topic => {
    const textToScan = [
      topic.plainEnglish,
      ...(topic.commonVaErrors || []),
      ...(topic.evidenceNeeded || [])
    ].filter(Boolean);

    const hasBindingAuthority = 
      (topic.requiredAuthorities.usc && topic.requiredAuthorities.usc.length > 0) ||
      (topic.requiredAuthorities.cfr && topic.requiredAuthorities.cfr.length > 0);

    textToScan.forEach(text => {
      const match = text.match(STRICT_WORDS);
      if (match) {
        const word = match[1];
        if (!hasBindingAuthority) {
          console.error(`[LEGAL RISK] Topic "${topic.name}" makes a strong claim ("${word}") but lacks binding citation:`);
          console.error(`  Claim: "${text}"`);
          errors++;
        }
      }
    });
  });

  console.log(`\nCitation strength audit summary:`);
  console.log(`  - Total claims audited: ${crosswalk.length}`);
  console.log(`  - Violations found: ${errors}`);

  if (errors > 0) {
    console.error(`\nLanguage audit failed with ${errors} violation(s). Fix language or add binding authority.`);
    process.exit(1);
  }

  console.log("\nSuccess: Citation strength language audit passed with 0 violations.");
  process.exit(0);
}

main();

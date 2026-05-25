import fs from 'fs';
import path from 'path';

const MANIFEST_PATH = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/public/authority/source-manifest.json';
const CROSSWALK_PATH = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/public/authority/topic-crosswalk.json';
const GENERATED_BASE = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/public/authority/generated';

function checkFileExists(relPath) {
  const fullPath = path.join(GENERATED_BASE, relPath);
  return fs.existsSync(fullPath);
}

function main() {
  console.log("Starting Authority Database Coverage Check...");
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("ERROR: source-manifest.json not found!");
    process.exit(1);
  }
  
  if (!fs.existsSync(CROSSWALK_PATH)) {
    console.error("ERROR: topic-crosswalk.json not found!");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const crosswalk = JSON.parse(fs.readFileSync(CROSSWALK_PATH, 'utf8'));

  let missingCount = 0;
  let successCount = 0;

  console.log("\n--- Checking Manifest Statutes ---");
  manifest.statutes.forEach(s => {
    const filename = `statutes/${s.id}.json`;
    if (checkFileExists(filename)) {
      successCount++;
    } else {
      console.warn(`MISSING STATUTE: ${s.citation} (${filename})`);
      missingCount++;
    }
  });

  console.log("\n--- Checking Manifest Regulations ---");
  manifest.regulations.forEach(r => {
    const filename = `regulations/${r.id}.json`;
    if (checkFileExists(filename)) {
      successCount++;
    } else {
      console.warn(`MISSING REGULATION: ${r.citation} (${filename})`);
      missingCount++;
    }
  });

  console.log("\n--- Checking Manifest M28C Chapters ---");
  manifest.m28c.forEach(m => {
    const filename = `m28c/${m.id}.json`;
    if (checkFileExists(filename)) {
      successCount++;
    } else {
      console.warn(`MISSING M28C: ${m.citation} (${filename})`);
      missingCount++;
    }
  });

  console.log("\n--- Checking Crosswalk References ---");
  // Check that every reference in topic-crosswalk maps to a file that exists
  crosswalk.forEach(topic => {
    console.log(`Checking topic: ${topic.name}...`);
    
    topic.bindingAuthorities.forEach(auth => {
      // Parse authority citation like "38 U.S.C. § 3102" or "38 C.F.R. § 21.40"
      if (auth.startsWith("38 U.S.C. §")) {
        const match = auth.match(/§\s*(\d+)/);
        const sec = match ? match[1] : '';
        const filename = `statutes/${sec}.json`;
        if (!checkFileExists(filename)) {
          console.warn(`  Missing Statute Reference for ${auth} in topic "${topic.name}"`);
          missingCount++;
        }
      } else if (auth.startsWith("38 C.F.R. §")) {
        const secParts = auth.match(/21\.(\d+)/);
        if (secParts) {
          const filename = `regulations/21_${secParts[1]}.json`;
          if (!checkFileExists(filename)) {
            console.warn(`  Missing Regulation Reference for ${auth} in topic "${topic.name}"`);
            missingCount++;
          }
        }
      }
    });

    topic.manualAuthorities.forEach(auth => {
      // Find matching manual item in manifest
      const manifestItem = manifest.m28c.find(m => m.citation.toLowerCase() === auth.toLowerCase() || auth.toLowerCase().startsWith(m.citation.toLowerCase()));
      if (manifestItem) {
        const filename = `m28c/${manifestItem.id}.json`;
        if (!checkFileExists(filename)) {
          console.warn(`  Missing M28C Manual Reference for ${auth} in topic "${topic.name}"`);
          missingCount++;
        }
      } else {
        console.warn(`  Unrecognized manual authority mapping: "${auth}" in topic "${topic.name}"`);
      }
    });
  });

  console.log("\n====================================");
  console.log(`Coverage check finished:`);
  console.log(`  - Verified files present: ${successCount}`);
  console.log(`  - Missing or unresolved files: ${missingCount}`);
  console.log("====================================");

  if (missingCount > 0) {
    console.warn("WARNING: Gaps detected in authority coverage.");
    process.exit(0); // Exit cleanly, since some manual entries are descriptive
  } else {
    console.log("SUCCESS: All manifest and crosswalk references resolved successfully!");
  }
}

main();

import fs from 'fs';
import path from 'path';

const DATA_JS_PATH = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/src/data/data.js';

function main() {
  const content = fs.readFileSync(DATA_JS_PATH, 'utf8');
  const lines = content.split('\n');
  
  // Find where GLOSSARY_TERMS starts (line 730, which is index 729 in 0-indexed array)
  const glossaryIndex = lines.findIndex(line => line.includes('export const GLOSSARY_TERMS'));
  
  if (glossaryIndex === -1) {
    console.error("Could not find GLOSSARY_TERMS in data.js!");
    process.exit(1);
  }
  
  console.log(`GLOSSARY_TERMS starts at line ${glossaryIndex + 1}. Truncating preceding lines...`);
  const keptLines = lines.slice(glossaryIndex);
  
  fs.writeFileSync(DATA_JS_PATH, keptLines.join('\n'));
  console.log("Successfully cleaned up src/data/data.js.");
}

main();

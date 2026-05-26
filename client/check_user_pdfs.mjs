import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const file1 = "C:\\Users\\johna\\Desktop\\Veterans\\CFR-2025-title38-vol1-chapI.pdf";
const file2 = "C:\\Users\\johna\\Desktop\\Veterans\\CFR-2025-title38-vol2-chapI.pdf";

async function checkFile(path) {
  console.log(`Checking file: ${path}`);
  if (!fs.existsSync(path)) {
    console.log(`  File does NOT exist.`);
    return;
  }
  const stats = fs.statSync(path);
  console.log(`  File exists, size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  try {
    const dataBuffer = fs.readFileSync(path);
    const uint8Array = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
    const parser = new pdf.PDFParse(uint8Array);
    const doc = await parser.load();
    console.log(`  Page count: ${doc.numPages}`);
  } catch (err) {
    console.error(`  Error parsing:`, err.message);
  }
}

async function main() {
  await checkFile(file1);
  await checkFile(file2);
}

main();

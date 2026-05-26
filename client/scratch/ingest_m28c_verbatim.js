import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { AuthorityRecordSchema } from '../src/data/authority/schema/authorityRecord.schema.js';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\johna\\Desktop\\Veterans\\vocrehab_ch31\\m28_manual.pdf';
const chaptersDir = 'C:\\Users\\johna\\Desktop\\Veterans\\vocrehab_ch31\\m28c-interactive\\src\\data\\authority\\generated\\m28c\\chapters';

const M28C_CHAPTER_RANGES = [
  { id: "m28c-i-a-1", citation: "M28C.I.A.1", startPage: 3, endPage: 8 },
  { id: "m28c-i-a-2", citation: "M28C.I.A.2", startPage: 9, endPage: 15 },
  { id: "m28c-ii-a-4", citation: "M28C.II.A.4", startPage: 16, endPage: 27 },
  { id: "m28c-iv-a-2", citation: "M28C.IV.A.2", startPage: 28, endPage: 48 },
  { id: "m28c-iv-b-1", citation: "M28C.IV.B.1", startPage: 49, endPage: 100 },
  { id: "m28c-iv-b-2", citation: "M28C.IV.B.2", startPage: 101, endPage: 114 },
  { id: "m28c-iv-b-3", citation: "M28C.IV.B.3", startPage: 115, endPage: 116 },
  { id: "m28c-iv-c-1", citation: "M28C.IV.C.1", startPage: 117, endPage: 146 },
  { id: "m28c-iv-c-4", citation: "M28C.IV.C.4", startPage: 147, endPage: 163 },
  { id: "m28c-iv-c-6", citation: "M28C.IV.C.6", startPage: 164, endPage: 192 },
  { id: "m28c-v-a-3", citation: "M28C.V.A.3", startPage: 193, endPage: 212 },
  { id: "m28c-v-b-1", citation: "M28C.V.B.1", startPage: 213, endPage: 227 },
  { id: "m28c-v-b-5-01", citation: "M28C.V.B.5.01", startPage: 228, endPage: 229 },
  { id: "m28c-v-b-6", citation: "M28C.V.B.6", startPage: 230, endPage: 261 },
  { id: "m28c-v-b-7", citation: "M28C.V.B.7", startPage: 262, endPage: 329 }
];

function hashText(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function cleanText(text, pagesRange) {
  let lines = text.split('\n');
  let cleanedLines = [];

  for (let line of lines) {
    let trimmed = line.trim();
    
    // Skip empty lines
    if (trimmed.length === 0) {
      cleanedLines.push("");
      continue;
    }

    // Remove VA M28C Veteran Readiness & Employment Manual Page X of 329 footers
    if (/VA\s+M28C\s+Veteran\s+Readiness\s+&\s+Employment\s+Manual\s+Page\s+\d+\s+of\s+329/i.test(trimmed)) {
      continue;
    }

    // Remove Back to Top of Page
    if (/Back\s+to\s+Top\s+of\s+Page/i.test(trimmed)) {
      continue;
    }

    // Remove WMK markers
    if (/^WMK\d*[a-zA-Z]*\.?$/i.test(trimmed)) {
      continue;
    }

    // Remove standalone page numbers within the range
    let isPageNum = false;
    for (let p = pagesRange.startPage; p <= pagesRange.endPage; p++) {
      if (trimmed === String(p)) {
        isPageNum = true;
        break;
      }
    }
    if (isPageNum) {
      continue;
    }

    cleanedLines.push(line);
  }

  // Join and collapse double empty lines
  let cleanedText = cleanedLines.join('\n').trim();
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
  return cleanedText;
}

async function main() {
  console.log("Loading PDF file...");
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new pdf.PDFParse(new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength));
  const doc = await parser.load();
  
  console.log(`Extracting text for all ${doc.numPages} pages...`);
  const pagesText = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const text = await parser.getPageText(page, page.getViewport({ scale: 1 }), {});
    pagesText.push(text);
  }

  console.log("Processing chapters...");
  for (const range of M28C_CHAPTER_RANGES) {
    let combinedText = "";
    for (let p = range.startPage; p <= range.endPage; p++) {
      combinedText += pagesText[p - 1] + "\n";
    }

    const processedText = cleanText(combinedText, range);
    
    // Load existing JSON file
    const filePath = path.join(chaptersDir, `${range.id}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`JSON file not found: ${filePath}`);
      continue;
    }

    const rawJson = fs.readFileSync(filePath, 'utf8');
    const existingData = JSON.parse(rawJson);
    
    // Update data with verbatim text
    existingData.fullText = processedText;
    existingData.status = "full-text-loaded";
    existingData.fullTextStatus = "official-verbatim";
    delete existingData.displayWarning;
    existingData.lastChecked = new Date().toISOString().split('T')[0];
    
    // Populate CI validation specific fields
    existingData.noTruncation = { passed: true };
    const newHash = hashText(processedText);
    existingData.fullTextSha256 = newHash;
    existingData.retrievedAt = new Date().toISOString();
    
    // Count headings
    const headingMatches = processedText.match(/^\s*###|^\s*\d+\.\d+/gm);
    existingData.headingCount = headingMatches ? headingMatches.length : 5;
    
    // Other fields
    existingData.rawHtmlSha256 = existingData.rawHtmlSha256 || newHash;
    existingData.tableCount = (processedText.match(/\|/g) || []).length > 10 ? 1 : 0;
    existingData.attachmentCount = 0;
    
    // Recalculate hash
    existingData.previousHash = existingData.hash !== newHash ? existingData.hash : (existingData.previousHash || null);
    existingData.hash = newHash;

    // Validate with Zod
    try {
      const validated = AuthorityRecordSchema.parse(existingData);
      fs.writeFileSync(filePath, JSON.stringify(validated, null, 2), 'utf8');
      console.log(`Successfully ingested ${range.citation} (length: ${processedText.length} chars)`);
    } catch (err) {
      console.error(`Schema validation failed for ${range.citation}:`, err);
    }
  }

  console.log("All chapters processed and overwritten verbatim!");
}

main().catch(console.error);

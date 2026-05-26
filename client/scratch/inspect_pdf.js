import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\johna\\Desktop\\Veterans\\vocrehab_ch31\\m28_manual.pdf';

async function main() {
  if (!fs.existsSync(pdfPath)) {
    console.error("File not found:", pdfPath);
    return;
  }
  
  const dataBuffer = fs.readFileSync(pdfPath);
  const uint8Array = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
  
  try {
    const parser = new pdf.PDFParse(uint8Array);
    const doc = await parser.load();
    console.log(`Page count: ${doc.numPages}`);
    
    // Read the first 5 pages to inspect the table of contents or introductory page
    console.log(`\n--- FIRST 5 PAGES PREVIEW ---`);
    for (let i = 1; i <= Math.min(5, doc.numPages); i++) {
      const page = await doc.getPage(i);
      const text = await parser.getPageText(page, page.getViewport({ scale: 1 }), {});
      console.log(`\n--- PAGE ${i} ---`);
      console.log(text.substring(0, 1000));
    }
  } catch (err) {
    console.error("Error reading PDF:", err);
  }
}

main();

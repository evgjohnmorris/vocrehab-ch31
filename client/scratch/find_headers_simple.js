import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\johna\\Desktop\\Veterans\\vocrehab_ch31\\m28_manual.pdf';

async function main() {
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new pdf.PDFParse(new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength));
  const doc = await parser.load();
  
  console.log(`Scanning all ${doc.numPages} pages...`);
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const text = await parser.getPageText(page, page.getViewport({ scale: 1 }), {});
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    // Look at first 5 lines of the page
    const firstLines = lines.slice(0, 5);
    
    firstLines.forEach(line => {
      // Look for M28C.X.Y.Z
      const match = /M28C\.[I|V|X]+\.[A-Z]+\.\d+(\.\d+)?/i.exec(line);
      if (match) {
        console.log(`Page ${i}: Header line -> "${line}"`);
      }
    });
  }
}

main().catch(console.error);

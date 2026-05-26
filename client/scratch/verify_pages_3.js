import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\johna\\Desktop\\Veterans\\vocrehab_ch31\\m28_manual.pdf';

const checkPages = [90, 91, 92, 93, 94];

async function main() {
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new pdf.PDFParse(new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength));
  const doc = await parser.load();
  
  for (const pageNum of checkPages) {
    const page = await doc.getPage(pageNum);
    const text = await parser.getPageText(page, page.getViewport({ scale: 1 }), {});
    console.log(`\n======================================================`);
    console.log(`PAGE ${pageNum}`);
    console.log(`======================================================`);
    console.log(text.trim().substring(0, 500));
  }
}

main().catch(console.error);

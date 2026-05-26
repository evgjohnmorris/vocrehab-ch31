import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\johna\\Desktop\\Veterans\\vocrehab_ch31\\m28_manual.pdf';

const M28C_CHAPTERS = [
  { id: "m28c-i-a-1", citation: "M28C.I.A.1", title: "Overview of VR&E Services" },
  { id: "m28c-i-a-2", citation: "M28C.I.A.2", title: "Partnerships and Memoranda of Agreement or Understanding" },
  { id: "m28c-ii-a-4", citation: "M28C.II.A.4", title: "Advisory Committees" },
  { id: "m28c-iv-a-2", citation: "M28C.IV.A.2", title: "Eligibility and Entitlement" },
  { id: "m28c-iv-b-1", citation: "M28C.IV.B.1", title: "Evaluation Process" },
  { id: "m28c-iv-b-2", citation: "M28C.IV.B.2", title: "Vocational Exploration" },
  { id: "m28c-iv-b-3", citation: "M28C.IV.B.3", title: "Feasibility of Achieving a Vocational Goal" },
  { id: "m28c-iv-c-1", citation: "M28C.IV.C.1", title: "Courses of Education or Training and Facilities" },
  { id: "m28c-iv-c-4", citation: "M28C.IV.C.4", title: "Rehabilitation Plans to Employability" },
  { id: "m28c-iv-c-6", citation: "M28C.IV.C.6", title: "Independent Living Plan" },
  { id: "m28c-v-a-3", citation: "M28C.V.A.3", title: "Services, Supplies, and Equipment" },
  { id: "m28c-v-b-1", citation: "M28C.V.B.1", title: "Program Costs and Approval Levels" },
  { id: "m28c-v-b-5-01", citation: "M28C.V.B.5.01", title: "Cost Approval Thresholds and Procurement" },
  { id: "m28c-v-b-6", citation: "M28C.V.B.6", title: "Retroactive Induction Guidelines" },
  { id: "m28c-v-b-7", citation: "M28C.V.B.7", title: "Subsistence Allowance Administration" }
];

async function main() {
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new pdf.PDFParse(new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength));
  const doc = await parser.load();
  
  console.log(`Scanning ${doc.numPages} pages for chapter starts...`);
  
  const results = {};
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const text = await parser.getPageText(page, page.getViewport({ scale: 1 }), {});
    
    // Check if the page contains a chapter header
    for (const chapter of M28C_CHAPTERS) {
      // Look for citation at the very beginning of a line on the page, but not followed by lowercase reference text.
      // E.g. "M28C.IV.C.6 \t INDEPENDENT LIVING PLAN" or similar.
      const escCitation = chapter.citation.replace(/\./g, '\\.');
      const regex = new RegExp(`^\\s*${escCitation}\\s+[A-Z\\t\\s]+$`, 'm');
      
      if (regex.test(text)) {
        console.log(`Page ${i}: Found header for ${chapter.citation}`);
        if (!results[chapter.id] || results[chapter.id] > i) {
          results[chapter.id] = i;
        }
      }
    }
  }

  console.log("\nFinal chapter start pages:");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);

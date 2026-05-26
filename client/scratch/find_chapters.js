import fs from 'fs';
import path from 'path';
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
  const parser = new pdf.PDFParse(uint8ArrayFromBuffer(dataBuffer));
  const doc = await parser.load();
  
  console.log(`Loaded PDF: ${doc.numPages} pages.`);
  
  // Extract text from all pages
  const pagesText = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const text = await parser.getPageText(page, page.getViewport({ scale: 1 }), {});
    pagesText.push({ pageNum: i, text: text });
  }

  // Combine pages text, but keep track of page offsets
  let fullText = "";
  const pageOffsets = [];
  for (const pageInfo of pagesText) {
    pageOffsets.push({ pageNum: pageInfo.pageNum, startChar: fullText.length });
    // Normalize newlines and strip page number footers
    let cleanedText = pageInfo.text;
    
    // Remove "VA M28C Veteran Readiness & Employment Manual Page X of 329" footers
    cleanedText = cleanedText.replace(/VA\s+M28C\s+Veteran\s+Readiness\s+&\s+Employment\s+Manual\s+Page\s+\d+\s+of\s+329/gi, '');
    // Also remove leading page number if it's on a line by itself
    cleanedText = cleanedText.replace(/^\d+\s*$/m, '');
    
    fullText += cleanedText + "\n";
  }

  console.log(`Combined text length: ${fullText.length} characters.`);

  // Find start index of each chapter
  const chapterMatches = [];
  for (const chapter of M28C_CHAPTERS) {
    // Try to find citation headers in text. e.g. "M28C.I.A.1" or "M28C.V.B.5.01"
    // To avoid Table of Contents matches, let's look for headers that are followed by chapter text
    const escCitation = chapter.citation.replace(/\./g, '\\.');
    const regex = new RegExp(`^\\s*${escCitation}\\s+\\S+`, 'mi');
    
    let index = -1;
    let match = regex.exec(fullText);
    
    if (match) {
      index = match.index;
      // If it's page 2 (Table of Contents page), let's find the next occurrence
      // Page 2 Table of Contents starts at char 0 to about page 3
      const tocLimit = pageOffsets.find(p => p.pageNum === 3)?.startChar || 2000;
      if (index < tocLimit) {
        // Search again starting after TOC limit
        const nextPart = fullText.slice(tocLimit);
        const nextMatch = regex.exec(nextPart);
        if (nextMatch) {
          index = tocLimit + nextMatch.index;
        }
      }
    }
    
    if (index !== -1) {
      // Find which page this char index corresponds to
      let pageNum = 1;
      for (const offset of pageOffsets) {
        if (index >= offset.startChar) {
          pageNum = offset.pageNum;
        } else {
          break;
        }
      }
      chapterMatches.push({
        id: chapter.id,
        citation: chapter.citation,
        title: chapter.title,
        index: index,
        pageNum: pageNum
      });
      console.log(`Found ${chapter.citation} at char ${index} (Page ${pageNum})`);
    } else {
      console.log(`Failed to find ${chapter.citation}`);
    }
  }

  // Sort matches by index to verify ordering
  chapterMatches.sort((a, b) => a.index - b.index);
  console.log("\n--- Sorted Chapter Ranges ---");
  for (let i = 0; i < chapterMatches.length; i++) {
    const start = chapterMatches[i].index;
    const end = (i + 1 < chapterMatches.length) ? chapterMatches[i+1].index : fullText.length;
    const length = end - start;
    console.log(`${chapterMatches[i].citation} (Page ${chapterMatches[i].pageNum}): chars ${start} to ${end} (length: ${length})`);
  }
}

function uint8ArrayFromBuffer(buffer) {
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

main().catch(console.error);

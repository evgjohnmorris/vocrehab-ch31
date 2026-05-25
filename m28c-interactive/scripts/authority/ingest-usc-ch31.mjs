import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AuthorityRecordSchema } from '../../src/data/authority/schema/authorityRecord.schema.js';
import { logger } from './utils/logger.mjs';
import { fetchWithCache } from './utils/cache.mjs';

const SECTIONS = Array.from({ length: 23 }, (_, i) => (3100 + i).toString());
const OUTPUT_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/src/data/authority/generated/usc/sections';
const PARENT_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/src/data/authority/generated/usc';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function hashText(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<p[^>]*>/g, '\n\n')
    .replace(/<\/p>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '') // strip all remaining HTML tags
    .replace(/&sect;/g, '§')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&raquo;/g, '»')
    .replace(/&laquo;/g, '«')
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/\n{3,}/g, '\n\n') // normalize spacing
    .trim();
}

function extractField(html, fieldName) {
  const startTag = `<!-- field-start:${fieldName} -->`;
  const endTag = `<!-- field-end:${fieldName} -->`;
  const startIndex = html.indexOf(startTag);
  if (startIndex === -1) return '';
  const endIndex = html.indexOf(endTag, startIndex);
  if (endIndex === -1) return '';
  return html.slice(startIndex + startTag.length, endIndex);
}

async function ingestSection(sec) {
  logger.info(`Processing 38 U.S.C. § ${sec}...`);
  const url = `https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title38-section${sec}&num=0&edition=prelim`;
  
  const res = await fetchWithCache(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const html = await res.text();
  
  if (html.includes("Document not found")) {
    throw new Error("Document not found on OLRC");
  }

  const rawHead = extractField(html, 'head');
  const rawStatute = extractField(html, 'statute');
  const rawSource = extractField(html, 'sourcecredit');
  const rawNotes = extractField(html, 'notes');

  const cleanHead = cleanHtml(rawHead);
  let title = cleanHead;
  const titleMatch = cleanHead.match(/§\s*\d+\.\s*(.*)/);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  const fullText = cleanHtml(rawStatute);
  const textHash = hashText(fullText);

  // Extract statutory notes
  const amendmentNotes = [];
  if (rawNotes) {
    const cleanNotes = cleanHtml(rawNotes);
    amendmentNotes.push({
      note: cleanNotes
    });
  }

  const record = {
    id: `38-usc-${sec}`,
    canonicalCitation: `38 U.S.C. § ${sec}`,
    title: title || `Section ${sec}`,
    authorityLevel: "binding-statute",
    sourceType: "usc",
    sourceUrl: url,
    officialStatus: "official",
    lastChecked: new Date().toISOString().split('T')[0],
    sourceUpdated: "2026-05-19", // public law 119-93 release point
    effectiveDate: null,
    status: "current",
    fullText,
    plainEnglish: `This section establishes statutory rules for 38 U.S.C. § ${sec}.`,
    veteranUse: `Cite this section in your appeal to bind the VA to statutory Chapter 31 rules.`,
    topics: ["chapter-31", "statute"],
    relatedAuthorities: [],
    publicLawRefs: [],
    federalRegisterRefs: [],
    amendmentNotes,
    hash: textHash
  };

  // Validate using Zod schema
  const parsed = AuthorityRecordSchema.parse(record);

  const filePath = path.join(OUTPUT_DIR, `38-usc-${sec}.json`);
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));
  logger.success(`Ingested 38 U.S.C. § ${sec} -> ${filePath}`);

  return parsed;
}

async function main() {
  logger.info("Starting U.S. Code Chapter 31 Ingestion (Normalized Schema)...");
  const ingestedList = [];
  
  for (const sec of SECTIONS) {
    try {
      const record = await ingestSection(sec);
      ingestedList.push({
        id: record.id,
        citation: record.canonicalCitation,
        title: record.title,
        hash: record.hash
      });
      await new Promise(r => setTimeout(r, 100)); // rate limiting (reduced delay due to caching)
    } catch (err) {
      logger.error(`Ingesting section ${sec} failed: ${err.message}`);
      process.exit(1);
    }
  }

  // Write parent index
  const indexData = {
    title: "38 U.S.C. Chapter 31 - Training and Rehabilitation for Veterans with Service-Connected Disabilities",
    version: "2026.1",
    lastChecked: new Date().toISOString().split('T')[0],
    sections: ingestedList
  };
  fs.writeFileSync(path.join(PARENT_DIR, '38-usc-ch31.json'), JSON.stringify(indexData, null, 2));
  logger.success(`Index saved -> ${path.join(PARENT_DIR, '38-usc-ch31.json')}`);
}

main().catch(err => {
  logger.error("Main execution failed", err);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { AuthorityRecordSchema } from '../../src/data/authority/schema/authorityRecord.schema.js';
import { logger } from './utils/logger.mjs';
import { fetchWithCache } from './utils/cache.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const DATE = '2026-05-21';
const TITLE = '38';
const PART = '21';
const SUBPART = 'A';
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src/data/authority/generated/cfr/sections');
const PARENT_DIR = path.join(PROJECT_ROOT, 'src/data/authority/generated/cfr');

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
    .replace(/<div class="paragraph-authority">[^]*?<\/div>/g, '') // remove authority notes within section
    .replace(/<p class="citation">[^]*?<\/p>/g, '') // remove citation source lines within section
    .replace(/<[^>]+>/g, '') // strip all remaining HTML tags
    .replace(/&sect;/g, '§')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/\n{3,}/g, '\n\n') // normalize spacing
    .trim();
}

async function main() {
  logger.info("Fetching CFR Part 21 Subpart A from eCFR...");
  const url = `https://www.ecfr.gov/api/renderer/v1/content/enhanced/${DATE}/title-${TITLE}?part=${PART}&subpart=${SUBPART}`;
  
  try {
    const res = await fetchWithCache(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const html = await res.text();
    logger.success(`CFR Content downloaded, size: ${html.length} bytes`);

    // Find all sections by matching <div class="section" id="21.XXX">
    const sectionRegex = /<div class="section" id="([^"]+)">/g;
    const matches = [];
    let match;
    while ((match = sectionRegex.exec(html)) !== null) {
      matches.push({
        id: match[1], // e.g. "21.1" or "21.21"
        index: match.index
      });
    }

    logger.info(`Found ${matches.length} sections in Subpart A.`);
    const sectionList = [];

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const start = current.index;
      const end = next ? next.index : html.length;
      
      const sectionHtml = html.slice(start, end);

      // Extract section title from the <h4> heading inside the block
      const h4Match = sectionHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
      let heading = '';
      if (h4Match) {
        heading = h4Match[1].replace(/<[^>]+>/g, '').trim();
      }

      const sectionNum = current.id; // e.g. "21.1"
      const canonicalCitation = `38 C.F.R. § ${sectionNum}`;
      
      const titleCleanRegex = new RegExp(`§\\s*${sectionNum}\\s+`);
      let title = heading.replace(titleCleanRegex, '').trim();

      // Check if reserved
      const isReserved = heading.toLowerCase().includes('[reserved]') || title.toLowerCase().includes('[reserved]');
      const status = isReserved ? "reserved" : "current";
      
      let cleanBody = '';
      if (isReserved) {
        title = "[Reserved]";
        cleanBody = "[Reserved]";
      } else {
        cleanBody = cleanHtml(sectionHtml.replace(h4Match ? h4Match[0] : '', ''));
      }

      const textHash = hashText(cleanBody);

      // Extract authority note if present in the section block
      const authMatch = sectionHtml.match(/<div class="paragraph-authority">([\s\S]*?)<\/div>/) || 
                        sectionHtml.match(/<div class="section-authority">([\s\S]*?)<\/div>/);
      let authority = '';
      if (authMatch) {
        authority = authMatch[1].replace(/<[^>]+>/g, '').trim();
      }

      // Extract history citations (e.g. "[49 FR 40814, Oct. 18, 1984]")
      const citeMatch = sectionHtml.match(/<p class="citation">([\s\S]*?)<\/p>/);
      let history = '';
      if (citeMatch) {
        history = citeMatch[1].replace(/<[^>]+>/g, '').trim();
      }

      const record = {
        id: `38-cfr-${sectionNum.replace('.', '-')}`,
        canonicalCitation,
        title: title || `Section ${sectionNum}`,
        authorityLevel: "binding-regulation",
        sourceType: "cfr",
        sourceUrl: url,
        officialStatus: "current-unofficial",
        lastChecked: new Date().toISOString().split('T')[0],
        sourceUpdated: DATE,
        effectiveDate: null,
        status,
        fullText: cleanBody,
        plainEnglish: `Explanatory guidance for 38 C.F.R. § ${sectionNum}.`,
        veteranUse: `Cite this regulation in your claim to establish counselor duty under § ${sectionNum}.`,
        topics: ["chapter-31", "regulation"],
        relatedAuthorities: [],
        publicLawRefs: [],
        federalRegisterRefs: [],
        amendmentNotes: history ? [{ note: history }] : [],
        hash: textHash
      };

      // Validate against Zod schema
      const parsed = AuthorityRecordSchema.parse(record);

      const filename = `38-cfr-${sectionNum.replace('.', '-')}.json`;
      const filePath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

      sectionList.push({
        id: parsed.id,
        section: sectionNum,
        citation: parsed.canonicalCitation,
        title: parsed.title,
        status: parsed.status,
        hash: parsed.hash
      });
      
      logger.success(`Ingested ${canonicalCitation} -> ${filename}`);
    }

    // Save parent index
    const indexData = {
      title: "38 C.F.R. Part 21 Subpart A - Veteran Readiness and Employment",
      version: DATE,
      lastChecked: new Date().toISOString().split('T')[0],
      sections: sectionList
    };
    fs.writeFileSync(path.join(PARENT_DIR, 'part-21-subpart-a.json'), JSON.stringify(indexData, null, 2));
    logger.success(`Index saved -> ${path.join(PARENT_DIR, 'part-21-subpart-a.json')}`);

  } catch (err) {
    logger.error(`CFR Ingestion failed: ${err.message}`);
    process.exit(1);
  }
}

main();

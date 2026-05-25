import fs from 'fs';
import path from 'path';

const DATE = '2026-05-21';
const TITLE = '38';
const PART = '21';
const SUBPART = 'A';
const OUTPUT_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/public/authority/generated/regulations';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
  console.log("Fetching CFR Part 21 Subpart A from eCFR...");
  const url = `https://www.ecfr.gov/api/renderer/v1/content/enhanced/${DATE}/title-${TITLE}?part=${PART}&subpart=${SUBPART}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const html = await res.text();
    console.log("CFR Content downloaded, size:", html.length);

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

    console.log(`Found ${matches.length} sections in Subpart A.`);

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const start = current.index;
      const end = next ? next.index : html.length;
      
      const sectionHtml = html.slice(start, end);

      // Extract section title from the <h4> heading inside the block
      // Format: <h4 ...>§ 21.1 Training and rehabilitation...</h4>
      const h4Match = sectionHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
      let heading = '';
      if (h4Match) {
        heading = h4Match[1].replace(/<[^>]+>/g, '').trim();
      }

      // Format clean citation and title
      // e.g. heading: "§ 21.1 Training and rehabilitation..."
      // citation: "38 C.F.R. § 21.1"
      // title: "Training and rehabilitation..."
      let title = heading;
      const sectionNum = current.id; // e.g. "21.1"
      const citation = `38 C.F.R. § ${sectionNum}`;
      
      // Clean section header from title
      const titleCleanRegex = new RegExp(`§\\s*${sectionNum}\\s+`);
      title = heading.replace(titleCleanRegex, '').trim();

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

      // Clean the main body text
      const cleanBody = cleanHtml(sectionHtml.replace(h4Match ? h4Match[0] : '', ''));

      const data = {
        id: sectionNum.replace('.', '_'), // e.g. "21_1"
        section: sectionNum,
        citation,
        title,
        text: cleanBody,
        authority,
        history,
        level: "binding_law",
        lastChecked: DATE
      };

      // Write to JSON
      const filename = `${sectionNum.replace('.', '_')}.json`;
      const filePath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`[SAVED] ${citation} -> ${filename}`);
    }

    console.log("CFR Part 21 Subpart A Ingestion Complete.");
  } catch (err) {
    console.error("CFR Ingestion failed:", err.message);
  }
}

main();

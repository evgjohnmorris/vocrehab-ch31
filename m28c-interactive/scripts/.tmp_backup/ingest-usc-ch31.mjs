import fs from 'fs';
import path from 'path';

const SECTIONS = Array.from({ length: 23 }, (_, i) => (3100 + i).toString());
const OUTPUT_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/public/authority/generated/statutes';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
  console.log(`Ingesting 38 U.S.C. § ${sec}...`);
  const url = `https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title38-section${sec}&num=0&edition=prelim`;
  
  try {
    const res = await fetch(url);
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
    // Find section title from cleanHead (e.g. "§3100. Purposes" -> "Purposes")
    let title = cleanHead;
    const titleMatch = cleanHead.match(/§\s*\d+\.\s*(.*)/);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    const data = {
      id: sec,
      citation: `38 U.S.C. § ${sec}`,
      title: title || `Section ${sec}`,
      text: cleanHtml(rawStatute),
      sourceCredit: cleanHtml(rawSource),
      notes: cleanHtml(rawNotes),
      level: "binding_law",
      lastChecked: new Date().toISOString().split('T')[0]
    };

    const filePath = path.join(OUTPUT_DIR, `${sec}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`[SAVED] 38 U.S.C. § ${sec} -> ${filePath}`);
    
    // Throttle requests slightly
    await new Promise(r => setTimeout(r, 200));
  } catch (err) {
    console.error(`[FAILED] Section ${sec}: ${err.message}`);
    // If it fails, write a basic skeleton or throw
    throw err;
  }
}

async function main() {
  console.log("Starting U.S. Code Chapter 31 Ingestion...");
  for (const sec of SECTIONS) {
    try {
      await ingestSection(sec);
    } catch (err) {
      console.error(`Skipping section ${sec} due to error.`);
    }
  }
  console.log("U.S. Code Chapter 31 Ingestion Complete.");
}

main();

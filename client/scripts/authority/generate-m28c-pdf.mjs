import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { logger } from './utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const CHAPTERS_DIR = path.join(PROJECT_ROOT, 'src/data/authority/generated/m28c/chapters');
const INDEX_PATH = path.join(PROJECT_ROOT, 'src/data/authority/generated/m28c/m28c-index.json');
const ROOT_PDF_PATH = path.resolve(PROJECT_ROOT, '../m28_manual.pdf');
const PUBLIC_PDF_PATH = path.resolve(PROJECT_ROOT, 'public/m28_manual.pdf');

// Ensure public directory exists
const publicDir = path.dirname(PUBLIC_PDF_PATH);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function linkCitations(text) {
  if (!text) return "";
  
  // Link 38 U.S.C. XXX
  text = text.replace(/38\s+U\.S\.C\.\s+(?:section\s+)?(\d+)/gi, (match, secNum) => {
    return `<a href="https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title38-section${secNum}&amp;edition=prelim" style="color: #ac5a39; text-decoration: none; font-weight: 600;">38 U.S.C. ${secNum}</a>`;
  });

  // Link 38 C.F.R. § 21.XX
  text = text.replace(/38\s+C\.F\.R\.\s+(?:§\s*)?21\.(\d+)/gi, (match, secNum) => {
    return `<a href="https://www.ecfr.gov/current/title-38/chapter-I/part-21/subpart-A/section-21.${secNum}" style="color: #1a365d; text-decoration: none; font-weight: 600;">38 C.F.R. § 21.${secNum}</a>`;
  });
  
  return text;
}

function formatContent(text) {
  if (!text) return "";
  
  const lines = text.split('\n');
  let inList = false;
  let html = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      continue;
    }

    // Check if it's a bold list item representing a subsection (e.g. * **Title**: Text)
    const boldMatch = line.match(/^[\*\-]\s+\*\*(.*?)\*\*:\s*(.*)$/);
    if (boldMatch) {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      
      const titleEscaped = escapeHtml(boldMatch[1]);
      let textEscaped = escapeHtml(boldMatch[2]);
      textEscaped = linkCitations(textEscaped);
      
      // Style VA Error Spotter differently
      if (titleEscaped.includes("VA Error Spotter")) {
        html += `<div class="subsection-block error-spotter-block">\n  <span class="subsection-title error-spotter-title">⚠️ ${titleEscaped}</span>\n  <span class="subsection-text">${textEscaped}</span>\n</div>\n`;
      } else {
        html += `<div class="subsection-block">\n  <span class="subsection-title">${titleEscaped}</span>\n  <span class="subsection-text">${textEscaped}</span>\n</div>\n`;
      }
      continue;
    }

    // Header level 3 (Sections)
    if (line.startsWith('###')) {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      const headingText = line.replace(/^###\s*/, '');
      const numMatch = headingText.match(/^(\d+\.\d+)\s+(.*)$/);
      if (numMatch) {
        html += `<h3 class="section-title"><span class="section-num">${escapeHtml(numMatch[1])}</span> <span class="section-text-inner">${escapeHtml(numMatch[2])}</span></h3>\n`;
      } else {
        html += `<h3 class="section-title">${escapeHtml(headingText)}</h3>\n`;
      }
      continue;
    }

    // Header level 2
    if (line.startsWith('##')) {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      html += `<h2>${escapeHtml(line.replace(/^##\s*/, ''))}</h2>\n`;
      continue;
    }

    // Header level 1
    if (line.startsWith('#')) {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      html += `<h1>${escapeHtml(line.replace(/^#\s*/, ''))}</h1>\n`;
      continue;
    }

    // Lists
    if (line.startsWith('*') || line.startsWith('-')) {
      if (!inList) {
        html += "<ul>\n";
        inList = true;
      }
      let liText = escapeHtml(line.replace(/^[\*\-]\s*/, ''));
      liText = linkCitations(liText);
      html += `  <li>${liText}</li>\n`;
      continue;
    }

    // Regular paragraphs
    if (inList) {
      html += "</ul>\n";
      inList = false;
    }
    
    let pText = escapeHtml(line);
    pText = linkCitations(pText);

    // Check if it looks like a manual subsection index, e.g. M28C.I.A.1.01.a
    if (line.startsWith('M28C.') || /^\d+\.\d+/.test(line)) {
      html += `<p class="manual-section"><strong>${pText}</strong></p>\n`;
    } else {
      html += `<p>${pText}</p>\n`;
    }
  }

  if (inList) {
    html += "</ul>\n";
  }

  return html;
}

async function main() {
  logger.info("Initializing M28C PDF Compiler (Architectural & Styled Edition)...");

  if (!fs.existsSync(INDEX_PATH)) {
    logger.error(`Manual index not found at ${INDEX_PATH}. Run ingestion first.`);
    process.exit(1);
  }

  const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  const chapters = [];

  for (const item of indexData.chapters) {
    const chapPath = path.join(CHAPTERS_DIR, `${item.id}.json`);
    if (!fs.existsSync(chapPath)) {
      logger.warn(`Chapter file missing: ${chapPath}`);
      continue;
    }
    const chapData = JSON.parse(fs.readFileSync(chapPath, 'utf8'));
    chapters.push(chapData);
  }

  logger.info(`Loaded ${chapters.length} chapters. Organizing into logical Lifecycle Phases...`);

  // Group chapters by Veteran Lifecycle Phase
  const partsList = [
    { 
      id: "PHASE 1", 
      title: "Entry, Evaluation, & Entitlement", 
      subtitle: "Initial application, VRC assessment, and Employment Handicap determinations",
      chapterIds: ["m28c-i-a-1", "m28c-iv-a-2", "m28c-iv-b-1"],
      chapters: []
    },
    { 
      id: "PHASE 2", 
      title: "Career Strategy & Plan Construction", 
      subtitle: "Vocational goals, feasibility assessments, and IWRP/IILP development",
      chapterIds: ["m28c-iv-b-2", "m28c-iv-b-3", "m28c-iv-c-4", "m28c-iv-c-6"],
      chapters: []
    },
    { 
      id: "PHASE 3", 
      title: "Tuition Procurement, Technology, & Supplies", 
      subtitle: "School selection, laptop packages, and cost approval thresholds",
      chapterIds: ["m28c-iv-c-1", "m28c-v-a-3", "m28c-v-b-1", "m28c-v-b-5-01"],
      chapters: []
    },
    { 
      id: "PHASE 4", 
      title: "Maintenance, Subsistence, & GI Bill Restoration", 
      subtitle: "Direct reimbursements, monthly allowance elections, and retroactive inductions",
      chapterIds: ["m28c-i-a-2", "m28c-v-b-7", "m28c-v-b-6"],
      chapters: []
    },
    { 
      id: "PHASE 5", 
      title: "Disputes & Advisory Committees", 
      subtitle: "Appealing decisions and case reviews by the Vocational Rehabilitation Panel",
      chapterIds: ["m28c-ii-a-4"],
      chapters: []
    }
  ];

  // Map loaded chapters into the parts list based on their IDs
  partsList.forEach(part => {
    part.chapterIds.forEach(cid => {
      const match = chapters.find(chap => chap.id === cid);
      if (match) {
        part.chapters.push(match);
      }
    });
  });

  // Build Table of Contents HTML
  let tocHtml = `<div class="toc-page">
    <h2 class="toc-title">Table of Contents</h2>
    <div class="toc-container">`;
  
  partsList.forEach(part => {
    if (part.chapters.length === 0) return;
    
    tocHtml += `
      <div class="toc-part-header">
        <span class="toc-part-id">${part.id}</span>
        <span class="toc-part-title">${escapeHtml(part.title)}</span>
      </div>`;
    
    part.chapters.forEach(chap => {
      tocHtml += `
        <div class="toc-item">
          <span class="toc-citation">${escapeHtml(chap.canonicalCitation)}</span>
          <span class="toc-chapter-title">${escapeHtml(chap.title)}</span>
          <span class="toc-dots"></span>
        </div>`;
    });
  });
  
  tocHtml += `</div></div>`;

  // Build Chapters HTML with Part transition pages
  let chaptersHtml = "";
  partsList.forEach(part => {
    if (part.chapters.length === 0) return;
    
    chaptersHtml += `
      <div class="part-page">
        <div class="part-page-center">
          <div class="part-number">${part.id}</div>
          <div class="part-divider"></div>
          <h1 class="part-title">${escapeHtml(part.title)}</h1>
          <p class="part-subtitle">${escapeHtml(part.subtitle)}</p>
        </div>
      </div>`;
    
    part.chapters.forEach((chap) => {
      const formatted = formatContent(chap.fullText);
      chaptersHtml += `
        <div class="chapter-container">
          <div class="chapter-header">
            <span class="chapter-citation-top">${escapeHtml(chap.canonicalCitation)}</span>
            <span class="chapter-title-top">${escapeHtml(chap.title)}</span>
          </div>
          <h1 class="chapter-main-title">${escapeHtml(chap.canonicalCitation)} &mdash; ${escapeHtml(chap.title)}</h1>
          ${chap.displayWarning ? `<div class="warning-banner">${escapeHtml(chap.displayWarning)}</div>` : ''}
          <div class="chapter-body">
            ${formatted}
          </div>
        </div>`;
    });
  });

  // Construct complete HTML file with print layout CSS rules
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>VA M28C Chapter 31 Policy Manual</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  @page {
    size: letter;
    margin: 1in;
    @bottom-right {
      content: counter(page);
    }
  }
  
  body {
    font-family: 'Lora', Georgia, serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #1a202c;
    margin: 0;
    padding: 0;
  }

  h1, h2, h3, h4, h5, h6, .toc-title, .cover-title {
    font-family: 'Inter', Helvetica, Arial, sans-serif;
    color: #1a365d;
    font-weight: 700;
  }

  /* Cover Page Styling */
  .cover-page {
    page-break-after: always;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 1.5in 0.5in;
    border-left: 8px double #1a365d;
    padding-left: 1in;
  }

  .cover-top {
    text-align: left;
  }

  .cover-org {
    font-family: 'Inter', sans-serif;
    font-size: 12pt;
    letter-spacing: 0.15em;
    color: #ac5a39;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 0.2in;
  }

  .cover-title {
    font-size: 32pt;
    line-height: 1.15;
    margin: 0.2in 0;
    color: #1a365d;
    font-weight: 800;
  }

  .cover-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 16pt;
    color: #4a5568;
    font-weight: 400;
    margin-top: 0.1in;
  }

  .cover-shield-container {
    margin: 40px 0;
    text-align: left;
  }

  .cover-bottom {
    text-align: left;
    border-top: 2px solid #e2e8f0;
    padding-top: 0.3in;
  }

  .cover-meta {
    font-family: 'Inter', sans-serif;
    font-size: 10.5pt;
    color: #718096;
    margin: 0.08in 0;
  }

  /* Table of Contents */
  .toc-page {
    page-break-after: always;
    padding-top: 0.5in;
  }

  .toc-title {
    font-size: 22pt;
    border-bottom: 3px solid #1a365d;
    padding-bottom: 8px;
    margin-bottom: 25px;
  }

  .toc-container {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .toc-part-header {
    display: flex;
    gap: 12px;
    align-items: center;
    border-bottom: 1px solid #1a365d;
    padding-bottom: 4px;
    margin-top: 15px;
  }

  .toc-part-id {
    font-weight: 800;
    color: #1a365d;
    font-size: 10pt;
    letter-spacing: 0.05em;
  }

  .toc-part-title {
    font-weight: 600;
    color: #4a5568;
    font-size: 9.5pt;
    text-transform: uppercase;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    padding-left: 15px;
  }

  .toc-citation {
    font-weight: 600;
    color: #ac5a39;
    width: 110px;
    flex-shrink: 0;
  }

  .toc-chapter-title {
    color: #2d3748;
    flex-grow: 1;
    text-align: left;
  }

  .toc-dots {
    border-bottom: 1px dotted #cbd5e0;
    flex-grow: 0.1;
    width: 50px;
    margin-left: 10px;
  }

  /* Part Transition Pages */
  .part-page {
    page-break-before: always;
    page-break-after: always;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    padding: 2in;
    text-align: center;
  }

  .part-page-center {
    width: 100%;
  }

  .part-number {
    font-family: 'Inter', sans-serif;
    font-size: 16pt;
    font-weight: 700;
    color: #ac5a39;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .part-divider {
    height: 4px;
    width: 80px;
    background-color: #1a365d;
    margin: 20px auto;
  }

  .part-title {
    font-size: 24pt;
    color: #1a365d;
    line-height: 1.25;
    margin: 10px 0;
  }

  .part-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 11pt;
    color: #718096;
    margin-top: 15px;
  }

  /* Chapter Container and Pagebreaks */
  .chapter-container {
    page-break-before: always;
    padding-top: 0.2in;
  }

  .chapter-header {
    display: flex;
    justify-content: space-between;
    font-family: 'Inter', sans-serif;
    font-size: 8.5pt;
    color: #a0aec0;
    border-bottom: 1px solid #edf2f7;
    padding-bottom: 5px;
    margin-bottom: 25px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chapter-main-title {
    font-size: 18pt;
    line-height: 1.3;
    margin-bottom: 30px;
    color: #1a365d;
  }

  .warning-banner {
    background-color: #fffaf0;
    border-left: 4px solid #dd6b20;
    padding: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 9.5pt;
    color: #dd6b20;
    margin-bottom: 25px;
    font-weight: 500;
  }

  /* Section and Subsection Styles */
  .section-title {
    font-size: 13pt;
    margin-top: 35px;
    margin-bottom: 15px;
    color: #1a365d;
    border-bottom: 1px solid #edf2f7;
    padding-bottom: 6px;
    page-break-after: avoid;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-num {
    background-color: #1a365d;
    color: #ffffff;
    font-size: 9pt;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Inter', sans-serif;
    flex-shrink: 0;
  }

  .section-text-inner {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
  }

  .subsection-block {
    margin: 15px 0 15px 15px;
    padding: 10px 18px;
    border-left: 3.5px solid #ac5a39;
    background-color: #fcfcfb;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
  }

  .error-spotter-block {
    border-left: 3.5px solid #e53e3e;
    background-color: #fff5f5;
  }

  .subsection-title {
    display: block;
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    font-weight: 700;
    color: #ac5a39;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .error-spotter-title {
    color: #e53e3e;
  }

  .subsection-text {
    font-size: 10.5pt;
    line-height: 1.55;
    color: #2d3748;
    display: block;
    text-align: justify;
  }

  .chapter-body p {
    margin-bottom: 1.2em;
    text-align: justify;
  }

  .chapter-body h2 {
    font-size: 14pt;
    margin-top: 1.5in;
    margin-bottom: 15px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 5px;
    page-break-after: avoid;
  }

  .chapter-body h3 {
    font-size: 12pt;
    margin-top: 1.2in;
    margin-bottom: 12px;
    page-break-after: avoid;
  }

  .manual-section {
    margin-top: 15px;
    margin-bottom: 5px;
    color: #2d3748;
  }

  ul {
    margin-top: 0;
    margin-bottom: 1.2em;
    padding-left: 20px;
  }

  li {
    margin-bottom: 0.5em;
  }

</style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-top">
      <div class="cover-org">U.S. Department of Veterans Affairs</div>
      <div class="cover-title">Veteran Readiness &amp; Employment<br>M28C Policy Manual</div>
      <div class="cover-subtitle">Chapter 31 Rehabilitation Policy and Procedures</div>
      
      <div class="cover-shield-container">
        <svg class="cover-shield" viewBox="0 0 100 100" width="90" height="90" style="fill: #1a365d; display: block;">
          <path d="M50 5 L10 25 L10 55 C10 75 30 90 50 95 C70 90 90 75 90 55 L90 25 Z" />
          <path d="M50 12 L18 29 L18 53 C18 69 34 82 50 87 C66 82 82 69 82 53 L82 29 Z" fill="#fff" />
          <path d="M50 17 L24 33 L24 51 C24 64 37 75 50 80 C63 75 76 64 76 51 L76 33 Z" fill="#ac5a39" />
        </svg>
      </div>
    </div>
    
    <div class="cover-bottom">
      <div class="cover-meta">Verbatim Reference Publication &amp; Database Index</div>
      <div class="cover-meta">Effective Date: May 26, 2026</div>
      <div class="cover-meta">Office of Veteran Readiness and Employment (VR&amp;E)</div>
    </div>
  </div>

  <!-- Table of Contents -->
  ${tocHtml}

  <!-- Manual Chapters -->
  ${chaptersHtml}

</body>
</html>
`;

  // Write temporary HTML file for Playwright rendering
  const tempHtmlPath = path.join(PROJECT_ROOT, '.tmp/m28c_manual_print.html');
  const tempDir = path.dirname(tempHtmlPath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
  logger.info(`Wrote temporary HTML to ${tempHtmlPath}`);

  // Launch Playwright and generate PDF
  logger.info("Launching chromium for PDF generation...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`file://${tempHtmlPath}`);
  logger.info("Loading fonts and layout elements...");
  await page.waitForTimeout(4000); // wait for fonts to load

  logger.info("Compiling print layout and saving PDF...");
  
  // PDF configurations matching high-quality publishing standards
  const pdfOptions = {
    path: ROOT_PDF_PATH,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '1in',
      bottom: '1in',
      left: '1in',
      right: '1in'
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 7.5px; color: #cbd5e0; width: 100%; padding: 0 1in; box-sizing: border-box; border-bottom: 0.5px solid #edf2f7; padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
        <span>U.S. Department of Veterans Affairs &mdash; Chapter 31 Policy Manual</span>
        <span>Verbatim Reference Publication</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 8px; color: #a0aec0; width: 100%; padding: 0 1in; box-sizing: border-box; display: flex; justify-content: space-between;">
        <span>VA M28C Veteran Readiness & Employment Manual</span>
        <span>Page <class class="pageNumber"></class> of <class class="totalPages"></class></span>
      </div>
    `
  };

  await page.pdf(pdfOptions);
  logger.success(`Verbatim PDF generated successfully at root: ${ROOT_PDF_PATH}`);

  // Copy to public folder
  fs.copyFileSync(ROOT_PDF_PATH, PUBLIC_PDF_PATH);
  logger.success(`Verbatim PDF copied to public assets: ${PUBLIC_PDF_PATH}`);

  await browser.close();
  
  // Cleanup temp HTML
  try {
    fs.unlinkSync(tempHtmlPath);
  } catch (err) {
    // ignore
  }

  logger.success("M28C PDF build pipeline completed successfully.");
}

main().catch(err => {
  logger.error(`PDF generation failed: ${err.message}`);
  process.exit(1);
});

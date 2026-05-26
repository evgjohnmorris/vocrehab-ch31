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

function formatContent(text) {
  if (!text) return "";
  
  // Format standard lines, section headers, bullet lists, etc.
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

    // Header level 3
    if (line.startsWith('###')) {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      html += `<h3>${escapeHtml(line.replace(/^###\s*/, ''))}</h3>\n`;
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
      html += `  <li>${escapeHtml(line.replace(/^[\*\-]\s*/, ''))}</li>\n`;
      continue;
    }

    // Regular paragraphs
    if (inList) {
      html += "</ul>\n";
      inList = false;
    }
    
    // Check if it looks like a manual subsection index, e.g. M28C.I.A.1.01.a
    if (line.startsWith('M28C.') || /^\d+\.\d+/.test(line)) {
      html += `<p class="manual-section"><strong>${escapeHtml(line)}</strong></p>\n`;
    } else {
      html += `<p>${escapeHtml(line)}</p>\n`;
    }
  }

  if (inList) {
    html += "</ul>\n";
  }

  return html;
}

async function main() {
  logger.info("Initializing M28C PDF Compiler...");

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

  logger.info(`Loaded ${chapters.length} chapters. Compiling HTML document...`);

  // Build Table of Contents HTML
  let tocHtml = `<div class="toc-page">
    <h2 class="toc-title">Table of Contents</h2>
    <div class="toc-grid">`;
  
  chapters.forEach((chap, idx) => {
    tocHtml += `
      <div class="toc-item">
        <span class="toc-citation">${escapeHtml(chap.canonicalCitation)}</span>
        <span class="toc-dots"></span>
        <span class="toc-chapter-title">${escapeHtml(chap.title)}</span>
      </div>`;
  });
  
  tocHtml += `</div></div>`;

  // Build Chapters HTML
  let chaptersHtml = "";
  chapters.forEach((chap) => {
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
    line-height: 1.6;
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
    padding: 2in 0;
  }

  .cover-top {
    text-align: center;
  }

  .cover-org {
    font-family: 'Inter', sans-serif;
    font-size: 14pt;
    letter-spacing: 0.15em;
    color: #4a5568;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 0.5in;
  }

  .cover-title {
    font-size: 28pt;
    line-height: 1.2;
    margin: 0.5in 0;
    color: #1a365d;
  }

  .cover-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 16pt;
    color: #4a5568;
    font-weight: 400;
  }

  .cover-bottom {
    text-align: center;
    border-top: 2px solid #e2e8f0;
    padding-top: 0.5in;
  }

  .cover-meta {
    font-family: 'Inter', sans-serif;
    font-size: 11pt;
    color: #718096;
    margin: 0.1in 0;
  }

  /* Table of Contents */
  .toc-page {
    page-break-after: always;
    padding-top: 0.5in;
  }

  .toc-title {
    font-size: 20pt;
    border-bottom: 2px solid #1a365d;
    padding-bottom: 10px;
    margin-bottom: 30px;
  }

  .toc-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: 'Inter', sans-serif;
    font-size: 11pt;
  }

  .toc-citation {
    font-weight: 600;
    color: #1a365d;
    width: 120px;
    flex-shrink: 0;
  }

  .toc-dots {
    flex-grow: 1;
    border-bottom: 1px dotted #cbd5e0;
    margin: 0 10px;
  }

  .toc-chapter-title {
    color: #2d3748;
    max-width: 450px;
    text-align: right;
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
    background-color: #f7fafc;
    border-left: 4px solid #dd6b20;
    padding: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 9.5pt;
    color: #dd6b20;
    margin-bottom: 25px;
    font-weight: 500;
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

  /* Page Numbering Footer style (for screen preview, browser print handles footer elements) */
  .footer-element {
    position: fixed;
    bottom: -0.5in;
    right: 0;
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: #a0aec0;
  }

</style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-top">
      <div class="cover-org">U.S. Department of Veterans Affairs</div>
      <div class="cover-title">Veteran Readiness & Employment<br>M28C Manual</div>
      <div class="cover-subtitle">Chapter 31 Policy and Procedures Manual</div>
    </div>
    <div class="cover-bottom">
      <div class="cover-meta">Verbatim Reference Publication</div>
      <div class="cover-meta">Effective Date: May 26, 2026</div>
      <div class="cover-meta">Office of Veteran Readiness and Employment</div>
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
    headerTemplate: '<div></div>',
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

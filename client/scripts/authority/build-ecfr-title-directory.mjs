import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithCache } from './utils/cache.mjs';
import { logger } from './utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const STRUCTURE_DATE = '2026-05-22';
const TITLE_NUMBERS = ['20', '5', '15', '16', '24', '26', '34', '45', '41', '46', '48'];
const OUTPUT_BASE = path.join(PROJECT_ROOT, 'public', 'authority');
const OUTPUT_DIR = path.join(OUTPUT_BASE, 'ecfr');
const DIRECTORY_FILE = path.join(OUTPUT_BASE, 'ecfr-title-directory.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function stripHtml(input) {
  return String(input || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function createStats() {
  return {
    totalNodes: 0,
    reservedNodes: 0,
    chapters: 0,
    subtitles: 0,
    subchapters: 0,
    parts: 0,
    subparts: 0,
    sections: 0,
    appendices: 0,
    subjectGroups: 0,
    other: 0
  };
}

function incrementStats(stats, type, reserved) {
  stats.totalNodes += 1;
  if (reserved) {
    stats.reservedNodes += 1;
  }

  if (type === 'chapter') stats.chapters += 1;
  else if (type === 'subtitle') stats.subtitles += 1;
  else if (type === 'subchapter') stats.subchapters += 1;
  else if (type === 'part') stats.parts += 1;
  else if (type === 'subpart') stats.subparts += 1;
  else if (type === 'section') stats.sections += 1;
  else if (type === 'appendix') stats.appendices += 1;
  else if (type === 'subject_group') stats.subjectGroups += 1;
  else stats.other += 1;
}

function flattenTree(rootNode) {
  const stats = createStats();
  const items = [];

  function walk(node, ancestors) {
    const label = stripHtml(node.label);
    const labelLevel = stripHtml(node.label_level);
    const description = stripHtml(node.label_description);
    const identifier = stripHtml(node.identifier);
    const pathEntries = [...ancestors, label || `${node.type} ${identifier}`];
    const pathLabel = pathEntries.join(' > ');
    const depth = ancestors.length;
    const reserved = Boolean(node.reserved);

    incrementStats(stats, node.type, reserved);

    if (depth > 0) {
      items.push({
        id: [rootNode.identifier, ...ancestors, `${node.type}:${identifier}`].join('|'),
        type: node.type,
        identifier,
        label,
        labelLevel,
        description,
        depth,
        reserved,
        volumes: Array.isArray(node.volumes) ? node.volumes.map(String) : [],
        receivedOn: node.received_on || null,
        descendantRange: stripHtml(node.descendant_range),
        childCount: Array.isArray(node.children) ? node.children.length : 0,
        pathLabel
      });
    }

    const nextAncestors = [...ancestors, label || `${node.type} ${identifier}`];
    for (const child of node.children || []) {
      walk(child, nextAncestors);
    }
  }

  walk(rootNode, []);

  return { items, stats };
}

function buildTopLevelSummary(rootNode) {
  return (rootNode.children || []).map((child) => ({
    identifier: stripHtml(child.identifier),
    label: stripHtml(child.label),
    type: child.type,
    reserved: Boolean(child.reserved),
    childCount: Array.isArray(child.children) ? child.children.length : 0,
    descendantRange: stripHtml(child.descendant_range)
  }));
}

function buildKeywordList(rootNode, topLevelSummary) {
  const keywords = new Set([
    stripHtml(rootNode.identifier),
    stripHtml(rootNode.label),
    stripHtml(rootNode.label_description)
  ]);

  topLevelSummary.slice(0, 8).forEach((entry) => {
    keywords.add(entry.identifier);
    keywords.add(entry.label);
  });

  return Array.from(keywords)
    .flatMap((value) => String(value || '').split(/\s+/))
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

async function buildTitleRecord(titleNumber) {
  const apiUrl = `https://www.ecfr.gov/api/versioner/v1/structure/${STRUCTURE_DATE}/title-${titleNumber}.json`;
  const currentUrl = `https://www.ecfr.gov/current/title-${titleNumber}`;

  logger.info(`Fetching eCFR title structure for Title ${titleNumber}...`);
  const response = await fetchWithCache(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${apiUrl}: HTTP ${response.status}`);
  }

  const structure = await response.json();
  const titleLabel = stripHtml(structure.label);
  const titleDescription = stripHtml(structure.label_description);
  const topLevelSummary = buildTopLevelSummary(structure);
  const { items, stats } = flattenTree(structure);
  const keywords = buildKeywordList(structure, topLevelSummary);

  const detailRecord = {
    id: `title-${titleNumber}`,
    titleNumber,
    label: titleLabel,
    shortLabel: titleDescription,
    structureDate: STRUCTURE_DATE,
    currentUrl,
    apiUrl,
    itemCount: items.length,
    stats,
    topLevelSummary,
    items
  };

  const summaryRecord = {
    id: detailRecord.id,
    titleNumber,
    label: titleLabel,
    shortLabel: titleDescription,
    structureDate: STRUCTURE_DATE,
    currentUrl,
    apiUrl,
    itemCount: items.length,
    stats,
    topLevelSummary: topLevelSummary.slice(0, 6),
    keywords
  };

  const detailPath = path.join(OUTPUT_DIR, `${detailRecord.id}.json`);
  fs.writeFileSync(detailPath, JSON.stringify(detailRecord, null, 2));
  logger.success(`Saved ${detailPath}`);

  return summaryRecord;
}

async function main() {
  ensureDir(OUTPUT_DIR);

  const titles = [];
  for (const titleNumber of TITLE_NUMBERS) {
    titles.push(await buildTitleRecord(titleNumber));
  }

  const directory = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    structureDate: STRUCTURE_DATE,
    titleCount: titles.length,
    titles
  };

  fs.writeFileSync(DIRECTORY_FILE, JSON.stringify(directory, null, 2));
  logger.success(`Saved ${DIRECTORY_FILE}`);
}

main().catch((error) => {
  logger.error(`Failed to build eCFR title directory: ${error.message}`);
  process.exit(1);
});

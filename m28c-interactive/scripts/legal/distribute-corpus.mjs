import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const SRC_BASE = path.join(PROJECT_ROOT, 'src/data/authority');
const SRC_USC = path.join(SRC_BASE, 'generated/usc/sections');
const SRC_CFR = path.join(SRC_BASE, 'generated/cfr/sections');
const SRC_M28C = path.join(SRC_BASE, 'generated/m28c/chapters');

const PUBLIC_BASE = path.join(PROJECT_ROOT, 'public/authority');
const PUBLIC_USC = path.join(PUBLIC_BASE, 'usc');
const PUBLIC_CFR = path.join(PUBLIC_BASE, 'cfr');
const PUBLIC_M28C = path.join(PUBLIC_BASE, 'm28c');
const PUBLIC_SEARCH = path.join(PROJECT_ROOT, 'public/search');

function hashText(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  console.log("Distributing legal corpus to public assets...");
  ensureDir(PUBLIC_USC);
  ensureDir(PUBLIC_CFR);
  ensureDir(PUBLIC_M28C);
  ensureDir(PUBLIC_SEARCH);

  const manifest = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    statutes: [],
    regulations: [],
    m28c: []
  };

  const searchIndex = [];

  // 1. Process Statutes (38 U.S.C.)
  const uscFiles = fs.readdirSync(SRC_USC).filter(f => f.endsWith('.json'));
  uscFiles.forEach(file => {
    const raw = fs.readFileSync(path.join(SRC_USC, file), 'utf8');
    const data = JSON.parse(raw);
    
    // Naming pattern matches standard ID: e.g. 38-usc-3104.json
    const id = data.id; // e.g. "38-usc-3104"
    const destName = `${id}.json`;
    const destPath = path.join(PUBLIC_USC, destName);
    
    // Add snapshot/pinning metadata if missing
    data.snapshotDate = data.snapshotDate || "2026-05-25";
    data.sourceLastChecked = data.sourceLastChecked || "2026-05-25";
    data.hash = hashText(data.fullText || data.text || '');
    data.previousHash = data.previousHash || data.hash;
    data.changedSinceLastSnapshot = data.changedSinceLastSnapshot || false;

    fs.writeFileSync(destPath, JSON.stringify(data, null, 2));

    manifest.statutes.push({
      id: id, // keep full canonical ID
      citation: data.canonicalCitation || `38 U.S.C. § ${id.split('-').pop()}`,
      title: data.title,
      hash: data.hash,
      lastChecked: data.lastChecked
    });

    searchIndex.push({
      id: data.id,
      type: "usc",
      citation: data.canonicalCitation,
      title: data.title,
      text: data.fullText,
      topics: data.topics
    });
  });

  // 2. Process Regulations (38 C.F.R.)
  const cfrFiles = fs.readdirSync(SRC_CFR).filter(f => f.endsWith('.json'));
  cfrFiles.forEach(file => {
    const raw = fs.readFileSync(path.join(SRC_CFR, file), 'utf8');
    const data = JSON.parse(raw);
    
    // Naming pattern matches standard ID: e.g. 38-cfr-21-212.json
    const id = data.id; // e.g. "38-cfr-21-212"
    const destName = `${id}.json`;
    const destPath = path.join(PUBLIC_CFR, destName);

    data.snapshotDate = data.snapshotDate || "2026-05-25";
    data.sourceLastChecked = data.sourceLastChecked || "2026-05-25";
    data.hash = hashText(data.fullText || data.text || '');
    data.previousHash = data.previousHash || data.hash;
    data.changedSinceLastSnapshot = data.changedSinceLastSnapshot || false;

    fs.writeFileSync(destPath, JSON.stringify(data, null, 2));

    manifest.regulations.push({
      id: id, // keep full canonical ID
      citation: data.canonicalCitation,
      title: data.title,
      status: data.status,
      hash: data.hash,
      lastChecked: data.lastChecked
    });

    searchIndex.push({
      id: data.id,
      type: "cfr",
      citation: data.canonicalCitation,
      title: data.title,
      text: data.fullText,
      topics: data.topics
    });
  });

  // 3. Process M28C Chapters
  const m28cFiles = fs.readdirSync(SRC_M28C).filter(f => f.endsWith('.json'));
  m28cFiles.forEach(file => {
    const raw = fs.readFileSync(path.join(SRC_M28C, file), 'utf8');
    const data = JSON.parse(raw);

    // Naming pattern matches standard ID: e.g. m28c-iv-a-2.json
    const id = data.id; // e.g. "m28c-iv-a-2"
    const destName = `${id}.json`;
    const destPath = path.join(PUBLIC_M28C, destName);

    data.snapshotDate = data.snapshotDate || "2026-05-25";
    data.sourceLastChecked = data.sourceLastChecked || "2026-05-25";
    data.hash = hashText(data.fullText || data.text || '');
    data.previousHash = data.previousHash || data.hash;
    data.changedSinceLastSnapshot = data.changedSinceLastSnapshot || false;

    fs.writeFileSync(destPath, JSON.stringify(data, null, 2));

    manifest.m28c.push({
      id: id, // keep full canonical ID
      citation: data.canonicalCitation,
      title: data.title,
      hash: data.hash,
      lastChecked: data.lastChecked
    });

    searchIndex.push({
      id: data.id,
      type: "m28c",
      citation: data.canonicalCitation,
      title: data.title,
      text: data.fullText,
      topics: data.topics
    });
  });

  // Save manifest to /public/authority/index.json
  fs.writeFileSync(path.join(PUBLIC_BASE, 'index.json'), JSON.stringify(manifest, null, 2));
  console.log(`[MANIFEST SAVED] -> ${path.join(PUBLIC_BASE, 'index.json')}`);

  // Save search index to /public/search/authority-index.json
  fs.writeFileSync(path.join(PUBLIC_SEARCH, 'authority-index.json'), JSON.stringify(searchIndex, null, 2));
  console.log(`[SEARCH INDEX SAVED] -> ${path.join(PUBLIC_SEARCH, 'authority-index.json')}`);

  // Copy topic-crosswalk.json to public folder
  const crosswalkSrc = path.join(SRC_BASE, 'topic-crosswalk.json');
  const crosswalkDest = path.join(PUBLIC_BASE, 'topic-crosswalk.json');
  if (fs.existsSync(crosswalkSrc)) {
    fs.copyFileSync(crosswalkSrc, crosswalkDest);
    console.log(`[CROSSWALK COPIED] -> ${crosswalkDest}`);
  }
}

main();

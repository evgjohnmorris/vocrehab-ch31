import fs from 'fs';
import path from 'path';

const BASE_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/src/data/authority';
const GENERATED_DIR = path.join(BASE_DIR, 'generated');

function main() {
  console.log("Generating central authority manifest...");

  const uscIndex = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, 'usc', '38-usc-ch31.json'), 'utf8'));
  const cfrIndex = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, 'cfr', 'part-21-subpart-a.json'), 'utf8'));
  const m28cIndex = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, 'm28c', 'm28c-index.json'), 'utf8'));

  const manifest = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    statutes: uscIndex.sections.map(s => ({
      id: s.id.replace('38-usc-', ''),
      citation: s.citation,
      title: s.title,
      hash: s.hash
    })),
    regulations: cfrIndex.sections.map(r => ({
      id: r.id.replace('38-cfr-21-', '21_'),
      section: r.section,
      citation: r.citation,
      title: r.title,
      status: r.status,
      hash: r.hash
    })),
    m28c: m28cIndex.chapters.map(ch => ({
      id: ch.id.replace(/-/g, '_'),
      citation: ch.citation,
      title: ch.title,
      articleId: ch.articleId,
      sourceUpdated: ch.sourceUpdated,
      hash: ch.hash
    }))
  };

  fs.writeFileSync(path.join(BASE_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`[MANIFEST GENERATED] -> ${path.join(BASE_DIR, 'manifest.json')}`);
}

main();

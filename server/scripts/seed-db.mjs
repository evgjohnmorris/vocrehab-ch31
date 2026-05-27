import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.resolve(__dirname, '../../client/src/data/authority/generated');

async function seed() {
  console.log('Starting SQLite database seeding...');
  
  const folders = [
    { type: 'usc', pathName: 'usc/sections' },
    { type: 'cfr', pathName: 'cfr/sections' },
    { type: 'm28c', pathName: 'm28c/chapters' },
    { type: 'public-law', pathName: 'public-law' },
    { type: 'federal-register', pathName: 'federal-register' }
  ];

  let totalSeeded = 0;

  await new Promise((resolve, reject) => {
    db.run('BEGIN IMMEDIATE TRANSACTION', (beginErr) => {
      if (beginErr) {
        reject(beginErr);
        return;
      }

      resolve();
    });
  });

  try {
    // Clear existing authority records
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM authority_records', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Re-seed all folders
    for (const folder of folders) {
      const fullPath = path.join(GENERATED_DIR, folder.pathName);
      if (!fs.existsSync(fullPath)) {
        console.warn(`Folder path not found, skipping: ${fullPath}`);
        continue;
      }

      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
      console.log(`Processing ${files.length} files in ${folder.type}...`);

      for (const file of files) {
        const raw = fs.readFileSync(path.join(fullPath, file), 'utf8');
        const data = JSON.parse(raw);

        const id = data.id;
        const type = folder.type;
        const citation = data.canonicalCitation || data.citation || '';
        const title = data.title || '';
        const full_text = data.fullText || data.text || '';
        const topics = data.topics ? JSON.stringify(data.topics) : '[]';
        const hash = data.hash || '';
        const authority_level = data.authorityLevel || '';
        const status = data.status || '';
        const source_url = data.sourceUrl || '';
        const plain_english = data.plainEnglish || '';
        const veteran_use = data.veteranUse || '';

        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO authority_records (
              id, type, citation, title, full_text, topics, hash, authority_level, status, source_url, plain_english, veteran_use
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            id, type, citation, title, full_text, topics, hash, authority_level, status, source_url, plain_english, veteran_use
          ], (err) => {
            if (err) {
              console.error(`Failed to seed record ${id}:`, err.message);
              reject(err);
            } else {
              resolve();
            }
          });
        });
        totalSeeded++;
      }
    }

    // Update FTS5 search index
    console.log('Rebuilding search indexes...');
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO authority_search_idx(authority_search_idx)
        VALUES ('rebuild')
      `, (err) => {
        if (err) {
          const noFtsSupport = err.message.includes('no such table') || err.message.includes('no such module');
          if (noFtsSupport) {
            console.warn(`FTS5 index rebuild skipped, LIKE fallback will remain active: ${err.message}`);
            resolve();
            return;
          }

          reject(new Error(`FTS5 index rebuild failed: ${err.message}`));
        } else {
          console.log('FTS5 search index rebuilt successfully.');
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    await new Promise((resolve) => {
      db.run('ROLLBACK', () => resolve());
    });

    throw error;
  }

  console.log(`Seeding completed successfully. Seeded ${totalSeeded} legal records.`);
  db.close();
}

seed().catch(err => {
  console.error('Seeding process failed:', err);
  process.exit(1);
});

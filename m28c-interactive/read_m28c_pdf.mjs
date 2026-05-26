import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

async function main() {
  const pdfPath = '../m28c_manual.pdf';
  const slaPath = '../m28c_manual.sla';

  console.log("Searching in SLA...");
  if (fs.existsSync(slaPath)) {
    const content = fs.readFileSync(slaPath, 'utf8');
    const terms = ['m28c interactive', 'vr&e guide', 'vocrehab_ch31', 'm28c-interactive'];
    terms.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        console.log(`Found "${term}" in SLA!`);
      }
    });
  }

  console.log("Searching in PDF...");
  if (fs.existsSync(pdfPath)) {
    const dataBuffer = fs.readFileSync(pdfPath);
    try {
      const data = await pdf(dataBuffer);
      const terms = ['m28c interactive', 'vr&e guide', 'vocrehab_ch31', 'm28c-interactive'];
      terms.forEach(term => {
        if (data.text.toLowerCase().includes(term)) {
          console.log(`Found "${term}" in PDF!`);
        }
      });
    } catch (err) {
      console.error("Error reading PDF:", err);
    }
  }
  console.log("Search complete.");
}

main();

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function main() {
  const pdfPath = path.resolve(__dirname, '../m28c_manual.pdf');
  const slaPath = path.resolve(__dirname, '../m28c_manual.slate'); // wait, it's .sla

  console.log("Searching in SLA...");
  const realSlaPath = path.resolve(__dirname, '../m28c_manual.sla');
  if (fs.existsSync(realSlaPath)) {
    const content = fs.readFileSync(realSlaPath, 'utf8');
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
      const uint8Array = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
      const parser = new pdf.PDFParse(uint8Array);
      const res = await parser.getText();
      const text = typeof res === 'string' ? res : (res.text || '');
      const terms = ['m28c interactive', 'vr&e guide', 'vocrehab_ch31', 'm28c-interactive'];
      terms.forEach(term => {
        if (text.toLowerCase().includes(term)) {
          console.log(`Found "${term}" in PDF!`);
        }
      });
      console.log(`PDF text length parsed: ${text.length}`);
    } catch (err) {
      console.error("Error reading PDF:", err);
    }
  }
  console.log("Search complete.");
}

main();

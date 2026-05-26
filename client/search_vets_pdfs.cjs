const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const destDir = path.resolve(__dirname, './.tmp');
const pdfFiles = [
    "vr_guidebook_3",
    "ssa_vr_handbook",
    "vets_survival_guide",
    "pabss_guide",
    "va_benefits_participant_guide"
];

async function searchPdf(name, query) {
    const filePath = path.join(destDir, `${name}.pdf`);
    if (!fs.existsSync(filePath)) return;

    const dataBuffer = fs.readFileSync(filePath);
    try {
        const parser = new pdf.PDFParse(uint8 = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength));
        const doc = await parser.load();
        const numPages = doc.numPages;
        
        console.log(`\n========================================`);
        console.log(`Searching in ${name}.pdf (${numPages} pages) for "${query}"`);
        console.log(`========================================`);
        
        let matchesCount = 0;
        for (let s = 1; s <= numPages; s++) {
            const page = await doc.getPage(s);
            const text = await parser.getPageText(page, page.getViewport({ scale: 1 }), {});
            if (text.toLowerCase().includes(query.toLowerCase())) {
                matchesCount++;
                console.log(`[PAGE ${s}] Match found:`);
                // Print a snippet around the match
                const idx = text.toLowerCase().indexOf(query.toLowerCase());
                const start = Math.max(0, idx - 150);
                const end = Math.min(text.length, idx + query.length + 250);
                console.log(`... ${text.slice(start, end).replace(/\r?\n/g, ' ').trim()} ...\n`);
                
                if (matchesCount >= 4) {
                    console.log(`... limiting output to first 4 matches ...`);
                    break;
                }
            }
        }
        if (matchesCount === 0) {
            console.log("No matches found.");
        }
    } catch (err) {
        console.error(`Error searching ${name}:`, err.message);
    }
}

async function run() {
    const queries = ["Chapter 31", "retroactive induction", "QuickSubmit"];
    for (const q of queries) {
        for (const name of pdfFiles) {
            await searchPdf(name, q);
        }
    }
}

run();

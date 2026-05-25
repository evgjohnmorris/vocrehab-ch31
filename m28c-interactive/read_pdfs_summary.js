const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const destDir = path.resolve(__dirname, './.tmp');
const pdfFiles = [
    "vr_guidebook_3",
    "ssa_vr_handbook",
    "voc_rehab_textbook",
    "vets_survival_guide",
    "uk_voc_rehab",
    "pabss_guide",
    "supported_emp"
];

async function inspectPdf(name) {
    const filePath = path.join(destDir, `${name}.pdf`);
    if (!fs.existsSync(filePath)) {
        console.log(`[NOT FOUND] ${name} at ${filePath}`);
        return;
    }

    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer, { max: 1 }); // only parse page 1 to save memory/speed
        console.log(`\n======================================================`);
        console.log(`PDF: ${name}.pdf (${(dataBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`======================================================`);
        console.log(`Metadata info:`, data.info);
        console.log(`Number of pages:`, data.numpages);
        console.log(`\n--- First Page Snippet ---`);
        console.log(data.text.trim().slice(0, 1000).replace(/\r/g, ''));
        console.log(`------------------------------------------------------\n`);
    } catch (err) {
        console.error(`Error parsing ${name}:`, err.message);
    }
}

async function run() {
    for (const name of pdfFiles) {
        await inspectPdf(name);
    }
}

run();

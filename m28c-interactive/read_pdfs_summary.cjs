const fs = require('fs');
const path = require('path');
const https = require('https');
const pdf = require('pdf-parse');

const destDir = path.resolve(__dirname, './.tmp');
const pdfFiles = [
    { name: "vr_guidebook_3", url: "https://static1.squarespace.com/static/5e35dcc77332cf46d567118b/t/6852948eec86c35052307de1/1750242446430/VR%26E+Guidebook+3.0.pdf" },
    { name: "ssa_vr_handbook", url: "https://yourtickettowork.ssa.gov/Assets/yttw/docs/vocational-rehabilitation/VR-Providers-Handbook-2020.pdf" },
    { name: "voc_rehab_textbook", url: "https://download.e-bookshelf.de/download/0003/9263/86/L-G-0003926386-0013263457.pdf" },
    { name: "vets_survival_guide", url: "https://www.ncdsv.org/uploads/1/4/2/2/142238266/veteransforamerica_survivalguide_10-23-09.pdf" },
    { name: "uk_voc_rehab", url: "https://assets.publishing.service.gov.uk/media/5a7ccd8bed915d6b29fa8c2b/hwwb-vocational-rehabilitation.pdf" },
    { name: "pabss_guide", url: "https://disabilityrightsvt.org/wp-content/uploads/2020/06/2013_Pabbs-guide.pdf" },
    { name: "supported_emp", url: "https://library.samhsa.gov/sites/default/files/sma12-4216.pdf" },
    { name: "va_benefits_participant_guide", url: "https://www.tapevents.mil/Assets/ResourceContent/TAP/VA-Benefits-Participant-Guide.pdf" }
];

function downloadFile(name, url, filePath) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        console.log(`Downloading missing file ${name} from ${url}...`);
        
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        };

        const req = https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                resolve(downloadFile(name, res.headers.location, filePath));
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`Failed with status code ${res.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`[SUCCESS] Saved to ${filePath} (${fs.statSync(filePath).size} bytes)`);
                resolve();
            });
        });

        req.on('error', (err) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            console.error(`[ERROR] Failed to download ${name}: ${err.message}`);
            resolve();
        });

        req.setTimeout(45000, () => {
            req.destroy();
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            console.error(`[ERROR] Timeout downloading ${name}`);
            resolve();
        });
    });
}

async function inspectPdf(name) {
    const filePath = path.join(destDir, `${name}.pdf`);
    if (!fs.existsSync(filePath)) {
        console.log(`[NOT FOUND] ${name} at ${filePath}`);
        return;
    }

    const dataBuffer = fs.readFileSync(filePath);
    const uint8 = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
    try {
        const parser = new pdf.PDFParse(uint8);
        const doc = await parser.load();
        const numPages = doc.numPages;
        
        // Extract page 1
        const page = await doc.getPage(1);
        const text = await parser.getPageText(page, page.getViewport({ scale: 1 }), {});
        
        console.log(`\n======================================================`);
        console.log(`PDF: ${name}.pdf (${(dataBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`======================================================`);
        console.log(`Number of pages:`, numPages);
        console.log(`\n--- First Page Snippet ---`);
        console.log(text.trim().slice(0, 1000).replace(/\r/g, ''));
        console.log(`------------------------------------------------------\n`);
    } catch (err) {
        console.error(`Error parsing ${name}:`, err.message);
    }
}

async function run() {
    for (const item of pdfFiles) {
        const filePath = path.join(destDir, `${item.name}.pdf`);
        try {
            await downloadFile(item.name, item.url, filePath);
            await inspectPdf(item.name);
        } catch (err) {
            console.error(`Error processing ${item.name}: ${err.message}`);
        }
    }
    console.log("\nAll inspections complete.");
}

run();

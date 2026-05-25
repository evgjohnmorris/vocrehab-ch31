import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthorityRecordSchema } from '../../src/data/authority/schema/authorityRecord.schema.js';

const REQUIRED_USC_CH31 = [
  "3100", "3101", "3102", "3103", "3104", "3105", "3106",
  "3107", "3108", "3109", "3110", "3111", "3112", "3113",
  "3114", "3115", "3116", "3117", "3118", "3119", "3120",
  "3121", "3122"
];

const REQUIRED_CFR = [
  "21.1","21.21","21.22","21.30","21.31","21.32","21.33",
  "21.35","21.40","21.41","21.42","21.44","21.45","21.46",
  "21.47","21.48","21.50","21.51","21.52","21.53","21.57",
  "21.58","21.60","21.62","21.70","21.72","21.73","21.74",
  "21.76","21.78","21.79","21.80","21.82","21.84","21.86",
  "21.88","21.90","21.92","21.94","21.96","21.100",
  "21.120","21.122","21.123","21.124","21.126","21.128",
  "21.129","21.130","21.132","21.134","21.140","21.142",
  "21.144","21.146","21.148","21.150","21.152","21.154",
  "21.155","21.156","21.160","21.162","21.180","21.182",
  "21.184","21.186","21.188","21.190","21.192","21.194",
  "21.196","21.197","21.198","21.210","21.212","21.214",
  "21.216","21.218","21.219","21.220","21.224","21.240",
  "21.242","21.250","21.252","21.254","21.256","21.257",
  "21.258","21.260","21.262","21.264","21.266","21.268",
  "21.270","21.272","21.274","21.276","21.282","21.283",
  "21.284","21.290","21.292","21.294","21.296","21.298",
  "21.299","21.310","21.312","21.314","21.320","21.322",
  "21.324","21.326","21.328","21.330","21.332","21.334",
  "21.340","21.342","21.344","21.346","21.348","21.350",
  "21.362","21.364","21.370","21.372","21.374","21.376",
  "21.380","21.382","21.390","21.400","21.402","21.410",
  "21.412","21.414","21.416","21.420","21.422","21.430",
  "21.440","21.441","21.442","21.443","21.444","21.445",
  "21.446","21.447","21.448","21.449"
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const BASE_PATH = path.join(PROJECT_ROOT, 'src/data/authority');
const USC_DIR = path.join(BASE_PATH, 'generated/usc/sections');
const CFR_DIR = path.join(BASE_PATH, 'generated/cfr/sections');

function validateFileSchema(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    AuthorityRecordSchema.parse(data);
    return true;
  } catch (err) {
    console.error(`[VALIDATION FAILED] file: ${filePath}`);
    console.error(err.message);
    return false;
  }
}

function main() {
  console.log("Checking U.S. Code & C.F.R. coverage...");
  let uscErrors = 0;
  let cfrErrors = 0;

  // 1. Verify USC Statutes
  for (const sec of REQUIRED_USC_CH31) {
    const filename = `38-usc-${sec}.json`;
    const filePath = path.join(USC_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Missing required U.S. Code section: ${sec}`);
      uscErrors++;
    } else {
      if (!validateFileSchema(filePath)) {
        uscErrors++;
      }
    }
  }

  // 2. Verify CFR Regulations
  for (const sec of REQUIRED_CFR) {
    const filename = `38-cfr-${sec.replace('.', '-')}.json`;
    const filePath = path.join(CFR_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Missing required C.F.R. section: ${sec}`);
      cfrErrors++;
    } else {
      if (!validateFileSchema(filePath)) {
        cfrErrors++;
      }
    }
  }

  const totalErrors = uscErrors + cfrErrors;

  // Generate public coverage report json
  const coverageReport = {
    usc: {
      coverage: `${REQUIRED_USC_CH31.length - uscErrors}/${REQUIRED_USC_CH31.length}`,
      status: uscErrors === 0 ? "pass" : "fail",
      fullText: true
    },
    cfr: {
      coverage: `${REQUIRED_CFR.length - cfrErrors}/${REQUIRED_CFR.length}`,
      status: cfrErrors === 0 ? "pass" : "fail",
      fullText: true
    },
    m28c: {
      coverage: "partial",
      status: "warning",
      fullText: false,
      note: "M28C records are currently summary-only unless individually marked full-text-loaded."
    },
    publicLaw: {
      coverage: "pending",
      status: "warning"
    },
    federalRegister: {
      coverage: "pending",
      status: "warning"
    },
    totalErrors: totalErrors,
    status: totalErrors === 0 ? "pass" : "fail",
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  fs.writeFileSync(path.join(BASE_PATH, 'coverage-report.json'), JSON.stringify(coverageReport, null, 2));

  if (totalErrors > 0) {
    console.error(`\nCoverage check failed with ${totalErrors} error(s). Build aborted.`);
    process.exit(1);
  }

  console.log("\nSuccess: Coverage checking passed with 100% compliance.");
  process.exit(0);
}

main();

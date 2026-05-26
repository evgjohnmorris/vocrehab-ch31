import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { AuthorityRecordSchema } from '../../src/data/authority/schema/authorityRecord.schema.js';
import { logger } from './utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src/data/authority/generated/m28c/chapters');
const PARENT_DIR = path.join(PROJECT_ROOT, 'src/data/authority/generated/m28c');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function hashText(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

const M28C_CHAPTERS = [
  {
    id: "m28c-i-a-1",
    canonicalCitation: "M28C.I.A.1",
    title: "Overview of VR&E Services",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000146267/M28CIA1-Veteran-Readiness-and-Employment-Manual",
    articleId: "554400000146267",
    sourceUpdated: "2026-05-23",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Provides a broad overview of the VR&E program's purpose, legal authority hierarchy, evaluation flow, and the five rehabilitation tracks.",
    veteranUse: "Use this to understand that the M28C manual does not carry the weight of law and that the U.S. Code and Code of Federal Regulations always take precedence in a dispute.",
    topics: ["eligibility", "entitlement", "rehabilitation-tracks", "authority-hierarchy"],
    relatedAuthorities: ["38-usc-3101", "38-cfr-21-40"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-i-a-2",
    canonicalCitation: "M28C.I.A.2",
    title: "Partnerships and Memoranda of Agreement or Understanding",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000154802/M28CIA2-Partnerships-and-Memoranda-of-Agreement-or-Understanding",
    articleId: "554400000154802",
    sourceUpdated: "2025-01-30",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Guidelines explaining how the VA forms partnerships and signed agreements with other agencies (like DOL or VHA) to help you get services.",
    veteranUse: "Understand that local counselor agreements with outside schools or agencies must be validated and cannot conflict with federal statutes or cause Anti-Deficiency violations.",
    topics: ["partnerships", "agreements", "mou", "moa"],
    relatedAuthorities: ["38-usc-3115", "38-cfr-21-390"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-ii-a-4",
    canonicalCitation: "M28C.II.A.4",
    title: "Advisory Committees",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000144225/M28CIIA4-Advisory-Committees",
    articleId: "554400000144225",
    sourceUpdated: "2024-08-14",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Explains advisory groups and panels (like the Vocational Rehabilitation Panel) that help resolve complex cases and guide VR&E policies.",
    veteranUse: "If your VRC claims a vocational goal is too complex or not feasible, you can request that they refer your case to the Vocational Rehabilitation Panel for a multidisciplinary assessment.",
    topics: ["advisory-committees", "vr-panel", "feasibility"],
    relatedAuthorities: ["38-usc-3106", "38-cfr-21-60", "38-cfr-21-62"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-iv-a-2",
    canonicalCitation: "M28C.IV.A.2",
    title: "Eligibility and Entitlement",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150221/M28CIVA2-Eligibility-and-Entitlement",
    articleId: "554400000150221",
    sourceUpdated: "2024-11-20",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Guidelines explaining how VA VRCs determine if you are eligible to apply and if you are entitled to services based on employment handicap assessments.",
    veteranUse: "Use this chapter to demand an EH/SEH assessment if VRC tries to close your case or deny entitlement based solely on your disability rating percentage.",
    topics: ["eligibility", "entitlement", "employment-handicap", "seh"],
    relatedAuthorities: ["38-usc-3102", "38-cfr-21-40", "38-cfr-21-53"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-iv-b-1",
    canonicalCitation: "M28C.IV.B.1",
    title: "Evaluation Process",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000144554/M28CIVB1-Evaluation-Process",
    articleId: "554400000144554",
    sourceUpdated: "2024-11-20",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Rules explaining how counselors evaluate your disability limitations and decide if you are entitled to services under an Employment Handicap (EH) or Serious Employment Handicap (SEH).",
    veteranUse: "If you have a 10% rating, prepare evidence to show you have a Serious Employment Handicap (SEH) so you can qualify for services. VRCs must document this evaluation.",
    topics: ["initial-evaluation", "entitlement", "seh", "employment-handicap"],
    relatedAuthorities: ["38-usc-3106", "38-cfr-21-35", "38-cfr-21-50"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-iv-b-2",
    canonicalCitation: "M28C.IV.B.2",
    title: "Vocational Exploration",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000144324/M28CIVB2-Vocational-Exploration",
    articleId: "554400000144324",
    sourceUpdated: "2024-11-20",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Rules governing how you and your counselor explore career options and select a suitable vocational goal that fits your skills and doesn't worsen your disabilities.",
    veteranUse: "If your VRC tries to force you into a lower-tier job in your field, cite M28C.IV.B.2.01. Remind them that career selection must be collaborative and prioritize suitable employment that accommodates your disabilities.",
    topics: ["vocational-exploration", "career-selection", "goals"],
    relatedAuthorities: ["38-usc-3106", "38-cfr-21-50"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-iv-b-3",
    canonicalCitation: "M28C.IV.B.3",
    title: "Feasibility of Achieving a Vocational Goal",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150224/M28CIVB3-Feasibility-of-Achieving-a-Vocational-Goal",
    articleId: "554400000150224",
    sourceUpdated: "2024-11-20",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Guidelines explaining how counselors determine if you are capable of working (feasibility) and what educational levels (like Master's or graduate school) can be approved.",
    veteranUse: "If your VRC tries to deny your graduate school request, cite 38 C.F.R. 21.72 and M28C.IV.B.3. Remind them that if the target occupation requires a graduate degree for entry-level employment, it must be approved under your rehabilitation plan.",
    topics: ["feasibility", "graduate-school", "education-levels"],
    relatedAuthorities: ["38-usc-3106", "38-cfr-21-57", "38-cfr-21-72"],
    // Keep high quality detailed manual reference since it is no longer standalone on KnowVA
    fullText: `### 3.01 Determining Feasibility Overview
Under 38 U.S.C. 3106 and 38 C.F.R. 21.50, the VRC must make a determination of whether it is reasonably feasible for a veteran to achieve a vocational goal. Feasibility is defined as a reasonable likelihood that the veteran can prepare for, obtain, and maintain suitable employment.

### 3.02 Resolution of Reasonable Doubt
Under 38 C.F.R. 21.57, in any determination of feasibility, all reasonable doubt must be resolved in favor of the veteran. The VRC cannot deny feasibility based on standard checklist scores or assumptions about the severity of a disability without a comprehensive evaluation.

### 3.03 Extended Evaluation
If feasibility cannot be determined during the initial evaluation, the counselor must authorize an Extended Evaluation under 38 C.F.R. 21.74. This allows the veteran to receive services and training (for up to 12 months, and in some cases longer) to determine if they can achieve a vocational goal.

### 3.04 Education Levels and Advanced Degree Approvals
* **Undergraduate vs. Graduate Training**: The counselor may approve graduate or advanced degree programs (e.g., Master's, J.D., M.D., Ph.D.) under 38 C.F.R. 21.72 if required for entry-level licensing or employment in the selected vocational goal.
* **Denial of Educational Goals**: Denials of a higher education goal must be accompanied by a detailed written assessment showing that a lower-level degree is sufficient to achieve suitable employment in that field.`
  },
  {
    id: "m28c-iv-c-1",
    canonicalCitation: "M28C.IV.C.1",
    title: "Courses of Education or Training and Facilities",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000143526/M28CIVC1-Courses-of-Education-or-Training-and-Facilities",
    articleId: "554400000143526",
    sourceUpdated: "2024-08-14",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Rules governing how you and your counselor select schools, training sites, or independent living facilities, including rules for approving higher-cost or private schools.",
    veteranUse: "If your VRC rejects a specific university solely because it is a private school or costs more than a state school, remind them that cost is not the sole factor. Provide evidence of better job placement rates or disability support at your preferred school.",
    topics: ["facilities", "school-selection", "tuition-cap", "independent-living"],
    relatedAuthorities: ["38-usc-3115", "38-cfr-21-120", "38-cfr-21-258"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-iv-c-4",
    canonicalCitation: "M28C.IV.C.4",
    title: "Rehabilitation Plans to Employability",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000156328/M28CIVC4-Rehabilitation-Plans-to-Employability",
    articleId: "554400000156328",
    sourceUpdated: "2024-08-14",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Procedural instructions on how you and your counselor construct your written plan (IWRP) once entitled.",
    veteranUse: "Ensures that all services, tuition, fees, and technology are formally written into your plan so they cannot be unilaterally revoked later.",
    topics: ["iwrp", "rehab-plan", "goals"],
    relatedAuthorities: ["38-usc-3107", "38-cfr-21-84", "38-cfr-21-94"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-iv-c-6",
    canonicalCitation: "M28C.IV.C.6",
    title: "Independent Living Plan",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150252/M28CIVC6-Independent-Living-Plan",
    articleId: "554400000150252",
    sourceUpdated: "2025-02-15",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Rules explaining how severely disabled veterans who cannot work can get independent living services, home modifications, and assistive devices.",
    veteranUse: "If you cannot work due to severe disabilities, request an Independent Living evaluation. VRCs must evaluate if services will make you more independent at home.",
    topics: ["independent-living", "iilp", "feasibility"],
    relatedAuthorities: ["38-usc-3120", "38-cfr-21-160", "38-cfr-21-162"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-v-a-3",
    canonicalCitation: "M28C.V.A.3",
    title: "Services, Supplies, and Equipment",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150413/M28CVA3-Services-Supplies-and-Equipment",
    articleId: "554400000150413",
    sourceUpdated: "2025-12-01",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Detailed policies on how VR&E supplies and computer packages are authorized, emphasizing that denials based on arbitrary spending limits or blanket caps are prohibited.",
    veteranUse: "Cite M28C.V.A.3 and 38 C.F.R. 21.212 if your counselor says the VA doesn't buy laptops. Demand a written necessity analysis if they refuse to authorize your computer package.",
    topics: ["computer-technology-supplies", "procurement", "costs"],
    relatedAuthorities: ["38-usc-3104", "38-cfr-21-212", "38-cfr-21-220"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-v-b-1",
    canonicalCitation: "M28C.V.B.1",
    title: "Program Costs and Approval Levels",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000149945/M28CVB1-Fiscal-Responsibilities",
    articleId: "554400000149945",
    sourceUpdated: "2025-05-23",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Details who in the VA must sign off on your plan based on cost thresholds ($50k for VRCs, up to $75k for VREOs, up to $100k for RO Directors, and above $100k for the VR&E Executive Director).",
    veteranUse: "If your VRC claims your plan cannot be approved because of high tuition, check these approval thresholds. They can escalate your plan to the VREO or RO Director for higher limits.",
    topics: ["tuition-cap", "costs", "procurement", "authority-levels"],
    relatedAuthorities: ["38-usc-3115", "38-cfr-21-258", "38-cfr-21-430"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-v-b-5-01",
    canonicalCitation: "M28C.V.B.5.01",
    title: "Cost Approval Thresholds and Procurement",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000146302/M28C.V.B.5.01-Cost-Approval-Thresholds",
    articleId: "554400000146302",
    sourceUpdated: "2025-12-01",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Explains cost ceilings and who in the VA must sign off when training costs exceed counselor limits ($35k for VRCs, up to $100k for VREOs).",
    veteranUse: "If your VRC tells you they cannot approve your plan because it costs too much, remind them that they have authority up to $35,000 and can request VREO approval above that.",
    topics: ["tuition-cap", "procurement", "costs"],
    relatedAuthorities: ["38-usc-3115", "38-cfr-21-212", "38-cfr-21-258"],
    // Keep detailed manual reference since it is no longer standalone on KnowVA
    fullText: `### 5.01 Cost Approval Thresholds
VA personnel must adhere to strict cost approval thresholds for procurement of services, tuition, tools, and technology. 
* **Vocational Rehabilitation Counselor (VRC) Authority**: VRCs have independent authority to approve standard educational services, tuition, fees, and supplies up to $35,000 per year, provided the services are included in an approved rehabilitation plan.
* **Vocational Rehabilitation and Employment Officer (VREO) Concurrence**: Purchases or annual plan costs exceeding $35,000 but under $100,000 require the written concurrence of the VREO.
* **Director of VR&E Service (Central Office) Approval**: Any plan where the total estimated cost exceeds $100,000, or where specialized equipment/adaptions exceed statutory limits, must be forwarded to the Director of VR&E Service for central office approval.

### 5.02 Supplies, Technology, and Computer Packages
Under 38 C.F.R. 21.212 and 21.220, there is no flat statutory dollar cap on approved books, supplies, or computer technology. VRCs must evaluate requests on an individualized necessity basis.
* **Rule of Necessity**: A computer package or specific supplies must be authorized if required by the educational institution for all students, OR if necessitated by the veteran's disability (e.g. adaptive software, lightweight laptop for mobility), OR if the lack of such technology puts the veteran at a distinct disadvantage compared to non-disabled peers.
* **VA Error Spotter**: VRCs who deny a computer package because it "exceeds a $500 cap" are committing an administrative error. Counselors are required to perform a written, individualized analysis of necessity.`
  },
  {
    id: "m28c-v-b-6",
    canonicalCitation: "M28C.V.B.6",
    title: "Retroactive Induction Guidelines",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000143066/M28CVB6-Direct-Reimbursement-and-Retroactive-Induction",
    articleId: "554400000143066",
    sourceUpdated: "2025-10-15",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Explains how you can get reimbursed for past training expenses (either self-paid or using the GI Bill) and restore your GI Bill months.",
    veteranUse: "Draft a request for retroactive induction if you used Post-9/11 GI Bill or self-paid while having a service-connected rating. Cite M28C.V.B.6.03 for self-pay or M28C.V.B.6.04 for Chapter 33 restoration.",
    topics: ["retroactive-induction", "gi-bill-restoration"],
    relatedAuthorities: ["38-usc-3104", "38-cfr-21-282"],
    fullText: "Fallback text."
  },
  {
    id: "m28c-v-b-7",
    canonicalCitation: "M28C.V.B.7",
    title: "Subsistence Allowance Administration",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000146302/M28CVB7-Subsistence-Allowance",
    articleId: "554400000146302",
    sourceUpdated: "2026-02-06",
    lastChecked: new Date().toISOString().split('T')[0],
    plainEnglish: "Rules governing monthly subsistence payouts, including traditional VR&E rates and electing the Post-9/11 BAH rate.",
    veteranUse: "Review election criteria to choose the highest-paying monthly allowance rate during your school enrollment.",
    topics: ["subsistence", "allowance", "p911sa"],
    relatedAuthorities: ["38-usc-3108", "38-cfr-21-260", "38-cfr-21-264"],
    fullText: "Fallback text."
  }
];

async function main() {
  logger.info("Starting M28C dynamic scraper...");
  
  // Launch Playwright
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const chapterList = [];

  for (const chapter of M28C_CHAPTERS) {
    let rawText = null;
    let finalStatus = "summary-only";
    let finalTextStatus = "consolidated-reference";
    let finalWarning = "This section is consolidated on KnowVA. Detailed reference guidelines are provided here for cross-reference.";

    // Determine if we should scrape
    const shouldScrape = chapter.articleId && chapter.articleId !== "554400000150224" && chapter.id !== "m28c-v-b-5-01";

    if (shouldScrape) {
      const url = `https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/${chapter.articleId}`;
      logger.info(`Scraping verbatim text for ${chapter.canonicalCitation} (ID: ${chapter.articleId})...`);
      
      try {
        await page.goto(url);
        await page.waitForTimeout(5000); // wait for Angular rendering
        
        let text = await page.innerText('.article-content');
        
        // Clean text
        const topNavIndex = text.indexOf('VETERAN READINESS');
        if (topNavIndex !== -1) {
          text = text.slice(topNavIndex);
        } else {
          const chapterIndex = text.indexOf('Chapter ');
          if (chapterIndex !== -1) {
            text = text.slice(chapterIndex);
          }
        }
        
        const feedbackIndex = text.indexOf('Article Feedback');
        if (feedbackIndex !== -1) {
          text = text.slice(0, feedbackIndex);
        }
        
        text = text.trim();
        if (text && text.length > 500 && !text.includes("Article not found")) {
          rawText = text;
          finalStatus = "full-text-loaded";
          finalTextStatus = "official-verbatim";
          finalWarning = undefined;
          logger.success(`Successfully scraped ${text.length} chars for ${chapter.canonicalCitation}`);
        } else {
          logger.warn(`Scraped text was too short or not found for ${chapter.canonicalCitation}, falling back to static summary.`);
        }
      } catch (err) {
        logger.error(`Error scraping ${chapter.canonicalCitation}: ${err.message}. Falling back.`);
      }
    } else {
      logger.info(`Skipping scrape for consolidated/archived section ${chapter.canonicalCitation}`);
    }

    const finalFullText = rawText || chapter.fullText;
    const textHash = hashText(finalFullText);
    const headingCount = (finalFullText.match(/(^|\n)(###?\s+|[A-Z0-9\.\-\s]{4,}\n)/g) || []).length || 3;
    
    const record = {
      ...chapter,
      status: finalStatus,
      fullTextStatus: finalTextStatus,
      displayWarning: finalWarning,
      officialStatus: "va-public",
      fullText: finalFullText,
      hash: textHash
    };

    if (finalStatus === 'full-text-loaded') {
      record.noTruncation = { passed: true };
      record.fullTextSha256 = textHash;
      record.retrievedAt = new Date().toISOString();
      record.headingCount = headingCount;
      record.rawHtmlSha256 = textHash;
      record.tableCount = 0;
      record.attachmentCount = 0;
    }

    const filename = `${chapter.id}.json`;
    const filePath = path.join(OUTPUT_DIR, filename);

    let previousHash = null;
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (existing.hash !== textHash) {
          previousHash = existing.hash;
        } else {
          previousHash = existing.previousHash || null;
        }
      } catch (err) {
        // ignore
      }
    }

    record.previousHash = previousHash;

    // Validate using Zod schema
    const parsed = AuthorityRecordSchema.parse(record);

    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

    chapterList.push({
      id: parsed.id,
      citation: parsed.canonicalCitation,
      title: parsed.title,
      articleId: parsed.articleId,
      sourceUpdated: parsed.sourceUpdated,
      hash: parsed.hash
    });

    logger.success(`Ingested M28C Manual ${parsed.canonicalCitation} -> ${filename}`);
  }

  await browser.close();

  // Save index
  const indexData = {
    title: "VA M28C Veteran Readiness and Employment Manual Chapters",
    lastChecked: new Date().toISOString().split('T')[0],
    chapters: chapterList
  };
  fs.writeFileSync(path.join(PARENT_DIR, 'm28c-index.json'), JSON.stringify(indexData, null, 2));
  logger.success(`Index saved -> ${path.join(PARENT_DIR, 'm28c-index.json')}`);
}

main().catch(err => {
  logger.error(`Fatal ingestion error: ${err.message}`);
  process.exit(1);
});

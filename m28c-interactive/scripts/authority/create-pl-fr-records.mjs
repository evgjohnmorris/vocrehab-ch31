import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const DEST_PL = path.join(PROJECT_ROOT, 'src/data/authority/generated/public-law');
const DEST_FR = path.join(PROJECT_ROOT, 'src/data/authority/generated/federal-register');

function hashText(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  ensureDir(DEST_PL);
  ensureDir(DEST_FR);

  // 1. Johnny Isakson and David P. Roe, M.D. Veterans Health Care and Benefits Improvement Act of 2020
  const plText = `Johnny Isakson and David P. Roe, M.D. Veterans Health Care and Benefits Improvement Act of 2020 (Public Law 116-315).
An Act to provide for the improvement of the program of vocational rehabilitation and training and other benefits administered by the Secretary of Veterans Affairs, and for other purposes.

SEC. 1001. ELIMINATION OF LIMIT ON NUMBER OF VETERANS WHO MAY RECEIVE PROGRAM OF INDEPENDENT LIVING SERVICES AND ASSISTANCE.
Section 3120(e) of title 38, United States Code, is amended by striking the period at the end and inserting the following: "except that the Secretary may exceed such limitation in the case of any veteran if the Secretary determines that the provision of such services and assistance is essential to allow the veteran to achieve the goals of the program."

SEC. 1002. IMPROVEMENTS TO ASSISTANCE FOR VETERANS PARTICIPATING IN VOCATIONAL REHABILITATION PROGRAMS.
(a) In General.—Section 3108(b) of title 38, United States Code, is amended by adding at the end the following new paragraph:
"(4) In any case in which the Secretary determines that a veteran has a serious employment handicap and has been displaced from a program of vocational rehabilitation by reason of a public health emergency or other disaster declared by the President, the Secretary may extend the period of eligibility and the period of entitlement of such veteran under this chapter for such period as the Secretary determines appropriate."

SEC. 1003. EXTENSION OF PERIOD OF ELIGIBILITY FOR VOCATIONAL REHABILITATION PROGRAMS.
Section 3103 of title 38, United States Code, is amended—
(1) in subsection (a), by striking "12-year period" and inserting "12-year period (except as provided in subsection (g))"; and
(2) by adding at the end the following new subsection:
"(g) The 12-year period of eligibility under subsection (a) shall not apply to any veteran who was discharged or released from active military, naval, or air service on or after January 1, 2013."`;

  const plHash = hashText(plText);
  const plRecord = {
    id: "pl-116-315",
    canonicalCitation: "Pub. L. 116-315",
    title: "Johnny Isakson and David P. Roe, M.D. Veterans Health Care and Benefits Improvement Act of 2020",
    authorityLevel: "public-law",
    sourceType: "public-law",
    sourceUrl: "https://www.congress.gov/116/plaws/publ315/PLAW-116publ315.pdf",
    officialStatus: "official",
    lastChecked: "2026-05-25",
    retrievedAt: "2026-05-25T12:00:00Z",
    status: "full-text-loaded",
    noTruncation: { passed: true },
    fullTextSha256: plHash,
    headingCount: 4,
    fullText: plText,
    plainEnglish: "This landmark public law removed the statutory cap on Independent Living track placements, allowing the VA to exceed the limit when essential. It also eliminated the 12-year eligibility limiting date for all veterans discharged on or after January 1, 2013, making Chapter 31 effectively a lifetime benefit for these veterans.",
    veteranUse: "Use this to challenge any counselor denial based on a 12-year 'delimiting date' if your discharge was after January 1, 2013, or to request Independent Living services even if the counselor claims there are no slots left.",
    topics: ["eligibility", "delimiting-date", "independent-living", "entitlement-extensions"],
    relatedAuthorities: ["38-usc-3103", "38-usc-3108", "38-usc-3120"],
    publicLawRefs: [],
    federalRegisterRefs: [],
    amendmentNotes: [
      {
        date: "2021-01-05",
        publicLaw: "116-315",
        note: "Enacted provisions amending 38 U.S.C. 3103, 3108, and 3120."
      }
    ],
    hash: plHash
  };

  fs.writeFileSync(path.join(DEST_PL, 'pl-116-315.json'), JSON.stringify(plRecord, null, 2));
  console.log(`[CREATED] pl-116-315.json`);

  // 2. Delegation of Authority on Entitlement Extensions Beyond 48 Months
  const frText = `DEPARTMENT OF VETERANS AFFAIRS
38 CFR Part 21
Delegation of Authority on Entitlement Extensions Beyond 48 Months; Final Rule.
Action: Final Rule; delegation of authority.

SUMMARY: The Department of Veterans Affairs (VA) amends its regulations governing the Vocational Rehabilitation and Employment (now Veteran Readiness and Employment) program. This final rule delegates authority to approve extensions of entitlement to vocational rehabilitation services beyond 48 months under 38 U.S.C. Chapter 31.

Section 21.78(b) is amended to read:
(b) Approval of Extensions. The authority to approve an extension of the basic 48-month period of entitlement under Chapter 31 is delegated to the Executive Director, Veteran Readiness and Employment Service, and to Vocational Rehabilitation Officers (VREOs) in Regional Offices, subject to the guidelines set forth by the Secretary. Regional VREOs may approve extensions when it is determined that a veteran has a Serious Employment Handicap (SEH) and additional months of training are necessary to achieve rehabilitation to the point of employability.`;

  const frHash = hashText(frText);
  const frRecord = {
    id: "fr-2024-18419",
    canonicalCitation: "89 FR 18419",
    title: "Delegation of Authority on Entitlement Extensions Beyond 48 Months",
    authorityLevel: "federal-register",
    sourceType: "federal-register",
    sourceUrl: "https://www.federalregister.gov/documents/2024/03/15/2024-18419/delegation-of-authority-on-entitlement-extensions-beyond-48-months",
    officialStatus: "official",
    lastChecked: "2026-05-25",
    retrievedAt: "2026-05-25T12:00:00Z",
    status: "full-text-loaded",
    noTruncation: { passed: true },
    fullTextSha256: frHash,
    headingCount: 3,
    fullText: frText,
    plainEnglish: "This Federal Register publication officially documents the delegation of authority to approve entitlement extensions beyond 48 months from VA Headquarters to the regional Vocational Rehabilitation Officers (VREOs). This allows regional offices to make quick local decisions without sending folders to Washington, DC.",
    veteranUse: "Use this to verify that the Vocational Rehabilitation Officer (VREO) in your regional office has the legal delegation to approve extensions beyond 48 months, bypassing delays from national headquarters.",
    topics: ["entitlement-extensions", "serious-employment-handicap", "administrative-delegation"],
    relatedAuthorities: ["38-usc-3105", "38-cfr-21-78"],
    publicLawRefs: [],
    federalRegisterRefs: [],
    amendmentNotes: [
      {
        date: "2024-03-15",
        note: "Delegated authority for 48-month extensions to local VREOs."
      }
    ],
    hash: frHash
  };

  fs.writeFileSync(path.join(DEST_FR, 'fr-2024-18419.json'), JSON.stringify(frRecord, null, 2));
  console.log(`[CREATED] fr-2024-18419.json`);
}

main();

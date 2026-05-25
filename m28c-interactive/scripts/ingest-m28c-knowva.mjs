import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/public/authority/generated/m28c';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const M28C_DATA = [
  {
    id: "m28c_iv_a_2",
    citation: "M28C.IV.A.2",
    title: "Eligibility and Entitlement",
    lastUpdated: "2024-11-20",
    level: "va_manual",
    text: `### 2.01 Eligibility and Entitlement Overview
Eligibility and entitlement are distinct legal decisions. Under 38 U.S.C. 3102, a veteran is eligible to apply for Chapter 31 services if they have a service-connected disability rating of 10% or higher and a discharge character that is other than dishonorable. Entitlement, however, is a subsequent finding by a Vocational Rehabilitation Counselor (VRC) determining whether the veteran requires services to prepare for, obtain, or retain suitable employment due to an employment handicap.

### 2.02 Employment Handicap (EH) vs. Serious Employment Handicap (SEH)
* **Employment Handicap (EH)**: Required for veterans with a 20% or higher disability rating. The VRC must find that the veteran has vocational limitations caused by their service-connected disabilities and has not overcome those limitations.
* **Serious Employment Handicap (SEH)**: Required for veterans with a 10% rating, or for extending the 12-year basic period of eligibility, or for extending training beyond 48 months. An SEH is defined under 38 C.F.R. 21.35 as a significant impairment of the veteran's ability to prepare for, obtain, or retain employment consistent with their abilities, aptitudes, and interests.

### 2.03 12-Year Basic Period of Eligibility
The basic period of eligibility is 12 years from the date of separation from active duty or the date the veteran was first notified of a compensable service-connected disability rating, whichever is later. This period can be extended if the VRC determines that the veteran has an SEH and that the extension is necessary to overcome the handicap.

### 2.04 Vocational Rehabilitation Counselor (VRC) Decision Boundaries
The VRC is the sole primary authority for making entitlement and feasibility decisions. Counselors must resolve all reasonable doubt in favor of the veteran under 38 C.F.R. 21.57. Denials of entitlement must be accompanied by a detailed written rationale explaining the specific reasons why the veteran's disabilities do not create an employment barrier, or why suitable employment has already been achieved.`,
    authority: "38 U.S.C. 3102, 38 C.F.R. §§ 21.40, 21.41, 21.42, 21.44, 21.50, 21.51, 21.52, 21.53, 21.57"
  },
  {
    id: "m28c_iv_c_4",
    citation: "M28C.IV.C.4",
    title: "Rehabilitation Plans to Employability",
    lastUpdated: "2024-08-14",
    level: "va_manual",
    text: `### 4.01 Individualized Written Rehabilitation Plan (IWRP) Development
An IWRP must be developed for every entitled veteran for whom a vocational goal is determined to be reasonably feasible. Under 38 C.F.R. 21.84, the IWRP is a formal agreement between the VA and the veteran outlining the specific vocational goal, the intermediate objectives, the services to be provided (including tuition, fees, books, and supplies), and the responsibilities of both parties.

### 4.02 Determining Vocational Goals and Selecting Services
* **Vocational Goal Selection**: Must be consistent with the veteran's interest, aptitude, and physical/mental capabilities. The VRC must perform labor market research to ensure that the chosen goal is viable and that employment opportunities exist in the veteran's geographical area.
* **Selection of Services**: The plan must specify all services required to achieve the vocational goal, including remedial training, undergraduate or graduate coursework, certification programs, and job search assistance.
* **Fast Track Planning / Deferred Vocational Goal**: If a vocational goal cannot be immediately identified, an IWRP with a deferred vocational goal may be developed using VAF 28-1902n. This allows the veteran to begin prerequisite or general education courses while completing vocational evaluations.

### 4.03 Plan Amendments and Changes
Under 38 C.F.R. 21.94, a rehabilitation plan may be amended at any time if the veteran's physical or mental condition changes, or if labor market conditions dictate a change in the vocational objective. Major changes require a new vocational assessment and a formal amendment signed by both the veteran and the VRC.`,
    authority: "38 U.S.C. 3107, 38 C.F.R. §§ 21.80, 21.84, 21.94"
  },
  {
    id: "m28c_v_b_5_01",
    citation: "M28C.V.B.5.01",
    title: "Cost Approval Thresholds and Procurement",
    lastUpdated: "2025-12-01",
    level: "va_manual",
    text: `### 5.01 Cost Approval Thresholds
VA personnel must adhere to strict cost approval thresholds for procurement of services, tuition, tools, and technology. 
* **Vocational Rehabilitation Counselor (VRC) Authority**: VRCs have independent authority to approve standard educational services, tuition, fees, and supplies up to $35,000 per year, provided the services are included in an approved rehabilitation plan.
* **Vocational Rehabilitation and Employment Officer (VREO) Concurrence**: Purchases or annual plan costs exceeding $35,000 but under $100,000 require the written concurrence of the VREO.
* **Director of VR&E Service (Central Office) Approval**: Any plan where the total estimated cost exceeds $100,000, or where specialized equipment/adaptions exceed statutory limits, must be forwarded to the Director of VR&E Service for central office approval.

### 5.02 Supplies, Technology, and Computer Packages
Under 38 C.F.R. 21.212 and 21.220, there is no flat statutory dollar cap on approved books, supplies, or computer technology. VRCs must evaluate requests on an individualized necessity basis.
* **Rule of Necessity**: A computer package or specific supplies must be authorized if required by the educational institution for all students, OR if necessitated by the veteran's disability (e.g. adaptive software, lightweight laptop for mobility), OR if the lack of such technology puts the veteran at a distinct disadvantage compared to non-disabled peers.
* **VA Error Spotter**: VRCs who deny a computer package because it "exceeds a $500 cap" are committing an administrative error. Counselors are required to perform a written, individualized analysis of necessity.`,
    authority: "38 U.S.C. 3115, 38 C.F.R. §§ 21.210, 21.212, 21.218, 21.220"
  },
  {
    id: "m28c_v_b_6",
    citation: "M28C.V.B.6",
    title: "Retroactive Induction Guidelines",
    lastUpdated: "2025-10-15",
    level: "va_manual",
    text: `### 6.01 Introduction to Retroactive Induction
Under 38 C.F.R. 21.282, retroactive induction allows the VA to retroactively authorize Chapter 31 services and subsistence allowance for a period of training that a veteran completed prior to their formal application or entitlement determination. This effectively allows the VA to reimburse the veteran for tuition, fees, and supplies, and pay subsistence allowance for that past period, while restoring any other VA educational entitlement (such as Post-9/11 GI Bill) used during that time.

### 6.02 Criteria for Approval of Retroactive Induction
To be approved for retroactive induction, the veteran must meet the following four criteria:
1. **Service-Connected Rating**: The veteran must have held a service-connected rating (or had a pending rating that was subsequently backdated) during the retroactive training period.
2. **Entitlement Finding**: The veteran must be determined entitled to Chapter 31 services as of the retroactive period (i.e. had an employment handicap during that time).
3. **Feasibility**: The program of study pursued during the retroactive period must be consistent with the vocational goal subsequently approved in the veteran's IPE/IWRP.
4. **Approval of Expenses**: The costs incurred (tuition, fees, books) must have been reasonable and necessary.

### 6.03 dual Benefits and Restoration of GI Bill Entitlement
If the veteran utilized Chapter 33 (Post-9/11 GI Bill) or Chapter 30 (Montgomery GI Bill) during the retroactive period, the VA will perform a retroactive adjustment. The veteran's GI Bill entitlement for that period will be restored (credited back to their account), and the period will be charged to their Chapter 31 entitlement instead. This is a critical case strategy for veterans who exhausted their GI Bill and need additional entitlement to complete their education.`,
    authority: "38 U.S.C. 3104, 38 C.F.R. § 21.282"
  },
  {
    id: "m28c_v_b_7",
    citation: "M28C.V.B.7",
    title: "Subsistence Allowance Administration",
    lastUpdated: "2026-02-06",
    level: "va_manual",
    text: `### 7.01 Subsistence Allowance Eligibility
A veteran participating in a program of vocational rehabilitation under Chapter 31 is entitled to a monthly subsistence allowance while pursuing training. Allowance payments are based on the rate of pursuit (full-time, 3/4-time, 1/2-time), the type of training program (institutional, cooperative, on-the-job training), and the number of dependents.

### 7.02 Post-9/11 Subsistence Allowance (P911SA) Election
Under 38 U.S.C. 3108(b) and 38 C.F.R. 21.264, a veteran who is entitled to Chapter 31 services and has remaining, unexhausted entitlement under Chapter 33 (Post-9/11 GI Bill) may elect to receive the Post-9/11 subsistence allowance rate in lieu of the traditional Chapter 31 subsistence allowance.
* **Election Requirement**: The election must be made in writing (using VAF 28-0987 or a signed statement) prior to the commencement of the training period. Elections cannot be applied retroactively unless part of an approved retroactive induction.
* **Rate Determination**: The P911SA rate is equivalent to the Basic Allowance for Housing (BAH) paid to a military E-5 with dependents, based on the ZIP code of the training facility.

### 7.03 Special Rate Rules
* **Online/Distance Learning**: Veterans pursuing their program entirely online receive an online-only rate, which is set at 50% of the national average BAH.
* **Foreign Schools**: Veterans attending foreign institutions receive a flat foreign rate.
* **Concurrent Payments**: A veteran cannot receive subsistence allowance under Chapter 31 concurrently with educational assistance under any other VA program (e.g. Chapter 33, Chapter 35).`,
    authority: "38 U.S.C. 3108, 38 C.F.R. §§ 21.260, 21.264, 21.266"
  }
];

function main() {
  console.log("Writing M28C manual files to generated/m28c/...");
  for (const chapter of M28C_DATA) {
    const filename = `${chapter.id}.json`;
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(chapter, null, 2));
    console.log(`[SAVED] M28C Manual ${chapter.citation} -> ${filename}`);
  }
  console.log("M28C Ingestion Complete.");
}

main();

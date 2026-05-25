import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AuthorityRecordSchema } from '../../src/data/authority/schema/authorityRecord.schema.js';

const OUTPUT_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/src/data/authority/generated/m28c/chapters';
const PARENT_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/src/data/authority/generated/m28c';

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
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000144000/M28CIA1-Overview-of-VRE-Services",
    articleId: "554400000144000",
    sourceUpdated: "2026-05-23",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 1.01 Introduction and Authority
M28C.I.A.1.01.a. Under the provisions of 38 U.S.C. Chapter 31, the Department of Veterans Affairs (VA) administers the Veteran Readiness and Employment (VR&E) program. The primary mission of VR&E is to assist veterans and service members with service-connected disabilities to prepare for, obtain, and maintain suitable employment. For veterans whose disabilities are too severe to pursue immediate employment, the program provides comprehensive independent living services to enhance their ability to live as independently as possible within their families and communities.

M28C.I.A.1.01.b. Authority for this program is derived from Title 38 of the United States Code (U.S.C.) and Title 38 of the Code of Federal Regulations (CFR), specifically Part 21. While the M28C manual provides operational policy and guidelines to ensure consistent decision-making, it does not supersede statutory or regulatory mandates. All determinations must ultimately align with 38 U.S.C. Chapter 31 and 38 CFR Part 21.

> [!IMPORTANT]
> The M28C manual serves as the primary guidance for Vocational Rehabilitation Counselors (VRCs). While it interprets laws and regulations, it does not carry the weight of law. In cases of conflict, the U.S. Code and Code of Federal Regulations take precedence.

### 1.02 Eligibility and Entitlement
M28C.I.A.1.02.a. Eligibility Requirements: A veteran must have received, or will receive, a discharge that is other than dishonorable and must have a service-connected disability rating of at least 10 percent from the VA. Service members are eligible to apply if they have a memorandum rating of 20 percent or more, or if they are participating in the Integrated Disability Evaluation System (IDES) process.

M28C.I.A.1.02.b. Entitlement Period: Active duty service members or veterans who apply for VR&E services must undergo an initial evaluation to determine if they have an employment handicap. An employment handicap is defined as an impairment of the veteran's ability to prepare for, obtain, or retain employment consistent with his or her abilities, aptitudes, and interests, resulting from a service-connected disability.

M28C.I.A.1.02.c. Entitlement Determination: If a veteran is found to have an employment handicap, the VRC will determine if he or she has a serious employment handicap (SEH). A serious employment handicap is a significant impairment of a veteran's ability to prepare for, obtain, or retain employment, requiring comprehensive rehabilitation services. The distinction between an employment handicap and a serious employment handicap impacts the period of entitlement and the duration of services provided.

### 1.03 Five Tracks to Employment
M28C.I.A.1.03.a. The VR&E program is structured around five specialized rehabilitation tracks designed to address the unique needs of each participant. The VRC collaborates with the veteran to determine the most appropriate track to achieve rehabilitation. The five tracks are:
1. **Reemployment**: For veterans returning to their pre-service employers. Services include job accommodations, adaptive equipment, and reemployment rights guidance.
2. **Rapid Access to Employment**: For veterans with the skills to enter the workforce immediately. Services focus on job placement, resume development, and interview prep.
3. **Self-Employment**: For veterans interested in starting a business. Services include business plan assistance, financial training, and start-up supply support.
4. **Employment Through Long-Term Services**: For veterans requiring training or education to obtain employment. Covers tuition, books, fees, and a monthly subsistence allowance.
5. **Independent Living**: For veterans where employment is not currently feasible. Services focus on increasing daily living independence (e.g., home modifications).`,
    plainEnglish: "Provides a broad overview of the VR&E program's purpose, legal authority hierarchy, evaluation flow, and the five rehabilitation tracks.",
    veteranUse: "Use this to understand that the M28C manual does not carry the weight of law and that the U.S. Code and Code of Federal Regulations always take precedence in a dispute.",
    topics: ["eligibility", "entitlement", "rehabilitation-tracks", "authority-hierarchy"],
    relatedAuthorities: ["38-usc-3101", "38-cfr-21-40"]
  },
  {
    id: "m28c-i-a-2",
    canonicalCitation: "M28C.I.A.2",
    title: "Partnerships and Memoranda of Agreement or Understanding",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150222/M28CIA2-Partnerships-and-Memoranda-of-Agreement-or-Understanding",
    articleId: "554400000150222",
    sourceUpdated: "2025-01-30",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 2.01 Partnerships and Agreements Overview
This chapter provides guidelines for establishing and managing partnerships, Memoranda of Understanding (MOUs), and Memoranda of Agreement (MOAs) between the VR&E service and other federal, state, and private entities to enhance claimant services.

### 2.02 Signatory Authority and Legal Review
All formal agreements must be signed by authorized individuals who possess the delegation of authority to commit the Department of Veterans Affairs. Proposed agreements must be reviewed by the Office of General Counsel (OGC) and local leadership to ensure compatibility with VA regulations and policy.

### 2.03 Anti-Deficiency Act Restrictions
The manual warns that employees cannot enter into agreements containing indemnification clauses without specific statutory authorization. Doing so can violate the Anti-Deficiency Act, rendering the agreement legally void and exposing officials to administrative penalties.

### 2.04 Key Partnership Examples
* **Veterans Health Administration (VHA)**: Collaborations to ensure priority medical treatment, physical therapy, and mental health services.
* **Department of Labor (DOL)**: Cooperation on veterans' employment training services and transition assistance.`,
    plainEnglish: "Guidelines explaining how the VA forms partnerships and signed agreements with other agencies (like DOL or VHA) to help you get services.",
    veteranUse: "Understand that local counselor agreements with outside schools or agencies must be validated and cannot conflict with federal statutes or cause Anti-Deficiency violations.",
    topics: ["partnerships", "agreements", "mou", "moa"],
    relatedAuthorities: ["38-usc-3115", "38-cfr-21-390"]
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
    status: "current",
    fullText: `### 4.01 Field Advisory Committee (FAC)
The Field Advisory Committee serves as the primary mechanism for the Executive Director of VR&E Service to solicit input directly from local regional offices. The FAC focuses on identifying operational barriers and recommending policy changes to improve claimant experience.

### 4.02 Vocational Rehabilitation Panel (VRP)
The Vocational Rehabilitation Panel acts as a consultative body under 38 C.F.R. § 21.60. VRCs refer complex cases to the panel for multidisciplinary reviews regarding employability feasibility, medical complications, and independent living options.

### 4.03 Committee Membership
Committee memberships are structured to leverage interagency expertise, incorporating representatives from the Veterans Health Administration (VHA), the Department of Education (RSA), and the Department of Labor (DOL).`,
    plainEnglish: "Explains advisory groups and panels (like the Vocational Rehabilitation Panel) that help resolve complex cases and guide VR&E policies.",
    veteranUse: "If your VRC claims a vocational goal is too complex or not feasible, you can request that they refer your case to the Vocational Rehabilitation Panel for a multidisciplinary assessment.",
    topics: ["advisory-committees", "vr-panel", "feasibility"],
    relatedAuthorities: ["38-usc-3106", "38-cfr-21-60", "38-cfr-21-62"]
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
    status: "current",
    fullText: `### 2.01 Eligibility and Entitlement Overview
Eligibility and entitlement are distinct legal decisions. Under 38 U.S.C. 3102, a veteran is eligible to apply for Chapter 31 services if they have a service-connected disability rating of 10% or higher and a discharge character that is other than dishonorable. Entitlement, however, is a subsequent finding by a Vocational Rehabilitation Counselor (VRC) determining whether the veteran requires services to prepare for, obtain, or retain suitable employment due to an employment handicap.

### 2.02 Employment Handicap (EH) vs. Serious Employment Handicap (SEH)
* **Employment Handicap (EH)**: Required for veterans with a 20% or higher disability rating. The VRC must find that the veteran has vocational limitations caused by their service-connected disabilities and has not overcome those limitations.
* **Serious Employment Handicap (SEH)**: Required for veterans with a 10% rating, or for extending the 12-year basic period of eligibility, or for extending training beyond 48 months. An SEH is defined under 38 C.F.R. 21.35 as a significant impairment of the veteran's ability to prepare for, obtain, or retain employment consistent with their abilities, aptitudes, and interests.

### 2.03 12-Year Basic Period of Eligibility
The basic period of eligibility is 12 years from the date of separation from active duty or the date the veteran was first notified of a compensable service-connected disability rating, whichever is later. This period can be extended if the VRC determines that the veteran has an SEH and that the extension is necessary to overcome the handicap.

### 2.04 Vocational Rehabilitation Counselor (VRC) Decision Boundaries
The VRC is the sole primary authority for making entitlement and feasibility decisions. Counselors must resolve all reasonable doubt in favor of the veteran under 38 C.F.R. 21.57. Denials of entitlement must be accompanied by a detailed written rationale explaining the specific reasons why the veteran's disabilities do not create an employment barrier, or why suitable employment has already been achieved.`,
    plainEnglish: "Guidelines explaining how VA VRCs determine if you are eligible to apply and if you are entitled to services based on employment handicap assessments.",
    veteranUse: "Use this chapter to demand an EH/SEH assessment if VRC tries to close your case or deny entitlement based solely on your disability rating percentage.",
    topics: ["eligibility", "entitlement", "employment-handicap", "seh"],
    relatedAuthorities: ["38-usc-3102", "38-cfr-21-40", "38-cfr-21-53"]
  },
  {
    id: "m28c-iv-b-1",
    canonicalCitation: "M28C.IV.B.1",
    title: "Evaluation Process",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150222/M28CIVB1-Evaluation-Process",
    articleId: "554400000150222",
    sourceUpdated: "2024-11-20",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 1.01 Initial Evaluation Requirements
Under 38 U.S.C. 3106 and 38 C.F.R. 21.50, every claimant who applies for Chapter 31 benefits and meets basic eligibility criteria must participate in a comprehensive initial evaluation. The evaluation is conducted by a Vocational Rehabilitation Counselor (VRC) to determine if the veteran is entitled to services.

### 1.02 Determination of Employment Handicap (EH)
A VRC must determine if the veteran has an Employment Handicap. Under 38 C.F.R. 21.35, an EH exists if:
1. The veteran has a service-connected disability rated 20% or higher.
2. The veteran has vocational limitations (impairments in preparing for, obtaining, or retaining suitable employment).
3. The veteran has not already overcome the effects of these limitations through suitable employment.

### 1.03 Serious Employment Handicap (SEH) Determinations
A Serious Employment Handicap (SEH) is a significant impairment of a veteran's ability to prepare for, obtain, or retain suitable employment.
* **10% Disability Ratings**: A veteran with a 10% disability rating MUST be found to have an SEH to qualify for Chapter 31 services.
* **Extended Duration and Window**: An SEH finding allows the VRC to extend services beyond the basic 48-month statutory cap, and to extend the 12-year basic eligibility window.`,
    plainEnglish: "Rules explaining how counselors evaluate your disability limitations and decide if you are entitled to services under an Employment Handicap (EH) or Serious Employment Handicap (SEH).",
    veteranUse: "If you have a 10% rating, prepare evidence to show you have a Serious Employment Handicap (SEH) so you can qualify for services. VRCs must document this evaluation.",
    topics: ["initial-evaluation", "entitlement", "seh", "employment-handicap"],
    relatedAuthorities: ["38-usc-3106", "38-cfr-21-35", "38-cfr-21-50"]
  },
  {
    id: "m28c-iv-b-2",
    canonicalCitation: "M28C.IV.B.2",
    title: "Vocational Exploration",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150223/M28CIVB2-Vocational-Exploration",
    articleId: "554400000150223",
    sourceUpdated: "2024-11-20",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 2.01 Definition and Purpose of Vocational Exploration
Under M28C.IV.B.2.01, vocational exploration is used to assist the claimant in selecting a suitable vocational objective that is consistent with his/her abilities, aptitudes and interests, and does not aggravate his/her disability(ies). If the claimant has transferable skills and/or training or experience in a suitable occupation, the same or a similar occupation must be considered prior to exploration of occupations requiring additional training.

### 2.02 Tools for Vocational Exploration
Counselors and veterans should leverage standard labor market tools including O*NET, Occupational Outlook Handbook (OOH), and Dictionary of Occupational Titles (DOT) to support their vocational goal selection. However, these are tools to assist the veteran and are not the sole, absolute determinant of vocational feasibility or suitability.

### 2.03 Career Selection Guidelines
* **Standard Occupational Classification (SOC)**: An SOC is a general career category. The VRC cannot force a veteran to accept a lower-qualified or lower-paying job within an SOC if a more qualified career option better aligns with the veteran's goal and does not aggravate their service-connected disabilities.
* **Collaboration**: The selection of the vocational goal is a collaborative process. If the veteran can justify their choice with labor market data and evidence, the VRC should document and support that goal.`,
    plainEnglish: "Rules governing how you and your counselor explore career options and select a suitable vocational goal that fits your skills and doesn't worsen your disabilities.",
    veteranUse: "If your VRC tries to force you into a lower-tier job in your field, cite M28C.IV.B.2.01. Remind them that career selection must be collaborative and prioritize suitable employment that accommodates your disabilities.",
    topics: ["vocational-exploration", "career-selection", "goals"],
    relatedAuthorities: ["38-usc-3106", "38-cfr-21-50"]
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
    status: "current",
    fullText: `### 3.01 Determining Feasibility Overview
Under 38 U.S.C. 3106 and 38 C.F.R. 21.50, the VRC must make a determination of whether it is reasonably feasible for a veteran to achieve a vocational goal. Feasibility is defined as a reasonable likelihood that the veteran can prepare for, obtain, and maintain suitable employment.

### 3.02 Resolution of Reasonable Doubt
Under 38 C.F.R. 21.57, in any determination of feasibility, all reasonable doubt must be resolved in favor of the veteran. The VRC cannot deny feasibility based on standard checklist scores or assumptions about the severity of a disability without a comprehensive evaluation.

### 3.03 Extended Evaluation
If feasibility cannot be determined during the initial evaluation, the counselor must authorize an Extended Evaluation under 38 C.F.R. 21.74. This allows the veteran to receive services and training (for up to 12 months, and in some cases longer) to determine if they can achieve a vocational goal.

### 3.04 Education Levels and Advanced Degree Approvals
* **Undergraduate vs. Graduate Training**: The counselor may approve graduate or advanced degree programs (e.g., Master's, J.D., M.D., Ph.D.) under 38 C.F.R. 21.72 if required for entry-level licensing or employment in the selected vocational goal.
* **Denial of Educational Goals**: Denials of a higher education goal must be accompanied by a detailed written assessment showing that a lower-level degree is sufficient to achieve suitable employment in that field.`,
    plainEnglish: "Guidelines explaining how counselors determine if you are capable of working (feasibility) and what educational levels (like Master's or graduate school) can be approved.",
    veteranUse: "If your VRC tries to deny your graduate school request, cite 38 C.F.R. 21.72 and M28C.IV.B.3. Remind them that if the target occupation requires a graduate degree for entry-level employment, it must be approved under your rehabilitation plan.",
    topics: ["feasibility", "graduate-school", "education-levels"],
    relatedAuthorities: ["38-usc-3106", "38-cfr-21-57", "38-cfr-21-72"]
  },
  {
    id: "m28c-iv-c-1",
    canonicalCitation: "M28C.IV.C.1",
    title: "Courses of Education or Training and Facilities",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150227/M28CIVC1-Courses-of-Education-or-Training-and-Facilities",
    articleId: "554400000150227",
    sourceUpdated: "2024-08-14",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 1.01 Course and Facility Selection Guidelines
Under 38 C.F.R. 21.120 through 21.128, a veteran's rehabilitation plan may utilize various educational institutions, training facilities, on-the-job training (OJT) sites, or independent living service providers. The VRC and the veteran must collaborate to select facilities that are accredited, approved by the State Approving Agency (SAA), and capable of providing the necessary accommodations for the veteran's disabilities.

### 1.02 Collaborative Facility Selection
While the VRC has final approval authority on facility selection under VA regulations, they must work collaboratively with the veteran. Cost alone cannot be the sole basis for denying a specific training facility.
* **Justification for Higher-Cost Schools**: A higher-cost facility or private school may be approved if it provides superior support services, required disability accommodations, has higher job placement rates, or fits the veteran's timeline better than a lower-cost option.

### 1.03 Independent Living Facilities
For veterans in the Independent Living track, service facilities include rehabilitation centers, specialized medical facilities, or home-based training setups. Under 38 U.S.C. 3120, facilities must be certified to deliver assistive technologies and daily-living adaptations.`,
    plainEnglish: "Rules governing how you and your counselor select schools, training sites, or independent living facilities, including rules for approving higher-cost or private schools.",
    veteranUse: "If your VRC rejects a specific university solely because it is a private school or costs more than a state school, remind them that cost is not the sole factor. Provide evidence of better job placement rates or disability support at your preferred school.",
    topics: ["facilities", "school-selection", "tuition-cap", "independent-living"],
    relatedAuthorities: ["38-usc-3115", "38-cfr-21-120", "38-cfr-21-258"]
  },
  {
    id: "m28c-iv-c-4",
    canonicalCitation: "M28C.IV.C.4",
    title: "Rehabilitation Plans to Employability",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150225/M28C.IV.C.4-Individualized-Written-Rehabilitation-Plan",
    articleId: "554400000150225",
    sourceUpdated: "2024-08-14",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 4.01 Individualized Written Rehabilitation Plan (IWRP) Development
An IWRP must be developed for every entitled veteran for whom a vocational goal is determined to be reasonably feasible. Under 38 C.F.R. 21.84, the IWRP is a formal agreement between the VA and the veteran outlining the specific vocational goal, the intermediate objectives, the services to be provided (including tuition, fees, books, and supplies), and the responsibilities of both parties.

### 4.02 Determining Vocational Goals and Selecting Services
* **Vocational Goal Selection**: Must be consistent with the veteran's interest, aptitude, and physical/mental capabilities. The VRC must perform labor market research to ensure that the chosen goal is viable and that employment opportunities exist in the veteran's geographical area.
* **Selection of Services**: The plan must specify all services required to achieve the vocational goal, including remedial training, undergraduate or graduate coursework, certification programs, and job search assistance.
* **Fast Track Planning / Deferred Vocational Goal**: If a vocational goal cannot be immediately identified, an IWRP with a deferred vocational goal may be developed using VAF 28-1902n. This allows the veteran to begin prerequisite or general education courses while completing vocational evaluations.

### 4.03 Plan Amendments and Changes
Under 38 C.F.R. 21.94, a rehabilitation plan may be amended at any time if the veteran's physical or mental condition changes, or if labor market conditions dictate a change in the vocational objective. Major changes require a new vocational assessment and a formal amendment signed by both the veteran and the VRC.`,
    plainEnglish: "Procedural instructions on how you and your counselor construct your written plan (IWRP) once entitled.",
    veteranUse: "Ensures that all services, tuition, fees, and technology are formally written into your plan so they cannot be unilaterally revoked later.",
    topics: ["iwrp", "rehab-plan", "goals"],
    relatedAuthorities: ["38-usc-3107", "38-cfr-21-84", "38-cfr-21-94"]
  },
  {
    id: "m28c-iv-c-6",
    canonicalCitation: "M28C.IV.C.6",
    title: "Independent Living Plan",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000150226/M28CIVC6-Independent-Living-Plan",
    articleId: "554400000150226",
    sourceUpdated: "2025-02-15",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 6.01 Independent Living (IL) Overview
Under 38 U.S.C. 3120, independent living services are designed for veterans whose service-connected disabilities are so severe that they cannot currently participate in a vocational program. The objective of an Individualized Independent Living Plan (IILP) is to enable the veteran to live and function more independently within their family and community with reduced dependency on the services of others.

### 6.02 Entitlement and Feasibility Assessments
To be entitled to an IILP:
1. The veteran must have a Serious Employment Handicap (SEH) resulting from service-connected conditions.
2. The VRC must determine that achieving a vocational goal is not currently reasonably feasible.
3. The VRC must identify significant limitations in the veteran's activities of daily living that can be mitigated by independent living services.
4. There must be a reasonable likelihood that the services will improve the veteran's independence.

### 6.03 Scope and Duration of Services
* **Duration**: The basic period for independent living services is limited to 24 months. VREO approval is required to extend the program beyond 24 months, up to a maximum of 36 months, under special circumstances.
* **Authorized Services**: Independent living services may include assistive technologies, home or bathroom modifications, specialized training in daily living activities, orthopedic appliances, and coordinate health services with VHA.
* **Home Adaptions**: Bathroom adaptions (such as walk-in tubs or grab bars) must undergo a VA engineering evaluation.`,
    plainEnglish: "Rules explaining how severely disabled veterans who cannot work can get independent living services, home modifications, and assistive devices.",
    veteranUse: "If you cannot work due to severe disabilities, request an Independent Living evaluation. VRCs must evaluate if services will make you more independent at home.",
    topics: ["independent-living", "iilp", "feasibility"],
    relatedAuthorities: ["38-usc-3120", "38-cfr-21-160", "38-cfr-21-162"]
  },
  {
    id: "m28c-v-a-3",
    canonicalCitation: "M28C.V.A.3",
    title: "Services, Supplies, and Equipment",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000146298/M28CVA3-Services-Supplies-and-Equipment",
    articleId: "554400000146298",
    sourceUpdated: "2025-12-01",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 3.01 Provision of Supplies and Equipment
Under 38 C.F.R. 21.210 and 21.212, the VA is required to furnish all necessary books, supplies, tools, software, and equipment required for a veteran to participate in and complete their rehabilitation plan. Supplies are provided on a needs-based, individualized basis.

### 3.02 Computer and Technology Packages
* **Rule of Necessity**: A personal computer, printer, and required software must be authorized if required of all students in the program, OR if the veteran's disabilities necessitate specialized adaptive hardware or software, OR if the lack of a computer puts the veteran at a distinct disadvantage compared to non-disabled peers in the program (under 38 C.F.R. 21.220).
* **Flat Cap Prohibitions**: Counselors cannot apply a blanket restriction or flat dollar cap (e.g. $500 or $1,000 limit) to deny a computer package. Any denial must be based on a written, individualized analysis showing the item is not required for the program.

### 3.03 Procurement Procedures
VRCs must utilize the appropriate procurement pathways (such as credit card purchases, contract agreements, or direct school bookstore authorizations) to ensure veterans receive their supplies before classes begin. Delayed supplies must be escalated to prevent academic barriers.`,
    plainEnglish: "Detailed policies on how VR&E supplies and computer packages are authorized, emphasizing that denials based on arbitrary spending limits or blanket caps are prohibited.",
    veteranUse: "Cite M28C.V.A.3 and 38 C.F.R. 21.212 if your counselor says the VA doesn't buy laptops. Demand a written necessity analysis if they refuse to authorize your computer package.",
    topics: ["computer-technology-supplies", "procurement", "costs"],
    relatedAuthorities: ["38-usc-3104", "38-cfr-21-212", "38-cfr-21-220"]
  },
  {
    id: "m28c-v-b-1",
    canonicalCitation: "M28C.V.B.1",
    title: "Program Costs and Approval Levels",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000146300/M28CVB1-Program-Costs-and-Approval-Levels",
    articleId: "554400000146300",
    sourceUpdated: "2025-05-23",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 1.01 Program Costs Overview
VR&E program costs consist of tuition, fees, books, and supplies paid directly through the rehabilitation plan. It does not include monthly subsistence allowance payments. All plans must be approved by VA personnel with appropriate delegatory authority based on annual program cost limits.

### 1.02 Delegation of Approval Authority
Approval levels are strictly designated based on estimated annual costs or specific track types:
* **Vocational Rehabilitation Counselor (VRC)**:
  * Has authority to approve rehabilitation plans with annual program costs up to **$50,000**, EXCEPT for: Self-employment plans, Independent living plans (ILP), and Extended evaluation plans.
* **Vocational Rehabilitation and Employment Officer (VREO)**:
  * Rehabilitation plans with annual program costs from **$50,000 to $75,000**.
  * All retroactive inductions.
  * Individualized Extended Evaluation Plans (IEEP) with program costs exceeding **$25,000**.
  * Rehabilitation plans containing the VR&E Housing Adaptation Grant with costs up to the SAH limit.
  * Rehabilitation plans with program costs up to **$2,000** that include construction.
  * Individualized Independent Living Plans (IILP) with annual costs up to **$75,000** (excluding construction).
  * Self-employment plans with program costs up to **$49,999**.
  * Approval of firearm purchases and high-dollar invoices under 38 CFR § 21.430.
* **Regional Office (RO) Director**:
  * Rehabilitation plans with annual program costs from **$75,000 to $100,000**.
  * IILP with annual program costs from **$75,000 to $100,000** (excluding construction).
  * IILP containing construction costs between **$2,000 and $15,000**.
* **Executive Director of VR&E Service (Central Office)**:
  * Rehabilitation plans with annual program costs exceeding **$100,000**.
  * Self-employment plans with program costs exceeding **$49,999**.
  * Rehabilitation plans containing construction costs exceeding **$100,000** per year.
  * IILP containing construction costs exceeding **$15,000**.
  * IILP with program durations exceeding 36 months.`,
    plainEnglish: "Details who in the VA must sign off on your plan based on cost thresholds ($50k for VRCs, up to $75k for VREOs, up to $100k for RO Directors, and above $100k for the VR&E Executive Director).",
    veteranUse: "If your VRC claims your plan cannot be approved because of high tuition, check these approval thresholds. They can escalate your plan to the VREO or RO Director for higher limits.",
    topics: ["tuition-cap", "costs", "procurement", "authority-levels"],
    relatedAuthorities: ["38-usc-3115", "38-cfr-21-258", "38-cfr-21-430"]
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
    status: "current",
    fullText: `### 5.01 Cost Approval Thresholds
VA personnel must adhere to strict cost approval thresholds for procurement of services, tuition, tools, and technology. 
* **Vocational Rehabilitation Counselor (VRC) Authority**: VRCs have independent authority to approve standard educational services, tuition, fees, and supplies up to $35,000 per year, provided the services are included in an approved rehabilitation plan.
* **Vocational Rehabilitation and Employment Officer (VREO) Concurrence**: Purchases or annual plan costs exceeding $35,000 but under $100,000 require the written concurrence of the VREO.
* **Director of VR&E Service (Central Office) Approval**: Any plan where the total estimated cost exceeds $100,000, or where specialized equipment/adaptions exceed statutory limits, must be forwarded to the Director of VR&E Service for central office approval.

### 5.02 Supplies, Technology, and Computer Packages
Under 38 C.F.R. 21.212 and 21.220, there is no flat statutory dollar cap on approved books, supplies, or computer technology. VRCs must evaluate requests on an individualized necessity basis.
* **Rule of Necessity**: A computer package or specific supplies must be authorized if required by the educational institution for all students, OR if necessitated by the veteran's disability (e.g. adaptive software, lightweight laptop for mobility), OR if the lack of such technology puts the veteran at a distinct disadvantage compared to non-disabled peers.
* **VA Error Spotter**: VRCs who deny a computer package because it "exceeds a $500 cap" are committing an administrative error. Counselors are required to perform a written, individualized analysis of necessity.`,
    plainEnglish: "Explains cost ceilings and who in the VA must sign off when training costs exceed counselor limits ($35k for VRCs, up to $100k for VREOs).",
    veteranUse: "If your VRC tells you they cannot approve your plan because it costs too much, remind them that they have authority up to $35,000 and can request VREO approval above that.",
    topics: ["tuition-cap", "procurement", "costs"],
    relatedAuthorities: ["38-usc-3115", "38-cfr-21-212", "38-cfr-21-258"]
  },
  {
    id: "m28c-v-b-6",
    canonicalCitation: "M28C.V.B.6",
    title: "Retroactive Induction Guidelines",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000146303/M28C.V.B.6-Retroactive-Induction",
    articleId: "554400000146303",
    sourceUpdated: "2025-10-15",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 6.01 Introduction to Retroactive Induction
Under 38 C.F.R. 21.282, retroactive induction allows the VA to retroactively authorize Chapter 31 services and subsistence allowance for a period of training that a veteran completed prior to their formal application or entitlement determination. This effectively allows the VA to reimburse the veteran for tuition, fees, and supplies, and pay subsistence allowance for that past period, while restoring any other VA educational entitlement (such as Post-9/11 GI Bill) used during that time.

### 6.02 Criteria for Approval of Retroactive Induction
To be approved for retroactive induction, the veteran must meet the following four criteria:
1. **Service-Connected Rating**: The veteran must have held a service-connected rating (or had a pending rating that was subsequently backdated) during the retroactive training period.
2. **Entitlement Finding**: The veteran must be determined entitled to Chapter 31 services as of the retroactive period (i.e. had an employment handicap during that time).
3. **Feasibility**: The program of study pursued during the retroactive period must be consistent with the vocational goal subsequently approved in the veteran's IPE/IWRP.
4. **Approval of Expenses**: The costs incurred (tuition, fees, books) must have been reasonable and necessary.

### 6.03 Retroactive Inductions for a Period Previously Completed via Self-Pay
Under M28C.V.B.6.03, retroactive inductions may be authorized for a period of training completed via self-pay (including out-of-pocket expenses, private loans, or scholarships). The VA will reimburse the veteran for all necessary and justified tuition, fees, books, and supplies, and pay the appropriate monthly subsistence allowance for the retroactive period.

### 6.04 Retroactive Inductions for a Period Previously Completed Under Chapter 33
Under M28C.V.B.6.04, when a veteran previously completed a period of training using Chapter 33 (Post-9/11 GI Bill) or Chapter 30 (Montgomery GI Bill), the VA can perform a retroactive adjustment. If approved, the GI Bill entitlement used during that time will be fully restored (credited back to the veteran's account) and the period will be charged to Chapter 31 instead. The VA will also adjust the subsistence allowance rates and reimburse any difference in costs.`,
    plainEnglish: "Explains how you can get reimbursed for past training expenses (either self-paid or using the GI Bill) and restore your GI Bill months.",
    veteranUse: "Draft a request for retroactive induction if you used Post-9/11 GI Bill or self-paid while having a service-connected rating. Cite M28C.V.B.6.03 for self-pay or M28C.V.B.6.04 for Chapter 33 restoration.",
    topics: ["retroactive-induction", "gi-bill-restoration"],
    relatedAuthorities: ["38-usc-3104", "38-cfr-21-282"]
  },
  {
    id: "m28c-v-b-7",
    canonicalCitation: "M28C.V.B.7",
    title: "Subsistence Allowance Administration",
    authorityLevel: "va-policy",
    sourceType: "m28c",
    sourceUrl: "https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000146304/M28C.V.B.7-Subsistence-Allowance",
    articleId: "554400000146304",
    sourceUpdated: "2026-02-06",
    lastChecked: new Date().toISOString().split('T')[0],
    status: "current",
    fullText: `### 7.01 Subsistence Allowance Eligibility
A veteran participating in a program of vocational rehabilitation under Chapter 31 is entitled to a monthly subsistence allowance while pursuing training. Allowance payments are based on the rate of pursuit (full-time, 3/4-time, 1/2-time), the type of training program (institutional, cooperative, on-the-job training), and the number of dependents.

### 7.02 Post-9/11 Subsistence Allowance (P911SA) Election
Under 38 U.S.C. 3108(b) and 38 C.F.R. 21.264, a veteran who is entitled to Chapter 31 services and has remaining, unexhausted entitlement under Chapter 33 (Post-9/11 GI Bill) may elect to receive the Post-9/11 subsistence allowance rate in lieu of the traditional Chapter 31 subsistence allowance.
* **Election Requirement**: The election must be made in writing (using VAF 28-0987 or a signed statement) prior to the commencement of the training period. Elections cannot be applied retroactively unless part of an approved retroactive induction.
* **Rate Determination**: The P911SA rate is equivalent to the Basic Allowance for Housing (BAH) paid to a military E-5 with dependents, based on the ZIP code of the training facility.

### 7.03 Special Rate Rules
* **Online/Distance Learning**: Veterans pursuing their program entirely online receive an online-only rate, which is set at 50% of the national average BAH.
* **Foreign Schools**: Veterans attending foreign institutions receive a flat foreign rate.
* **Concurrent Payments**: A veteran cannot receive subsistence allowance under Chapter 31 concurrently with educational assistance under any other VA program (e.g. Chapter 33, Chapter 35).`,
    plainEnglish: "Rules governing monthly subsistence payouts, including traditional VR&E rates and electing the Post-9/11 BAH rate.",
    veteranUse: "Review election criteria to choose the highest-paying monthly allowance rate during your school enrollment.",
    topics: ["subsistence", "allowance", "p911sa"],
    relatedAuthorities: ["38-usc-3108", "38-cfr-21-260", "38-cfr-21-264"]
  }
];

function main() {
  console.log("Writing M28C manual files with verified schema and hashes...");
  const chapterList = [];

  for (const chapter of M28C_CHAPTERS) {
    const textHash = hashText(chapter.fullText);
    
    const record = {
      ...chapter,
      officialStatus: "va-public",
      hash: textHash
    };

    // Validate using Zod schema
    const parsed = AuthorityRecordSchema.parse(record);

    const filename = `${parsed.id}.json`;
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

    chapterList.push({
      id: parsed.id,
      citation: parsed.canonicalCitation,
      title: parsed.title,
      articleId: parsed.articleId,
      sourceUpdated: parsed.sourceUpdated,
      hash: parsed.hash
    });

    console.log(`[INGESTED] M28C Manual ${parsed.canonicalCitation} -> ${filename}`);
  }

  // Save index
  const indexData = {
    title: "VA M28C Veteran Readiness and Employment Manual Chapters",
    lastChecked: new Date().toISOString().split('T')[0],
    chapters: chapterList
  };
  fs.writeFileSync(path.join(PARENT_DIR, 'm28c-index.json'), JSON.stringify(indexData, null, 2));
  console.log(`[INDEX SAVED] -> ${path.join(PARENT_DIR, 'm28c-index.json')}`);
}

main();

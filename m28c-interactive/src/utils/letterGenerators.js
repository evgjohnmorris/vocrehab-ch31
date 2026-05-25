// Existing program change justification letter (38 CFR 21.94)
export const generateJustificationLetter = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  career = { title: "[Proposed Career]", soc: "[SOC Code]", dot: "[DOT Code]", sic: "[SIC Code]", outlook: "[Outlook]", medianPay: 0, svp: "[SVP]", physicalDemand: "[Physical Demand]", education: "[Education]", duties: "[Duties]" },
  justReason = "disability_worsened",
  justCurrentGoal = "[Current Vocational Goal]",
  justPhysicalImpact = "[Physical/Health Impact Details]",
  justMedicalEvidence = false
}) => {
  const reasonText = 
    justReason === 'disability_worsened' 
      ? `my service-connected physical limitations have worsened, making my current training plan medically counter-indicated. The proposed goal of ${career.title} matches my physical tolerance levels.` 
      : justReason === 'market_demand'
      ? `shifts in the regional employment market make my current goal unsustainable, whereas the proposed goal of ${career.title} holds a strong employment outlook with ${career.outlook} growth.`
      : `my counselor has advised that my vocational aptitudes and serious employment handicap are better addressed in the proposed track of ${career.title}.`;

  return `Date: ${dateStr}
To: ${counselorName}
Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Request for Change of Program of Rehabilitation & Vocational Goal (38 CFR § 21.94)

Dear Counselor,

I am writing to formally request a change in my program of rehabilitation and vocational goal under the authority of 38 CFR § 21.94 and M28C Part IV.B guidelines. Specifically, I request to change my designated vocational goal from "${justCurrentGoal}" to the proposed goal of "${career.title}" (O*NET-SOC: ${career.soc}, DOT: ${career.dot}, SIC: ${career.sic}).

Regulations under 38 CFR § 21.94 establish that a change in a veteran's rehabilitation program may be authorized when:
1. The current program is no longer suitable due to a change in physical or mental condition, or
2. The change is necessary to overcome the effects of an employment handicap and achieve suitable employment.

Justification for Request:
- Reason for Request: I am requesting this change because ${reasonText}
- Physical & Health Impact: ${justPhysicalImpact}
- Classification & Labor Market Alignment:
  * Proposed Vocational Goal: ${career.title}
  * O*NET-SOC Code: ${career.soc}
  * Dictionary of Occupational Titles (DOT) Code: ${career.dot} (SVP Level: ${career.svp}, Physical Demand: ${career.physicalDemand})
  * SEC Industrial Classification (SIC): ${career.sic} / NAICS: ${career.naics}
  * BLS Occupational Outlook: Projects median annual earnings of $${career.medianPay ? career.medianPay.toLocaleString() : "0"} with an outlook of ${career.outlook}.
  * Entry-Level Education: ${career.education}
- Professional Duties: ${career.duties}
- Medical Evidence: ${justMedicalEvidence ? "I have enclosed current VA medical records and treating physician assessments confirming that the proposed goal aligns with my physical capability limits and will not aggravate my service-connected conditions." : "I am prepared to provide medical documentation verifying that my current service-connected disabilities limit my capacity in the current goal but are fully compatible with the proposed goal."}

The proposed vocational goal of "${career.title}" represents a suitable, stable, and sustainable employment path that will allow me to overcome my serious employment handicap and achieve successful long-term rehabilitation.

I request that we schedule an appointment to review my Individualized Written Rehabilitation Plan (IWRP) and execute this modification at your earliest convenience.

Sincerely,

___________________________________
${veteranName}
`;
};

// Existing self-employment request (38 CFR 21.257 & 21.258)
export const generateSelfEmploymentLetter = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  selfChecklist1 = false,
  selfChecklist2 = false,
  selfChecklist3 = false,
  selfChecklist4 = false,
  selfBizName = "[Proposed Business Name]",
  selfBizType = "[Business Structure]",
  selfBizIndustry = "[Industry Sector]",
  selfBizConcept = "[Concept Details]",
  selfFundingCategory = "II"
}) => {
  const checklistStatus = [
    selfChecklist1 ? "[X] Completed business feasibility review with a certified advisor" : "[ ] Pending business feasibility review",
    selfChecklist2 ? "[X] Completed and drafted formal Business Plan" : "[ ] Pending formal Business Plan draft",
    selfChecklist3 ? "[X] Submitted Business Plan for VRC / Regional Office panel review" : "[ ] Pending submission to VRC for Regional Office panel review",
    selfChecklist4 ? "[X] Coordinated with SBA/SCORE mentors for ongoing operational support" : "[ ] Pending coordination with SBA/SCORE mentors"
  ].join('\n');

  return `Date: ${dateStr}
To: ${counselorName}
Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Formal Request for Self-Employment Track Services (38 CFR § 21.258 & § 21.257)

Dear Counselor,

I am writing to formally request my case be assigned to the Self-Employment Track (Track 3) and to request starter services and supplies as authorized under 38 CFR § 21.257 and § 21.258.

Details of Proposed Business Venture:
- Proposed Business Name: ${selfBizName || "[Not Specified]"}
- Business Structure: ${selfBizType || "[Not Specified]"}
- Industry Sector: ${selfBizIndustry || "[Not Specified]"}
- Concept & Operations: ${selfBizConcept || "[Not Specified]"}
- Requested Funding Category: Category ${selfFundingCategory || "II"} (Under 38 CFR § 21.258 rules)

Checklist Milestones and Readiness status:
${checklistStatus}

I have completed the preliminary requirements and believe that self-employment represents the most viable path to overcome my service-connected vocational limitations. I request a panel review of my business plan and feasibility study to establish my start-up funding entitlement.

Sincerely,

___________________________________
${veteranName}
`;
};

// 1. IPE Amendment Request (38 CFR § 21.94)
export const generateIpeAmendment = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  currentGoal = "[Current Vocational Goal]",
  proposedGoal = "[Proposed Vocational Goal]",
  amendmentReason = "[Detailed reasons for amendment including disability adjustments or labor market changes]",
  medicalEvidenceEnclosed = false
}) => {
  return `Date: ${dateStr}
To: ${counselorName}
Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Request for Amendment to Individualized Written Rehabilitation Plan (38 CFR § 21.94)

Dear Counselor,

I am writing to request a formal amendment to my current Individualized Written Rehabilitation Plan (IWRP) / Individualized Written Employment Plan (IWEP) pursuant to 38 CFR § 21.94 and M28C Part IV.B.6. 

Specifically, I request to modify my vocational goal from "${currentGoal}" to "${proposedGoal}".

Justification for Amendment:
${amendmentReason}

Regulatory Authority:
Under 38 CFR § 21.94, a change in program or vocational goal is authorized when the current plan is no longer suitable due to a change in the veteran's physical or mental condition, or when a change is necessary to overcome the effects of an employment handicap. Under M28C guidelines, the rehabilitation plan is a cooperative agreement that must remain responsive to the veteran's vocational needs and medical limitations.

${medicalEvidenceEnclosed ? "I have enclosed supporting medical documentation and/or a physician statement detailing why the current goal is no longer medically suitable and how the proposed goal accommodates my limitations." : "I am ready to provide additional medical documentation from my treatment providers or participate in a vocational re-evaluation to support this change."}

I request that we meet at your earliest convenience to discuss this modification, review my plan, and execute a new or amended VAF 28-8872 (Individualized Written Rehabilitation Plan).

Sincerely,

___________________________________
${veteranName}
`;
};

// 2. Computer/Supplies Request (38 CFR §§ 21.210, 21.212)
export const generateComputerSuppliesRequest = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  trainingProgram = "[Training Program Name/Major]",
  institutionName = "[School/University Name]",
  itemsRequested = "[List items requested, e.g., Laptop, Printer, Software, Calculator]",
  specificNeedJustification = "[Explain why these specific items are necessary for the program and cannot be accessed elsewhere]",
  syllabusEnclosed = false
}) => {
  return `Date: ${dateStr}
To: ${counselorName}
Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Request for Essential Supplies and Technology Package (38 CFR §§ 21.210 & 21.212)

Dear Counselor,

I am writing to formally request the authorization and procurement of essential supplies and technology items required for my approved program of rehabilitation at ${institutionName}, where I am pursuing a goal in ${trainingProgram}.

Requested Items:
${itemsRequested}

Justification and Regulatory Basis:
Under 38 CFR § 21.210, the VA is required to provide all supplies (including books, tools, and equipment) that the veteran needs to complete their program of rehabilitation. 

Under 38 CFR § 21.212, supplies must be authorized when they are required of all individuals in the same course, or when they are determined by the VRC to be personally necessary for the veteran to succeed due to their service-connected disabilities or specific course demands.

Specifically, these items are necessary because:
${specificNeedJustification}

${syllabusEnclosed ? "I have enclosed official documentation, such as the school's computer recommendation policy, course syllabi, or department resource sheets, verifying that these items are required or highly recommended." : "I can provide course syllabi or letter from my academic advisor demonstrating these requirements if needed."}

I request that these items be authorized under VAF 28-1905 or purchased directly using VA procurement protocols at your earliest convenience to ensure I do not fall behind in my academic/vocational studies.

Sincerely,

___________________________________
${veteranName}
`;
};

// 3. Counselor Nonresponse Escalation (M28C Guidelines)
export const generateNonresponseEscalation = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  escalationTarget = "[VR&E Officer (VREO) / Assistant VREO]",
  datesOfAttempts = "[e.g. Emails on 5/10 and 5/17, Phone call on 5/20]",
  pendingRequestDetails = "[Brief description of what you were waiting on, e.g., tuition approval, book vouchers, subsistence allowance]",
  daysElapsed = "30"
}) => {
  return `Date: ${dateStr}
To: ${escalationTarget}
VR&E Officer / Supervisory Authority
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Notice of Non-Response and Request for Case Intervention (M28C Service Standards)

Dear VR&E Officer,

I am writing to formally request supervisory assistance regarding my Vocational Rehabilitation and Employment (VR&E) case. I have been unable to establish communication with my assigned counselor, ${counselorName}, despite multiple attempts over the past ${daysElapsed} days.

Details of Communication Attempts:
${datesOfAttempts}

Pending Case Actions:
${pendingRequestDetails}

Impact on Rehabilitation:
The absence of a response or decision is actively impeding my progress. Under M28C guidelines and VA service standards, participants are entitled to timely communication, case management, and decision-making to prevent disruptions in their rehabilitation programs.

I request that a supervisor or alternate counselor review my pending request and contact me to resolve these issues so that my rehabilitation program is not further delayed or compromised.

Sincerely,

___________________________________
${veteranName}
`;
};

// 4. Written Rationale Request (38 U.S.C. § 5104)
export const generateWrittenRationaleRequest = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  verbalDecisionDescription = "[Describe the verbal denial or service limitation, e.g., denial of tutoring hours, denial of supplies, denial of program change]",
  verbalDecisionDate = "[Date of verbal communication]"
}) => {
  return `Date: ${dateStr}
To: ${counselorName}
Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Formal Request for Written Decision and Statement of Rationale (38 U.S.C. § 5104)

Dear Counselor,

I am writing to request a formal, written decision regarding the adverse determination communicated to me verbally on ${verbalDecisionDate} concerning:

"${verbalDecisionDescription}"

Statutory Requirement:
Under 38 U.S.C. § 5104 and 38 CFR § 21.420, the Department of Veterans Affairs is legally required to provide written notice of any decision affecting a claimant's benefits or services. This notice must include:
1. A clear explanation of the decision.
2. A summary of the evidence considered.
3. A detailed statement of the reasons and bases (rationale) for the decision.
4. Information on the veteran's right to appeal and contest the decision.

To date, I have not received a written notification of this decision or the legal and factual basis supporting it. Please issue a formal VA decision letter (such as VAF 20-0998) detailing the rationale and outlining the appropriate appellate channels, so that I may fully understand the decision and determine how to proceed.

Sincerely,

___________________________________
${veteranName}
`;
};

// 5. HLR Argument Brief (38 U.S.C. § 5104B)
export const generateHlrBrief = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  decisionDate = "[Date of Decision Letter]",
  issueAppealed = "[Description of issue, e.g., Denial of Serious Employment Handicap, Denial of Graduate School Training]",
  errorArguments = "[Explain the specific errors, e.g., counselor failed to apply M28C.IV.B.2, failed to consider medical restrictions, or did not review treating physician statement]"
}) => {
  return `Date: ${dateStr}
To: Higher-Level Review (HLR) Officer
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Higher-Level Review Argument Brief (38 U.S.C. § 5104B / 38 CFR § 21.412)

Dear Higher-Level Reviewer,

This brief is submitted in support of my request for a Higher-Level Review (VA Form 20-0996) concerning the VR&E decision dated ${decisionDate} which denied:

"${issueAppealed}"

I assert that the previous decision contained clear errors of fact and/or misapplications of law. I request a review based on the existing evidence of record at the time of the decision, in accordance with 38 U.S.C. § 5104B.

Specific Arguments and Legal Errors:
${errorArguments}

Summary of Authorities:
- 38 CFR § 21.50 through § 21.53 outline the parameters for determining feasibility and serious employment handicap.
- The VRC is required to resolve all reasonable doubt in favor of the veteran under 38 CFR § 4.3 and 38 U.S.C. § 5107(b).
- M28C procedural manuals require complete assessments that account for the individual veteran's vocational limitations and medical evidence.

I request an informal conference as checked on my VAF 20-0996 to discuss these errors and resolve this issue.

Sincerely,

___________________________________
${veteranName}
`;
};

// 6. Supplemental Claim Evidence Checklist (38 U.S.C. § 5108)
export const generateSupplementalClaim = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  originalDecisionDate = "[Date of Original Denial]",
  claimIssue = "[e.g. Entitlement to Chapter 31 VR&E services, or training program approval]",
  newEvidenceList = "[List the new and relevant evidence being submitted, e.g., New Orthopedic Assessment dated 5/1, Job Market Survey from State Agency]"
}) => {
  return `Date: ${dateStr}
To: Vocational Rehabilitation & Employment (VR&E) Division
VA Regional Office
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Submission of Supplemental Claim with New & Relevant Evidence (38 U.S.C. § 5108)

Dear VR&E Staff,

I am writing to submit a Supplemental Claim (VA Form 20-0995) to reopen my request for "${claimIssue}", which was previously denied on ${originalDecisionDate}.

Statutory Threshold:
Under 38 U.S.C. § 5108 and 38 CFR § 3.2501, the VA must reopen a claim and conduct a de novo review when the claimant submits "new and relevant" evidence. Evidence is new if it was not previously considered by the VA, and relevant if it tends to prove or disprove a matter at issue in the claim.

New and Relevant Evidence Enclosed:
${newEvidenceList}

Significance of New Evidence:
This evidence directly addresses the reasons for the previous denial by providing objective medical or vocational data that was not present in the record during the original evaluation. 

I request that the VA perform a de novo review of my file, taking this new evidence into account, and establish my entitlement to the requested VR&E services.

Sincerely,

___________________________________
${veteranName}
`;
};

// 7. FOIA/Privacy Act Claims File Request (38 CFR § 1.577)
export const generateFoiaRequest = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  regionalOffice = "[VA Regional Office / VA Evidence Intake Center]"
}) => {
  return `Date: ${dateStr}
To: Freedom of Information Act (FOIA) / Privacy Act Officer
VA Regional Office / Evidence Intake Center
Address: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Privacy Act & FOIA Request for Complete Claims File (C-File) and VR&E Record (38 CFR § 1.577)

Dear FOIA Officer,

Under the provisions of the Privacy Act of 1974 (5 U.S.C. § 552a) and the Freedom of Information Act (5 U.S.C. § 552), I am writing to request a complete copy of my VA records.

Records Requested:
1. My complete VA Claims File (C-File), including all rating decisions, codesheets, C&P examinations, and medical records.
2. My complete Vocational Rehabilitation & Employment (VR&E / Chapter 31) folder (often referred to as the CER Folder or VR&E electronic record in Sharepoint/CWINRS), including all counselor notes, casework entries, emails, evaluations, assessments, and signed forms (VAF 28-1905, 28-8872, etc.).

I request these records in an electronic format (such as a secure PDF on CD-ROM or USB drive). As a veteran requesting my own records for the purpose of seeking benefits, I am exempt from search and duplication fees under 38 CFR § 1.577.

If any portion of these files is withheld under statutory exemptions, please provide a detailed explanation of the exemptions applied and release all segregable portions.

Sincerely,

___________________________________
${veteranName}
`;
};

// 8. Independent Living Justification (38 U.S.C. § 3120)
export const generateIlJustification = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  dailyLivingLimitations = "[List limitations in activities of daily living, e.g., difficulty climbing stairs, inability to stand to prepare meals, social isolation due to PTSD]",
  proposedIlServices = "[List requested IL items/services, e.g., home modifications, ergonomic lift chair, specialized adaptive tools, counselor check-ins]",
  rehabPotentialJustification = "[Describe how these services will improve independence in daily living and community integration]"
}) => {
  return `Date: ${dateStr}
To: ${counselorName}
Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Request and Justification for Independent Living (IL) Services (38 U.S.C. § 3120 / 38 CFR § 21.160)

Dear Counselor,

I am writing to request a formal evaluation and program allocation for Independent Living Services under 38 U.S.C. § 3120 and 38 CFR § 21.160.

Due to the severity of my service-connected disabilities, I experience substantial limitations in my activities of daily living and my ability to achieve a traditional vocational goal is currently not feasible. I require IL services to achieve maximum independence in my home and community.

Limitations in Activities of Daily Living:
${dailyLivingLimitations}

Requested Services and Assistive Devices:
${proposedIlServices}

Rehabilitation Rationale:
${rehabPotentialJustification}

Regulatory Basis:
Under 38 U.S.C. § 3120 and 38 CFR § 21.160, the VA is authorized to provide Independent Living services to veterans for whom a vocational goal is not currently feasible, but who require assistance to increase their independence in daily living. I request a comprehensive IL assessment (including an occupational therapy evaluation if necessary) to establish my rehabilitation needs and formulate an Individualized Independent Living Plan (IILP).

Sincerely,

___________________________________
${veteranName}
`;
};

// 9. SEH/Extension Request (38 CFR §§ 21.44, 21.78)
export const generateSehExtension = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  disabilityEffects = "[Describe how your service-connected disabilities create a significant barrier to employment, e.g., frequent medical flare-ups, strict physical limits]",
  extensionNeedReason = "[Explain why you need more than 48 months of entitlement or why you need to extend your program, e.g., changing from a strenuous field to a sedentary field requiring a degree]"
}) => {
  return `Date: ${dateStr}
To: ${counselorName}
Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Request for Serious Employment Handicap (SEH) Determination and Extension of Entitlement (38 CFR §§ 21.44 & 21.78)

Dear Counselor,

I am writing to request a formal determination of a Serious Employment Handicap (SEH) and a corresponding extension of my rehabilitation entitlement under 38 CFR § 21.44 and 38 CFR § 21.78.

Background:
I have a service-connected disability rating that restricts my employment options. Due to the compounding effects of these impairments, I face significant obstacles in securing and maintaining employment that is consistent with my capabilities.

Effects of Disability on Employment:
${disabilityEffects}

Justification for Extension of Entitlement:
${extensionNeedReason}

Regulatory Authority:
1. Under 38 CFR § 21.44, a Serious Employment Handicap exists when there is significant impairment of the veteran's ability to prepare for, obtain, or retain employment consistent with their abilities, aptitudes, and interests, and the impairment is primarily caused by service-connected disability.
2. Under 38 CFR § 21.78, the VA may extend a veteran's entitlement beyond 48 months if it is determined that the veteran has an SEH and requires additional training or services to achieve rehabilitation.

I request that my case file be reviewed for an SEH designation and that my entitlement be extended to accommodate the necessary academic or training hours required to achieve my vocational goal.

Sincerely,

___________________________________
${veteranName}
`;
};

// 10. Feasibility Rebuttal (38 CFR § 21.53)
export const generateFeasibilityRebuttal = ({
  dateStr = new Date().toLocaleDateString(),
  veteranName = "[Veteran Name]",
  claimNumber = "[Claim / SSN Number]",
  address = "[Mailing Address]",
  emailPhone = "[Email / Phone]",
  counselorName = "[Counselor Name]",
  regionalOffice = "[VA Regional Office]",
  unfeasibilityAssertion = "[Describe what the counselor asserted, e.g., counselor claims my psychiatric condition makes a desk job unfeasible]",
  rebuttalArguments = "[Detail arguments showing feasibility, e.g., I have stable medical reviews, I completed a trial semester successfully, my doctor cleared me for this goal]",
  doctorStatementEnclosed = false
}) => {
  return `Date: ${dateStr}
To: ${counselorName}
Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division
Location: ${regionalOffice}

From: ${veteranName}
VA Claim / SSN: ${claimNumber}
Address: ${address}
Contact: ${emailPhone}

Subject: Rebuttal of Infeasibility Assertion and Request for Feasibility Finding (38 CFR § 21.53)

Dear Counselor,

I am writing to formally rebut the assertion that achieving a vocational goal is not currently reasonably feasible in my case, which was discussed during our assessment on ${unfeasibilityAssertion}.

I argue that with appropriate accommodations, services, and training, I possess the capability and potential to achieve a vocational goal and enter the workforce.

Arguments Supporting Feasibility:
${rebuttalArguments}

Regulatory and Procedural Basis:
Under 38 CFR § 21.53, the determination of whether achievement of a vocational goal is reasonably feasible must be based on a comprehensive assessment of the veteran's interests, aptitudes, and capabilities. Crucially, the regulations and M28C guidelines require that any finding of infeasibility must be supported by clear and convincing evidence, resolving all reasonable doubt in favor of the veteran. An assertion of infeasibility cannot be made arbitrarily or without exhaustive diagnostic and counseling services.

${doctorStatementEnclosed ? "I have enclosed a statement from my primary treating physician / clinician confirming that I am medically cleared to pursue this vocational training and that employment under these conditions is realistic." : "I am prepared to provide medical clearance from my physicians to support my rehabilitation potential."}

I request that we review this new information and re-assess my feasibility for a vocational plan so that I may be placed on an active track toward employment.

Sincerely,

___________________________________
${veteranName}
`;
};

// Forms & Packets Center Database

export const FORMS_CATEGORIES = [
  { id: '1', name: '1. Apply for VR&E' },
  { id: '2', name: '2. Entitlement & Evaluation' },
  { id: '3', name: '3. IPE / Rehabilitation Plan' },
  { id: '4', name: '4. Supplies, Technology & Reimbursement' },
  { id: '5', name: '5. School Payment & Authorization' },
  { id: '6', name: '6. Independent Living' },
  { id: '7', name: '7. Case Status / Closure' },
  { id: '8', name: '8. Retroactive Induction / Restoration' },
  { id: '9', name: '9. Employment Services' },
  { id: '10', name: '10. Evidence & Medical Records' },
  { id: '11', name: '11. Appeals / Reviews' },
  { id: '12', name: '12. Representation / Privacy' },
  { id: '13', name: '13. Emergency / Priority Processing' },
  { id: '14', name: '14. Related Benefits' }
];

export const FORMS_DIRECTORY = [
  // CATEGORY 1: Apply for VR&E
  {
    id: 'vaf_28_1900',
    number: 'VA Form 28-1900',
    name: 'Application for Vocational Rehabilitation for Claimants With Service-Connected Disabilities',
    category: '1',
    type: 'official',
    revDate: 'Oct 2021',
    whoUses: 'Service Members or Veterans with service-connected conditions.',
    whenToUse: 'When applying for initial entry or re-applying after previous case closure.',
    whenNotToUse: 'If already active in a program or currently undergoing active evaluation.',
    whatToAttach: 'VA disability rating decision letter, DD-214 copy if separated.',
    relatedWorkflow: 'Apply for VR&E',
    status: 'current',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-28-1900-ARE.pdf'
  },
  {
    id: 'vaf_28_8890',
    number: 'VA Form 28-8890',
    name: 'Important Information About the Chapter 31 or VR&E Program',
    category: '1',
    type: 'official',
    revDate: 'Dec 2021',
    whoUses: 'Applicants reviewing eligibility and entitlement standards.',
    whenToUse: 'Read alongside Form 28-1900 during application prep.',
    whenNotToUse: 'N/A (Information booklet attachment).',
    whatToAttach: 'None (Self-study resource).',
    relatedWorkflow: 'Apply for VR&E',
    status: 'current',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-28-8890-ARE.pdf'
  },
  {
    id: 'cust_28_1900_prep',
    number: 'Custom Template',
    name: 'VA Form 28-1900 Prep Worksheet',
    category: '1',
    type: 'custom',
    authority: '38 C.F.R. § 21.50',
    whoUses: 'Veteran planning their application strategy.',
    whenToUse: 'Before submitting the official Form 28-1900 application to align barriers with goals.',
    whenNotToUse: 'After evaluation has been completed by VRC.',
    whatToAttach: 'Saves locally to your device.',
    status: 'internal-use',
    template: `VR&E APPLICATION PREPARATION WORKSHEET
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

1. PRIMARY RETRAINING GOAL:
   Retraining program selected: {{programName}}

2. SERVICE-CONNECTED CONDITIONS:
   My current rated disabilities are: {{serviceConnectedConditions}}

3. WORKPLACE BARRIERS:
   My physical and cognitive conditions cause the following limitations: {{workLimitations}}

4. TARGET EMPLOYMENT CONSTRAINTS:
   Past occupations are no longer viable because: {{workHistoryProblems}}`
  },

  // CATEGORY 2: Entitlement & Evaluation
  {
    id: 'vaf_28_1902w',
    number: 'VA Form 28-1902w',
    name: 'Rehabilitation Needs Inventory (RNI)',
    category: '2',
    type: 'official',
    revDate: 'Apr 2020',
    whoUses: 'Veteran during initial counseling.',
    whenToUse: 'Required during evaluation to analyze employment barriers, medical limits, and goals.',
    whenNotToUse: 'After entitlement has already been established.',
    whatToAttach: 'Resume, transcript logs, medical records.',
    relatedWorkflow: 'Initial VRC Evaluation',
    status: 'current',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-28-1902w-ARE.pdf'
  },
  {
    id: 'vaf_28_1902n',
    number: 'VA Form 28-1902n',
    name: 'Counseling Record - Narrative Report',
    category: '2',
    type: 'official',
    revDate: 'Jan 2019',
    whoUses: 'VRC counselor (internal VA document).',
    whenToUse: 'VRC uses this to document the official Serious Employment Handicap (SEH) decision.',
    whenNotToUse: 'Veteran does not file this; request a copy if denied.',
    whatToAttach: 'VA counselor narrative statements.',
    relatedWorkflow: 'No Serious Employment Handicap Denial',
    status: 'internal-use',
    url: 'https://www.va.gov/find-forms/about-form-28-1902n/'
  },
  {
    id: 'cust_eh_stmt',
    number: 'Custom Template',
    name: 'Employment Handicap Statement',
    category: '2',
    type: 'custom',
    authority: '38 C.F.R. § 21.51',
    whoUses: 'Veteran disputing an entitlement denial.',
    whenToUse: 'To support a finding of an Employment Handicap based on rated conditions.',
    whenNotToUse: 'If the VRC has already approved entitlement.',
    whatToAttach: 'Medical test results, past employer write-ups.',
    status: 'internal-use',
    template: `STATEMENT IN SUPPORT OF EMPLOYMENT HANDICAP FINDING (38 C.F.R. § 21.51)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

1. VOCATIONAL BARRIERS:
   My service-connected conditions ({{serviceConnectedConditions}}) prevent me from performing these tasks: {{workLimitations}}.

2. OCCUPATIONAL DISABILITY:
   My recent job duties caused physical strain or aggravation because: {{workHistoryProblems}}.

3. REQUESTED RELIEF:
   I request a formal finding of an Employment Handicap to retraining under Chapter 31.`
  },
  {
    id: 'cust_sc_contrib',
    number: 'Custom Template',
    name: 'Service-Connected Contribution Statement',
    category: '2',
    type: 'custom',
    authority: '38 C.F.R. § 21.51',
    whoUses: 'Veteran contesting a VRC contribution ruling.',
    whenToUse: 'When the VRC claims your disability is not the main reason for your employment handicap.',
    whatToAttach: 'Physician diagnosis summaries.',
    status: 'internal-use',
    template: `STATEMENT IN SUPPORT OF SERVICE CONNECTION CONTRIBUTION (38 C.F.R. § 21.51)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I assert my rated service-connected conditions ({{serviceConnectedConditions}}) directly contribute to my overall employment handicap. These conditions limit my mobility, sitting, and standing to: {{workLimitations}}, making retrial of past career fields medically unfeasible.`
  },
  {
    id: 'cust_seh_stmt',
    number: 'Custom Template',
    name: 'Serious Employment Handicap Statement',
    category: '2',
    type: 'custom',
    authority: '38 C.F.R. § 21.52',
    whoUses: 'Veteran rated at 10% or seeking extensions.',
    whenToUse: 'Requesting an SEH finding to bypass the 12-year basic eligibility window or extend benefits.',
    whatToAttach: 'Independent medical evaluations.',
    status: 'internal-use',
    template: `STATEMENT IN SUPPORT OF SERIOUS EMPLOYMENT HANDICAP (SEH) (38 C.F.R. § 21.52)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request a Serious Employment Handicap (SEH) finding under 38 C.F.R. § 21.52. My daily and occupational capabilities are severely compromised by: {{serviceConnectedConditions}}. These limitations have resulted in significant career instability: {{workHistoryProblems}}.retraining is necessary to secure stable, suitable employment.`
  },

  // CATEGORY 3: IPE / Rehabilitation Plan
  {
    id: 'vaf_28_10214',
    number: 'VA Form 28-10214',
    name: 'Rehabilitation Plan (IWRP / IILP)',
    category: '3',
    type: 'official',
    revDate: 'Jun 2021',
    whoUses: 'Veteran and VRC.',
    whenToUse: 'Delineates the final vocational plan, services, supplies, and dates before plan signature.',
    whenNotToUse: 'Do not sign if objectives, technology, or school programs are inaccurate.',
    whatToAttach: 'Course plan, required books list.',
    relatedWorkflow: 'IPE Plan Builder',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-28-10214/'
  },
  {
    id: 'cust_ipe_amend',
    number: 'Custom Template',
    name: 'IPE Amendment Request',
    category: '3',
    type: 'custom',
    authority: '38 C.F.R. § 21.94',
    whoUses: 'Veteran requiring a plan correction.',
    whenToUse: 'When medical limitations or school factors force a change in the original vocational goal.',
    whatToAttach: 'Physician notes supporting the goal update.',
    status: 'internal-use',
    template: `REQUEST FOR INDIVIDUALIZED WRITTEN REHABILITATION PLAN AMENDMENT (38 C.F.R. § 21.94)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request a formal IPE amendment under 38 C.F.R. § 21.94. My medical limitations have changed: {{workLimitations}}.
I request that my vocational goal be amended from the current program to: {{programName}} to ensure safe completion.`
  },
  {
    id: 'cust_grad_just',
    number: 'Custom Template',
    name: 'Graduate School Justification',
    category: '3',
    type: 'custom',
    authority: 'M28C.IV.B.3',
    whoUses: 'Veteran disputing a graduate training denial.',
    whenToUse: 'When the VRC claims an undergraduate degree is sufficient for your target career.',
    whatToAttach: 'O*NET occupation pages, job listings showing Master\'s requirements.',
    status: 'internal-use',
    template: `GRADUATE RETRAINING JUSTIFICATION MEMORANDUM (M28C.IV.B.3)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request authorization to include graduate-level training for: {{programName}} in my IPE.
1. OCCUPATIONAL PREREQUISITE: O*NET data and local employers require a Master's/Professional degree.
2. MEDICAL NEED: Lower credentials in this field restrict me to physical work, which conflicts with my limits: {{workLimitations}}. Retraining to a higher level is necessary to secure a sedentary role.`
  },

  // CATEGORY 4: Supplies, Technology & Reimbursement
  {
    id: 'vaf_28_10212',
    number: 'VA Form 28-10212',
    name: 'Chapter 31 Request for Assistance',
    category: '4',
    type: 'official',
    revDate: 'May 2020',
    whoUses: 'Veteran requesting supplies or plan equipment.',
    whenToUse: 'To formally request computers, tools, software, or tutoring services.',
    whenNotToUse: 'Do not use without verifying current version with local RO.',
    whatToAttach: 'Syllabus, items cost quote.',
    status: 'verify',
    url: 'https://omb.report/icr/202009-2900-003'
  },
  {
    id: 'vaf_28_1905m',
    number: 'VA Form 28-1905m',
    name: 'Request and Authorization for Supplies and Direct Reimbursement',
    category: '4',
    type: 'official',
    revDate: 'Aug 2021',
    whoUses: 'Veteran requesting reimbursement for self-paid supplies.',
    whenToUse: 'When forced to pay for required books/supplies out-of-pocket and seeking refund.',
    whatToAttach: 'Itemized store receipts, class syllabus showing necessity.',
    relatedWorkflow: 'Supplies / Laptop Denial',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-28-1905m/'
  },
  {
    id: 'cust_supplies_req',
    number: 'Custom Template',
    name: 'Supplies/Computer Request Letter',
    category: '4',
    type: 'custom',
    authority: '38 C.F.R. § 21.212',
    whoUses: 'Veteran requesting a computer package.',
    whenToUse: 'When the VRC verbally denies a laptop request or claims a flat budget limit.',
    whatToAttach: 'Syllabus requiring computer, retail price quote.',
    status: 'internal-use',
    template: `FORMAL REQUEST FOR TECHNOLOGY PACKAGE (38 C.F.R. § 21.212)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request authorization for a computer and technology package: {{programName}}.
1. REGULATORY COMPLIANCE: Chapter 31 supplies must be provided based on necessity. flat caps (e.g. $500) are contrary to C.F.R. rules.
2. EVIDENCE: Enclosed is the course syllabus stating computer/laptop is required for all students.`
  },
  {
    id: 'cust_assist_tech',
    number: 'Custom Template',
    name: 'Assistive Technology Request',
    category: '4',
    type: 'custom',
    authority: '38 C.F.R. § 21.220',
    whoUses: 'Veteran with physical or cognitive barriers.',
    whenToUse: 'Requesting specialized ergonomic chairs, screen readers, or dictation software.',
    whatToAttach: 'Occupational therapist review or physician statement.',
    status: 'internal-use',
    template: `REQUEST FOR ERGONOMIC / ASSISTIVE TECHNOLOGY (38 C.F.R. § 21.220)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request authorization for adaptive technology: {{workLimitations}}. These items accommodate my service-connected conditions ({{serviceConnectedConditions}}), allowing me to complete studies without aggravating my physical limitations.`
  },

  // CATEGORY 5: School Payment & Authorization
  {
    id: 'vaf_28_1905',
    number: 'VA Form 28-1905',
    name: 'Authorization and Certification of Entrance or Reentrance into Rehabilitation and Certification of Status',
    category: '5',
    type: 'official',
    revDate: 'Jul 2020',
    whoUses: 'VRC and School Certifying Official (SCO).',
    whenToUse: 'Authorizing tuition invoice billing. Ensure the SCO receives this to protect your account.',
    whenNotToUse: 'If classes are taken outside the approved IPE parameters.',
    whatToAttach: 'VA counselor signature.',
    relatedWorkflow: 'Tuition Unpaid / Billing Delay',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-28-1905/'
  },
  {
    id: 'cust_tuition_esc',
    number: 'Custom Template',
    name: 'Tuition/Books Emergency Escalation',
    category: '5',
    type: 'custom',
    authority: '38 C.F.R. § 21.262',
    whoUses: 'Veteran facing school registration drops.',
    whenToUse: 'When the VA fails to authorize tuition billing, resulting in school financial holds.',
    whatToAttach: 'Invoice showing outstanding balance, school threat to drop classes.',
    status: 'internal-use',
    template: `EMERGENCY TUITION AUTHORIZATION ESCALATION (38 C.F.R. § 21.262)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request immediate payment authorization for my school term starting: {{programName}}.
My registration is at risk of cancellation due to unpaid balance: {{workHistoryProblems}}. Under 38 C.F.R. § 21.262, VR&E is responsible for direct tuition billing. I request immediate relief to prevent drop penalties.`
  },
  {
    id: 'cust_school_memo',
    number: 'Custom Template',
    name: 'School Compliance Protection Memo',
    category: '5',
    type: 'custom',
    authority: '38 C.F.R. § 21.262',
    whoUses: 'School Billing / Financial Office.',
    whenToUse: 'Provide this statement to the registrar to block late fees or registration holds.',
    whatToAttach: 'Copy of active Form 28-1905 or purchase order.',
    status: 'internal-use',
    template: `SCHOOL LATE FEE PROTECTION NOTICE (38 C.F.R. § 21.262)
ATTENTION: REGISTRAR / BILLING OFFICE
VETERAN STUDENT: {{userName}}

This student is an active participant in the VA Chapter 31 VR&E program. Under 38 C.F.R. § 21.262, the VA agrees to pay tuition directly. The school is advised that dropping courses or charging late fees due to payment delays by the VA Regional Office is prohibited.`
  },

  // CATEGORY 6: Independent Living
  {
    id: 'vaf_28_0791',
    number: 'VA Form 28-0791',
    name: 'Pre- and Post-Independent Living Assessment',
    category: '6',
    type: 'official',
    revDate: 'Jul 2024',
    whoUses: 'VRC, Occupational Therapist, and Veteran.',
    whenToUse: 'Standard assessment form to document activities of daily living (ADL) limitations and housing barriers.',
    whatToAttach: 'Clinical logs, therapy reports.',
    relatedWorkflow: 'Independent Living Builder',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-28-0791/'
  },
  {
    id: 'cust_il_just',
    number: 'Custom Template',
    name: 'Independent Living Justification',
    category: '6',
    type: 'custom',
    authority: '38 U.S.C. § 3120',
    whoUses: 'Veteran with severe barriers to employment.',
    whenToUse: 'Requesting home modifications, stair lifts, ramps, or grab rails under an IILP.',
    whatToAttach: 'OT evaluation notes, home photos showing barrier risks.',
    status: 'internal-use',
    template: `INDEPENDENT LIVING JUSTIFICATION MEMORANDUM (38 U.S.C. § 3120)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request an Independent Living evaluation under 38 C.F.R. § 21.160. My service-connected conditions ({{serviceConnectedConditions}}) restrict my ADL independence: {{workLimitations}}. I request home inspections to install grab bars or ramps to reduce safety hazards and improve daily mobility.`
  },

  // CATEGORY 7: Case Status / Closure
  {
    id: 'cust_reentrance_disc',
    number: 'Custom Template',
    name: 'Reentrance After Discontinuance',
    category: '7',
    type: 'custom',
    authority: '38 C.F.R. § 21.284',
    whoUses: 'Veteran requesting case reopening.',
    whenToUse: 'When the VA has discontinued your case and you want to restart retraining.',
    whatToAttach: 'Medical statements proving current stability.',
    status: 'internal-use',
    template: `REQUEST FOR RE-ENTRY INTO VR&E SERVICES (38 C.F.R. § 21.284)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request to reopen my discontinued Chapter 31 case. Since closure, my circumstances have improved: {{workHistoryProblems}}. I am prepared to cooperate fully with a rehabilitation plan to overcome my barriers: {{workLimitations}}.`
  },
  {
    id: 'cust_good_cause',
    number: 'Custom Template',
    name: 'Good Cause Statement',
    category: '7',
    type: 'custom',
    authority: '38 C.F.R. § 21.362',
    whoUses: 'Veteran responding to a notice of proposed discontinuance.',
    whenToUse: 'When the VA accuses you of lack of cooperation or missed appointments.',
    whatToAttach: 'Doctor statements or emergency receipts.',
    status: 'internal-use',
    template: `STATEMENT OF GOOD CAUSE FOR PROGRAM DELAYS (38 C.F.R. § 21.362)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I submit this statement to show Good Cause for my recent plan delays: {{workHistoryProblems}}.
My absence/lack of contact was due to medical emergencies: {{workLimitations}}. I request that the VA refrain from closing my case and resume counseling.`
  },

  // CATEGORY 8: Retroactive Induction / Restoration
  {
    id: 'vaf_28_10286',
    number: 'VA Form 28-10286',
    name: 'Request for Retroactive Induction for a Period Previously Completed under Chapter 33',
    category: '8',
    type: 'official',
    revDate: 'Feb 2022',
    whoUses: 'Veteran seeking reimbursement for self-paid tuition and GI Bill recovery.',
    whenToUse: 'To request retroactive induction for a term completed prior to Chapter 31 entry.',
    whatToAttach: 'Transcripts, tuition ledgers, receipts, syllabi, Form 28-1905m.',
    relatedWorkflow: 'Retroactive Induction Request',
    status: 'current',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-28-10286-ARE.pdf'
  },
  {
    id: 'vaf_28_10281',
    number: 'VA Form 28-10281',
    name: 'Request for Restoration of Entitlement Due to Facility Closure, Program Disapproval, or Course Disapproval',
    category: '8',
    type: 'official',
    revDate: 'Mar 2021',
    whoUses: 'Veteran affected by school closure.',
    whenToUse: 'Requesting entitlement restoration when school closed or program was disapproved during enrollment.',
    whatToAttach: 'Enrollment records, school closure notification.',
    relatedWorkflow: 'School Closed / Program Disapproved',
    status: 'current',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-28-10281-ARE.pdf'
  },
  {
    id: 'cust_retro_ind',
    number: 'Custom Template',
    name: 'Retroactive Induction Request Letter',
    category: '8',
    type: 'custom',
    authority: '38 C.F.R. § 21.282',
    whoUses: 'Veteran completing retro induction request.',
    whenToUse: 'Attaching as a cover letter to VA Form 28-10286 to summarize timelines and arguments.',
    whatToAttach: 'Official Form 28-10286, transcripts.',
    status: 'internal-use',
    template: `FORMAL RETROACTIVE INDUCTION COVER LETTER (38 C.F.R. § 21.282)
VETERAN: {{userName}}
CLAIM NUMBER: {{claimNumber}}

I request a formal Retroactive Induction review under 38 C.F.R. § 21.282 for the period of {{programName}}.
During this period, I held an active service-connected rating. The courses completed directly support my current goal. I request refund of tuition and recovery of utilized Post-9/11 GI Bill months.`
  },

  // CATEGORY 9: Employment Services
  {
    id: 'vaf_28_10289',
    number: 'VA Form 28-10289',
    name: 'Monthly Progress Report: VR&E',
    category: '9',
    type: 'official',
    revDate: 'May 2022',
    whoUses: 'Veteran undergoing employment-track placement.',
    whenToUse: 'Required to report job search logs, workshops, and interview referrals to the VRC.',
    whatToAttach: 'Job applications checklist, employer contacts.',
    relatedWorkflow: 'Employment Services Track',
    status: 'current',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-28-10289-ARE.pdf'
  },

  // CATEGORY 10: Evidence & Medical Records
  {
    id: 'vaf_21_10210',
    number: 'VA Form 21-10210',
    name: 'Lay/Witness Statement',
    category: '10',
    type: 'official',
    revDate: 'Jun 2021',
    whoUses: 'Family, friends, classmates, or employers.',
    whenToUse: 'Submitting lay testimony about the veteran\'s physical or cognitive limitations.',
    whatToAttach: 'Witness signature.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-21-10210/'
  },
  {
    id: 'vaf_21_4138',
    number: 'VA Form 21-4138',
    name: 'Statement in Support of Claim',
    category: '10',
    type: 'official',
    revDate: 'Feb 2021',
    whoUses: 'Veteran submitting statements.',
    whenToUse: 'Formally submitting personal statements, facts, or rebuttal letters to VA.',
    whatToAttach: 'Signature, specific text.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-21-4138/'
  },
  {
    id: 'vaf_21_4142',
    number: 'VA Form 21-4142',
    name: 'Authorization to Disclose Personal Information to the Department of Veterans Affairs',
    category: '10',
    type: 'official',
    revDate: 'Dec 2021',
    whoUses: 'Veteran releasing medical logs.',
    whenToUse: 'Authorizing VA to retrieve private medical, psychological, or clinical records.',
    whatToAttach: 'VA Form 21-4142a with doctor details.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-21-4142/'
  },

  // CATEGORY 11: Appeals / Reviews
  {
    id: 'vaf_20_0995',
    number: 'VA Form 20-0995',
    name: 'Decision Review Request: Supplemental Claim',
    category: '11',
    type: 'official',
    revDate: 'Apr 2021',
    whoUses: 'Veteran submitting new evidence.',
    whenToUse: 'Filing a decision review when you have new and relevant evidence.',
    whatToAttach: 'Syllabus, clinical statement, or OT assessment.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-20-0995/'
  },
  {
    id: 'vaf_20_0996',
    number: 'VA Form 20-0996',
    name: 'Decision Review Request: Higher-Level Review (HLR)',
    category: '11',
    type: 'official',
    revDate: 'Jun 2021',
    whoUses: 'Veteran seeking senior staff review.',
    whenToUse: 'Filing an appeal when you believe the VRC made a clear error based on current records.',
    whatToAttach: 'No new evidence is permitted.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-20-0996/'
  },
  {
    id: 'vaf_10182',
    number: 'VA Form 10182',
    name: 'Decision Review Request: Board Appeal (Notice of Disagreement)',
    category: '11',
    type: 'official',
    revDate: 'Mar 2022',
    whoUses: 'Veteran appealing to a judge.',
    whenToUse: 'To appeal a VR&E decision directly to the Board of Veterans Appeals in D.C.',
    whatToAttach: 'Judge hearing requests.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-10182/'
  },
  {
    id: 'vaf_20_0998',
    number: 'VA Form 20-0998',
    name: 'Your Rights to Seek Further Review of our Decision',
    category: '11',
    type: 'official',
    revDate: 'Mar 2020',
    whoUses: 'Veteran evaluating review timelines.',
    whenToUse: 'VA decision attachment confirming timeline limits (HLR/Supplemental/Board).',
    whatToAttach: 'None.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-20-0998/'
  },

  // CATEGORY 12: Representation / Privacy
  {
    id: 'vaf_21_22',
    number: 'VA Form 21-22',
    name: 'Appointment of Veterans Service Organization as Claimant\'s Representative',
    category: '12',
    type: 'official',
    revDate: 'Aug 2021',
    whoUses: 'Veteran appointing VSO (DAV, VFW, American Legion).',
    whenToUse: 'Authorizing a VSO representative to access your file and advocate.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-21-22/'
  },
  {
    id: 'vaf_21_22a',
    number: 'VA Form 21-22a',
    name: 'Appointment of Individual as Claimant\'s Representative',
    category: '12',
    type: 'official',
    revDate: 'Aug 2021',
    whoUses: 'Veteran appointing private attorney or agent.',
    whenToUse: 'Appointing a private helper, lawyer, or advocate.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-21-22a/'
  },
  {
    id: 'vaf_21_0845',
    number: 'VA Form 21-0845',
    name: 'Authorization to Disclose Personal Information to a Third Party',
    category: '12',
    type: 'official',
    revDate: 'Oct 2021',
    whoUses: 'Veteran authorizing spouse/parent/helper info access.',
    whenToUse: 'Allowing a third party to ask details about your case without appointing them as VSO.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-21-0845/'
  },

  // CATEGORY 13: Emergency / Priority Processing
  {
    id: 'vaf_20_10207',
    number: 'VA Form 20-10207',
    name: 'Priority Processing Request',
    category: '13',
    type: 'official',
    revDate: 'Feb 2021',
    whoUses: 'Veteran with severe hardships.',
    whenToUse: 'Requesting fast-tracked claim reviews due to terminal illness, eviction, or advanced age.',
    whatToAttach: 'Hardship letters, past due mortgage statements.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-20-10207/'
  },

  // CATEGORY 14: Related Benefits
  {
    id: 'vaf_25_8832',
    number: 'VA Form 25-8832',
    name: 'Personalized Career Planning and Guidance Application (Chapter 36)',
    category: '14',
    type: 'official',
    revDate: 'Apr 2021',
    whoUses: 'Transitioning service members or veterans.',
    whenToUse: 'Applying for Chapter 36 career planning guidance (Note: Not Chapter 31).',
    status: 'current',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-25-8832-ARE.pdf'
  },
  {
    id: 'vaf_28_0588',
    number: 'VA Form 28-0588',
    name: 'VA Vocational Rehabilitation: Getting Ahead After You Get Out',
    category: '14',
    type: 'official',
    revDate: 'Mar 2021',
    whoUses: 'Pre-discharge transitioning service members.',
    whenToUse: 'Planning transition before official separation.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-28-0588/'
  },
  {
    id: 'vaf_28_0800',
    number: 'VA Form 28-0800',
    name: 'Longitudinal Study of VR&E Program Questionnaire',
    category: '14',
    type: 'official',
    revDate: 'Jun 2019',
    whoUses: 'Longitudinal study participants.',
    whenToUse: 'Required surveys for study metrics.',
    status: 'current',
    url: 'https://www.va.gov/find-forms/about-form-28-0800/'
  }
];

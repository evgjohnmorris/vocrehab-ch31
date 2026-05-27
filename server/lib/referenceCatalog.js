import { CAREERS_DATABASE } from '../../client/src/data/school_data.js';
import { INDUSTRIES_LOOKUP } from '../../client/src/data/industry_data.js';
import { FORMS_CATEGORIES, FORMS_DIRECTORY } from '../../client/src/data/forms-data.js';
import { VRE_OFFICES } from '../../client/src/data/data.js';

export const CODE_LIBRARY_CHAIN = [
  'CIP',
  'SOC',
  'O*NET',
  'BLS Wage & Projection',
  'VR&E IPE Justification'
];

export const VRNE_TRACK_LIBRARY = [
  {
    id: 'reemployment',
    title: 'Reemployment',
    summary: 'Return the veteran to the same or similar employer role when the occupation remains suitable with accommodations or transition support.',
    evidenceFocus: 'Employer compatibility, duty changes, accommodations, and return-to-work barriers.'
  },
  {
    id: 'rapid_employment',
    title: 'Rapid Access to Employment',
    summary: 'Move quickly toward direct placement when the veteran can transition into suitable work without long academic training.',
    evidenceFocus: 'Resume readiness, certifications, transferable military skills, and placement support.'
  },
  {
    id: 'self_employment',
    title: 'Self-Employment',
    summary: 'Support a veteran-owned business path when self-employment is the most suitable way to reach stable work.',
    evidenceFocus: 'Business feasibility, local market fit, startup supports, and disability-related work barriers.'
  },
  {
    id: 'long_term',
    title: 'Employment Through Long-Term Services',
    summary: 'Use college, graduate school, technical training, or extended preparation when the employment goal requires it.',
    evidenceFocus: 'CIP-to-SOC alignment, labor-market proof, required credentials, and long-term suitability.'
  },
  {
    id: 'independent_living',
    title: 'Independent Living',
    summary: 'Deliver services that improve independence in daily living when a vocational goal is not currently feasible.',
    evidenceFocus: 'ADL/IADL limits, safety barriers, assistive technology, transportation, and caregiver dependence.'
  }
];

const FORM_CATEGORY_MAP = new Map(FORMS_CATEGORIES.map((category) => [category.id, category.name]));

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function buildFieldDefinition(category, key, label, whatItDoes, whyItMatters, implementationStatus = 'planned') {
  return {
    fieldKey: key,
    category,
    label,
    whatItDoes,
    whyItMatters,
    implementationStatus
  };
}

export const REFERENCE_FIELD_LIBRARY = [
  buildFieldDefinition('occupation_codes', 'soc_code', 'SOC code', 'Federal occupation code used as the anchor occupation.', 'Lets the IPE goal point to an official occupation instead of a vague job title.', 'implemented'),
  buildFieldDefinition('occupation_codes', 'onet_soc_code', 'O*NET-SOC code', 'Detailed O*NET occupation profile code.', 'Adds tasks, skills, work context, and worker-requirement evidence for suitability and feasibility.', 'implemented'),
  buildFieldDefinition('occupation_codes', 'onet_job_zone', 'O*NET Job Zone', 'Training intensity and education-preparation signal.', 'Supports long-term training or shorter-path arguments without hand-waving.', 'planned'),
  buildFieldDefinition('occupation_codes', 'onet_interests_riasec', 'O*NET Interests / RIASEC', 'Interest-code alignment for the goal.', 'Helpful for aptitude and counseling discussions when choosing or changing goals.', 'planned'),
  buildFieldDefinition('occupation_codes', 'onet_work_context', 'O*NET Work Context', 'Job conditions and environment.', 'Compares real work setting demands against pain, PTSD, sensory, mobility, or social limits.', 'planned'),
  buildFieldDefinition('occupation_codes', 'onet_physical_demands', 'O*NET Abilities / Physical Demands', 'Functional and physical job demands.', 'Useful when rebutting unsuitable or infeasible findings.', 'planned'),
  buildFieldDefinition('occupation_codes', 'onet_alternate_titles', 'O*NET Alternate Titles', 'Alternate market-facing job titles.', 'Bridges VA wording to real job postings and labor-market evidence.', 'planned'),
  buildFieldDefinition('occupation_codes', 'dot_code', 'DOT code', 'Legacy Dictionary of Occupational Titles identifier.', 'Still useful when vocational experts or older records cite DOT and SVP language.', 'implemented'),
  buildFieldDefinition('occupation_codes', 'svp_level', 'SVP level', 'Specific vocational preparation intensity.', 'Shows how much training the occupation normally requires.', 'implemented'),
  buildFieldDefinition('occupation_codes', 'military_occ_crosswalk', 'Military occupation crosswalk', 'MOS/AFSC/NEC/rating to civilian role linkage.', 'Translates military experience into realistic civilian occupational goals.', 'planned'),

  buildFieldDefinition('education_codes', 'cip_code', 'CIP code', 'Federal instructional program identifier.', 'Anchors the requested degree or certificate program to a real education field.', 'implemented'),
  buildFieldDefinition('education_codes', 'cip_soc_crosswalk', 'CIP-SOC crosswalk', 'Program-to-occupation mapping.', 'Proves the requested school program is connected to the target occupation.', 'implemented'),
  buildFieldDefinition('education_codes', 'ipeds_unit_id', 'IPEDS UnitID', 'Federal institution identifier.', 'Helps validate the school inside federal education datasets.', 'planned'),
  buildFieldDefinition('education_codes', 'opeid', 'OPEID', 'Federal student-aid school ID.', 'Supports school identity checks and federal-aid participation.', 'planned'),
  buildFieldDefinition('education_codes', 'program_length', 'Program length', 'Credits, clock hours, or months.', 'Needed for IPE duration, subsistence planning, and feasibility timing.', 'planned'),
  buildFieldDefinition('education_codes', 'credential_level', 'Credential level', 'Certificate, associate, bachelor, master, doctorate, or similar.', 'Shows whether the requested level is necessary or excessive.', 'implemented'),
  buildFieldDefinition('education_codes', 'accreditation_status', 'Accreditation status', 'Institutional or program accreditation field.', 'Supports legitimacy checks for schools and programs.', 'planned'),
  buildFieldDefinition('education_codes', 'licensure_requirement', 'Licensure requirement', 'State board or occupational license dependency.', 'Explains why extra classes, exams, or fees may be mandatory.', 'planned'),
  buildFieldDefinition('education_codes', 'certification_code', 'Certification code / name', 'Industry certification field.', 'Useful for IT, healthcare, project management, trades, and licensing cases.', 'planned'),
  buildFieldDefinition('education_codes', 'apprenticeship_program_id', 'Apprenticeship program ID', 'Registered apprenticeship identifier.', 'Supports OJT and apprenticeship planning.', 'planned'),

  buildFieldDefinition('industry_codes', 'naics_code', 'NAICS code', 'Industry classification code.', 'Separates employer industry from occupation title and helps labor-market targeting.', 'implemented'),
  buildFieldDefinition('industry_codes', 'naics_sector', 'NAICS sector / subsector', 'Broad industry grouping.', 'Helps compare employer sectors for growth or self-employment planning.', 'implemented'),
  buildFieldDefinition('industry_codes', 'sic_code', 'SIC code', 'Legacy industry code.', 'Still useful when older business records or employer systems use SIC.', 'implemented'),
  buildFieldDefinition('industry_codes', 'sba_size_standard', 'SBA size standard', 'Small-business size threshold by NAICS.', 'Useful for self-employment or vendor planning.', 'planned'),
  buildFieldDefinition('industry_codes', 'uei', 'UEI / SAM.gov identifier', 'Entity registration field.', 'Useful for vendors, contractors, and self-employment planning.', 'planned'),
  buildFieldDefinition('industry_codes', 'cage_code', 'CAGE code', 'Federal contractor identifier.', 'Supports contractor-focused employment and business strategy.', 'planned'),
  buildFieldDefinition('industry_codes', 'psc_code', 'PSC code', 'Federal product-service code.', 'Useful for government-contract targeting in self-employment cases.', 'planned'),

  buildFieldDefinition('labor_market', 'bls_oews', 'BLS OEWS wage data', 'Occupation wages by geography.', 'Provides local wage proof for suitable employment arguments.', 'planned'),
  buildFieldDefinition('labor_market', 'employment_projection', 'BLS employment projection', 'National outlook and projected growth.', 'Shows whether the occupation is expanding or shrinking.', 'implemented'),
  buildFieldDefinition('labor_market', 'ooh_profile', 'Occupational Outlook Handbook profile', 'Plain-English pay, education, outlook, and environment summary.', 'Useful for explaining the goal to veterans and reviewers.', 'implemented'),
  buildFieldDefinition('labor_market', 'qcew', 'QCEW industry wages', 'Industry employment and wages by geography.', 'Strengthens local labor-market analysis beyond national outlook only.', 'planned'),
  buildFieldDefinition('labor_market', 'laus', 'LAUS unemployment data', 'Local unemployment measure.', 'Adds reality-check context for regional employment conditions.', 'planned'),
  buildFieldDefinition('labor_market', 'cbsa_code', 'CBSA / MSA code', 'Metro-area identifier.', 'Makes labor-market comparisons more realistic than state-only data.', 'planned'),
  buildFieldDefinition('labor_market', 'fips_code', 'FIPS state/county code', 'Geographic identifier for labor datasets.', 'Supports local data joins across labor and education sources.', 'planned'),
  buildFieldDefinition('labor_market', 'commuting_zone', 'Commuting zone / workforce region', 'Realistic work-area geography.', 'Improves local suitability analysis beyond a single county line.', 'planned'),
  buildFieldDefinition('labor_market', 'remote_work_flag', 'Remote-work flag', 'Indicates whether the occupation commonly supports remote work.', 'Helpful for mobility, pain, PTSD, transportation, or caregiver constraints.', 'planned'),
  buildFieldDefinition('labor_market', 'wage_percentiles', 'Wage percentile fields', '10th through 90th percentile wage slots.', 'Supports realistic wage expectations instead of just a median figure.', 'planned'),

  buildFieldDefinition('va_case_fields', 'vrne_track', 'VR&E track', 'Official support-and-services track classification.', 'Controls what type of plan, services, and disputes apply to the case.', 'implemented'),
  buildFieldDefinition('va_case_fields', 'case_status', 'Case status', 'Current lifecycle status.', 'Defines deadlines, escalation paths, and plan logic.', 'implemented'),
  buildFieldDefinition('va_case_fields', 'eh_seh_finding', 'EH / SEH finding', 'Employment handicap or serious employment handicap field.', 'Critical for eligibility windows and extension arguments.', 'planned'),
  buildFieldDefinition('va_case_fields', 'feasibility_status', 'Feasibility status', 'Feasible, extended evaluation, currently infeasible, or disputed.', 'Guides rebuttal strategy and evidence collection.', 'planned'),
  buildFieldDefinition('va_case_fields', 'ipe_goal_code', 'IPE goal code', 'Internal goal record tied to the occupation and training.', 'Connects case management to occupation evidence.', 'implemented'),
  buildFieldDefinition('va_case_fields', 'ipe_amendment_history', 'IPE amendment history', 'Goal and service change record.', 'Lets the backend track plan evolution and denial patterns.', 'planned'),
  buildFieldDefinition('va_case_fields', 'entitlement_month_counter', 'Entitlement month counter', 'Months used so far.', 'Supports 48-month analysis and extension logic.', 'planned'),
  buildFieldDefinition('va_case_fields', 'remaining_entitlement_estimate', 'Remaining entitlement estimate', 'Estimated months left.', 'Keeps month planning explicit and labeled as estimated when unverified.', 'planned'),
  buildFieldDefinition('va_case_fields', 'subsistence_election', 'Subsistence election', 'Chapter 31 or Post-9/11 subsistence choice.', 'Needed for payment strategy and comparative estimates.', 'planned'),
  buildFieldDefinition('va_case_fields', 'dependents_count', 'Dependents count', 'Dependency count field.', 'Drives Chapter 31 subsistence calculations.', 'planned'),
  buildFieldDefinition('va_case_fields', 'training_time', 'Training time', 'Full-time, three-quarter, half-time, OJT, online-only, and similar.', 'Affects payment, IPE planning, and school coordination.', 'planned'),
  buildFieldDefinition('va_case_fields', 'regional_office', 'Regional office / VREO region', 'Regional office routing field.', 'Critical for contacts and escalations.', 'implemented'),
  buildFieldDefinition('va_case_fields', 'counselor_response_log', 'Counselor response log', 'Structured contact timeline.', 'Supports delay severity and escalation readiness.', 'implemented'),
  buildFieldDefinition('va_case_fields', 'decision_notice_date', 'Decision notice date', 'Date of formal notice.', 'Starts appeal-deadline logic.', 'implemented'),
  buildFieldDefinition('va_case_fields', 'review_lane', 'Review lane', 'Correction, HLR, Supplemental, Board, FOIA, congressional, OIG, and similar.', 'Lets the backend manage next-action state instead of vague notes.', 'planned'),

  buildFieldDefinition('school_approval', 'va_approved_status', 'VA-approved school/program status', 'Indicates whether the school or program is approved.', 'Essential for protecting tuition use and school selection.', 'planned'),
  buildFieldDefinition('school_approval', 'weams_facility_code', 'WEAMS facility code', 'WEAMS approval reference.', 'Helps identify approved institutions and programs.', 'planned'),
  buildFieldDefinition('school_approval', 'saa_jurisdiction', 'State Approving Agency jurisdiction', 'Approval oversight field.', 'Clarifies who approved the program.', 'planned'),
  buildFieldDefinition('school_approval', 'sco_contact', 'School Certifying Official contact', 'SCO or compliance contact.', 'Important for enrollment and payment troubleshooting.', 'planned'),
  buildFieldDefinition('school_approval', 'program_approval_type', 'Program approval type', 'IHL, NCD, apprenticeship, OJT, flight, correspondence, and similar.', 'Separates tuition and approval logic by program type.', 'planned'),
  buildFieldDefinition('school_approval', 'term_dates', 'Term dates', 'Start and end dates for the school term.', 'Supports authorizations, drops, and subsistence timing.', 'planned'),
  buildFieldDefinition('school_approval', 'enrollment_cert_dates', 'Enrollment certification dates', 'School certification timeline fields.', 'Helps locate whether the delay is on the school or VA side.', 'planned'),
  buildFieldDefinition('school_approval', 'tuition_invoice_status', 'Tuition invoice status', 'Submitted, pending, rejected, paid, or unpaid.', 'Makes payment problems trackable.', 'planned'),
  buildFieldDefinition('school_approval', 'book_supply_auth_status', 'Book/supply authorization status', 'Requested, approved, denied, vendor pending, or purchased.', 'Supports crisis escalation when classes are starting.', 'planned'),
  buildFieldDefinition('school_approval', 'required_materials_list', 'Required materials list', 'Syllabus, bookstore, or department requirement record.', 'Proves laptops, books, software, or tools are actually required.', 'planned'),
  buildFieldDefinition('school_approval', 'academic_hold_flag', 'Academic hold flag', 'Emergency hold indicator.', 'Signals a tuition or authorization crisis.', 'planned'),
  buildFieldDefinition('school_approval', 'drop_add_deadline', 'Drop/add deadline', 'Critical term deadline field.', 'Protects the veteran from preventable debt and schedule damage.', 'planned'),

  buildFieldDefinition('legal_authority', 'usc_ch31_section', '38 U.S.C. Chapter 31 section', 'Statutory authority citation.', 'Separates binding law from policy commentary.', 'implemented'),
  buildFieldDefinition('legal_authority', 'cfr_part21_section', '38 C.F.R. Part 21 section', 'Regulatory authority citation.', 'Needed for binding review-lane and service rules.', 'implemented'),
  buildFieldDefinition('legal_authority', 'm28c_section', 'M28C / KnowVA section', 'Manual policy citation.', 'Useful when the issue turns on internal VA procedure.', 'implemented'),
  buildFieldDefinition('legal_authority', 'federal_register_document', 'Federal Register document number', 'Regulatory history field.', 'Supports version tracking and amendment history.', 'planned'),
  buildFieldDefinition('legal_authority', 'public_law_number', 'Public Law number', 'Statutory amendment source.', 'Tracks how law changed over time.', 'planned'),
  buildFieldDefinition('legal_authority', 'va_ogc_precop', 'VA OGC precedent opinion number', 'Binding VA legal interpretation field.', 'Strengthens legal analysis when a precedent opinion applies.', 'planned'),
  buildFieldDefinition('legal_authority', 'court_citation', 'CAVC / Federal Circuit citation', 'Judicial precedent field.', 'Supports litigation-grade authority tagging.', 'planned'),
  buildFieldDefinition('legal_authority', 'bva_citation', 'BVA citation number', 'Persuasive-only Board decision field.', 'Useful as persuasive context without confusing it for binding law.', 'planned'),
  buildFieldDefinition('legal_authority', 'va_form_revision', 'VA form number and revision date', 'Form version control field.', 'Needed when a stale form can derail a filing.', 'implemented'),
  buildFieldDefinition('legal_authority', 'authority_confidence_level', 'Authority confidence level', 'Binding, policy, persuasive, or advocacy tag.', 'Makes generated letters honest about what kind of authority they rely on.', 'implemented'),

  buildFieldDefinition('functional_limits', 'functional_limitation_category', 'Functional limitation category', 'Sitting, standing, lifting, memory, concentration, pain, stamina, and similar categories.', 'Lets the backend reason about suitability without storing raw medical files.', 'planned'),
  buildFieldDefinition('functional_limits', 'work_restriction', 'Work restriction', 'Low-stress, remote, flexible schedule, limited public contact, and similar restrictions.', 'Translates disability impact into real work constraints.', 'planned'),
  buildFieldDefinition('functional_limits', 'accommodation_type', 'Accommodation type', 'Assistive technology, ergonomic gear, flexible schedule, remote work, and similar accommodations.', 'Supports feasibility rebuttals and supply justifications.', 'planned'),
  buildFieldDefinition('functional_limits', 'essential_function_match', 'Essential function match', 'Compares job functions to functional limits.', 'Improves occupation-fit reasoning.', 'planned'),
  buildFieldDefinition('functional_limits', 'aggravation_risk', 'Aggravation risk', 'Whether the occupation is likely to worsen the disability picture.', 'Supports unsuitable-goal rebuttals.', 'planned'),
  buildFieldDefinition('functional_limits', 'il_adl_iadl_limits', 'Independent Living ADL/IADL limits', 'Daily living and home-function limitation fields.', 'Keeps Independent Living logic separate from employment-track logic.', 'planned'),
  buildFieldDefinition('functional_limits', 'assistive_technology_category', 'Assistive technology category', 'Laptop, adaptive device, mobility aid, ergonomic chair, hearing or vision aid, and similar categories.', 'Supports both employment and Independent Living requests.', 'planned'),

  buildFieldDefinition('appeal_logic', 'decision_date', 'Decision date', 'Date on the decision or denial.', 'Needed for appeal calculations and timeline reconstruction.', 'planned'),
  buildFieldDefinition('appeal_logic', 'notice_date', 'Notice date', 'Date the decision notice was issued or mailed.', 'Often the most important appeal trigger date.', 'planned'),
  buildFieldDefinition('appeal_logic', 'issue_decided', 'Issue decided', 'Structured issue title for the adverse action.', 'Prevents vague appeals and mixed issues.', 'planned'),
  buildFieldDefinition('appeal_logic', 'adverse_action_type', 'Benefit denied / reduced / closed', 'Classifies the adverse action.', 'Helps drive the correct response logic.', 'planned'),
  buildFieldDefinition('appeal_logic', 'evidence_considered', 'Evidence considered', 'What VA says it reviewed.', 'Supports missing-evidence analysis.', 'planned'),
  buildFieldDefinition('appeal_logic', 'evidence_missing', 'Evidence missing', 'Evidence the veteran says was ignored or never developed.', 'Strengthens Supplemental Claim and duty-to-assist arguments.', 'planned'),
  buildFieldDefinition('appeal_logic', 'denial_reason', 'Reason for denial', 'Feasibility, entitlement, unsuitable goal, lack of cooperation, supplies not required, and similar reasons.', 'Makes rebuttal logic precise.', 'planned'),
  buildFieldDefinition('appeal_logic', 'review_deadline', 'Review deadline', 'Next filing deadline field.', 'Protects review rights.', 'planned'),
  buildFieldDefinition('appeal_logic', 'chosen_lane', 'Chosen lane', 'HLR, Supplemental, Board, supervisor, or similar.', 'Moves the case into an explicit strategy lane.', 'planned'),
  buildFieldDefinition('appeal_logic', 'new_relevant_evidence_flag', 'New and relevant evidence flag', 'Supplemental-claim evidence flag.', 'Guides whether a Supplemental Claim is viable.', 'planned'),
  buildFieldDefinition('appeal_logic', 'board_docket_choice', 'Board docket choice', 'Hearing, evidence, or direct docket choice.', 'Needed for Board strategy.', 'planned'),

  buildFieldDefinition('power_fields', 'goal_disability_compatibility_score', 'Goal-to-disability compatibility score', 'Scored match between job demands and limitations.', 'Turns suitability analysis into something more concrete.', 'planned'),
  buildFieldDefinition('power_fields', 'training_necessity_score', 'Training necessity score', 'Structured measure of why the requested training is necessary.', 'Helps distinguish required education from optional preference.', 'planned'),
  buildFieldDefinition('power_fields', 'va_pushback_prediction', 'VA pushback prediction', 'Likely objections the counselor may raise.', 'Lets the app proactively prepare rebuttals.', 'planned'),
  buildFieldDefinition('power_fields', 'rebuttal_map', 'Rebuttal map', 'Maps objections to evidence and authority.', 'Turns documents into argument strategy.', 'planned'),
  buildFieldDefinition('power_fields', 'evidence_sufficiency_score', 'Evidence sufficiency score', 'Measures whether the packet is ready.', 'Prevents weak escalations and appeals.', 'implemented'),
  buildFieldDefinition('power_fields', 'ipe_change_justification_type', 'IPE change justification type', 'Medical, labor-market, academic, unsuitable-goal, or better-match rationale.', 'Improves amendment arguments.', 'planned'),
  buildFieldDefinition('power_fields', 'supply_justification_type', 'Supply justification type', 'Syllabus-driven, program-required, accommodation-driven, or licensing-driven supply rationale.', 'Sharpens supply requests.', 'planned'),
  buildFieldDefinition('power_fields', 'delay_severity_score', 'Delay severity score', 'Measures how urgent the delay has become.', 'Helps prioritize crisis cases.', 'planned'),
  buildFieldDefinition('power_fields', 'escalation_readiness', 'Escalation readiness', 'Measures readiness for supervisor, HLR, Board, congressional, or OIG escalation.', 'Avoids premature filings.', 'planned'),
  buildFieldDefinition('power_fields', 'authority_level_tag', 'Authority level tag', 'Binding law, VA policy, persuasive, or advocacy tag.', 'Prevents authority inflation in generated documents.', 'implemented'),
  buildFieldDefinition('power_fields', 'source_freshness_tag', 'Source freshness tag', 'Current, needs verification, stale, or superseded tag.', 'Signals when data must be refreshed before relying on it.', 'implemented')
];

export const RELATIONSHIP_LIBRARY = [
  {
    relationshipKey: 'cip_soc_onet_bls_ipe',
    title: 'CIP to SOC to O*NET to BLS to IPE justification',
    chain: CODE_LIBRARY_CHAIN,
    rationale: 'Use the school program, occupation code, occupational profile, and labor-market evidence together to show that the requested training is necessary for suitable employment.'
  },
  {
    relationshipKey: 'soc_naics_distinction',
    title: 'SOC occupation versus NAICS industry',
    chain: ['SOC occupation', 'NAICS employer industry'],
    rationale: 'Keeps the veteran job goal separate from the employer sector, which reduces bad crosswalk logic.'
  },
  {
    relationshipKey: 'school_payment_emergency',
    title: 'School approval to authorization to payment timing',
    chain: ['VA-approved program', 'term dates', 'authorization status', 'invoice status', 'academic hold'],
    rationale: 'Supports school-payment crisis escalation before a drop, hold, or unpaid balance causes harm.'
  }
];

export const TRAINING_PROGRAM_LIBRARY = [
  {
    id: 'cip_11_0701',
    cipCode: '11.0701',
    title: 'Computer Science',
    credentialLevel: 'bachelor_or_higher',
    programLengthHint: '4-year degree or accelerated equivalent',
    licensureRequirement: '',
    certificationFocus: 'Software engineering, systems development, data, and computing foundations',
    sourceFreshnessTag: 'needs_verification',
    evidenceStatus: 'curated_example'
  },
  {
    id: 'cip_11_1003',
    cipCode: '11.1003',
    title: 'Computer and Information Systems Security',
    credentialLevel: 'bachelor_or_higher',
    programLengthHint: '4-year degree or concentrated security program',
    licensureRequirement: '',
    certificationFocus: 'Cybersecurity, information assurance, and security operations',
    sourceFreshnessTag: 'needs_verification',
    evidenceStatus: 'curated_example'
  }
];

export const CIP_SOC_CROSSWALK_LIBRARY = [
  {
    id: 'crosswalk_11_1003_15_1212',
    cipCode: '11.1003',
    socCode: '15-1212.00',
    occupationTitle: 'Information Security Analyst',
    relationType: 'starter_mapping',
    evidenceStatus: 'curated_example',
    sourceFreshnessTag: 'needs_verification',
    notes: 'Starter CIP-to-SOC linkage for cybersecurity planning.'
  },
  {
    id: 'crosswalk_11_0701_15_1252',
    cipCode: '11.0701',
    socCode: '15-1252.00',
    occupationTitle: 'Software Developer',
    relationType: 'starter_mapping',
    evidenceStatus: 'curated_example',
    sourceFreshnessTag: 'needs_verification',
    notes: 'Starter CIP-to-SOC linkage for computer science planning.'
  }
];

export const OCCUPATION_PROFILE_LIBRARY = CAREERS_DATABASE.map((career) => ({
  id: `occupation_${slugify(career.title)}`,
  title: career.title,
  socCode: career.soc,
  onetSocCode: career.soc,
  oohGroup: career.oohGroup,
  educationLevel: career.education,
  dotCode: career.dot,
  svpLevel: career.svp,
  physicalDemand: career.physicalDemand,
  sicCode: career.sic,
  naicsCode: career.naics,
  medianPay: career.medianPay,
  outlookText: career.outlook,
  dutiesText: career.duties,
  compatibilityTags: [
    career.requiresSitting ? 'requires_sitting' : null,
    career.requiresRepetitiveMotion ? 'repetitive_motion' : null,
    career.requiresVisionHearing ? 'vision_hearing_critical' : null,
    career.requiresHighStressConfinement ? 'stress_or_confinement' : null,
    career.requiresRespiratorFumes ? 'fumes_or_respirator' : null
  ].filter(Boolean),
  sourceFreshnessTag: 'repo_curated',
  authorityLevelTag: 'occupational_evidence'
}));

export const INDUSTRY_PROFILE_LIBRARY = INDUSTRIES_LOOKUP.map((industry) => ({
  id: `industry_${slugify(`${industry.naics}_${industry.title}`)}`,
  title: industry.title,
  sicCode: industry.sic,
  naicsCode: industry.naics,
  summary: industry.desc,
  keyword: industry.keyword,
  sourceFreshnessTag: 'repo_curated'
}));

export const FORM_LIBRARY = FORMS_DIRECTORY.map((form) => ({
  id: form.id,
  formNumber: form.number || '',
  title: form.name,
  categoryId: form.category,
  categoryLabel: FORM_CATEGORY_MAP.get(form.category) || '',
  whoUses: form.whoUses || '',
  whenToUse: form.whenToUse || '',
  revisionDate: form.revDate || '',
  sourceUrl: form.url || '',
  relatedWorkflow: form.relatedWorkflow || '',
  formStatus: form.status || '',
  sourceFreshnessTag: form.type === 'official' ? 'repo_curated' : 'internal_use'
}));

export const REGIONAL_OFFICE_LIBRARY = VRE_OFFICES.map((office) => ({
  id: `office_${slugify(office.office)}`,
  officeName: office.office,
  officerName: office.officer || '',
  address: office.address || '',
  phone: office.phone || '',
  email: office.email || '',
  jurisdictionNotes: '',
  outstations: office.outStations || [],
  sourceFreshnessTag: 'repo_curated'
}));

function seedRows(db, sql, rows, mapper) {
  const statement = db.prepare(sql);
  rows.forEach((row) => {
    statement.run(mapper(row));
  });
  statement.finalize();
}

export function seedReferenceCatalog(db) {
  seedRows(db, `
    INSERT INTO reference_field_library (
      field_key,
      category,
      label,
      what_it_does,
      why_it_matters,
      implementation_status,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(field_key) DO UPDATE SET
      category = excluded.category,
      label = excluded.label,
      what_it_does = excluded.what_it_does,
      why_it_matters = excluded.why_it_matters,
      implementation_status = excluded.implementation_status,
      updated_at = CURRENT_TIMESTAMP
  `, REFERENCE_FIELD_LIBRARY, (field) => [
    field.fieldKey,
    field.category,
    field.label,
    field.whatItDoes,
    field.whyItMatters,
    field.implementationStatus
  ]);

  seedRows(db, `
    INSERT INTO reference_relationships (
      relationship_key,
      title,
      chain_json,
      rationale,
      updated_at
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(relationship_key) DO UPDATE SET
      title = excluded.title,
      chain_json = excluded.chain_json,
      rationale = excluded.rationale,
      updated_at = CURRENT_TIMESTAMP
  `, RELATIONSHIP_LIBRARY, (relationship) => [
    relationship.relationshipKey,
    relationship.title,
    JSON.stringify(relationship.chain),
    relationship.rationale
  ]);

  seedRows(db, `
    INSERT INTO vrne_tracks (
      id,
      title,
      summary,
      evidence_focus,
      updated_at
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      evidence_focus = excluded.evidence_focus,
      updated_at = CURRENT_TIMESTAMP
  `, VRNE_TRACK_LIBRARY, (track) => [
    track.id,
    track.title,
    track.summary,
    track.evidenceFocus
  ]);

  seedRows(db, `
    INSERT INTO occupation_profiles (
      id,
      title,
      soc_code,
      onet_soc_code,
      ooh_group,
      education_level,
      dot_code,
      svp_level,
      physical_demand,
      sic_code,
      naics_code,
      median_pay,
      outlook_text,
      duties_text,
      compatibility_tags_json,
      source_freshness_tag,
      authority_level_tag,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      soc_code = excluded.soc_code,
      onet_soc_code = excluded.onet_soc_code,
      ooh_group = excluded.ooh_group,
      education_level = excluded.education_level,
      dot_code = excluded.dot_code,
      svp_level = excluded.svp_level,
      physical_demand = excluded.physical_demand,
      sic_code = excluded.sic_code,
      naics_code = excluded.naics_code,
      median_pay = excluded.median_pay,
      outlook_text = excluded.outlook_text,
      duties_text = excluded.duties_text,
      compatibility_tags_json = excluded.compatibility_tags_json,
      source_freshness_tag = excluded.source_freshness_tag,
      authority_level_tag = excluded.authority_level_tag,
      updated_at = CURRENT_TIMESTAMP
  `, OCCUPATION_PROFILE_LIBRARY, (occupation) => [
    occupation.id,
    occupation.title,
    occupation.socCode,
    occupation.onetSocCode,
    occupation.oohGroup,
    occupation.educationLevel,
    occupation.dotCode,
    occupation.svpLevel,
    occupation.physicalDemand,
    occupation.sicCode,
    occupation.naicsCode,
    occupation.medianPay,
    occupation.outlookText,
    occupation.dutiesText,
    JSON.stringify(occupation.compatibilityTags),
    occupation.sourceFreshnessTag,
    occupation.authorityLevelTag
  ]);

  seedRows(db, `
    INSERT INTO industry_profiles (
      id,
      title,
      sic_code,
      naics_code,
      summary,
      keyword,
      source_freshness_tag,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      sic_code = excluded.sic_code,
      naics_code = excluded.naics_code,
      summary = excluded.summary,
      keyword = excluded.keyword,
      source_freshness_tag = excluded.source_freshness_tag,
      updated_at = CURRENT_TIMESTAMP
  `, INDUSTRY_PROFILE_LIBRARY, (industry) => [
    industry.id,
    industry.title,
    industry.sicCode,
    industry.naicsCode,
    industry.summary,
    industry.keyword,
    industry.sourceFreshnessTag
  ]);

  seedRows(db, `
    INSERT INTO training_program_profiles (
      id,
      cip_code,
      title,
      credential_level,
      program_length_hint,
      licensure_requirement,
      certification_focus,
      source_freshness_tag,
      evidence_status,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      cip_code = excluded.cip_code,
      title = excluded.title,
      credential_level = excluded.credential_level,
      program_length_hint = excluded.program_length_hint,
      licensure_requirement = excluded.licensure_requirement,
      certification_focus = excluded.certification_focus,
      source_freshness_tag = excluded.source_freshness_tag,
      evidence_status = excluded.evidence_status,
      updated_at = CURRENT_TIMESTAMP
  `, TRAINING_PROGRAM_LIBRARY, (program) => [
    program.id,
    program.cipCode,
    program.title,
    program.credentialLevel,
    program.programLengthHint,
    program.licensureRequirement,
    program.certificationFocus,
    program.sourceFreshnessTag,
    program.evidenceStatus
  ]);

  seedRows(db, `
    INSERT INTO cip_soc_crosswalks (
      id,
      cip_code,
      soc_code,
      occupation_title,
      relation_type,
      evidence_status,
      source_freshness_tag,
      notes,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      cip_code = excluded.cip_code,
      soc_code = excluded.soc_code,
      occupation_title = excluded.occupation_title,
      relation_type = excluded.relation_type,
      evidence_status = excluded.evidence_status,
      source_freshness_tag = excluded.source_freshness_tag,
      notes = excluded.notes,
      updated_at = CURRENT_TIMESTAMP
  `, CIP_SOC_CROSSWALK_LIBRARY, (crosswalk) => [
    crosswalk.id,
    crosswalk.cipCode,
    crosswalk.socCode,
    crosswalk.occupationTitle,
    crosswalk.relationType,
    crosswalk.evidenceStatus,
    crosswalk.sourceFreshnessTag,
    crosswalk.notes
  ]);

  seedRows(db, `
    INSERT INTO form_catalog (
      id,
      form_number,
      title,
      category_id,
      category_label,
      who_uses,
      when_to_use,
      revision_date,
      source_url,
      related_workflow,
      form_status,
      source_freshness_tag,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      form_number = excluded.form_number,
      title = excluded.title,
      category_id = excluded.category_id,
      category_label = excluded.category_label,
      who_uses = excluded.who_uses,
      when_to_use = excluded.when_to_use,
      revision_date = excluded.revision_date,
      source_url = excluded.source_url,
      related_workflow = excluded.related_workflow,
      form_status = excluded.form_status,
      source_freshness_tag = excluded.source_freshness_tag,
      updated_at = CURRENT_TIMESTAMP
  `, FORM_LIBRARY, (form) => [
    form.id,
    form.formNumber,
    form.title,
    form.categoryId,
    form.categoryLabel,
    form.whoUses,
    form.whenToUse,
    form.revisionDate,
    form.sourceUrl,
    form.relatedWorkflow,
    form.formStatus,
    form.sourceFreshnessTag
  ]);

  seedRows(db, `
    INSERT INTO regional_offices (
      id,
      office_name,
      officer_name,
      address,
      phone,
      email,
      jurisdiction_notes,
      outstations_json,
      source_freshness_tag,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      office_name = excluded.office_name,
      officer_name = excluded.officer_name,
      address = excluded.address,
      phone = excluded.phone,
      email = excluded.email,
      jurisdiction_notes = excluded.jurisdiction_notes,
      outstations_json = excluded.outstations_json,
      source_freshness_tag = excluded.source_freshness_tag,
      updated_at = CURRENT_TIMESTAMP
  `, REGIONAL_OFFICE_LIBRARY, (office) => [
    office.id,
    office.officeName,
    office.officerName,
    office.address,
    office.phone,
    office.email,
    office.jurisdictionNotes,
    JSON.stringify(office.outstations),
    office.sourceFreshnessTag
  ]);
}

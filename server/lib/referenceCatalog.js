import { CAREERS_DATABASE, SCHOOLS_DATABASE } from '../../client/src/data/school_data.js';
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

const DEFAULT_LAST_CHECKED_AT = new Date().toISOString().slice(0, 10);

const REFERENCE_NAMESPACE_METADATA = {
  SOC: {
    title: 'Standard Occupational Classification',
    description: 'Federal occupational taxonomy used to anchor veteran job goals to an official labor classification.',
    sourceName: 'Bureau of Labor Statistics',
    officialSourceLink: 'https://www.bls.gov/soc/',
    version: '2018 SOC',
    authorityLevel: 'federal_data',
    refreshFrequency: 'periodic taxonomy release'
  },
  ONET: {
    title: 'O*NET-SOC Taxonomy',
    description: 'Detailed occupation analysis layer with tasks, skills, knowledge, abilities, work context, and job-zone data.',
    sourceName: 'O*NET Resource Center',
    officialSourceLink: 'https://www.onetonline.org/',
    version: 'O*NET-SOC taxonomy',
    authorityLevel: 'federal_data',
    refreshFrequency: 'scheduled O*NET data release'
  },
  MILITARY_XWALK: {
    title: 'Military Occupational Crosswalk',
    description: 'Crosswalk layer for translating military occupations into civilian occupation targets and training gaps.',
    sourceName: 'O*NET OnLine',
    officialSourceLink: 'https://www.onetonline.org/crosswalk/MOC/',
    version: 'Current military crosswalk',
    authorityLevel: 'federal_data',
    refreshFrequency: 'scheduled crosswalk release'
  },
  CIP: {
    title: 'Classification of Instructional Programs',
    description: 'Federal taxonomy for instructional programs used to connect school programs to occupational targets.',
    sourceName: 'National Center for Education Statistics',
    officialSourceLink: 'https://nces.ed.gov/ipeds/cipcode/default.aspx?y=56',
    version: 'CIP 2020',
    authorityLevel: 'federal_data',
    refreshFrequency: 'periodic taxonomy release'
  },
  CIP_SOC: {
    title: 'CIP-SOC Crosswalk',
    description: 'Bridge between federal instructional program codes and federal occupational codes.',
    sourceName: 'National Center for Education Statistics',
    officialSourceLink: 'https://nces.ed.gov/ipeds/cipcode/post3.aspx?y=56',
    version: 'NCES CIP-SOC crosswalk',
    authorityLevel: 'federal_data',
    refreshFrequency: 'periodic crosswalk release'
  },
  IPEDS: {
    title: 'IPEDS Institution Registry',
    description: 'Federal institution dataset for school identity, sector, and institutional reporting.',
    sourceName: 'National Center for Education Statistics',
    officialSourceLink: 'https://nces.ed.gov/ipeds',
    version: 'Current IPEDS release',
    authorityLevel: 'federal_data',
    refreshFrequency: 'annual reporting cycle'
  },
  OPEID: {
    title: 'OPEID Institution Identity',
    description: 'Federal student-aid institution identity layer used for school verification and data joins.',
    sourceName: 'College Scorecard / U.S. Department of Education',
    officialSourceLink: 'https://collegescorecard.ed.gov/data/',
    version: 'Current institution data release',
    authorityLevel: 'federal_data',
    refreshFrequency: 'annual data refresh'
  },
  DAPIP: {
    title: 'DAPIP Accreditation Registry',
    description: 'Accreditation verification layer for postsecondary institutions and programs.',
    sourceName: 'U.S. Department of Education',
    officialSourceLink: 'https://ope.ed.gov/DAPIP/',
    version: 'Current DAPIP catalog',
    authorityLevel: 'federal_data',
    refreshFrequency: 'periodic accreditation update'
  },
  WEAMS: {
    title: 'WEAMS / GI Bill Approval Registry',
    description: 'VA approval and facility-code layer for veteran training sites and approved programs.',
    sourceName: 'Veterans Affairs',
    officialSourceLink: 'https://www.va.gov/education/gi-bill-comparison-tool/',
    version: 'Current GI Bill Comparison Tool',
    authorityLevel: 'federal_data',
    refreshFrequency: 'periodic approval update'
  },
  NAICS: {
    title: 'North American Industry Classification System',
    description: 'Official U.S. industry classification system used to connect occupations to employer markets and self-employment sectors.',
    sourceName: 'U.S. Census Bureau',
    officialSourceLink: 'https://www.census.gov/naics',
    version: '2022 NAICS',
    authorityLevel: 'federal_data',
    refreshFrequency: 'periodic taxonomy release'
  },
  SBA_SIZE: {
    title: 'SBA Size Standards',
    description: 'NAICS-linked size standards used for self-employment, vendor qualification, and contracting analysis.',
    sourceName: 'U.S. Small Business Administration',
    officialSourceLink: 'https://www.sba.gov/federal-contracting/contracting-guide/size-standards',
    version: 'Current SBA table',
    authorityLevel: 'federal_data',
    refreshFrequency: 'regulatory update'
  },
  SAM: {
    title: 'SAM.gov Entity Registry',
    description: 'Federal entity registration and UEI identity layer for self-employment and contracting workflows.',
    sourceName: 'SAM.gov',
    officialSourceLink: 'https://sam.gov/entity-registration',
    version: 'Current SAM.gov registry',
    authorityLevel: 'federal_data',
    refreshFrequency: 'continuous'
  },
  CAGE: {
    title: 'CAGE Entity Registry',
    description: 'Federal contractor facility identifier used for vendor and contracting verification.',
    sourceName: 'Defense Logistics Agency',
    officialSourceLink: 'https://cage.dla.mil/',
    version: 'Current CAGE catalog',
    authorityLevel: 'federal_data',
    refreshFrequency: 'continuous'
  },
  PSC: {
    title: 'Product and Service Codes',
    description: 'Federal procurement classification system used to describe products and services purchased by government buyers.',
    sourceName: 'Acquisition.gov',
    officialSourceLink: 'https://www.acquisition.gov/psc-manual',
    version: 'April 2024 PSC Manual',
    authorityLevel: 'federal_data',
    refreshFrequency: 'manual revision'
  },
  OEWS: {
    title: 'Occupational Employment and Wage Statistics',
    description: 'Occupation wage and employment dataset for national, state, metro, and nonmetro labor-market evidence.',
    sourceName: 'Bureau of Labor Statistics',
    officialSourceLink: 'https://www.bls.gov/oes/',
    version: 'May 2025 profiles',
    authorityLevel: 'federal_data',
    refreshFrequency: 'annual release'
  },
  EMP_PROJ: {
    title: 'Employment Projections',
    description: 'National employment projections and openings data for occupational growth analysis.',
    sourceName: 'Bureau of Labor Statistics',
    officialSourceLink: 'https://www.bls.gov/emp/data/occupational-data.htm',
    version: '2024-2034 projections',
    authorityLevel: 'federal_data',
    refreshFrequency: 'annual release'
  },
  OOH: {
    title: 'Occupational Outlook Handbook',
    description: 'Plain-English occupation guidance layer covering pay, outlook, education, and work environment.',
    sourceName: 'Bureau of Labor Statistics',
    officialSourceLink: 'https://www.bls.gov/ooh/',
    version: 'Current OOH edition',
    authorityLevel: 'federal_data',
    refreshFrequency: 'periodic update'
  },
  QCEW: {
    title: 'Quarterly Census of Employment and Wages',
    description: 'Industry employment and wage data by geography and ownership type.',
    sourceName: 'Bureau of Labor Statistics',
    officialSourceLink: 'https://www.bls.gov/cew/',
    version: 'Current QCEW release',
    authorityLevel: 'federal_data',
    refreshFrequency: 'quarterly release'
  },
  FIPS: {
    title: 'FIPS Geography Codes',
    description: 'Federal state and county geography identifiers used to join labor, school, and location datasets.',
    sourceName: 'U.S. Census Bureau',
    officialSourceLink: 'https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html',
    version: 'Current TIGER / FIPS references',
    authorityLevel: 'federal_data',
    refreshFrequency: 'annual geography update'
  },
  CBSA: {
    title: 'CBSA / MSA Geography Codes',
    description: 'Metropolitan and micropolitan labor-market geography used for realistic regional employment analysis.',
    sourceName: 'Office of Management and Budget',
    officialSourceLink: 'https://www.whitehouse.gov/wp-content/uploads/2023/07/OMB-Bulletin-23-01.pdf',
    version: 'OMB Bulletin 23-01',
    authorityLevel: 'federal_data',
    refreshFrequency: 'bulletin revision'
  },
  CERT: {
    title: 'Certification and License Registry',
    description: 'Credential and licensure layer used to justify required exams, fees, training, and supplies.',
    sourceName: 'CareerOneStop',
    officialSourceLink: 'https://www.careeronestop.org/Developers/WebAPI/Certifications/get-certification-details-by-id.aspx',
    version: 'CareerOneStop Web API',
    authorityLevel: 'federal_data',
    refreshFrequency: 'service update'
  },
  APPRENTICESHIP: {
    title: 'Registered Apprenticeship Registry',
    description: 'Registered apprenticeship and OJT pathway index for non-college training options.',
    sourceName: 'Apprenticeship.gov',
    officialSourceLink: 'https://www.apprenticeship.gov/data-and-statistics',
    version: 'Current apprenticeship data',
    authorityLevel: 'federal_data',
    refreshFrequency: 'periodic update'
  },
  TRACK: {
    title: 'VR&E Track Registry',
    description: 'Official VR&E support-and-services tracks that shape case logic, evidence, and service eligibility.',
    sourceName: 'Veterans Affairs',
    officialSourceLink: 'https://www.va.gov/careers-employment/vocational-rehabilitation/programs/',
    version: 'Current VA track guidance',
    authorityLevel: 'va_policy',
    refreshFrequency: 'manual review'
  },
  USC: {
    title: '38 U.S.C. Chapter 31',
    description: 'Binding statutory authority for Chapter 31 training and rehabilitation.',
    sourceName: 'U.S. Code',
    officialSourceLink: 'https://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title38-chapter31',
    version: 'Current U.S. Code preliminary edition',
    authorityLevel: 'binding',
    refreshFrequency: 'statutory update'
  },
  CFR: {
    title: '38 C.F.R. Part 21',
    description: 'Binding VR&E regulation layer covering entitlement, feasibility, plans, supplies, payments, and case status.',
    sourceName: 'eCFR',
    officialSourceLink: 'https://www.ecfr.gov/current/title-38/chapter-I/part-21/subpart-A',
    version: 'Current eCFR',
    authorityLevel: 'binding',
    refreshFrequency: 'regulatory update'
  },
  M28C: {
    title: 'M28C / KnowVA',
    description: 'VA procedural manual layer for VR&E operations and counselor workflow.',
    sourceName: 'KnowVA',
    officialSourceLink: 'https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000146267/M28C.I.A.1--Veteran-Readiness-and-Employment-Manual',
    version: 'Current KnowVA manual page',
    authorityLevel: 'va_policy',
    refreshFrequency: 'manual review'
  },
  FORM: {
    title: 'VA Form Registry',
    description: 'Official VA form index with use cases, revision dates, and workflow relevance.',
    sourceName: 'Veterans Affairs',
    officialSourceLink: 'https://www.va.gov/find-forms/',
    version: 'Current VA forms catalog',
    authorityLevel: 'federal_data',
    refreshFrequency: 'manual review'
  },
  REVIEW_LANE: {
    title: 'VA Decision Review Lanes',
    description: 'Decision review options and filing lanes used to analyze adverse action strategy and deadlines.',
    sourceName: 'Veterans Affairs',
    officialSourceLink: 'https://www.va.gov/decision-reviews/',
    version: 'Current VA review-lane guidance',
    authorityLevel: 'va_policy',
    refreshFrequency: 'manual review'
  },
  BIZ_STRATEGY: {
    title: 'Business Strategy Ontology',
    description: 'Curated strategy ontology connecting strategy families, growth models, pricing, operations, innovation, and venture-planning evidence to workforce and market indexes.',
    sourceName: 'Maintainer synthesis with public strategy sources',
    officialSourceLink: 'https://hbr.org/topic/subject/strategy',
    version: 'repo_curated_strategy_ontology_v1',
    authorityLevel: 'practitioner',
    refreshFrequency: 'manual review'
  }
};

function buildDescription(parts) {
  return parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ');
}

function buildReferenceIndex({
  namespace,
  code,
  title,
  description,
  parentCode = '',
  hierarchyLevel = 0,
  effectiveDate = '',
  retiredDate = '',
  sourceName,
  officialSourceLink,
  lastCheckedAt = DEFAULT_LAST_CHECKED_AT,
  version,
  authorityLevel,
  refreshFrequency
}) {
  const metadata = REFERENCE_NAMESPACE_METADATA[namespace] || {};

  return {
    id: `${namespace}:${code}`,
    namespace,
    code,
    title,
    description,
    parentCode,
    hierarchyLevel,
    effectiveDate,
    retiredDate,
    sourceName: sourceName || metadata.sourceName || '',
    officialSourceLink: officialSourceLink || metadata.officialSourceLink || '',
    lastCheckedAt,
    version: version || metadata.version || '',
    authorityLevel: authorityLevel || metadata.authorityLevel || 'federal_data',
    refreshFrequency: refreshFrequency || metadata.refreshFrequency || 'manual review'
  };
}

function buildReferenceCrosswalk({
  sourceNamespace,
  sourceCode,
  targetNamespace,
  targetCode,
  relationshipType,
  confidence,
  sourceLink = '',
  version = '',
  lastCheckedAt = DEFAULT_LAST_CHECKED_AT
}) {
  return {
    id: `${sourceNamespace}:${sourceCode}->${targetNamespace}:${targetCode}:${relationshipType}`,
    sourceNamespace,
    sourceCode,
    targetNamespace,
    targetCode,
    relationshipType,
    confidence,
    sourceLink,
    version,
    lastCheckedAt
  };
}

function dedupeById(rows) {
  const registry = new Map();
  rows.forEach((row) => {
    if (row && row.id) {
      registry.set(row.id, row);
    }
  });
  return Array.from(registry.values());
}

function normalizeFormCode(formNumber, fallbackId) {
  const code = String(formNumber || '')
    .replace(/^VA Form\s+/i, '')
    .trim();

  return code || fallbackId;
}

function buildBusinessStrategy({
  strategyCode,
  strategyName,
  parentFamily,
  strategyLevel,
  definition,
  whenToUse,
  whenNotToUse,
  relatedFramework,
  upstreamIndexes = [],
  downstreamIndexes = [],
  keyMetrics = [],
  sourceName,
  sourceUrl,
  sourceType,
  evidenceRequired,
  exampleUseCase
}) {
  return {
    id: `business_strategy_${slugify(strategyCode)}`,
    strategyCode,
    strategyName,
    parentFamily,
    strategyLevel,
    definition,
    whenToUse,
    whenNotToUse,
    relatedFramework,
    upstreamIndexes,
    downstreamIndexes,
    keyMetrics,
    sourceName,
    sourceUrl,
    sourceType,
    evidenceRequired,
    exampleUseCase
  };
}

function buildStrategySet(defaults, strategies) {
  return strategies.map((strategy) => buildBusinessStrategy({
    ...defaults,
    ...strategy
  }));
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

const REVIEW_LANE_LIBRARY = [
  {
    code: 'informal_correction',
    title: 'Informal Correction / Supervisor Review',
    description: 'Non-formal correction path used before a veteran commits to a formal review lane when a written decision is missing or the issue may be fixed quickly.'
  },
  {
    code: 'higher_level_review',
    title: 'Higher-Level Review',
    description: 'Formal review lane generally filed within one year of a decision notice and normally does not allow new evidence.'
  },
  {
    code: 'supplemental_claim',
    title: 'Supplemental Claim',
    description: 'Formal review lane used when the veteran has new and relevant evidence to submit in support of the dispute.'
  },
  {
    code: 'board_appeal',
    title: 'Board Appeal',
    description: 'Formal Board review lane with docket choices that generally must be selected within one year of the decision notice.'
  },
  {
    code: 'foia_privacy_act',
    title: 'FOIA / Privacy Act Request',
    description: 'Records-request lane used to obtain missing VR&E records, counselor notes, or supporting file materials.'
  },
  {
    code: 'congressional_inquiry',
    title: 'Congressional Inquiry',
    description: 'Escalation lane used when deadlines, payment failures, or prolonged nonresponse justify outside intervention.'
  },
  {
    code: 'oig_complaint',
    title: 'OIG Complaint',
    description: 'Oversight escalation lane for significant misconduct, systemic abuse, or document-handling failures.'
  }
];

const STRATEGY_SOURCES = {
  hbr: {
    sourceName: 'Harvard Business Review',
    sourceUrl: 'https://hbr.org/topic/subject/strategy',
    sourceType: 'academic'
  },
  isc: {
    sourceName: 'Harvard Institute for Strategy and Competitiveness',
    sourceUrl: 'https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-value-chain.aspx',
    sourceType: 'academic'
  },
  ifm: {
    sourceName: 'Cambridge Institute for Manufacturing',
    sourceUrl: 'https://www.ifm.eng.cam.ac.uk/research/dstools/porters-generic-competitive-strategies/',
    sourceType: 'academic'
  },
  ansoff: {
    sourceName: 'Corporate Finance Institute',
    sourceUrl: 'https://corporatefinanceinstitute.com/resources/management/ansoff-matrix/',
    sourceType: 'practitioner'
  },
  bcg: {
    sourceName: 'BCG',
    sourceUrl: 'https://www.bcg.com/about/overview/our-history/growth-share-matrix',
    sourceType: 'consulting'
  },
  strategyzer: {
    sourceName: 'Strategyzer',
    sourceUrl: 'https://www.strategyzer.com/library/the-business-model-canvas',
    sourceType: 'practitioner'
  },
  bdc: {
    sourceName: 'BDC',
    sourceUrl: 'https://www.bdc.ca/en/articles-tools/marketing-sales-export/marketing/pricing-5-common-strategies',
    sourceType: 'practitioner'
  },
  blueOcean: {
    sourceName: 'Blue Ocean Strategy',
    sourceUrl: 'https://www.blueoceanstrategy.com/what-is-blue-ocean-strategy/',
    sourceType: 'practitioner'
  },
  christensen: {
    sourceName: 'Christensen Institute',
    sourceUrl: 'https://www.christenseninstitute.org/theory/disruptive-innovation/',
    sourceType: 'academic'
  },
  hbs: {
    sourceName: 'Harvard Business School',
    sourceUrl: 'https://www.hbs.edu/faculty/Pages/item.aspx?num=32',
    sourceType: 'academic'
  },
  maintainer: {
    sourceName: 'Maintainer synthesis',
    sourceUrl: 'https://hbr.org/topic/subject/strategy',
    sourceType: 'practitioner'
  }
};

const BUSINESS_STRATEGY_LIBRARY = [
  ...buildStrategySet({
    parentFamily: 'Corporate Strategy',
    strategyLevel: 'corporate',
    relatedFramework: 'Corporate strategy and enterprise portfolio direction',
    upstreamIndexes: ['corporate mission', 'enterprise risk', 'capital allocation', 'board strategy'],
    downstreamIndexes: ['business-unit strategy', 'product strategy', 'market strategy', 'operating model'],
    keyMetrics: ['revenue growth', 'portfolio ROI', 'cash flow', 'risk concentration'],
    sourceName: STRATEGY_SOURCES.hbr.sourceName,
    sourceUrl: STRATEGY_SOURCES.hbr.sourceUrl,
    sourceType: STRATEGY_SOURCES.hbr.sourceType,
    evidenceRequired: 'Capital plan, market opportunity, operating capacity, and strategic fit evidence.',
    exampleUseCase: 'A veteran-owned firm chooses whether to expand, stabilize, or restructure before committing to a self-employment plan.'
  }, [
    {
      strategyCode: 'CORP.GROWTH',
      strategyName: 'Growth',
      definition: 'Expand revenue, markets, products, or business units through deliberate corporate growth moves.',
      whenToUse: 'When the company has capital, execution capacity, and credible expansion opportunities.',
      whenNotToUse: 'When liquidity, delivery quality, or unit economics are unstable.'
    },
    {
      strategyCode: 'CORP.STABILITY',
      strategyName: 'Stability',
      definition: 'Maintain position through optimization, customer retention, and measured operating discipline instead of aggressive expansion.',
      whenToUse: 'When preserving reliable cash flow and operational consistency matters more than rapid expansion.',
      whenNotToUse: 'When the current market is collapsing or the business must reposition quickly.'
    },
    {
      strategyCode: 'CORP.RETRENCHMENT',
      strategyName: 'Retrenchment / Turnaround',
      definition: 'Reduce scope, divest activities, or restructure the enterprise when performance, liquidity, or risk exposure has become unsustainable.',
      whenToUse: 'When performance weakness or concentrated risk threatens survival.',
      whenNotToUse: 'When short-term softness can be solved without shrinking the enterprise.'
    },
    {
      strategyCode: 'CORP.COMBINATION',
      strategyName: 'Combination Strategy',
      definition: 'Use different strategies across business units, such as growth in one area and stabilization or divestiture in another.',
      whenToUse: 'When the portfolio contains units in very different market or performance conditions.',
      whenNotToUse: 'When the business is still simple enough for one clear strategic direction.'
    },
    {
      strategyCode: 'CORP.DIVERSIFICATION',
      strategyName: 'Diversification',
      definition: 'Enter new products or businesses beyond the current core, either through related or unrelated moves.',
      whenToUse: 'When the core market is limited and the company has a repeatable capability that can travel.',
      whenNotToUse: 'When management attention and capital are already overstretched.'
    },
    {
      strategyCode: 'CORP.VERTICAL_INTEGRATION',
      strategyName: 'Vertical Integration',
      definition: 'Control upstream suppliers or downstream distribution to improve margin, reliability, or customer access.',
      whenToUse: 'When supply reliability, channel control, or margin capture are strategic bottlenecks.',
      whenNotToUse: 'When flexibility matters more than ownership or control.'
    },
    {
      strategyCode: 'CORP.HORIZONTAL_INTEGRATION',
      strategyName: 'Horizontal Integration',
      definition: 'Expand by merging with or acquiring competitors in the same layer of the market.',
      whenToUse: 'When consolidation strengthens market position or creates scale efficiencies.',
      whenNotToUse: 'When integration risk or antitrust exposure outweighs the gains.'
    }
  ]),

  ...buildStrategySet({
    parentFamily: 'Competitive Strategy',
    strategyLevel: 'business_unit',
    relatedFramework: "Porter's Generic Strategies",
    upstreamIndexes: ['corporate strategy', 'industry structure', 'competitive advantage'],
    downstreamIndexes: ['pricing', 'product strategy', 'channel strategy', 'operations design'],
    keyMetrics: ['gross margin', 'market share', 'price premium', 'customer retention'],
    sourceName: STRATEGY_SOURCES.ifm.sourceName,
    sourceUrl: STRATEGY_SOURCES.ifm.sourceUrl,
    sourceType: STRATEGY_SOURCES.ifm.sourceType,
    evidenceRequired: 'Industry structure, competitor benchmarking, customer value proof, and cost-position evidence.',
    exampleUseCase: 'A veteran planning a cybersecurity consultancy chooses between premium differentiation and low-cost niche support.'
  }, [
    {
      strategyCode: 'COMP.COST_LEADERSHIP',
      strategyName: 'Cost Leadership',
      definition: 'Win by delivering acceptable value at structurally lower cost than competitors.',
      whenToUse: 'When scale, process discipline, and standardized demand can support a sustainable cost edge.',
      whenNotToUse: 'When buyers choose primarily on trust, expertise, or premium outcomes rather than price.'
    },
    {
      strategyCode: 'COMP.DIFFERENTIATION',
      strategyName: 'Differentiation',
      definition: 'Win by offering unique value through brand, quality, innovation, service, or specialized expertise.',
      whenToUse: 'When the business can prove a meaningful premium value proposition.',
      whenNotToUse: 'When customers view offers as interchangeable commodities.'
    },
    {
      strategyCode: 'COMP.FOCUS',
      strategyName: 'Focus',
      definition: 'Win by concentrating on a defined segment, geography, or use case rather than the whole market.',
      whenToUse: 'When a narrow market has clear unmet needs and the firm can serve it deeply.',
      whenNotToUse: 'When the addressable niche is too small to support the business model.'
    },
    {
      strategyCode: 'COMP.FOCUS_COST',
      strategyName: 'Cost Focus',
      definition: 'Provide the lowest practical cost within a narrow customer niche.',
      whenToUse: 'When the niche values affordability and efficient delivery more than premium differentiation.',
      whenNotToUse: 'When the niche expects white-glove service or premium trust signals.'
    },
    {
      strategyCode: 'COMP.FOCUS_DIFFERENTIATION',
      strategyName: 'Differentiation Focus',
      definition: 'Provide a premium or specialized offer for a narrowly defined segment.',
      whenToUse: 'When a niche has distinctive pain points and will pay for tailored expertise.',
      whenNotToUse: 'When the segment is too price sensitive for specialization to pay off.'
    }
  ]),

  ...buildStrategySet({
    parentFamily: 'Growth Strategy',
    strategyLevel: 'business_unit',
    relatedFramework: 'Ansoff Matrix',
    upstreamIndexes: ['corporate growth objective', 'capital allocation'],
    downstreamIndexes: ['go-to-market', 'pricing', 'product roadmap', 'channel strategy'],
    keyMetrics: ['new revenue', 'customer acquisition', 'expansion rate', 'adjacent market traction'],
    sourceName: STRATEGY_SOURCES.ansoff.sourceName,
    sourceUrl: STRATEGY_SOURCES.ansoff.sourceUrl,
    sourceType: STRATEGY_SOURCES.ansoff.sourceType,
    evidenceRequired: 'Current-market performance, adjacent demand proof, delivery capacity, and risk-adjusted growth assumptions.',
    exampleUseCase: 'A veteran-owned services business decides whether to sell more to current customers or move into a new region.'
  }, [
    {
      strategyCode: 'GROWTH.MARKET_PENETRATION',
      strategyName: 'Market Penetration',
      definition: 'Sell more existing products or services to existing markets.',
      whenToUse: 'When the current market still has room for share gain or higher wallet capture.',
      whenNotToUse: 'When current demand is saturated or churn is masking a weak offer.'
    },
    {
      strategyCode: 'GROWTH.MARKET_DEVELOPMENT',
      strategyName: 'Market Development',
      definition: 'Take existing offers into new geographies, channels, or customer segments.',
      whenToUse: 'When the offer already works and adjacent markets are reachable without a full rebuild.',
      whenNotToUse: 'When the new market needs a very different product or operating model.'
    },
    {
      strategyCode: 'GROWTH.PRODUCT_DEVELOPMENT',
      strategyName: 'Product Development',
      definition: 'Create new products or service lines for current customers.',
      whenToUse: 'When customer trust is strong and unmet needs can be served through extensions of the current relationship.',
      whenNotToUse: 'When the organization cannot yet maintain the existing offer reliably.'
    },
    {
      strategyCode: 'GROWTH.DIVERSIFICATION',
      strategyName: 'Diversification',
      definition: 'Enter new products in new markets at the same time, with higher strategic risk.',
      whenToUse: 'When the company has surplus capacity, transferable capabilities, and a compelling adjacency thesis.',
      whenNotToUse: 'When the business lacks enough focus or capital discipline to absorb high uncertainty.'
    }
  ]),

  ...buildStrategySet({
    parentFamily: 'Portfolio Strategy',
    strategyLevel: 'corporate',
    relatedFramework: 'BCG Growth-Share Matrix',
    upstreamIndexes: ['corporate strategy', 'capital allocation'],
    downstreamIndexes: ['product lifecycle', 'market share analysis', 'resource allocation'],
    keyMetrics: ['market share', 'growth rate', 'cash generation', 'margin profile'],
    sourceName: STRATEGY_SOURCES.bcg.sourceName,
    sourceUrl: STRATEGY_SOURCES.bcg.sourceUrl,
    sourceType: STRATEGY_SOURCES.bcg.sourceType,
    evidenceRequired: 'Relative market share, market growth, unit economics, and capital needs by product or business line.',
    exampleUseCase: 'A veteran entrepreneur uses portfolio logic to decide which service line deserves investment and which should be harvested or exited.'
  }, [
    {
      strategyCode: 'PORT.STARS',
      strategyName: 'Stars',
      definition: 'High-share, high-growth businesses or products that justify continued investment.',
      whenToUse: 'When a line already has strong traction in a fast-growing market.',
      whenNotToUse: 'When growth is bought only through unsustainable subsidy or margin destruction.'
    },
    {
      strategyCode: 'PORT.CASH_COWS',
      strategyName: 'Cash Cows',
      definition: 'High-share, lower-growth businesses that generate dependable cash.',
      whenToUse: 'When the company needs reliable funding to support other strategic bets.',
      whenNotToUse: 'When the unit is quietly decaying and no longer throws off healthy cash.'
    },
    {
      strategyCode: 'PORT.QUESTION_MARKS',
      strategyName: 'Question Marks',
      definition: 'Low-share, high-growth businesses that require selective investment or a disciplined exit decision.',
      whenToUse: 'When there is a plausible path to leadership if the business is funded and improved.',
      whenNotToUse: 'When there is no realistic path to competitive advantage.'
    },
    {
      strategyCode: 'PORT.DOGS',
      strategyName: 'Dogs / Pets',
      definition: 'Low-share, low-growth businesses that often warrant maintenance only for strategic reasons or an exit.',
      whenToUse: 'When the unit serves a deliberate strategic role or can still produce acceptable cash with minimal effort.',
      whenNotToUse: 'When management attention would be better spent elsewhere.'
    }
  ]),

  ...buildStrategySet({
    parentFamily: 'Business Model Strategy',
    strategyLevel: 'business_unit',
    relatedFramework: 'Business Model Canvas / Business Model Navigator',
    upstreamIndexes: ['corporate strategy', 'value proposition'],
    downstreamIndexes: ['revenue model', 'cost model', 'customer segment', 'channel model'],
    keyMetrics: ['gross margin', 'recurring revenue', 'retention', 'unit economics'],
    sourceName: STRATEGY_SOURCES.strategyzer.sourceName,
    sourceUrl: STRATEGY_SOURCES.strategyzer.sourceUrl,
    sourceType: STRATEGY_SOURCES.strategyzer.sourceType,
    evidenceRequired: 'Value proposition proof, target-customer clarity, revenue logic, delivery economics, and partner assumptions.',
    exampleUseCase: 'A Chapter 31 self-employment plan maps the venture through customer segments, channels, revenue streams, and cost structure.'
  }, [
    {
      strategyCode: 'MODEL.BUSINESS_MODEL_CANVAS',
      strategyName: 'Business Model Canvas',
      definition: 'Use the nine building blocks of the business model to describe how value is created, delivered, and captured.',
      whenToUse: 'When the business needs a structured design tool for the whole model.',
      whenNotToUse: 'When the team needs detailed financial forecasting rather than model framing.'
    },
    {
      strategyCode: 'MODEL.PLATFORM',
      strategyName: 'Platform Model',
      definition: 'Create value by connecting multiple sides of a market and benefiting from network effects.',
      whenToUse: 'When the venture can broker value between participants and create repeatable matching efficiency.',
      whenNotToUse: 'When liquidity, trust, or two-sided participation cannot be established.'
    },
    {
      strategyCode: 'MODEL.SUBSCRIPTION',
      strategyName: 'Subscription Model',
      definition: 'Capture recurring revenue through repeated monthly, annual, or ongoing access fees.',
      whenToUse: 'When the offer delivers repeatable continuing value and churn can be managed.',
      whenNotToUse: 'When the product is one-time, episodic, or too unpredictable for recurring billing.'
    },
    {
      strategyCode: 'MODEL.FREEMIUM',
      strategyName: 'Freemium Model',
      definition: 'Offer a free tier that converts a subset of users into paid premium plans.',
      whenToUse: 'When customer acquisition can scale cheaply and premium conversion economics are favorable.',
      whenNotToUse: 'When free users are expensive to support and conversion is weak.'
    },
    {
      strategyCode: 'MODEL.RAZOR_BLADE',
      strategyName: 'Razor-and-Blade Model',
      definition: 'Use a low-cost base product to drive recurring follow-on consumable or service revenue.',
      whenToUse: 'When repeat usage or replenishment creates predictable downstream value capture.',
      whenNotToUse: 'When follow-on demand is uncertain or buyers resist lock-in.'
    },
    {
      strategyCode: 'MODEL.MARKETPLACE',
      strategyName: 'Marketplace Model',
      definition: 'Operate a buyer-seller venue that monetizes transactions, discovery, or access.',
      whenToUse: 'When a fragmented market needs better trust, discovery, or payment infrastructure.',
      whenNotToUse: 'When supply and demand cannot both be activated early enough.'
    },
    {
      strategyCode: 'MODEL.LICENSING',
      strategyName: 'Licensing Model',
      definition: 'Monetize intellectual property, systems, or brand assets by granting usage rights to others.',
      whenToUse: 'When the business owns transferable intellectual property or process assets.',
      whenNotToUse: 'When enforcement, quality control, or partner dependence becomes a major liability.'
    },
    {
      strategyCode: 'MODEL.FRANCHISE',
      strategyName: 'Franchise Model',
      definition: 'Replicate a proven operating system through independent operators under a shared brand and ruleset.',
      whenToUse: 'When the model is repeatable, teachable, and brand governance can scale.',
      whenNotToUse: 'When the operation is still too founder-dependent or inconsistent.'
    }
  ]),

  ...buildStrategySet({
    parentFamily: 'Pricing Strategy',
    strategyLevel: 'pricing',
    relatedFramework: 'Pricing strategy and willingness-to-pay analysis',
    upstreamIndexes: ['business model', 'revenue model', 'competitive strategy'],
    downstreamIndexes: ['SKU pricing', 'discount policy', 'customer segment offers', 'margin design'],
    keyMetrics: ['gross margin', 'ARPU', 'conversion rate', 'retention', 'discount leakage'],
    sourceName: STRATEGY_SOURCES.bdc.sourceName,
    sourceUrl: STRATEGY_SOURCES.bdc.sourceUrl,
    sourceType: STRATEGY_SOURCES.bdc.sourceType,
    evidenceRequired: 'Cost structure, customer value proof, competitor pricing, and elasticity assumptions.',
    exampleUseCase: 'A veteran-owned venture chooses between value-based pricing for specialized services and penetration pricing for initial market entry.'
  }, [
    { strategyCode: 'PRICE.COST_PLUS', strategyName: 'Cost-Plus Pricing', definition: 'Set price by adding a target markup over cost.', whenToUse: 'When cost visibility is strong and the market tolerates predictable markups.', whenNotToUse: 'When willingness to pay is much higher or lower than cost-based logic implies.' },
    { strategyCode: 'PRICE.VALUE_BASED', strategyName: 'Value-Based Pricing', definition: 'Set price according to the value delivered to the customer.', whenToUse: 'When the offer creates measurable economic or mission value.', whenNotToUse: 'When value proof is weak and buyers compare mostly on price.' },
    { strategyCode: 'PRICE.COMPETITIVE', strategyName: 'Competitive Pricing', definition: 'Price in relation to the visible market benchmark.', whenToUse: 'When buyers have clear benchmark alternatives and transparency is high.', whenNotToUse: 'When the offer is unique enough to justify a different logic.' },
    { strategyCode: 'PRICE.PENETRATION', strategyName: 'Penetration Pricing', definition: 'Use a lower initial price to capture share quickly.', whenToUse: 'When speed of adoption matters and later expansion or retention supports the economics.', whenNotToUse: 'When the business cannot survive early low margins.' },
    { strategyCode: 'PRICE.SKIMMING', strategyName: 'Price Skimming', definition: 'Start at a high price and capture early-adopter willingness to pay before broadening.', whenToUse: 'When novelty, scarcity, or premium demand is strong.', whenNotToUse: 'When competitors can quickly undercut the offer.' },
    { strategyCode: 'PRICE.DYNAMIC', strategyName: 'Dynamic Pricing', definition: 'Adjust price based on demand, supply, timing, or algorithmic signals.', whenToUse: 'When demand fluctuates and dynamic optimization improves yield.', whenNotToUse: 'When customers expect transparent stable pricing.' },
    { strategyCode: 'PRICE.FREEMIUM', strategyName: 'Freemium Pricing', definition: 'Use free access as part of the pricing ladder to encourage later paid conversion.', whenToUse: 'When low-friction acquisition is critical and free support costs remain manageable.', whenNotToUse: 'When too much value is given away for sustainable conversion.' },
    { strategyCode: 'PRICE.SUBSCRIPTION', strategyName: 'Subscription Pricing', definition: 'Charge recurring access fees tied to time-based use or service delivery.', whenToUse: 'When value recurs reliably over time.', whenNotToUse: 'When use is irregular and customers prefer one-time purchase.' },
    { strategyCode: 'PRICE.USAGE_BASED', strategyName: 'Usage-Based Pricing', definition: 'Charge according to measurable consumption such as seats, volume, or transactions.', whenToUse: 'When usage correlates well with customer value.', whenNotToUse: 'When customers need cost predictability more than precision.' },
    { strategyCode: 'PRICE.BUNDLE', strategyName: 'Bundle Pricing', definition: 'Package multiple offers together to improve value perception or average order size.', whenToUse: 'When combined offers create better perceived value or simplify buying.', whenNotToUse: 'When bundling hides product-level economics or confuses buyers.' },
    { strategyCode: 'PRICE.GEOGRAPHIC', strategyName: 'Geographic Pricing', definition: 'Adjust price based on regional demand, competition, or cost differences.', whenToUse: 'When markets differ materially in willingness to pay or delivery cost.', whenNotToUse: 'When customers expect uniform national pricing.' },
    { strategyCode: 'PRICE.TIERED', strategyName: 'Tiered Pricing', definition: 'Offer good-better-best packages with escalating value and price.', whenToUse: 'When customer segments vary meaningfully in needs and budget.', whenNotToUse: 'When too many tiers create confusion and internal complexity.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'Market Creation Strategy',
    strategyLevel: 'market',
    relatedFramework: 'Blue Ocean Strategy and value innovation',
    upstreamIndexes: ['corporate growth', 'innovation strategy'],
    downstreamIndexes: ['customer discovery', 'category design', 'positioning', 'ecosystem build-out'],
    keyMetrics: ['new demand creation', 'category awareness', 'adoption velocity', 'margin improvement'],
    sourceName: STRATEGY_SOURCES.blueOcean.sourceName,
    sourceUrl: STRATEGY_SOURCES.blueOcean.sourceUrl,
    sourceType: STRATEGY_SOURCES.blueOcean.sourceType,
    evidenceRequired: 'Non-consumption analysis, category pain-point evidence, offer redesign logic, and adoption barriers.',
    exampleUseCase: 'A veteran founder reframes a service around underserved customers rather than competing head-on in a crowded market.'
  }, [
    { strategyCode: 'MARKET.BLUE_OCEAN', strategyName: 'Blue Ocean Strategy', definition: 'Pursue differentiation and lower cost together to create new market space.', whenToUse: 'When existing competition is intense and the offer can be reimagined around value innovation.', whenNotToUse: 'When the market is already wide open and standard competition works fine.' },
    { strategyCode: 'MARKET.CATEGORY_CREATION', strategyName: 'Category Creation', definition: 'Shape a new market category narrative and educate buyers on a novel problem-solution frame.', whenToUse: 'When the business introduces a genuinely new way to think about an important problem.', whenNotToUse: 'When buyers already understand the category and only execution matters.' },
    { strategyCode: 'MARKET.NON_CONSUMPTION', strategyName: 'Non-Consumption Strategy', definition: 'Serve customers excluded by current options due to price, complexity, or access barriers.', whenToUse: 'When many potential users are not buying at all because the current market excludes them.', whenNotToUse: 'When the opportunity only shifts share among already active buyers.' },
    { strategyCode: 'MARKET.ECOSYSTEM_CREATION', strategyName: 'Ecosystem Creation', definition: 'Create new demand by coordinating complementary partners, tools, or standards.', whenToUse: 'When the offer needs complementary adoption to unlock full value.', whenNotToUse: 'When the core offer can succeed without orchestrating an ecosystem.' },
    { strategyCode: 'MARKET.DEMAND_CREATION', strategyName: 'Demand Creation', definition: 'Create interest through education, awareness, and new use-case framing.', whenToUse: 'When customer understanding, not only visibility, is the bottleneck.', whenNotToUse: 'When buyers already know the need and simply need a better vendor.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'Innovation Strategy',
    strategyLevel: 'innovation',
    relatedFramework: 'Disruptive innovation, lean startup, and horizon management',
    upstreamIndexes: ['growth strategy', 'product strategy', 'technology strategy'],
    downstreamIndexes: ['MVP design', 'experiments', 'roadmap', 'R&D budget'],
    keyMetrics: ['experiment velocity', 'learning rate', 'new-offer adoption', 'innovation ROI'],
    sourceName: STRATEGY_SOURCES.christensen.sourceName,
    sourceUrl: STRATEGY_SOURCES.christensen.sourceUrl,
    sourceType: STRATEGY_SOURCES.christensen.sourceType,
    evidenceRequired: 'Customer problem evidence, experimentation logic, technical feasibility, and scaling assumptions.',
    exampleUseCase: 'A veteran-owned startup uses lean experimentation before asking VR&E to back a self-employment plan.'
  }, [
    { strategyCode: 'INNOV.SUSTAINING', strategyName: 'Sustaining Innovation', definition: 'Improve existing products for existing customers along dimensions they already value.', whenToUse: 'When the current market rewards meaningful quality or performance improvements.', whenNotToUse: 'When customers mainly need simpler or cheaper access rather than better features.' },
    { strategyCode: 'INNOV.DISRUPTIVE', strategyName: 'Disruptive Innovation', definition: 'Start simpler, more accessible, or less expensive and move upmarket over time.', whenToUse: 'When incumbents overserve a segment and entry can begin at the low end or in overlooked use cases.', whenNotToUse: 'When success depends immediately on beating incumbents at the high end.' },
    { strategyCode: 'INNOV.LEAN_STARTUP', strategyName: 'Lean Startup', definition: 'Use build-measure-learn cycles and validated learning to reduce uncertainty.', whenToUse: 'When the business model is still unproven and assumptions must be tested quickly.', whenNotToUse: 'When regulatory, safety, or procurement conditions require a finished system before testing.' },
    { strategyCode: 'INNOV.OPEN', strategyName: 'Open Innovation', definition: 'Use external ideas, partners, or communities to accelerate innovation.', whenToUse: 'When innovation benefits from external expertise, partner distribution, or shared development.', whenNotToUse: 'When the strategic asset must stay tightly controlled in-house.' },
    { strategyCode: 'INNOV.RD_LED', strategyName: 'R&D-Led Innovation', definition: 'Drive innovation through formal technical research, labs, or deep technical breakthroughs.', whenToUse: 'When technical differentiation and defensibility are central to winning.', whenNotToUse: 'When customer adoption risk is higher than technical risk.' },
    { strategyCode: 'INNOV.CUSTOMER_LED', strategyName: 'Customer-Led Innovation', definition: 'Use customer jobs, pain points, and observed behavior to shape new offers.', whenToUse: 'When user insight can reveal high-value unmet needs.', whenNotToUse: 'When customers cannot easily articulate a breakthrough need but technical invention leads.' },
    { strategyCode: 'INNOV.DESIGN_THINKING', strategyName: 'Design Thinking', definition: 'Use empathy, ideation, prototyping, and testing to shape customer-centered innovation.', whenToUse: 'When problem framing and user experience are major unknowns.', whenNotToUse: 'When the problem is already well-defined and operational execution is the bottleneck.' },
    { strategyCode: 'INNOV.THREE_HORIZONS', strategyName: 'Three Horizons', definition: 'Balance current performance with emerging bets and future growth opportunities.', whenToUse: 'When leadership needs to manage near-term execution and long-term experimentation at once.', whenNotToUse: 'When the business is too early-stage for formal portfolio horizon management.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'International Strategy',
    strategyLevel: 'international',
    relatedFramework: 'Global integration versus local responsiveness',
    upstreamIndexes: ['corporate strategy', 'geographic expansion'],
    downstreamIndexes: ['country risk', 'trade rules', 'localization', 'tax and supply-chain planning'],
    keyMetrics: ['country revenue mix', 'local market share', 'cross-border margin', 'market-entry payback'],
    sourceName: STRATEGY_SOURCES.hbs.sourceName,
    sourceUrl: STRATEGY_SOURCES.hbs.sourceUrl,
    sourceType: STRATEGY_SOURCES.hbs.sourceType,
    evidenceRequired: 'Country demand proof, entry barriers, legal and tax constraints, localization needs, and partner quality.',
    exampleUseCase: 'A veteran-owned product business evaluates export, licensing, or joint-venture paths into a foreign market.'
  }, [
    { strategyCode: 'INTL.EXPORT', strategyName: 'Export Strategy', definition: 'Sell domestic products or services into foreign markets without major local ownership.', whenToUse: 'When the offer can travel and local compliance is manageable.', whenNotToUse: 'When local delivery or regulation requires deep in-country presence.' },
    { strategyCode: 'INTL.LICENSING', strategyName: 'Licensing', definition: 'Allow foreign partners to use intellectual property or brand rights in exchange for fees or royalties.', whenToUse: 'When market access is easier through a local partner than through direct operations.', whenNotToUse: 'When IP control or quality assurance risk is too high.' },
    { strategyCode: 'INTL.FRANCHISING', strategyName: 'Franchising', definition: 'Replicate a proven operating model through local operators in other countries.', whenToUse: 'When the business system is codified and partner governance can scale internationally.', whenNotToUse: 'When the model still depends on founder improvisation.' },
    { strategyCode: 'INTL.JOINT_VENTURE', strategyName: 'Joint Venture', definition: 'Enter a market through shared ownership and control with a foreign partner.', whenToUse: 'When local knowledge, legitimacy, or shared risk is strategically useful.', whenNotToUse: 'When governance complexity is likely to slow execution.' },
    { strategyCode: 'INTL.ACQUISITION', strategyName: 'Acquisition', definition: 'Enter or expand in a foreign market by buying an existing company.', whenToUse: 'When speed, installed base, or local capability is worth the acquisition premium.', whenNotToUse: 'When integration risk is high and local due diligence is weak.' },
    { strategyCode: 'INTL.GREENFIELD', strategyName: 'Greenfield Investment', definition: 'Build a new operation from scratch in a foreign market.', whenToUse: 'When the company needs full control and can justify the longer timeline.', whenNotToUse: 'When the market requires immediate scale or existing local relationships.' },
    { strategyCode: 'INTL.MULTIDOMESTIC', strategyName: 'Multidomestic Strategy', definition: 'Adapt heavily to local markets rather than standardizing globally.', whenToUse: 'When local customer preferences, regulation, or culture differ substantially.', whenNotToUse: 'When global standardization is the main source of advantage.' },
    { strategyCode: 'INTL.GLOBAL', strategyName: 'Global Strategy', definition: 'Standardize across countries for scale efficiency and brand consistency.', whenToUse: 'When customer needs and economics are similar across markets.', whenNotToUse: 'When local responsiveness is essential to winning.' },
    { strategyCode: 'INTL.TRANSNATIONAL', strategyName: 'Transnational Strategy', definition: 'Balance global efficiency with local responsiveness.', whenToUse: 'When both scale and local adaptation materially matter.', whenNotToUse: 'When the organization cannot handle the complexity of dual optimization.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'Operations Strategy',
    strategyLevel: 'operating_model',
    relatedFramework: 'Value chain and operating-model design',
    upstreamIndexes: ['competitive strategy', 'value chain'],
    downstreamIndexes: ['procurement', 'logistics', 'production', 'fulfillment', 'service quality'],
    keyMetrics: ['cycle time', 'defect rate', 'inventory turns', 'service level', 'cost to serve'],
    sourceName: STRATEGY_SOURCES.isc.sourceName,
    sourceUrl: STRATEGY_SOURCES.isc.sourceUrl,
    sourceType: STRATEGY_SOURCES.isc.sourceType,
    evidenceRequired: 'Process maps, cost and quality data, supplier risk, throughput constraints, and service-level targets.',
    exampleUseCase: 'A veteran-owned operation improves delivery reliability before scaling or seeking financing.'
  }, [
    { strategyCode: 'OPS.LEAN', strategyName: 'Lean Operations', definition: 'Reduce waste, improve flow, and create continuous improvement in operations.', whenToUse: 'When process delay, rework, or handoff waste is a major performance drag.', whenNotToUse: 'When the larger bottleneck is strategy or demand rather than operations.' },
    { strategyCode: 'OPS.SIX_SIGMA', strategyName: 'Six Sigma', definition: 'Reduce defects and variation through disciplined process control.', whenToUse: 'When process consistency and error reduction are mission critical.', whenNotToUse: 'When the process is too early-stage or unstable for heavy control tooling.' },
    { strategyCode: 'OPS.TQM', strategyName: 'Total Quality Management', definition: 'Build a broad quality culture around customer satisfaction and cross-functional process improvement.', whenToUse: 'When quality must become a company-wide management discipline.', whenNotToUse: 'When leadership only wants a narrow tactical fix.' },
    { strategyCode: 'OPS.JIT', strategyName: 'Just-in-Time', definition: 'Reduce inventory and coordinate tightly with supply flows.', whenToUse: 'When demand is stable enough and suppliers are reliable enough to support low inventory.', whenNotToUse: 'When supply volatility makes low-buffer operations dangerous.' },
    { strategyCode: 'OPS.OUTSOURCING', strategyName: 'Outsourcing', definition: 'Use external providers for non-core or scale-sensitive functions.', whenToUse: 'When specialists can deliver faster or cheaper than an internal build.', whenNotToUse: 'When the outsourced function is strategically core or quality sensitive.' },
    { strategyCode: 'OPS.INSOURCING', strategyName: 'Insourcing', definition: 'Bring important functions inside for control, quality, or capability reasons.', whenToUse: 'When ownership of capability or service quality matters more than external flexibility.', whenNotToUse: 'When internal fixed cost would overwhelm the business.' },
    { strategyCode: 'OPS.AUTOMATION', strategyName: 'Automation', definition: 'Use software, robotics, or AI to reduce manual work and improve scale.', whenToUse: 'When repeatable processes are large enough to justify automation investment.', whenNotToUse: 'When the process is still changing too quickly to automate well.' },
    { strategyCode: 'OPS.SUPPLY_CHAIN_RESILIENCE', strategyName: 'Supply-Chain Resilience', definition: 'Use redundancy, sourcing diversity, and risk controls to protect continuity.', whenToUse: 'When supplier disruption or concentration risk threatens delivery.', whenNotToUse: 'When resilience overhead would destroy economics in a low-risk environment.' },
    { strategyCode: 'OPS.VERTICAL_INTEGRATION', strategyName: 'Vertical Integration', definition: 'Control upstream or downstream operating steps to improve reliability or economics.', whenToUse: 'When supplier or distribution dependence is a structural weakness.', whenNotToUse: 'When ownership complexity outweighs the control benefit.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'Customer and Market Strategy',
    strategyLevel: 'market',
    relatedFramework: 'Segmentation, targeting, positioning, and value disciplines',
    upstreamIndexes: ['competitive strategy', 'business model'],
    downstreamIndexes: ['customer segment', 'ICP', 'personas', 'channels', 'campaigns', 'sales motion'],
    keyMetrics: ['segment growth', 'conversion rate', 'CAC', 'retention', 'brand preference'],
    sourceName: STRATEGY_SOURCES.hbr.sourceName,
    sourceUrl: 'https://hbr.org/1993/01/customer-intimacy-and-other-value-disciplines',
    sourceType: 'academic',
    evidenceRequired: 'Customer segmentation evidence, ICP definition, channel economics, and positioning proof.',
    exampleUseCase: 'A self-employment plan defines the target customer, positioning, and go-to-market channel instead of treating demand as generic.'
  }, [
    { strategyCode: 'MKT.SEGMENTATION', strategyName: 'Segmentation Strategy', definition: 'Divide the market into meaningful groups with different needs or buying behavior.', whenToUse: 'When the market is too broad to serve well with one undifferentiated approach.', whenNotToUse: 'When the total market is already extremely narrow and obvious.' },
    { strategyCode: 'MKT.TARGETING', strategyName: 'Targeting Strategy', definition: 'Choose which customer segments the business will intentionally pursue.', whenToUse: 'When resources are limited and strategic focus matters.', whenNotToUse: 'When the firm lacks enough insight to prioritize one segment over another.' },
    { strategyCode: 'MKT.POSITIONING', strategyName: 'Positioning Strategy', definition: 'Define how the business wants to be perceived relative to alternatives.', whenToUse: 'When the buyer must understand why this offer is different and worth choosing.', whenNotToUse: 'When the market is purely transactional and undifferentiated.' },
    { strategyCode: 'MKT.BRAND', strategyName: 'Brand Strategy', definition: 'Shape trust, identity, and message consistency around the offer.', whenToUse: 'When purchase decisions depend on trust, reputation, or emotional signal as well as function.', whenNotToUse: 'When the business is not yet clear enough about its core value promise.' },
    { strategyCode: 'MKT.CHANNEL', strategyName: 'Channel Strategy', definition: 'Choose how the offer reaches the customer through direct, partner, distributor, or marketplace channels.', whenToUse: 'When route-to-market economics strongly affect scale and margin.', whenNotToUse: 'When the business has not yet validated the customer value proposition.' },
    { strategyCode: 'MKT.GTM', strategyName: 'Go-to-Market Strategy', definition: 'Coordinate launch, sales motion, and demand generation into a coherent market entry plan.', whenToUse: 'When the offer is ready to be launched or repositioned in the market.', whenNotToUse: 'When the product still lacks basic problem-solution fit.' },
    { strategyCode: 'MKT.CUSTOMER_INTIMACY', strategyName: 'Customer Intimacy', definition: 'Win through relationship depth, customization, and close understanding of the customer.', whenToUse: 'When tailored service and responsiveness drive willingness to pay.', whenNotToUse: 'When the business depends on standardized scale and low cost.' },
    { strategyCode: 'MKT.PRODUCT_LEADERSHIP', strategyName: 'Product Leadership', definition: 'Win through the best product, innovation speed, or premium feature set.', whenToUse: 'When customers reward the leading offer and continual innovation.', whenNotToUse: 'When buyers mostly care about reliability and cost, not innovation.' },
    { strategyCode: 'MKT.OPERATIONAL_EXCELLENCE', strategyName: 'Operational Excellence', definition: 'Win through reliability, convenience, and low delivered cost.', whenToUse: 'When process consistency and low friction are the main value drivers.', whenNotToUse: 'When high-touch customization is what customers value most.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'Sales and Revenue Strategy',
    strategyLevel: 'market',
    relatedFramework: 'Go-to-market and revenue engine design',
    upstreamIndexes: ['go-to-market', 'pricing', 'business model'],
    downstreamIndexes: ['pipeline', 'CAC', 'LTV', 'retention', 'expansion revenue'],
    keyMetrics: ['pipeline coverage', 'CAC payback', 'win rate', 'NRR', 'expansion revenue'],
    sourceName: STRATEGY_SOURCES.maintainer.sourceName,
    sourceUrl: STRATEGY_SOURCES.maintainer.sourceUrl,
    sourceType: STRATEGY_SOURCES.maintainer.sourceType,
    evidenceRequired: 'Sales-cycle assumptions, acquisition channels, conversion metrics, retention logic, and expansion model.',
    exampleUseCase: 'A veteran entrepreneur defines whether the venture will grow through self-serve product, direct sales, channels, or partners.'
  }, [
    { strategyCode: 'REV.ENTERPRISE_SALES', strategyName: 'Enterprise Sales', definition: 'Use a relationship-heavy sales motion for larger accounts with longer buying cycles.', whenToUse: 'When deals are high value and procurement or stakeholder complexity is real.', whenNotToUse: 'When the average contract value cannot support long sales cycles.' },
    { strategyCode: 'REV.SMB_SALES', strategyName: 'SMB Sales', definition: 'Use shorter-cycle selling to many smaller accounts.', whenToUse: 'When volume and faster conversion can produce efficient revenue growth.', whenNotToUse: 'When the offer needs heavy custom selling to close.' },
    { strategyCode: 'REV.PLG', strategyName: 'Product-Led Growth', definition: 'Let the product drive acquisition, activation, and expansion through self-serve usage.', whenToUse: 'When users can discover value quickly without a large sales process.', whenNotToUse: 'When the product requires heavy education or enterprise approval before use.' },
    { strategyCode: 'REV.SALES_LED', strategyName: 'Sales-Led Growth', definition: 'Use direct sales engagement as the main engine of acquisition and expansion.', whenToUse: 'When the sale is consultative or high stakes.', whenNotToUse: 'When the product can scale more efficiently through self-serve use.' },
    { strategyCode: 'REV.CHANNEL_LED', strategyName: 'Channel-Led Growth', definition: 'Grow through resellers, distributors, or indirect go-to-market partners.', whenToUse: 'When partners can reach customers more efficiently than direct selling.', whenNotToUse: 'When partner incentives and economics are too weak to sustain effort.' },
    { strategyCode: 'REV.PARTNER_ECOSYSTEM', strategyName: 'Partner Ecosystem', definition: 'Use alliances, integrations, and co-selling relationships to expand revenue reach.', whenToUse: 'When partners amplify trust, reach, or product value.', whenNotToUse: 'When the company cannot yet support partner success well.' },
    { strategyCode: 'REV.LAND_AND_EXPAND', strategyName: 'Land and Expand', definition: 'Start with a smaller foothold and grow account scope over time.', whenToUse: 'When initial adoption barriers are easier to overcome with a narrow first use case.', whenNotToUse: 'When the offer must be fully adopted upfront to deliver value.' },
    { strategyCode: 'REV.ABM', strategyName: 'Account-Based Marketing', definition: 'Target specific named accounts with coordinated sales and marketing effort.', whenToUse: 'When a small number of high-value accounts matter disproportionately.', whenNotToUse: 'When the business depends on broad-volume acquisition.' },
    { strategyCode: 'REV.COMMUNITY_LED', strategyName: 'Community-Led Growth', definition: 'Use education, advocacy, and community participation to drive acquisition and retention.', whenToUse: 'When trust, peer learning, or practitioner identity strongly influence adoption.', whenNotToUse: 'When the buyer journey is largely transactional and low engagement.' },
    { strategyCode: 'REV.USAGE_EXPANSION', strategyName: 'Usage Expansion', definition: 'Grow revenue by increasing product consumption over time.', whenToUse: 'When usage scales naturally with customer success.', whenNotToUse: 'When higher usage does not correlate with value or margin.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'M&A and Partnership Strategy',
    strategyLevel: 'corporate',
    relatedFramework: 'Build versus buy versus partner decision-making',
    upstreamIndexes: ['corporate strategy', 'capital allocation'],
    downstreamIndexes: ['target screening', 'due diligence', 'synergy model', 'integration plan'],
    keyMetrics: ['deal payback', 'synergy capture', 'integration speed', 'partner contribution'],
    sourceName: STRATEGY_SOURCES.maintainer.sourceName,
    sourceUrl: STRATEGY_SOURCES.maintainer.sourceUrl,
    sourceType: STRATEGY_SOURCES.maintainer.sourceType,
    evidenceRequired: 'Capability gaps, target quality, synergy logic, integration risk, and partner economics.',
    exampleUseCase: 'A veteran-owned business decides whether to build capability internally, partner, or acquire access to customers and expertise.'
  }, [
    { strategyCode: 'MA.HORIZONTAL_ACQUISITION', strategyName: 'Horizontal Acquisition', definition: 'Acquire a competitor operating at the same level of the market.', whenToUse: 'When consolidation can increase scale or remove direct competition.', whenNotToUse: 'When integration distraction outweighs the strategic gain.' },
    { strategyCode: 'MA.VERTICAL_ACQUISITION', strategyName: 'Vertical Acquisition', definition: 'Acquire a supplier or distributor to strengthen value-chain control.', whenToUse: 'When a bottleneck upstream or downstream is strategically costly.', whenNotToUse: 'When ownership adds unnecessary operational complexity.' },
    { strategyCode: 'MA.CONGLOMERATE_ACQUISITION', strategyName: 'Conglomerate Acquisition', definition: 'Acquire an unrelated business for diversification or portfolio reasons.', whenToUse: 'When diversification is a deliberate capital-allocation thesis.', whenNotToUse: 'When management lacks the capacity to govern unrelated operations well.' },
    { strategyCode: 'MA.CAPABILITY_ACQUISITION', strategyName: 'Capability Acquisition', definition: 'Acquire talent, technology, IP, or specialized know-how.', whenToUse: 'When buying capability is faster or more reliable than building it.', whenNotToUse: 'When the needed capability can be built internally with acceptable speed.' },
    { strategyCode: 'MA.MARKET_ENTRY_ACQUISITION', strategyName: 'Market-Entry Acquisition', definition: 'Acquire access to a geography, segment, or installed customer base.', whenToUse: 'When speed to market and existing relationships justify acquisition.', whenNotToUse: 'When cheaper partnership or greenfield entry is available.' },
    { strategyCode: 'PARTNER.STRATEGIC_ALLIANCE', strategyName: 'Strategic Alliance', definition: 'Collaborate with another party without shared ownership.', whenToUse: 'When coordination can unlock value without the burden of integration.', whenNotToUse: 'When incentives are too misaligned for durable cooperation.' },
    { strategyCode: 'PARTNER.JOINT_VENTURE', strategyName: 'Joint Venture', definition: 'Create a jointly owned vehicle to pursue a shared opportunity.', whenToUse: 'When both sides must contribute meaningful assets and shared control is acceptable.', whenNotToUse: 'When governance conflict is likely to overwhelm the opportunity.' },
    { strategyCode: 'PARTNER.LICENSING', strategyName: 'Licensing Partnership', definition: 'Use partnership to share or monetize intellectual property rights.', whenToUse: 'When IP monetization matters more than building the full commercial system directly.', whenNotToUse: 'When direct control of customer experience is essential.' },
    { strategyCode: 'PARTNER.FRANCHISING', strategyName: 'Franchising Partnership', definition: 'Expand through independent operators using a shared brand and system.', whenToUse: 'When replication matters more than centralized ownership.', whenNotToUse: 'When local operators cannot reliably execute the standard.' },
    { strategyCode: 'PARTNER.ECOSYSTEM', strategyName: 'Ecosystem Partnership', definition: 'Coordinate integrations or complements that make the core offer more valuable.', whenToUse: 'When platform or complement effects materially improve adoption.', whenNotToUse: 'When a closed, vertically controlled model is strategically better.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'Turnaround and Restructuring Strategy',
    strategyLevel: 'turnaround',
    relatedFramework: 'Turnaround, liquidity, and restructuring playbook',
    upstreamIndexes: ['corporate strategy', 'risk management'],
    downstreamIndexes: ['liquidity actions', 'cost actions', 'stakeholder map', 'asset plan'],
    keyMetrics: ['cash runway', 'burn rate', 'margin recovery', 'debt service coverage'],
    sourceName: STRATEGY_SOURCES.maintainer.sourceName,
    sourceUrl: STRATEGY_SOURCES.maintainer.sourceUrl,
    sourceType: STRATEGY_SOURCES.maintainer.sourceType,
    evidenceRequired: 'Liquidity profile, debt obligations, unit economics, cost structure, and stakeholder constraints.',
    exampleUseCase: 'A distressed business plan must show why restructuring or refocus is more credible than continuing unchanged.'
  }, [
    { strategyCode: 'TURN.COST_REDUCTION', strategyName: 'Cost Reduction', definition: 'Cut workforce, procurement, or overhead costs to stabilize cash flow.', whenToUse: 'When expense structure is the main threat to survival.', whenNotToUse: 'When cost cutting would destroy the core capability needed to recover.' },
    { strategyCode: 'TURN.ASSET_SALE', strategyName: 'Asset Sale', definition: 'Sell non-core assets to improve liquidity or refocus the business.', whenToUse: 'When trapped capital can be released without crippling the core.', whenNotToUse: 'When assets are essential to future recovery.' },
    { strategyCode: 'TURN.DIVESTITURE', strategyName: 'Divestiture', definition: 'Sell a business unit or line to narrow scope and improve focus.', whenToUse: 'When a non-core line consumes resources without strategic payoff.', whenNotToUse: 'When the divested unit is still critical to strategic differentiation.' },
    { strategyCode: 'TURN.DEBT_RESTRUCTURING', strategyName: 'Debt Restructuring', definition: 'Renegotiate debt terms, maturities, or obligations to relieve pressure.', whenToUse: 'When financing structure, not only operations, is blocking recovery.', whenNotToUse: 'When the core economics are too broken for financial restructuring to matter.' },
    { strategyCode: 'TURN.OPERATING_TURNAROUND', strategyName: 'Operational Turnaround', definition: 'Fix delivery, quality, service, or margin performance at the operating level.', whenToUse: 'When execution breakdowns, not just balance-sheet issues, are causing decline.', whenNotToUse: 'When the business has no viable market even after operational repair.' },
    { strategyCode: 'TURN.STRATEGIC_REFOCUS', strategyName: 'Strategic Refocus', definition: 'Narrow products, markets, or customer types to rebuild a sharper position.', whenToUse: 'When the business is too diffuse and loses money serving low-fit opportunities.', whenNotToUse: 'When the company has already narrowed too far and lacks growth options.' },
    { strategyCode: 'TURN.MANAGEMENT_REPLACEMENT', strategyName: 'Management Replacement', definition: 'Change leadership to restore execution, credibility, or governance discipline.', whenToUse: 'When leadership quality is itself a central root cause of failure.', whenNotToUse: 'When the problem is structural and not meaningfully leadership driven.' },
    { strategyCode: 'TURN.LIQUIDATION', strategyName: 'Liquidation', definition: 'Wind down the business and sell assets because recovery is no longer credible.', whenToUse: 'When ongoing operation destroys more value than an orderly exit.', whenNotToUse: 'When a viable turnaround path still exists.' },
    { strategyCode: 'TURN.BANKRUPTCY_REORG', strategyName: 'Bankruptcy Reorganization', definition: 'Use formal legal restructuring to reset obligations and preserve viable operations.', whenToUse: 'When the business needs court-supervised restructuring to survive.', whenNotToUse: 'When out-of-court solutions remain practical and cheaper.' }
  ]),

  ...buildStrategySet({
    parentFamily: 'Digital, Data, and AI Strategy',
    strategyLevel: 'operating_model',
    relatedFramework: 'Digital transformation and technology-enabled operating-model design',
    upstreamIndexes: ['corporate strategy', 'operating model'],
    downstreamIndexes: ['software architecture', 'data products', 'AI use cases', 'automation roadmap', 'security controls'],
    keyMetrics: ['automation rate', 'digital adoption', 'data quality', 'security posture', 'cloud efficiency'],
    sourceName: STRATEGY_SOURCES.maintainer.sourceName,
    sourceUrl: STRATEGY_SOURCES.maintainer.sourceUrl,
    sourceType: STRATEGY_SOURCES.maintainer.sourceType,
    evidenceRequired: 'Technology roadmap, process redesign, workforce capability plan, data governance, and security controls.',
    exampleUseCase: 'A veteran founder planning a digital service business aligns technology choices with staffing, training, market demand, and cyber risk.'
  }, [
    { strategyCode: 'DIGITAL.DIGITIZATION', strategyName: 'Digitization', definition: 'Convert analog information or workflows into digital form.', whenToUse: 'When manual records or paper-heavy processes are slowing the business.', whenNotToUse: 'When digitization alone will not solve the actual operating problem.' },
    { strategyCode: 'DIGITAL.TRANSFORMATION', strategyName: 'Digital Transformation', definition: 'Redesign the operating model around technology rather than merely digitizing old steps.', whenToUse: 'When the business needs fundamental process or customer-experience change.', whenNotToUse: 'When only small local automation improvements are needed.' },
    { strategyCode: 'DIGITAL.PLATFORM', strategyName: 'Platform Strategy', definition: 'Use APIs, ecosystem design, or shared infrastructure to build scalable digital leverage.', whenToUse: 'When partners, developers, or complements can multiply value.', whenNotToUse: 'When the product does not benefit from ecosystem participation.' },
    { strategyCode: 'DIGITAL.DATA', strategyName: 'Data Strategy', definition: 'Use governance, analytics, and data products to improve decisions or monetization.', whenToUse: 'When data quality and use can materially improve performance or create value.', whenNotToUse: 'When the organization lacks the discipline to manage data responsibly.' },
    { strategyCode: 'DIGITAL.AI', strategyName: 'AI Strategy', definition: 'Use AI for automation, prediction, copilots, personalization, or new digital capabilities.', whenToUse: 'When AI meaningfully improves economics, speed, or customer outcomes.', whenNotToUse: 'When the problem can be solved more reliably with simpler tools.' },
    { strategyCode: 'DIGITAL.CYBERSECURITY', strategyName: 'Cybersecurity Strategy', definition: 'Protect digital operations through resilience, risk control, and security governance.', whenToUse: 'When digital dependence or compliance risk makes cyber resilience a strategic necessity.', whenNotToUse: 'When the topic is being treated as a one-off technical checkbox rather than ongoing strategy.' },
    { strategyCode: 'DIGITAL.CLOUD', strategyName: 'Cloud Strategy', definition: 'Use cloud architecture choices to improve scalability, reliability, and cost control.', whenToUse: 'When infrastructure flexibility or rapid scaling is important.', whenNotToUse: 'When the business lacks the governance to manage cloud complexity or spend.' },
    { strategyCode: 'DIGITAL.OMNICHANNEL', strategyName: 'Omnichannel Strategy', definition: 'Unify digital and physical customer experience across touchpoints.', whenToUse: 'When customers interact through multiple channels and expect continuity.', whenNotToUse: 'When the business only has one meaningful channel.' }
  ])
];

const BUSINESS_STRATEGY_REFERENCE_INDEX_LIBRARY = BUSINESS_STRATEGY_LIBRARY.map((strategy) =>
  buildReferenceIndex({
    namespace: 'BIZ_STRATEGY',
    code: strategy.strategyCode,
    title: strategy.strategyName,
    description: buildDescription([
      strategy.definition,
      strategy.parentFamily ? `Family: ${strategy.parentFamily}.` : '',
      strategy.relatedFramework ? `Framework: ${strategy.relatedFramework}.` : ''
    ]),
    parentCode: strategy.parentFamily,
    hierarchyLevel: 1,
    sourceName: strategy.sourceName,
    officialSourceLink: strategy.sourceUrl,
    version: 'repo_curated_strategy_ontology_v1',
    authorityLevel: 'practitioner',
    refreshFrequency: 'manual review'
  })
);

const BUSINESS_STRATEGY_TARGETS = {
  'Corporate Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'industry_portfolio_evidence_from', confidence: 0.7 },
    { targetNamespace: 'QCEW', targetCode: 'DATASET', relationshipType: 'market_scale_evidence_from', confidence: 0.66 }
  ],
  'Competitive Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'industry_benchmarking_from', confidence: 0.72 },
    { targetNamespace: 'SOC', targetCode: 'DATASET', relationshipType: 'workforce_role_planning_from', confidence: 0.64 },
    { targetNamespace: 'ONET', targetCode: 'DATASET', relationshipType: 'capability_requirement_context', confidence: 0.6 }
  ],
  'Growth Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'industry_expansion_evidence_from', confidence: 0.72 },
    { targetNamespace: 'CBSA', targetCode: 'DATASET', relationshipType: 'geographic_market_selection_from', confidence: 0.68 },
    { targetNamespace: 'FIPS', targetCode: 'DATASET', relationshipType: 'regional_market_granularity_from', confidence: 0.64 },
    { targetNamespace: 'QCEW', targetCode: 'DATASET', relationshipType: 'local_industry_demand_from', confidence: 0.68 }
  ],
  'Portfolio Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'industry_position_evidence_from', confidence: 0.68 },
    { targetNamespace: 'OEWS', targetCode: 'DATASET', relationshipType: 'labor_value_signal_from', confidence: 0.55 },
    { targetNamespace: 'EMP_PROJ', targetCode: 'DATASET', relationshipType: 'growth_signal_from', confidence: 0.66 }
  ],
  'Business Model Strategy': [
    { targetNamespace: 'TRACK', targetCode: 'self_employment', relationshipType: 'vrne_track_relevance', confidence: 0.9 },
    { targetNamespace: 'CFR', targetCode: '21.257', relationshipType: 'self_employment_authority_context', confidence: 0.92 },
    { targetNamespace: 'CFR', targetCode: '21.258', relationshipType: 'self_employment_cost_authority_context', confidence: 0.9 },
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'industry_model_evidence_from', confidence: 0.78 },
    { targetNamespace: 'SAM', targetCode: 'DATASET', relationshipType: 'entity_registration_context', confidence: 0.58 },
    { targetNamespace: 'CAGE', targetCode: 'DATASET', relationshipType: 'contractor_identity_context', confidence: 0.5 },
    { targetNamespace: 'PSC', targetCode: 'DATASET', relationshipType: 'federal_procurement_alignment', confidence: 0.52 }
  ],
  'Pricing Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'pricing_benchmark_context', confidence: 0.66 },
    { targetNamespace: 'QCEW', targetCode: 'DATASET', relationshipType: 'regional_market_wage_context', confidence: 0.54 }
  ],
  'Market Creation Strategy': [
    { targetNamespace: 'TRACK', targetCode: 'self_employment', relationshipType: 'venture_creation_relevance', confidence: 0.84 },
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'category_market_context', confidence: 0.66 },
    { targetNamespace: 'CBSA', targetCode: 'DATASET', relationshipType: 'regional_demand_context', confidence: 0.62 }
  ],
  'Innovation Strategy': [
    { targetNamespace: 'TRACK', targetCode: 'self_employment', relationshipType: 'venture_experimentation_relevance', confidence: 0.86 },
    { targetNamespace: 'CFR', targetCode: '21.257', relationshipType: 'feasibility_plan_authority_context', confidence: 0.88 },
    { targetNamespace: 'SOC', targetCode: 'DATASET', relationshipType: 'workforce_capability_alignment', confidence: 0.64 },
    { targetNamespace: 'ONET', targetCode: 'DATASET', relationshipType: 'job_demand_alignment', confidence: 0.6 },
    { targetNamespace: 'CIP', targetCode: 'DATASET', relationshipType: 'training_requirement_alignment', confidence: 0.66 }
  ],
  'International Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'industry_entry_context', confidence: 0.64 },
    { targetNamespace: 'SAM', targetCode: 'DATASET', relationshipType: 'federal_vendor_context', confidence: 0.54 },
    { targetNamespace: 'CAGE', targetCode: 'DATASET', relationshipType: 'contractor_context', confidence: 0.5 },
    { targetNamespace: 'PSC', targetCode: 'DATASET', relationshipType: 'procurement_context', confidence: 0.5 }
  ],
  'Operations Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'operating_benchmark_context', confidence: 0.68 },
    { targetNamespace: 'QCEW', targetCode: 'DATASET', relationshipType: 'regional_operations_context', confidence: 0.6 },
    { targetNamespace: 'SOC', targetCode: 'DATASET', relationshipType: 'workforce_design_context', confidence: 0.62 },
    { targetNamespace: 'ONET', targetCode: 'DATASET', relationshipType: 'work_design_context', confidence: 0.58 }
  ],
  'Customer and Market Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'market_structure_context', confidence: 0.64 },
    { targetNamespace: 'CBSA', targetCode: 'DATASET', relationshipType: 'local_customer_market_context', confidence: 0.66 },
    { targetNamespace: 'FIPS', targetCode: 'DATASET', relationshipType: 'local_targeting_context', confidence: 0.62 }
  ],
  'Sales and Revenue Strategy': [
    { targetNamespace: 'TRACK', targetCode: 'self_employment', relationshipType: 'venture_revenue_model_relevance', confidence: 0.82 },
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'channel_benchmark_context', confidence: 0.6 },
    { targetNamespace: 'CBSA', targetCode: 'DATASET', relationshipType: 'territory_design_context', confidence: 0.56 },
    { targetNamespace: 'SOC', targetCode: 'DATASET', relationshipType: 'sales_role_planning_context', confidence: 0.52 }
  ],
  'M&A and Partnership Strategy': [
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'target_market_context', confidence: 0.6 },
    { targetNamespace: 'SAM', targetCode: 'DATASET', relationshipType: 'partner_vendor_context', confidence: 0.58 },
    { targetNamespace: 'CAGE', targetCode: 'DATASET', relationshipType: 'contractor_partner_context', confidence: 0.52 },
    { targetNamespace: 'PSC', targetCode: 'DATASET', relationshipType: 'procurement_partner_context', confidence: 0.5 }
  ],
  'Turnaround and Restructuring Strategy': [
    { targetNamespace: 'QCEW', targetCode: 'DATASET', relationshipType: 'regional_industry_health_context', confidence: 0.62 },
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'industry_viability_context', confidence: 0.64 }
  ],
  'Digital, Data, and AI Strategy': [
    { targetNamespace: 'TRACK', targetCode: 'self_employment', relationshipType: 'digital_venture_relevance', confidence: 0.84 },
    { targetNamespace: 'SOC', targetCode: 'DATASET', relationshipType: 'digital_workforce_context', confidence: 0.7 },
    { targetNamespace: 'ONET', targetCode: 'DATASET', relationshipType: 'digital_task_context', confidence: 0.66 },
    { targetNamespace: 'CIP', targetCode: 'DATASET', relationshipType: 'digital_training_context', confidence: 0.7 },
    { targetNamespace: 'NAICS', targetCode: 'DATASET', relationshipType: 'digital_industry_context', confidence: 0.64 }
  ]
};

const BUSINESS_STRATEGY_CROSSWALK_LIBRARY = BUSINESS_STRATEGY_LIBRARY.flatMap((strategy) =>
  (BUSINESS_STRATEGY_TARGETS[strategy.parentFamily] || []).map((target) =>
    buildReferenceCrosswalk({
      sourceNamespace: 'BIZ_STRATEGY',
      sourceCode: strategy.strategyCode,
      targetNamespace: target.targetNamespace,
      targetCode: target.targetCode,
      relationshipType: target.relationshipType,
      confidence: target.confidence,
      sourceLink: strategy.sourceUrl || REFERENCE_NAMESPACE_METADATA.BIZ_STRATEGY.officialSourceLink,
      version: 'repo_curated_strategy_ontology_v1'
    })
  )
);

const STARTER_AUTHORITY_INDEX_LIBRARY = [
  buildReferenceIndex({
    namespace: 'USC',
    code: 'CH31',
    title: '38 U.S.C. Chapter 31',
    description: 'Binding Chapter 31 statutory framework for rehabilitation and training.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.1',
    title: '38 C.F.R. 21.1 Purpose',
    description: 'Binding purpose provision for Chapter 31 services and independence-to-employment outcomes.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.35',
    title: '38 C.F.R. 21.35 Definitions',
    description: 'Binding definitions section covering core Chapter 31 terms used throughout entitlement and plan analysis.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.40',
    title: '38 C.F.R. 21.40 Basic Entitlement',
    description: 'Binding entitlement rule used to evaluate threshold Chapter 31 eligibility.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.50',
    title: '38 C.F.R. 21.50 Initial Evaluation',
    description: 'Binding evaluation rule for the initial VR&E assessment and planning process.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.51',
    title: '38 C.F.R. 21.51 Employment Handicap',
    description: 'Binding employment-handicap rule used in entitlement disputes and evaluation logic.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.52',
    title: '38 C.F.R. 21.52 Serious Employment Handicap',
    description: 'Binding serious-employment-handicap rule used in extended training and extension disputes.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.53',
    title: '38 C.F.R. 21.53 Feasibility',
    description: 'Binding feasibility standard used when VA questions whether a vocational goal can currently be achieved.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.57',
    title: '38 C.F.R. 21.57 Extended Evaluation',
    description: 'Binding extended-evaluation rule for cases where feasibility cannot yet be determined.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.70',
    title: '38 C.F.R. 21.70 Vocational Rehabilitation Program',
    description: 'Binding program-structure rule for Chapter 31 rehabilitation planning.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.78',
    title: '38 C.F.R. 21.78 48-Month Limitation / Extensions',
    description: 'Binding time-limit and extension rule relevant to month-counter and extension disputes.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.80-21.98',
    title: '38 C.F.R. 21.80-21.98 Rehabilitation Plan Rules',
    description: 'Binding plan and IPE rule cluster for plan creation, amendments, and service disputes.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.160+',
    title: '38 C.F.R. 21.160+ Case Status and Closure',
    description: 'Binding case-status, interruption, discontinuance, and closure rule cluster.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.210+',
    title: '38 C.F.R. 21.210+ Supplies',
    description: 'Binding supplies and equipment rule cluster for books, laptops, software, and related materials.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.257',
    title: '38 C.F.R. 21.257 Approval of Self-Employment as a Vocational Goal',
    description: 'Binding self-employment rule covering suitability, feasibility analysis, market analysis, financing review, and business-plan training needs.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.258',
    title: '38 C.F.R. 21.258 Cost Limitations on Approval of Self-Employment Plans',
    description: 'Binding cost-threshold rule for self-employment plan approval and higher-level VR&E review.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'CFR',
    code: '21.260+',
    title: '38 C.F.R. 21.260+ Subsistence Allowance',
    description: 'Binding subsistence and payment rule cluster used in rate and allowance analysis.',
    hierarchyLevel: 1
  }),
  buildReferenceIndex({
    namespace: 'M28C',
    code: 'M28C.I.A.1',
    title: 'M28C Veteran Readiness and Employment Manual',
    description: 'VA manual landing point for counselor procedure and workflow expectations.',
    hierarchyLevel: 1
  })
];

const DATASET_REFERENCE_INDEX_LIBRARY = Object.entries(REFERENCE_NAMESPACE_METADATA).map(([namespace, metadata]) =>
  buildReferenceIndex({
    namespace,
    code: 'DATASET',
    title: metadata.title,
    description: metadata.description,
    hierarchyLevel: 0,
    sourceName: metadata.sourceName,
    officialSourceLink: metadata.officialSourceLink,
    version: metadata.version,
    authorityLevel: metadata.authorityLevel,
    refreshFrequency: metadata.refreshFrequency
  })
);

const TRACK_REFERENCE_INDEX_LIBRARY = VRNE_TRACK_LIBRARY.map((track) =>
  buildReferenceIndex({
    namespace: 'TRACK',
    code: track.id,
    title: track.title,
    description: track.summary,
    hierarchyLevel: 1
  })
);

const REVIEW_LANE_REFERENCE_INDEX_LIBRARY = REVIEW_LANE_LIBRARY.map((lane) =>
  buildReferenceIndex({
    namespace: 'REVIEW_LANE',
    code: lane.code,
    title: lane.title,
    description: lane.description,
    hierarchyLevel: 1
  })
);

const TRAINING_REFERENCE_INDEX_LIBRARY = TRAINING_PROGRAM_LIBRARY.map((program) =>
  buildReferenceIndex({
    namespace: 'CIP',
    code: program.cipCode,
    title: program.title,
    description: buildDescription([
      `Repo-curated starter training record for CIP ${program.cipCode}.`,
      program.credentialLevel ? `Credential level: ${program.credentialLevel}.` : '',
      program.programLengthHint ? `Program length: ${program.programLengthHint}.` : '',
      program.certificationFocus ? `Focus: ${program.certificationFocus}.` : ''
    ]),
    hierarchyLevel: 1,
    version: 'repo_curated_training_seed'
  })
);

const OCCUPATION_REFERENCE_INDEX_LIBRARY = OCCUPATION_PROFILE_LIBRARY.flatMap((occupation) => ([
  buildReferenceIndex({
    namespace: 'SOC',
    code: occupation.socCode,
    title: occupation.title,
    description: buildDescription([
      `Repo-curated starter occupation anchor aligned to SOC for ${occupation.title}.`,
      occupation.educationLevel ? `Typical education: ${occupation.educationLevel}.` : '',
      occupation.physicalDemand ? `Physical demand: ${occupation.physicalDemand}.` : ''
    ]),
    hierarchyLevel: 1,
    version: 'repo_curated_occupation_seed'
  }),
  buildReferenceIndex({
    namespace: 'ONET',
    code: occupation.onetSocCode,
    title: occupation.title,
    description: buildDescription([
      `Repo-curated starter O*NET profile alignment for ${occupation.title}.`,
      occupation.dutiesText ? `Duties: ${occupation.dutiesText}` : ''
    ]),
    hierarchyLevel: 1,
    version: 'repo_curated_occupation_seed'
  })
]));

const INDUSTRY_REFERENCE_INDEX_LIBRARY = INDUSTRY_PROFILE_LIBRARY.map((industry) =>
  buildReferenceIndex({
    namespace: 'NAICS',
    code: industry.naicsCode,
    title: industry.title,
    description: buildDescription([
      `Repo-curated starter industry alignment for NAICS ${industry.naicsCode}.`,
      industry.summary
    ]),
    hierarchyLevel: 1,
    version: 'repo_curated_industry_seed'
  })
);

const FORM_REFERENCE_INDEX_LIBRARY = FORM_LIBRARY
  .filter((form) => /^VA Form\s+/i.test(form.formNumber) && form.sourceUrl)
  .map((form) =>
    buildReferenceIndex({
      namespace: 'FORM',
      code: normalizeFormCode(form.formNumber, form.id),
      title: form.title,
      description: buildDescription([
        `Official ${form.formNumber}.`,
        form.whenToUse ? `Use when: ${form.whenToUse}` : '',
        form.categoryLabel ? `Category: ${form.categoryLabel}.` : ''
      ]),
      hierarchyLevel: 1,
      officialSourceLink: form.sourceUrl,
      version: form.revisionDate || 'current'
    })
  );

const SCHOOL_REFERENCE_INDEX_LIBRARY = SCHOOLS_DATABASE.flatMap((school) => {
  const rows = [];

  if (school.opeCode) {
    rows.push(buildReferenceIndex({
      namespace: 'OPEID',
      code: school.opeCode,
      title: school.name,
      description: buildDescription([
        `Repo-curated starter school identity record for ${school.name} in ${school.city}, ${school.state}.`,
        school.institutionOwnership ? `Control: ${school.institutionOwnership}.` : ''
      ]),
      hierarchyLevel: 1,
      version: 'repo_curated_school_seed'
    }));
  }

  if (school.facilityCode) {
    rows.push(buildReferenceIndex({
      namespace: 'WEAMS',
      code: school.facilityCode,
      title: school.name,
      description: buildDescription([
        `Repo-curated starter VA facility-code record for ${school.name} in ${school.city}, ${school.state}.`,
        school.priorityEnrollment ? 'Priority enrollment supported.' : '',
        school.yellowRibbon ? 'Yellow Ribbon supported.' : ''
      ]),
      hierarchyLevel: 1,
      version: 'repo_curated_school_seed'
    }));
  }

  return rows;
});

export const REFERENCE_INDEX_LIBRARY = dedupeById([
  ...DATASET_REFERENCE_INDEX_LIBRARY,
  ...STARTER_AUTHORITY_INDEX_LIBRARY,
  ...TRACK_REFERENCE_INDEX_LIBRARY,
  ...REVIEW_LANE_REFERENCE_INDEX_LIBRARY,
  ...BUSINESS_STRATEGY_REFERENCE_INDEX_LIBRARY,
  ...TRAINING_REFERENCE_INDEX_LIBRARY,
  ...OCCUPATION_REFERENCE_INDEX_LIBRARY,
  ...INDUSTRY_REFERENCE_INDEX_LIBRARY,
  ...FORM_REFERENCE_INDEX_LIBRARY,
  ...SCHOOL_REFERENCE_INDEX_LIBRARY
]);

const REVIEW_LANE_FORM_CROSSWALKS = [
  {
    sourceCode: 'higher_level_review',
    targetCode: '20-0996',
    relationshipType: 'filed_on',
    confidence: 0.98
  },
  {
    sourceCode: 'supplemental_claim',
    targetCode: '20-0995',
    relationshipType: 'filed_on',
    confidence: 0.98
  },
  {
    sourceCode: 'board_appeal',
    targetCode: '10182',
    relationshipType: 'filed_on',
    confidence: 0.98
  }
];

export const REFERENCE_CROSSWALK_LIBRARY = dedupeById([
  ...BUSINESS_STRATEGY_CROSSWALK_LIBRARY,
  ...CIP_SOC_CROSSWALK_LIBRARY.map((crosswalk) =>
    buildReferenceCrosswalk({
      sourceNamespace: 'CIP',
      sourceCode: crosswalk.cipCode,
      targetNamespace: 'SOC',
      targetCode: crosswalk.socCode,
      relationshipType: 'training_program_aligns_to_occupation',
      confidence: 0.95,
      sourceLink: REFERENCE_NAMESPACE_METADATA.CIP_SOC.officialSourceLink,
      version: REFERENCE_NAMESPACE_METADATA.CIP_SOC.version
    })
  ),
  ...OCCUPATION_PROFILE_LIBRARY.map((occupation) =>
    buildReferenceCrosswalk({
      sourceNamespace: 'SOC',
      sourceCode: occupation.socCode,
      targetNamespace: 'ONET',
      targetCode: occupation.onetSocCode,
      relationshipType: 'occupational_profile',
      confidence: 0.95,
      sourceLink: REFERENCE_NAMESPACE_METADATA.ONET.officialSourceLink,
      version: REFERENCE_NAMESPACE_METADATA.ONET.version
    })
  ),
  ...OCCUPATION_PROFILE_LIBRARY.map((occupation) =>
    buildReferenceCrosswalk({
      sourceNamespace: 'SOC',
      sourceCode: occupation.socCode,
      targetNamespace: 'NAICS',
      targetCode: occupation.naicsCode,
      relationshipType: 'starter_market_alignment',
      confidence: 0.6,
      sourceLink: 'https://www.census.gov/topics/employment/industry-occupation/guidance/code-lists.html',
      version: 'repo_curated_alignment_v1'
    })
  ),
  ...SCHOOLS_DATABASE
    .filter((school) => school.opeCode && school.facilityCode)
    .map((school) =>
      buildReferenceCrosswalk({
        sourceNamespace: 'OPEID',
        sourceCode: school.opeCode,
        targetNamespace: 'WEAMS',
        targetCode: school.facilityCode,
        relationshipType: 'institution_approval_match',
        confidence: 0.75,
        sourceLink: REFERENCE_NAMESPACE_METADATA.WEAMS.officialSourceLink,
        version: 'repo_curated_school_seed'
      })
    ),
  ...REVIEW_LANE_FORM_CROSSWALKS.map((crosswalk) =>
    buildReferenceCrosswalk({
      sourceNamespace: 'REVIEW_LANE',
      sourceCode: crosswalk.sourceCode,
      targetNamespace: 'FORM',
      targetCode: crosswalk.targetCode,
      relationshipType: crosswalk.relationshipType,
      confidence: crosswalk.confidence,
      sourceLink: REFERENCE_NAMESPACE_METADATA.REVIEW_LANE.officialSourceLink,
      version: 'repo_curated_review_lane_seed'
    })
  )
]);

function seedRows(db, sql, rows, mapper) {
  const statement = db.prepare(sql);
  rows.forEach((row) => {
    statement.run(mapper(row));
  });
  statement.finalize();
}

export function seedReferenceCatalog(db) {
  seedRows(db, `
    INSERT INTO reference_indexes (
      id,
      namespace,
      code,
      title,
      description,
      parent_code,
      hierarchy_level,
      effective_date,
      retired_date,
      source_name,
      official_source_link,
      last_checked_at,
      version,
      authority_level,
      refresh_frequency,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(namespace, code) DO UPDATE SET
      id = excluded.id,
      title = excluded.title,
      description = excluded.description,
      parent_code = excluded.parent_code,
      hierarchy_level = excluded.hierarchy_level,
      effective_date = excluded.effective_date,
      retired_date = excluded.retired_date,
      source_name = excluded.source_name,
      official_source_link = excluded.official_source_link,
      last_checked_at = excluded.last_checked_at,
      version = excluded.version,
      authority_level = excluded.authority_level,
      refresh_frequency = excluded.refresh_frequency,
      updated_at = CURRENT_TIMESTAMP
  `, REFERENCE_INDEX_LIBRARY, (indexRecord) => [
    indexRecord.id,
    indexRecord.namespace,
    indexRecord.code,
    indexRecord.title,
    indexRecord.description,
    indexRecord.parentCode,
    indexRecord.hierarchyLevel,
    indexRecord.effectiveDate,
    indexRecord.retiredDate,
    indexRecord.sourceName,
    indexRecord.officialSourceLink,
    indexRecord.lastCheckedAt,
    indexRecord.version,
    indexRecord.authorityLevel,
    indexRecord.refreshFrequency
  ]);

  seedRows(db, `
    INSERT INTO reference_crosswalks (
      id,
      source_namespace,
      source_code,
      target_namespace,
      target_code,
      relationship_type,
      confidence,
      source_link,
      version,
      last_checked_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(source_namespace, source_code, target_namespace, target_code, relationship_type) DO UPDATE SET
      id = excluded.id,
      confidence = excluded.confidence,
      source_link = excluded.source_link,
      version = excluded.version,
      last_checked_at = excluded.last_checked_at,
      updated_at = CURRENT_TIMESTAMP
  `, REFERENCE_CROSSWALK_LIBRARY, (crosswalk) => [
    crosswalk.id,
    crosswalk.sourceNamespace,
    crosswalk.sourceCode,
    crosswalk.targetNamespace,
    crosswalk.targetCode,
    crosswalk.relationshipType,
    crosswalk.confidence,
    crosswalk.sourceLink,
    crosswalk.version,
    crosswalk.lastCheckedAt
  ]);

  seedRows(db, `
    INSERT INTO business_strategy_index (
      id,
      strategy_code,
      strategy_name,
      parent_family,
      strategy_level,
      definition,
      when_to_use,
      when_not_to_use,
      related_framework,
      upstream_indexes,
      downstream_indexes,
      key_metrics,
      source_name,
      source_url,
      source_type,
      evidence_required,
      example_use_case,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(strategy_code) DO UPDATE SET
      id = excluded.id,
      strategy_name = excluded.strategy_name,
      parent_family = excluded.parent_family,
      strategy_level = excluded.strategy_level,
      definition = excluded.definition,
      when_to_use = excluded.when_to_use,
      when_not_to_use = excluded.when_not_to_use,
      related_framework = excluded.related_framework,
      upstream_indexes = excluded.upstream_indexes,
      downstream_indexes = excluded.downstream_indexes,
      key_metrics = excluded.key_metrics,
      source_name = excluded.source_name,
      source_url = excluded.source_url,
      source_type = excluded.source_type,
      evidence_required = excluded.evidence_required,
      example_use_case = excluded.example_use_case,
      updated_at = CURRENT_TIMESTAMP
  `, BUSINESS_STRATEGY_LIBRARY, (strategy) => [
    strategy.id,
    strategy.strategyCode,
    strategy.strategyName,
    strategy.parentFamily,
    strategy.strategyLevel,
    strategy.definition,
    strategy.whenToUse,
    strategy.whenNotToUse,
    strategy.relatedFramework,
    JSON.stringify(strategy.upstreamIndexes),
    JSON.stringify(strategy.downstreamIndexes),
    JSON.stringify(strategy.keyMetrics),
    strategy.sourceName,
    strategy.sourceUrl,
    strategy.sourceType,
    strategy.evidenceRequired,
    strategy.exampleUseCase
  ]);

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

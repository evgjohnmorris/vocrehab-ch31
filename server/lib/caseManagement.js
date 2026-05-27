import { randomUUID } from 'node:crypto';

export const CASE_STAGE_OPTIONS = [
  'Not Applied',
  'Applied, Waiting Appointment',
  'Evaluation Phase',
  'Entitled, No IPE',
  'IPE Signed',
  'In School / Training',
  'Employment Services',
  'Interrupted Status',
  'Discontinued Status',
  'Rehabilitated',
  'Independent Living',
  'Appeal Pending'
];

export const CASE_TRACK_OPTIONS = [
  'reemployment',
  'rapid_employment',
  'self_employment',
  'long_term',
  'independent_living'
];

export const CASE_TRACK_LABELS = {
  reemployment: 'Reemployment',
  rapid_employment: 'Rapid Access to Employment',
  self_employment: 'Self-Employment',
  long_term: 'Employment Through Long-Term Services',
  independent_living: 'Independent Living'
};

export const IPE_STATUS_OPTIONS = [
  'not_started',
  'under_review',
  'draft_in_progress',
  'signed',
  'amendment_requested',
  'amendment_denied',
  'interrupted',
  'discontinued',
  'rehabilitated'
];

export const CASE_STORAGE_GUIDANCE = {
  headline: 'Store only the minimum case facts needed for planning and escalation.',
  warning: 'Do not store SSNs, VA file numbers, medical record numbers, or raw C-File documents unless the backend is hardened and access-controlled.',
  recommendedFields: [
    'case stage',
    'issue type',
    'regional office',
    'school or program',
    'deadline dates',
    'communication history',
    'generated advocacy letters'
  ]
};

const LAST_REVIEWED_AT = '2026-05-27';
const MAX_SHORT_TEXT_LENGTH = 160;
const MAX_TEXT_LENGTH = 500;
const MAX_LONG_TEXT_LENGTH = 4000;
const MAX_CASE_ITEMS = 50;

function textField(name, label, placeholder) {
  return {
    name,
    label,
    type: 'text',
    placeholder
  };
}

function numberField(name, label, placeholder) {
  return {
    name,
    label,
    type: 'number',
    placeholder
  };
}

function selectField(name, label, options) {
  return {
    name,
    label,
    type: 'select',
    options
  };
}

function createIssueDefinition(overrides) {
  const issue = {
    workflowId: overrides.workflowId,
    title: overrides.title,
    desc: overrides.desc,
    category: overrides.category || 'case_management',
    track: overrides.track || 'long_term',
    trackLabel: CASE_TRACK_LABELS[overrides.track || 'long_term'],
    riskLevel: overrides.riskLevel || 'medium',
    dashboardEnabled: Boolean(overrides.dashboardEnabled),
    caseStages: overrides.caseStages || CASE_STAGE_OPTIONS.slice(1, 9),
    authorityIds: overrides.authorityIds || [],
    citations: overrides.citations || overrides.authorityIds || [],
    steps: overrides.steps || [
      {
        title: 'Collected Facts',
        fields: [
          textField('decisionDate', 'Relevant Decision or Delay Date', 'e.g. May 15, 2026'),
          textField('summary', 'Short Problem Summary', 'Describe what the VR&E office did or failed to do')
        ]
      }
    ],
    errors: overrides.errors || [],
    templates: overrides.templates || [],
    reviewLaneWarning: Boolean(overrides.reviewLaneWarning),
    evidenceChecklist: overrides.evidenceChecklist || [],
    deadlineRules: overrides.deadlineRules || [],
    escalationOptions: overrides.escalationOptions || [],
    lastReviewedAt: overrides.lastReviewedAt || LAST_REVIEWED_AT,
    sourceStatus: overrides.sourceStatus || 'maintainer_verified',
    contentVersion: overrides.contentVersion || 1
  };

  return issue;
}

const CASE_ISSUE_TAXONOMY = [
  createIssueDefinition({
    workflowId: 'counselor-delay',
    title: 'Counselor Nonresponse',
    desc: "Your VRC hasn't answered your email, eVA, or phone calls for weeks.",
    dashboardEnabled: true,
    riskLevel: 'medium',
    track: 'long_term',
    caseStages: [
      'Applied, Waiting Appointment',
      'Evaluation Phase',
      'Entitled, No IPE',
      'IPE Signed',
      'In School / Training',
      'Employment Services'
    ],
    authorityIds: ['38-usc-3115', '38-cfr-21-33'],
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          textField('vrcName', "Counselor's Name", 'e.g. John Doe'),
          textField('lastContactDate', 'Date of Last Response', 'e.g. April 12, 2026'),
          numberField('followUpCount', 'Number of Follow-up Attempts', 'e.g. 3'),
          selectField('contactMethod', 'Primary Contact Method Used', ['eVA Portal', 'Email', 'Phone Call', 'Certified Mail'])
        ]
      }
    ],
    errors: [
      "Failure to maintain contact can undermine the counselor's duty to assist and active case development.",
      'Repeated nonresponse can block orientation, authorizations, plan amendments, and payment approvals.'
    ],
    templates: ['counselor-escalation'],
    evidenceChecklist: [
      { id: 'email_stamps', text: 'Sent emails or portal messages with timestamps proving outreach attempts', weight: 40 },
      { id: 'contact_timeline', text: 'Written communication log listing date, method, and lack of reply', weight: 40 },
      { id: 'school_delay_impact', text: 'School or vendor notice showing the delay is causing harm', weight: 20 }
    ],
    deadlineRules: [
      { id: 'follow_up_5_days', label: 'Follow up if no response within 5 business days', trigger: 'no_response', targetDays: 5 },
      { id: 'supervisory_14_days', label: 'Escalate to VREO if no response within 14 days', trigger: 'continued_nonresponse', targetDays: 14 }
    ],
    escalationOptions: [
      'Send a written supervisory escalation to the VR&E Officer.',
      'Attach the contact log and any school or payment impact letter.',
      'Request a formal written decision if delay is masking a denial.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'supplies-denial',
    title: 'Supplies / Laptop Denial',
    desc: 'VR&E refused or stalled the laptop, software, ergonomic, or required supplies package.',
    dashboardEnabled: true,
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Entitled, No IPE', 'IPE Signed', 'In School / Training', 'Employment Services'],
    authorityIds: ['38-usc-3104', '38-cfr-21-212'],
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          textField('requestedItem', 'Requested Item or Package', 'e.g. Laptop, software, desk setup'),
          textField('courseOrProgram', 'School Program / Training Goal', 'e.g. Cybersecurity B.S.'),
          textField('reasonGiven', 'Reason Given by VR&E', 'e.g. School should provide it'),
          textField('quoteAmount', 'Approximate Cost / Quote', 'e.g. $1,850')
        ]
      }
    ],
    errors: [
      'VR&E sometimes reframes required supplies as optional consumer items without analyzing rehabilitation necessity.',
      'Denials often ignore curriculum, remote-learning requirements, accommodation needs, or the IPE training plan.'
    ],
    templates: ['supplies-request'],
    evidenceChecklist: [
      { id: 'course_syllabus', text: 'Syllabus or course requirement proving the item is needed', weight: 35 },
      { id: 'school_requirement', text: 'School or instructor statement confirming the requirement', weight: 30 },
      { id: 'vendor_quote', text: 'Current vendor quote or itemized estimate', weight: 20 },
      { id: 'medical_accommodation', text: 'Medical or ergonomic justification if accommodations are involved', weight: 15 }
    ],
    deadlineRules: [
      { id: 'term_start', label: 'Resolve before classes begin or before assignment deadlines', trigger: 'term_access', targetDays: 7 }
    ],
    escalationOptions: [
      'Request a written necessity determination tied to the IPE and curriculum.',
      'Escalate immediately if delay will prevent course participation.',
      'Preserve the denial for written-decision review if the counselor refuses to issue in writing.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'tuition-unpaid',
    title: 'Tuition or Books Not Paid',
    desc: 'Your school is unpaid, your account is on hold, or books and fees were not authorized on time.',
    dashboardEnabled: true,
    riskLevel: 'critical',
    track: 'long_term',
    caseStages: ['IPE Signed', 'In School / Training'],
    authorityIds: ['38-usc-3104', '38-cfr-21-420'],
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          textField('schoolName', 'School Name', 'e.g. University of Pittsburgh'),
          textField('termStart', 'Term or Billing Date', 'e.g. August 26, 2026'),
          textField('amountDue', 'Outstanding Balance', 'e.g. $4,920'),
          textField('accountHold', 'Consequence / Hold', 'e.g. Registration hold, drop risk')
        ]
      }
    ],
    errors: [
      'Payment delays can derail an approved rehabilitation plan even when entitlement and authorization are already established.',
      'Schools often need fast documentation to stop drops, holds, or late fees.'
    ],
    templates: ['tuition-delay-escalation'],
    evidenceChecklist: [
      { id: 'invoice', text: 'School invoice, statement, or unpaid balance notice', weight: 35 },
      { id: 'term_dates', text: 'School term start date or deadline documentation', weight: 25 },
      { id: 'authorization_gap', text: 'Evidence that the authorization was delayed or missing', weight: 20 },
      { id: 'late_fee_risk', text: 'Late fee, hold, or drop warning from the school', weight: 20 }
    ],
    deadlineRules: [
      { id: 'school_hold', label: 'Escalate before school hold or drop deadline', trigger: 'school_balance', targetDays: 3 }
    ],
    escalationOptions: [
      'Send a school payment escalation immediately with invoices attached.',
      'Notify the SCO or bursar that VR&E payment is pending and request a temporary hold release.',
      'Ask for a written decision if the office is refusing to authorize covered costs.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'case-closed',
    title: 'Interrupted / Discontinued Case',
    desc: 'VR&E changed your case status, closed the case, or is pushing you out of the program.',
    dashboardEnabled: true,
    riskLevel: 'critical',
    track: 'long_term',
    caseStages: ['Interrupted Status', 'Discontinued Status', 'Appeal Pending', 'Employment Services'],
    authorityIds: ['38-cfr-21-197', '38-cfr-21-198'],
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          textField('statusChangeDate', 'Status Change Date', 'e.g. May 2, 2026'),
          textField('statusReason', 'Reason Given by VR&E', 'e.g. Unsatisfactory conduct'),
          textField('lastSuccessfulAction', 'Last Positive Case Action', 'e.g. Passing grades, internship approval'),
          textField('harmIfClosed', 'Immediate Harm if Case Remains Closed', 'e.g. Cannot continue semester')
        ]
      }
    ],
    errors: [
      'Interrupted and discontinued statuses require due process and documented reasons.',
      'Case closure decisions are often vulnerable when the record omits evidence, ignores mitigating circumstances, or lacks clear notice.'
    ],
    templates: ['discontinuance-rebuttal'],
    evidenceChecklist: [
      { id: 'status_letter', text: 'Written interruption, discontinuance, or closure notice', weight: 30 },
      { id: 'performance_records', text: 'Grades, attendance, or participation records contradicting the closure basis', weight: 30 },
      { id: 'mitigating_evidence', text: 'Medical or hardship records explaining interruptions', weight: 20 },
      { id: 'communication_history', text: 'Messages proving you attempted to cure the issue or respond', weight: 20 }
    ],
    deadlineRules: [
      { id: 'notice_review_year', label: 'Preserve one-year review rights from written notice date', trigger: 'formal_notice', targetDays: 365 }
    ],
    escalationOptions: [
      'Demand the written decision and review rights if they were not provided.',
      'File a rebuttal explaining why closure is factually or legally defective.',
      'Prepare HLR or Supplemental Claim strategy once a formal notice exists.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'feasibility-denial',
    title: 'Feasibility Denial',
    desc: 'VR&E says your disabilities make the proposed goal not reasonably feasible.',
    dashboardEnabled: true,
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Evaluation Phase', 'Entitled, No IPE', 'Appeal Pending'],
    authorityIds: ['38-usc-3106', '38-cfr-21-53'],
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          textField('goalDenied', 'Denied Goal', 'e.g. Information Security Analyst'),
          textField('limitationsAtIssue', 'Limitations VR&E Relied On', 'e.g. Standing tolerance, PTSD symptoms'),
          textField('supportingProvider', 'Supporting Provider or Evaluator', 'e.g. Treating therapist'),
          textField('contraryEvidence', 'Evidence Showing Feasibility', 'e.g. Prior success, accommodations')
        ]
      }
    ],
    errors: [
      'Feasibility denials often overstate limitations while ignoring accommodations and transferable strengths.',
      'A denial is weaker when the record lacks a full vocational analysis or fails to compare realistic alternatives.'
    ],
    templates: ['feasibility-rebuttal'],
    evidenceChecklist: [
      { id: 'medical_support', text: 'Provider statement supporting the goal with accommodations', weight: 30 },
      { id: 'vocational_history', text: 'Education, work history, or certifications showing progress toward the goal', weight: 25 },
      { id: 'accommodation_plan', text: 'Accommodation strategy explaining how barriers can be reduced', weight: 25 },
      { id: 'labor_market', text: 'Labor-market evidence showing realistic employment outcomes', weight: 20 }
    ],
    deadlineRules: [
      { id: 'formal_notice_year', label: 'Track one-year review rights from feasibility denial notice', trigger: 'formal_notice', targetDays: 365 }
    ],
    escalationOptions: [
      'Rebut the feasibility analysis with treating-provider and labor-market evidence.',
      'Request a written rationale identifying the specific missing evidence.',
      'Preserve review rights once the written denial is issued.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'ipe-change',
    title: 'IPE Amendment / Goal Change',
    desc: 'You need the IPE amended, or VR&E denied a different training goal.',
    dashboardEnabled: true,
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Entitled, No IPE', 'IPE Signed', 'In School / Training', 'Employment Services'],
    authorityIds: ['38-usc-3107', '38-cfr-21-80'],
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          textField('currentGoal', 'Current Goal / Plan', 'e.g. Business Administration'),
          textField('requestedGoal', 'Requested New Goal', 'e.g. Cybersecurity'),
          textField('changeReason', 'Why the Goal Must Change', 'e.g. Medical limitations, labor-market mismatch'),
          textField('supportingEvidence', 'Best Supporting Evidence', 'e.g. Physician note, O*NET analysis')
        ]
      }
    ],
    errors: [
      'Plan amendment denials often fail to address whether the original goal remains suitable.',
      'A strong amendment request ties the new goal to feasibility, aptitude, and realistic employment outcomes.'
    ],
    templates: ['ipe-change-letter'],
    evidenceChecklist: [
      { id: 'goal_mismatch', text: 'Evidence showing the current goal is no longer suitable or feasible', weight: 30 },
      { id: 'new_goal_fit', text: 'Evidence showing the new goal matches strengths and limitations', weight: 30 },
      { id: 'market_outlook', text: 'Labor-market or wage data supporting the revised goal', weight: 20 },
      { id: 'training_map', text: 'Program map, certification path, or degree plan for the revised goal', weight: 20 }
    ],
    deadlineRules: [
      { id: 'amendment_follow_up', label: 'Follow up if no written response within 10 business days', trigger: 'pending_amendment', targetDays: 10 }
    ],
    escalationOptions: [
      'Frame the amendment as a rehabilitation-necessity change, not a preference change.',
      'Tie the new goal to documented medical, vocational, and labor-market evidence.',
      'Demand written reasons if the office refuses to amend the IPE.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'seh-extension',
    title: '48-Month Extension / SEH',
    desc: 'VR&E says you exhausted entitlement or refuses an extension despite a serious employment handicap.',
    dashboardEnabled: true,
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Entitled, No IPE', 'IPE Signed', 'In School / Training', 'Appeal Pending'],
    authorityIds: ['38-usc-3105', '38-cfr-21-78'],
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          textField('monthsUsed', 'Months Already Used', 'e.g. 42 months'),
          textField('extensionNeed', 'Why Extra Time Is Needed', 'e.g. Clinical hours, accreditation path'),
          textField('sehFactors', 'Serious Employment Handicap Factors', 'e.g. Multiple disabilities, interrupted progress'),
          textField('remainingRequirement', 'What Remains To Finish', 'e.g. 2 semesters + internship')
        ]
      }
    ],
    errors: [
      'Month-limit denials often ignore whether the veteran qualifies for a serious employment handicap extension.',
      'An extension case is stronger when the remaining training is specific, measurable, and tied to employability.'
    ],
    templates: ['seh-extension-letter'],
    evidenceChecklist: [
      { id: 'remaining_program', text: 'Program map or graduation audit showing exactly what remains', weight: 30 },
      { id: 'seh_evidence', text: 'Evidence supporting serious employment handicap factors', weight: 30 },
      { id: 'completion_timeline', text: 'Timeline showing the extension will complete the plan', weight: 20 },
      { id: 'employment_link', text: 'Evidence linking completion to suitable employment', weight: 20 }
    ],
    deadlineRules: [
      { id: 'extension_before_term', label: 'Resolve before the next training term starts', trigger: 'continuity_of_training', targetDays: 14 }
    ],
    escalationOptions: [
      'Quantify the exact remaining training and why it cannot be compressed further.',
      'Document serious employment handicap factors and prior delays.',
      'Request a formal written denial if the office refuses the extension verbally.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'retroactive-induction',
    title: 'Retroactive Induction',
    desc: 'You want prior training, tuition, or supplies recognized retroactively under Chapter 31.',
    dashboardEnabled: false,
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Appeal Pending', 'Entitled, No IPE', 'In School / Training'],
    authorityIds: ['38-cfr-21-282', '38-usc-3104'],
    errors: [
      'Retroactive induction requests fail when the record does not clearly tie prior training to a later-approved rehabilitation goal.'
    ],
    templates: [],
    evidenceChecklist: [
      { id: 'past_invoices', text: 'Past tuition invoices, receipts, or supply records', weight: 35 },
      { id: 'admissions_records', text: 'Admissions letters, transcripts, or program records', weight: 35 },
      { id: 'goal_alignment', text: 'Explanation showing the past training aligns with the approved goal', weight: 30 }
    ],
    deadlineRules: [
      { id: 'retro_packet', label: 'Assemble invoices and transcripts before requesting review', trigger: 'packet_assembly', targetDays: 21 }
    ],
    escalationOptions: [
      'Build a packet proving the past program was part of the same rehabilitation path.',
      'Request a written explanation if retroactive induction is denied.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'independent-living-denial',
    title: 'Independent Living Denial',
    desc: 'VR&E denied Independent Living services, equipment, or home-based supports.',
    dashboardEnabled: false,
    riskLevel: 'high',
    track: 'independent_living',
    caseStages: ['Independent Living', 'Appeal Pending'],
    authorityIds: ['38-usc-3120', '38-cfr-21-160'],
    errors: [
      'Independent Living cases are often denied by applying employment-track logic to functional independence needs.'
    ],
    templates: [],
    evidenceChecklist: [
      { id: 'adl_limitations', text: 'ADL or IADL limitations documented by a provider or caregiver', weight: 35 },
      { id: 'safety_barriers', text: 'Home safety or access barriers tied to the requested item', weight: 35 },
      { id: 'independence_gain', text: 'Specific explanation of how the item improves independence', weight: 30 }
    ],
    escalationOptions: [
      'Separate employment goals from independence goals in the supporting statement.',
      'Use provider and caregiver evidence to show functional necessity.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'self-employment-denial',
    title: 'Self-Employment Denial',
    desc: 'VR&E denied the self-employment track, startup supports, or a business-plan request.',
    dashboardEnabled: false,
    riskLevel: 'high',
    track: 'self_employment',
    caseStages: ['Evaluation Phase', 'Entitled, No IPE', 'Appeal Pending'],
    authorityIds: ['38-usc-3104', '38-cfr-21-257'],
    errors: [
      'Self-employment denials often overlook business feasibility evidence, local market fit, or disability-related work limitations.'
    ],
    templates: [],
    evidenceChecklist: [
      { id: 'business_plan', text: 'Business plan or feasibility outline', weight: 40 },
      { id: 'market_analysis', text: 'Local market or customer-demand evidence', weight: 30 },
      { id: 'limitation_fit', text: 'Explanation showing why self-employment fits the disability picture', weight: 30 }
    ],
    escalationOptions: [
      'Frame the business plan as a rehabilitation strategy, not a speculative venture.',
      'Document why traditional employment is less suitable.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'school-authorization-problem',
    title: 'School Authorization Problem',
    desc: 'The authorization, 1905-equivalent approval, or school billing chain is incomplete or wrong.',
    dashboardEnabled: false,
    riskLevel: 'critical',
    track: 'long_term',
    caseStages: ['IPE Signed', 'In School / Training'],
    authorityIds: ['38-usc-3104', '38-cfr-21-420'],
    errors: [
      'Authorization failures can look like school error when the actual problem is upstream in VR&E processing.'
    ],
    templates: [],
    evidenceChecklist: [
      { id: 'authorization_request', text: 'Proof the authorization was requested or expected', weight: 35 },
      { id: 'school_notice', text: 'School notice explaining what is missing', weight: 35 },
      { id: 'term_deadline', text: 'Term deadline or late-fee notice', weight: 30 }
    ],
    escalationOptions: [
      'Coordinate the counselor, SCO, and bursar with a single written timeline.',
      'Escalate before class drop or payment hold deadlines.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'post-rehabilitation-training',
    title: 'Post-Rehabilitation Training Request',
    desc: 'You need additional training after rehabilitation or after employment services ended.',
    dashboardEnabled: false,
    riskLevel: 'medium',
    track: 'long_term',
    caseStages: ['Rehabilitated', 'Employment Services', 'Appeal Pending'],
    authorityIds: ['38-usc-3117', '38-cfr-21-284'],
    errors: [
      'Post-rehabilitation requests need a narrow showing that the extra training is necessary for stable employment.'
    ],
    templates: [],
    evidenceChecklist: [
      { id: 'employment_gap', text: 'Evidence showing the current training is insufficient for placement or retention', weight: 35 },
      { id: 'new_requirement', text: 'Employer, licensing, or market requirement for the extra training', weight: 35 },
      { id: 'continuity_plan', text: 'Short completion path linking the added training to employability', weight: 30 }
    ],
    escalationOptions: [
      'Tie the request to employment retention or placement, not general advancement.',
      'Document the exact credential or requirement still missing.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'case-interruption',
    title: 'Case Interruption',
    desc: 'VR&E moved the case to interrupted status or is threatening an interruption.',
    dashboardEnabled: false,
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Interrupted Status', 'In School / Training', 'Employment Services'],
    authorityIds: ['38-cfr-21-197'],
    errors: [
      'Interruptions must be grounded in a supportable reason and should include a path back to active services.'
    ],
    templates: [],
    evidenceChecklist: [
      { id: 'interruption_notice', text: 'Interruption notice or counselor communication', weight: 35 },
      { id: 'cure_steps', text: 'Evidence that the triggering issue can be cured', weight: 35 },
      { id: 'medical_context', text: 'Medical or hardship records if the interruption followed a crisis', weight: 30 }
    ],
    escalationOptions: [
      'Request written cure steps and timeline to return to active status.',
      'Document why interruption is unnecessary or unsupported.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'discontinuance',
    title: 'Discontinuance',
    desc: 'VR&E discontinued the case or is building toward a discontinuance action.',
    dashboardEnabled: false,
    riskLevel: 'critical',
    track: 'long_term',
    caseStages: ['Discontinued Status', 'Appeal Pending'],
    authorityIds: ['38-cfr-21-198'],
    errors: [
      'Discontinuance decisions carry serious downstream consequences and should be treated like formal adverse actions.'
    ],
    templates: [],
    evidenceChecklist: [
      { id: 'discontinuance_letter', text: 'Discontinuance notice and reason', weight: 35 },
      { id: 'contrary_facts', text: 'Records contradicting the discontinuance basis', weight: 35 },
      { id: 'mitigation', text: 'Evidence of mitigation, cure attempts, or due-process defects', weight: 30 }
    ],
    escalationOptions: [
      'Audit the notice for procedural defects and missing review rights.',
      'Build a rebuttal packet before the one-year review clock runs.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'training-goal-denial',
    title: 'Training Goal Denial',
    desc: 'VR&E rejected the proposed occupational goal as unsuitable or unnecessary.',
    dashboardEnabled: false,
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Evaluation Phase', 'Entitled, No IPE', 'Appeal Pending'],
    authorityIds: ['38-usc-3107', '38-cfr-21-80'],
    errors: [
      'Goal denials are vulnerable when the record does not compare the requested goal against disabilities, aptitudes, and local labor-market outcomes.'
    ],
    templates: [],
    evidenceChecklist: [
      { id: 'goal_fit', text: 'Evidence the requested goal fits limitations and strengths', weight: 35 },
      { id: 'market_need', text: 'Wage, demand, or hiring evidence supporting the goal', weight: 35 },
      { id: 'alternative_defects', text: 'Explanation why the proposed alternative is unsuitable', weight: 30 }
    ],
    escalationOptions: [
      'Document why the requested goal is the most feasible suitable outcome.',
      'Challenge unsupported assumptions about alternative occupations.'
    ]
  })
];

const ISSUE_DEFINITION_BY_ID = new Map(CASE_ISSUE_TAXONOMY.map((issue) => [issue.workflowId, issue]));

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeOptionalString(value, fieldName, maxLength, fallback = '') {
  if (value == null) {
    return fallback;
  }

  if (typeof value !== 'string') {
    throw createValidationError(`${fieldName} must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw createValidationError(`${fieldName} exceeds ${maxLength} characters.`);
  }

  return normalized;
}

function normalizeIsoDate(value, fieldName) {
  const normalized = normalizeOptionalString(value, fieldName, 32);

  if (!normalized) {
    return '';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw createValidationError(`${fieldName} must use YYYY-MM-DD format.`);
  }

  return normalized;
}

function normalizeMachineLabel(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeCaseStage(value) {
  const normalized = normalizeOptionalString(value, 'caseStage', MAX_SHORT_TEXT_LENGTH);

  if (!normalized) {
    throw createValidationError('caseStage is required.');
  }

  const match = CASE_STAGE_OPTIONS.find((option) => normalizeMachineLabel(option) === normalizeMachineLabel(normalized));
  if (!match) {
    throw createValidationError('caseStage must match a supported VR&E case stage.');
  }

  return match;
}

function normalizeTrack(value, fallback = '') {
  const normalized = normalizeOptionalString(value, 'track', MAX_SHORT_TEXT_LENGTH, fallback);

  if (!normalized) {
    return '';
  }

  if (!CASE_TRACK_OPTIONS.includes(normalized)) {
    throw createValidationError('track must match a supported VR&E track.');
  }

  return normalized;
}

function normalizeIpeStatus(value, fallback = '') {
  const normalized = normalizeOptionalString(value, 'ipeStatus', MAX_SHORT_TEXT_LENGTH, fallback);

  if (!normalized) {
    return '';
  }

  if (!IPE_STATUS_OPTIONS.includes(normalized)) {
    throw createValidationError('ipeStatus must match a supported IPE status.');
  }

  return normalized;
}

function assertKnownIssueId(issueTypeId) {
  if (!ISSUE_DEFINITION_BY_ID.has(issueTypeId)) {
    throw createValidationError(`Unknown issueTypeId: ${issueTypeId}`);
  }
}

export function getCaseIssueTaxonomy(options = {}) {
  const { dashboardOnly = false } = options;
  const filtered = dashboardOnly
    ? CASE_ISSUE_TAXONOMY.filter((issue) => issue.dashboardEnabled)
    : CASE_ISSUE_TAXONOMY;

  return cloneValue(filtered);
}

export function getCaseIssueDefinition(issueTypeId) {
  const issue = ISSUE_DEFINITION_BY_ID.get(issueTypeId);
  return issue ? cloneValue(issue) : null;
}

export function seedCaseIssueTaxonomy(db) {
  const statement = db.prepare(`
    INSERT INTO case_issue_taxonomy (
      id,
      title,
      summary,
      category,
      track,
      risk_level,
      dashboard_enabled,
      workflow_json,
      authority_refs,
      last_reviewed_at,
      source_status,
      content_version,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      category = excluded.category,
      track = excluded.track,
      risk_level = excluded.risk_level,
      dashboard_enabled = excluded.dashboard_enabled,
      workflow_json = excluded.workflow_json,
      authority_refs = excluded.authority_refs,
      last_reviewed_at = excluded.last_reviewed_at,
      source_status = excluded.source_status,
      content_version = excluded.content_version,
      updated_at = CURRENT_TIMESTAMP
  `);

  CASE_ISSUE_TAXONOMY.forEach((issue) => {
    statement.run([
      issue.workflowId,
      issue.title,
      issue.desc,
      issue.category,
      issue.track,
      issue.riskLevel,
      issue.dashboardEnabled ? 1 : 0,
      JSON.stringify(issue),
      JSON.stringify(issue.authorityIds),
      issue.lastReviewedAt,
      issue.sourceStatus,
      issue.contentVersion
    ]);
  });

  statement.finalize();
}

export function createCaseRecordId() {
  return `case_${randomUUID()}`;
}

export function createCaseChildId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

export function validateCurrentCaseRecordPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createValidationError('Case payload must be an object.');
  }

  const issueTypeId = normalizeOptionalString(payload.issueTypeId, 'issueTypeId', MAX_SHORT_TEXT_LENGTH);
  assertKnownIssueId(issueTypeId);

  const issue = ISSUE_DEFINITION_BY_ID.get(issueTypeId);
  const title = normalizeOptionalString(payload.title, 'title', MAX_SHORT_TEXT_LENGTH, issue.title);

  return {
    title,
    veteranName: normalizeOptionalString(payload.veteranName, 'veteranName', MAX_SHORT_TEXT_LENGTH),
    claimantReference: normalizeOptionalString(payload.claimantReference, 'claimantReference', MAX_SHORT_TEXT_LENGTH),
    counselorName: normalizeOptionalString(payload.counselorName, 'counselorName', MAX_SHORT_TEXT_LENGTH),
    regionalOffice: normalizeOptionalString(payload.regionalOffice, 'regionalOffice', MAX_SHORT_TEXT_LENGTH),
    schoolName: normalizeOptionalString(payload.schoolName, 'schoolName', MAX_TEXT_LENGTH),
    issueTypeId,
    caseStage: normalizeCaseStage(payload.caseStage),
    track: normalizeTrack(payload.track, issue.track),
    ipeStatus: normalizeIpeStatus(payload.ipeStatus),
    issueSummary: normalizeOptionalString(payload.issueSummary, 'issueSummary', MAX_LONG_TEXT_LENGTH, issue.desc),
    disputeHistory: normalizeOptionalString(payload.disputeHistory, 'disputeHistory', MAX_LONG_TEXT_LENGTH),
    escalationHistory: normalizeOptionalString(payload.escalationHistory, 'escalationHistory', MAX_LONG_TEXT_LENGTH),
    evidenceSummary: normalizeOptionalString(payload.evidenceSummary, 'evidenceSummary', MAX_LONG_TEXT_LENGTH),
    decisionNoticeDate: normalizeIsoDate(payload.decisionNoticeDate, 'decisionNoticeDate'),
    followUpDeadlineDate: normalizeIsoDate(payload.followUpDeadlineDate, 'followUpDeadlineDate'),
    createdFromWorkflowId: normalizeOptionalString(payload.createdFromWorkflowId, 'createdFromWorkflowId', MAX_SHORT_TEXT_LENGTH, issueTypeId)
  };
}

export function validateCaseDeadlinePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createValidationError('Deadline payload must be an object.');
  }

  return {
    title: normalizeOptionalString(payload.title, 'title', MAX_SHORT_TEXT_LENGTH),
    dueDate: normalizeIsoDate(payload.dueDate, 'dueDate'),
    status: normalizeOptionalString(payload.status, 'status', MAX_SHORT_TEXT_LENGTH, 'open'),
    source: normalizeOptionalString(payload.source, 'source', MAX_SHORT_TEXT_LENGTH),
    notes: normalizeOptionalString(payload.notes, 'notes', MAX_LONG_TEXT_LENGTH)
  };
}

export function validateCaseActivityPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createValidationError('Activity payload must be an object.');
  }

  return {
    activityType: normalizeOptionalString(payload.activityType, 'activityType', MAX_SHORT_TEXT_LENGTH, 'note'),
    occurredAt: normalizeIsoDate(payload.occurredAt, 'occurredAt'),
    summary: normalizeOptionalString(payload.summary, 'summary', MAX_TEXT_LENGTH),
    responseStatus: normalizeOptionalString(payload.responseStatus, 'responseStatus', MAX_SHORT_TEXT_LENGTH),
    notes: normalizeOptionalString(payload.notes, 'notes', MAX_LONG_TEXT_LENGTH)
  };
}

export function validateCaseDocumentPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createValidationError('Document payload must be an object.');
  }

  return {
    documentType: normalizeOptionalString(payload.documentType, 'documentType', MAX_SHORT_TEXT_LENGTH),
    title: normalizeOptionalString(payload.title, 'title', MAX_SHORT_TEXT_LENGTH),
    templateId: normalizeOptionalString(payload.templateId, 'templateId', MAX_SHORT_TEXT_LENGTH),
    status: normalizeOptionalString(payload.status, 'status', MAX_SHORT_TEXT_LENGTH, 'draft'),
    generatedBody: normalizeOptionalString(payload.generatedBody, 'generatedBody', MAX_LONG_TEXT_LENGTH),
    notes: normalizeOptionalString(payload.notes, 'notes', MAX_LONG_TEXT_LENGTH)
  };
}

export function assertCaseCollectionLimit(items, fieldName) {
  if (!Array.isArray(items)) {
    throw createValidationError(`${fieldName} must be an array.`);
  }

  if (items.length > MAX_CASE_ITEMS) {
    throw createValidationError(`${fieldName} exceeds ${MAX_CASE_ITEMS} items.`);
  }
}

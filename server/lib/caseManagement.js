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

const USER_REPORTED_SOURCE_LABEL = 'User-reported VR&E patterns from recent r/VeteransBenefits searches';

const COMMUNITY_SIGNAL_THEMES = [
  {
    id: 'payments_subsistence',
    label: 'Subsistence allowance and MHA confusion',
    signalCount: 15,
    workflowIds: ['subsistence-issue', 'entitlement-exhaustion', 'school-authorization-problem'],
    relatedPages: ['calculator', 'school_payment_tracker'],
    summary: 'Monthly rate elections, one-class-per-month schedules, summer credit load, partial months, and payment start dates are repeated pain points.'
  },
  {
    id: 'counselor_nonresponse',
    label: 'Counselor nonresponse and no-shows',
    signalCount: 15,
    workflowIds: ['counselor-delay', 'counselor-no-show', 'written-decision-request'],
    relatedPages: ['directory', 'written_decision_analyzer'],
    summary: 'Veterans repeatedly report unanswered emails, missed orientations, and uncertainty about who can intervene locally.'
  },
  {
    id: 'retroactive_induction',
    label: 'Retroactive induction and GI Bill restoration',
    signalCount: 10,
    workflowIds: ['retroactive-induction'],
    relatedPages: ['claim_builder', 'forms_center'],
    summary: 'Users want to recover Chapter 33 months and prove that prior training should have been covered under Chapter 31.'
  },
  {
    id: 'advanced_training',
    label: 'Graduate school and advanced training approval',
    signalCount: 15,
    workflowIds: ['graduate-school-justification', 'ipe-change', 'training-goal-denial'],
    relatedPages: ['planning', 'claim_builder'],
    summary: 'MBA, nursing, PA school, law school, and out-of-state programs regularly trigger necessity and cost disputes.'
  },
  {
    id: 'feasibility_entitlement',
    label: 'Feasibility and 48-month entitlement exhaustion',
    signalCount: 25,
    workflowIds: ['feasibility-denial', 'entitlement-exhaustion', 'seh-extension'],
    relatedPages: ['written_decision_analyzer', 'claim_builder'],
    summary: 'Mental-health feasibility issues and 48-month exhaustion often overlap when a program is near completion but the record is underdeveloped.'
  },
  {
    id: 'school_and_supplies',
    label: 'School authorizations, tuition, laptops, and required tools',
    signalCount: 20,
    workflowIds: ['tuition-unpaid', 'school-authorization-problem', 'supplies-denial'],
    relatedPages: ['school_payment_tracker', 'resources'],
    summary: 'Payment failures, missing authorizations, and laptop or software denials create immediate term-start crises.'
  }
];

const PROBLEM_ROUTER_BLUEPRINTS = [
  {
    id: 'counselor_disappeared',
    prompt: 'My counselor disappeared',
    summary: 'Use this when emails, portal messages, or calls are going unanswered, a meeting was missed, or you do not know who can intervene.',
    primaryWorkflowId: 'counselor-delay',
    supportingWorkflowIds: ['counselor-no-show', 'written-decision-request'],
    signalCount: 15
  },
  {
    id: 'school_not_paid',
    prompt: 'School starts soon and VA has not authorized anything',
    summary: 'Use this for unpaid tuition, missing authorizations, invoice confusion, account holds, or term-start emergency risk.',
    primaryWorkflowId: 'tuition-unpaid',
    supportingWorkflowIds: ['school-authorization-problem', 'written-decision-request'],
    signalCount: 20
  },
  {
    id: 'monthly_allowance_wrong',
    prompt: 'My monthly payment is wrong or missing',
    summary: 'Use this for subsistence, Post-9/11 Chapter 31 rate, summer, hybrid, online-only, partial-month, OJT, or missing-payment confusion.',
    primaryWorkflowId: 'subsistence-issue',
    supportingWorkflowIds: ['entitlement-exhaustion', 'school-authorization-problem'],
    signalCount: 15
  },
  {
    id: 'supplies_denied',
    prompt: 'I need a laptop, software, tools, or supplies',
    summary: 'Use this when a required item is denied, reimbursement is demanded, the bookstore cannot provide it, or a support specialist conflicts with the VRC.',
    primaryWorkflowId: 'supplies-denial',
    supportingWorkflowIds: ['written-decision-request', 'school-authorization-problem'],
    signalCount: 10
  },
  {
    id: 'already_have_degree_denial',
    prompt: 'They denied me because I already have a degree',
    summary: 'Use this when VA says your current degrees or credentials already lead to gainful employment, but the jobs are not suitable or sustainable.',
    primaryWorkflowId: 'current-degree-denial',
    supportingWorkflowIds: ['graduate-school-justification', 'ipe-change'],
    signalCount: 10
  },
  {
    id: 'grad_school_denied',
    prompt: 'Can VR&E pay for grad school, PA school, law school, MBA, nursing, or professional school?',
    summary: 'Use this when the dispute is really about graduate-level training necessity, cost, school choice, prerequisites, or licensure.',
    primaryWorkflowId: 'graduate-school-justification',
    supportingWorkflowIds: ['current-degree-denial', 'ipe-change'],
    signalCount: 15
  },
  {
    id: 'told_infeasible',
    prompt: 'VA says I am too disabled or my goal is infeasible',
    summary: 'Use this when mental health, rating percentage, medical clearance, or functional limitations are being used to block the goal.',
    primaryWorkflowId: 'feasibility-denial',
    supportingWorkflowIds: ['written-decision-request', 'independent-living-denial'],
    signalCount: 15
  },
  {
    id: 'case_closed_discontinued',
    prompt: 'They discontinued or closed my case for lack of cooperation',
    summary: 'Use this when the office interrupted, discontinued, or closed the case and you need reinstatement or appeal analysis.',
    primaryWorkflowId: 'case-closed',
    supportingWorkflowIds: ['written-decision-request', 'discontinuance'],
    signalCount: 10
  },
  {
    id: 'running_out_of_months',
    prompt: 'I am running out of entitlement before graduation',
    summary: 'Use this when the file shows 0 months remaining, a graduation gap exists, or an extension or SEH analysis may be needed.',
    primaryWorkflowId: 'entitlement-exhaustion',
    supportingWorkflowIds: ['seh-extension'],
    signalCount: 10
  },
  {
    id: 'retroactive_induction',
    prompt: 'Retroactive induction: can I get my GI Bill months back?',
    summary: 'Use this when earlier Chapter 33 usage or prior school terms should be reviewed as part of the same Chapter 31 rehabilitation path.',
    primaryWorkflowId: 'retroactive-induction',
    supportingWorkflowIds: ['entitlement-exhaustion'],
    signalCount: 10
  },
  {
    id: 'gi_bill_vs_vre',
    prompt: 'Should I use GI Bill or VR&E first?',
    summary: 'Use this for benefit-order strategy, preserving Chapter 33 months, comparing support types, and spotting retroactive-induction risk.',
    primaryWorkflowId: 'benefit-strategy-compare',
    supportingWorkflowIds: ['retroactive-induction', 'entitlement-exhaustion'],
    signalCount: 8
  },
  {
    id: 'need_to_change_ipe',
    prompt: 'I need to change my IPE',
    summary: 'Use this when the current goal is no longer suitable, the labor market changed, or a better-fit goal is supported by evidence.',
    primaryWorkflowId: 'ipe-change',
    supportingWorkflowIds: ['training-goal-denial', 'graduate-school-justification'],
    signalCount: 8
  }
];

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
    primaryCode: overrides.primaryCode || '',
    supportingCodes: overrides.supportingCodes || [],
    category: overrides.category || 'case_management',
    track: overrides.track || 'long_term',
    trackLabel: CASE_TRACK_LABELS[overrides.track || 'long_term'],
    riskLevel: overrides.riskLevel || 'medium',
    dashboardEnabled: Boolean(overrides.dashboardEnabled),
    priorityRank: Number.isFinite(overrides.priorityRank) ? overrides.priorityRank : 999,
    communitySignalCount: Number.isFinite(overrides.communitySignalCount) ? overrides.communitySignalCount : 0,
    userReportSource: overrides.userReportSource || '',
    problemRouterLabel: overrides.problemRouterLabel || '',
    problemRouterKeywords: overrides.problemRouterKeywords || [],
    recommendedPages: overrides.recommendedPages || [],
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
    intakeQuestions: overrides.intakeQuestions || [],
    likelyVaErrors: overrides.likelyVaErrors || [],
    generatedTools: overrides.generatedTools || [],
    recordsToRequest: overrides.recordsToRequest || [],
    microProblemTags: overrides.microProblemTags || [],
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
    primaryCode: 'VRE.COUNSELOR.NONRESPONSE',
    supportingCodes: ['VRE.COUNSELOR.SUPERVISOR_ESCALATION'],
    dashboardEnabled: true,
    priorityRank: 10,
    communitySignalCount: 15,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'Counselor is not responding',
    problemRouterKeywords: ['no response', 'ghosted', 'supervisor', 'regional office', 'email ignored'],
    recommendedPages: ['directory', 'written_decision_analyzer'],
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
        title: 'My counselor disappeared',
        fields: [
          textField('lastContactDate', 'When did you last hear from your counselor?', 'e.g. April 12, 2026'),
          numberField('followUpCount', 'How many unanswered emails or messages have you sent?', 'e.g. 3'),
          selectField('contactMethod', 'Did you use eVA, email, phone, or another contact method most often?', ['eVA Portal', 'Email', 'Phone Call', 'Certified Mail', 'VA.gov messaging', 'School contact']),
          textField('missedMeeting', 'Was there a scheduled meeting the counselor missed?', 'e.g. Orientation on May 27, 2026'),
          textField('deadlineImpact', 'Is a school term, payment, supply request, or deadline being affected?', 'e.g. Laptop request stalled before term start'),
          textField('supervisorKnown', 'Do you know the supervisor or regional office contact yet?', 'e.g. No supervisor contact provided')
        ]
      }
    ],
    intakeQuestions: [
      'When did you last hear from your counselor?',
      'How many unanswered emails or messages have you sent?',
      'Did you use eVA, VA.gov messaging, email, phone, or school contact?',
      'Was there a scheduled meeting the counselor missed?',
      'Is a school term, payment, supply request, or deadline being affected?',
      'Do you know the counselor’s supervisor or regional office contact?'
    ],
    likelyVaErrors: [
      'Communication breakdown is blocking active case development without a written decision.',
      'Delay is harming term-start, payment, or supply access without supervisory intervention.'
    ],
    generatedTools: [
      'Contact log',
      '7-day response request',
      'Supervisor escalation email',
      'Written decision request',
      'Congressional inquiry draft',
      'FOIA / Privacy Act records request'
    ],
    recordsToRequest: [
      'Sent email or portal timestamps',
      'Meeting invites or no-show proof',
      'School or vendor notices showing deadline harm',
      'Any prior written case-status notices'
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
    primaryCode: 'VRE.SUPPLIES.DENIED',
    supportingCodes: ['VRE.SUPPLIES.LAPTOP', 'VRE.SUPPLIES.SOFTWARE', 'VRE.SUPPLIES.TOOLS', 'VRE.SUPPLIES.EXAM_FEES'],
    dashboardEnabled: true,
    priorityRank: 40,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'I need a laptop, tools, software, or equipment',
    problemRouterKeywords: ['laptop', 'software', 'equipment', 'supplies', 'support specialist'],
    recommendedPages: ['resources', 'school_payment_tracker'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Entitled, No IPE', 'IPE Signed', 'In School / Training', 'Employment Services'],
    authorityIds: ['38-usc-3104', '38-cfr-21-212'],
    steps: [
      {
        title: 'I need a laptop, software, tools, or supplies',
        fields: [
          textField('requestedItem', 'What item are you requesting?', 'e.g. Laptop, software, ergonomic desk setup'),
          textField('requirementSource', 'Is it required by the syllabus, program, licensing board, clinical site, or employer?', 'e.g. Program handbook requires personal laptop'),
          textField('accommodationNeed', 'Is the item also tied to a disability accommodation or remote participation need?', 'e.g. Ergonomic setup for back pain'),
          textField('approvalStatus', 'Did the counselor approve it verbally or in writing, or did a support specialist deny it?', 'e.g. VRC approved verbally, support specialist said no'),
          textField('bookstoreIssue', 'Does the school bookstore sell it or are you being told to buy it first?', 'e.g. Bookstore does not sell it; told to self-purchase'),
          textField('quoteAmount', 'Do you have a quote, syllabus, handbook, or professor letter?', 'e.g. $1,850 quote and syllabus attached')
        ]
      }
    ],
    intakeQuestions: [
      'What item are you requesting?',
      'Is it required by the course, program, licensure path, clinical site, or employer?',
      'Is it needed because of a disability accommodation or remote participation issue?',
      'Did the counselor approve it verbally or in writing?',
      'Did the support specialist deny it or tell you to buy it first?',
      'Do you have a quote, syllabus, handbook, or professor letter?'
    ],
    likelyVaErrors: [
      'A required item is being treated as optional without analyzing curriculum, accommodation, or rehabilitation necessity.',
      'The office is shifting the burden to reimbursement or bookstore availability instead of deciding the request in writing.'
    ],
    generatedTools: [
      'Supply Justification Memo',
      'Written decision request',
      'Reimbursement demand letter',
      'Support specialist conflict summary'
    ],
    recordsToRequest: [
      'Syllabus or program handbook requirement',
      'School or professor letter',
      'Vendor quote or itemized estimate',
      'Any written approval or denial from the VRC or support staff'
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
    primaryCode: 'VRE.SCHOOL.TUITION_UNPAID',
    supportingCodes: ['VRE.SCHOOL.AUTHORIZATION_NOT_SENT', 'VRE.SCHOOL.SCO_COORDINATION'],
    dashboardEnabled: true,
    priorityRank: 20,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'School term is starting and VA has not paid',
    problemRouterKeywords: ['tuition unpaid', 'authorization not sent', 'school hold', 'books not paid'],
    recommendedPages: ['school_payment_tracker', 'directory'],
    riskLevel: 'critical',
    track: 'long_term',
    caseStages: ['IPE Signed', 'In School / Training'],
    authorityIds: ['38-usc-3104', '38-cfr-21-420'],
    steps: [
      {
        title: 'School starts soon and VA has not authorized anything',
        fields: [
          textField('schoolName', 'What school or training provider is involved?', 'e.g. University of Pittsburgh'),
          textField('termStart', 'What is the term start date?', 'e.g. August 26, 2026'),
          textField('authorizationStatus', 'Has the counselor sent the authorization and does the SCO confirm receipt?', 'e.g. SCO says no authorization received'),
          textField('invoiceStatus', 'Has the school submitted an invoice or purchase-order request yet?', 'e.g. Business office submitted invoice on August 20'),
          textField('amountDue', 'Is there an unpaid balance, late fee, or out-of-pocket amount?', 'e.g. $4,920 balance; used FAFSA'),
          textField('accountHold', 'Is there an academic hold, drop risk, or deadline emergency?', 'e.g. Drop risk in 3 days')
        ]
      }
    ],
    intakeQuestions: [
      'What is the term start date?',
      'Has the counselor sent the authorization to the school?',
      'Does the school certifying official confirm receipt?',
      'Has the business office received the purchase order or authorization?',
      'Has the school submitted an invoice yet?',
      'Is there an unpaid balance, academic hold, late fee, or drop risk?'
    ],
    likelyVaErrors: [
      'Authorization, invoice, and business-office handoff is broken during a time-sensitive term-start window.',
      'The veteran is absorbing term-start risk because the office has not resolved billing or written escalation promptly.'
    ],
    generatedTools: [
      'School Authorization Emergency Packet',
      'Joint counselor / SCO / business office / supervisor email',
      'School-payment emergency memo',
      'Written decision request'
    ],
    recordsToRequest: [
      'School invoice or bursar statement',
      'SCO email confirming whether authorization was received',
      'Hold, late-fee, or drop-risk notice',
      'Proof of FAFSA, loans, or out-of-pocket bridging if already used'
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
    workflowId: 'subsistence-issue',
    title: 'Subsistence / MHA Problem',
    desc: 'Your Chapter 31 subsistence allowance, Post-9/11 election rate, partial month, or training-load payment looks wrong.',
    primaryCode: 'VRE.PAYMENT.SUBSISTENCE_RATE',
    supportingCodes: [
      'VRE.PAYMENT.POST911_CH31_RATE',
      'VRE.PAYMENT.ONLINE_ONLY',
      'VRE.PAYMENT.SUMMER_TERM',
      'VRE.PAYMENT.PARTIAL_MONTH',
      'VRE.PAYMENT.NOT_RECEIVED',
      'VRE.PAYMENT.OJT_APPRENTICESHIP'
    ],
    dashboardEnabled: true,
    priorityRank: 15,
    communitySignalCount: 15,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'I have a subsistence, MHA, or partial-payment problem',
    problemRouterKeywords: ['mha', 'subsistence', 'partial month', 'summer credits', 'online only', '0 months 0 days'],
    recommendedPages: ['calculator', 'school_payment_tracker'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['IPE Signed', 'In School / Training', 'Employment Services', 'Appeal Pending'],
    authorityIds: ['38-usc-3108', '38-cfr-21-260', '38-cfr-21-264'],
    steps: [
      {
        title: 'My monthly payment is wrong or missing',
        fields: [
          selectField('rateElection', 'Are you using the standard Chapter 31 rate or the Post-9/11 Chapter 31 rate?', ['Standard Chapter 31 subsistence', 'Post-9/11 Chapter 31 election', 'Not sure']),
          selectField('trainingType', 'Are your classes resident, online, hybrid, mixed, OJT, or apprenticeship?', ['Resident college', 'Hybrid schedule', 'Online-only', 'Mixed schedule', 'OJT / Apprenticeship', 'Non-college or clock-hour program']),
          textField('creditLoad', 'How many credits or clock hours are certified?', 'e.g. 5 summer credits or 18 clock hours'),
          textField('termWindow', 'What are the term start and end dates?', 'e.g. May 20, 2026 to August 12, 2026'),
          textField('dependentStatus', 'Do you have dependents and was enrollment certified yet?', 'e.g. 2 dependents; school says certification sent'),
          textField('remainingMonthsShown', 'Was this a partial-month payment or does the letter show 0 months 0 days?', 'e.g. Partial month only; 0 months 0 days shown')
        ]
      }
    ],
    intakeQuestions: [
      'Are you using the standard Chapter 31 subsistence rate or the Post-9/11 Chapter 31 rate?',
      'Do you have remaining Post-9/11 GI Bill entitlement?',
      'Are your classes resident, online, hybrid, or mixed?',
      'How many credits or clock hours are certified?',
      'Is this summer, accelerated, one-class-per-month, OJT, or apprenticeship training?',
      'Did VA generate an award letter and was this a partial-month payment?'
    ],
    likelyVaErrors: [
      'The dispute may really be a rate-election, certification, training-time, or term-date problem rather than a Treasury timing issue.',
      'The office may not have reconciled enrollment mode, award generation, or prior-entitlement history before payment.'
    ],
    generatedTools: [
      'Subsistence Dispute Explainer',
      'Term-by-term payment audit request',
      'Certification gap summary',
      'Escalation note for counselor or SCO follow-up'
    ],
    recordsToRequest: [
      'Award letter or payment history',
      'Certified class schedule or enrollment certification',
      'School calendar or term dates',
      'Any Chapter 33 election or entitlement-usage history'
    ],
    errors: [
      'Rate disputes often mix up standard Chapter 31 subsistence, Post-9/11 election rates, partial-month proration, and online-only classification.',
      'Veterans frequently need a term-by-term audit when the award letter, enrollment pattern, and actual school delivery mode do not match.'
    ],
    templates: ['payment-audit-request'],
    evidenceChecklist: [
      { id: 'award_letter', text: 'Award letter or payment history showing the disputed amount', weight: 30 },
      { id: 'enrollment_pattern', text: 'Class schedule showing resident, hybrid, or online status by term', weight: 25 },
      { id: 'term_calendar', text: 'Official school calendar or term dates', weight: 20 },
      { id: 'rate_election', text: 'Any rate-election or Chapter 33 usage records affecting the calculation', weight: 25 }
    ],
    deadlineRules: [
      { id: 'payment_audit_before_term', label: 'Request a payment audit before the next monthly deposit date', trigger: 'incorrect_rate', targetDays: 7 }
    ],
    escalationOptions: [
      'Request a term-by-term payment audit with the exact enrollment pattern and rate election identified.',
      'Document whether the program is resident, hybrid, or online-only before disputing the local housing calculation.',
      'Escalate quickly if the payment error affects rent, books, or ongoing enrollment.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'case-closed',
    title: 'Interrupted / Discontinued Case',
    desc: 'VR&E changed your case status, closed the case, or is pushing you out of the program.',
    primaryCode: 'VRE.APPEAL.CLOSURE',
    supportingCodes: ['VRE.APPEAL.INTERRUPTION', 'VRE.APPEAL.DISCONTINUANCE'],
    dashboardEnabled: true,
    priorityRank: 70,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    riskLevel: 'critical',
    track: 'long_term',
    caseStages: ['Interrupted Status', 'Discontinued Status', 'Appeal Pending', 'Employment Services'],
    authorityIds: ['38-cfr-21-197', '38-cfr-21-198'],
    steps: [
      {
        title: 'They discontinued or closed my case',
        fields: [
          textField('statusChangeDate', 'Did VA issue a written discontinuance or closure letter, and when?', 'e.g. May 2, 2026'),
          textField('statusReason', 'What reason did VA give?', 'e.g. Lack of cooperation'),
          textField('warningOrResponseChance', 'Did they warn you first or give you a chance to respond?', 'e.g. No written warning before closure'),
          textField('cooperationProof', 'Do you have proof you cooperated or disability-related good cause?', 'e.g. Email chain and medical crisis note'),
          textField('harmIfClosed', 'Was your school term, payment, or rehabilitation plan harmed?', 'e.g. Cannot continue semester')
        ]
      }
    ],
    intakeQuestions: [
      'Did VA issue a written discontinuance or closure letter?',
      'What reason did VA give?',
      'Did they warn you first and give you a chance to respond?',
      'Do you have proof you cooperated or had disability-related good cause?',
      'Did the counselor fail to respond before accusing you of noncooperation?',
      'Do you want reinstatement, HLR, Supplemental Claim, Board appeal, or supervisor correction?'
    ],
    likelyVaErrors: [
      'Closure may have occurred without adequate warning, response opportunity, or proof of actual noncooperation.',
      'The office may have ignored disability-related good cause, favorable school records, or its own communication failures.'
    ],
    generatedTools: [
      'Reinstatement request',
      'Noncooperation rebuttal',
      'Contact-log exhibit',
      'Good-cause explanation',
      'Appeal-lane guide'
    ],
    recordsToRequest: [
      'Closure or discontinuance letter',
      'Any prior warning notice',
      'Email, call, or portal logs proving cooperation',
      'Medical or hardship evidence supporting good cause'
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
    primaryCode: 'VRE.FEASIBILITY.SUITABLE_EMPLOYMENT',
    supportingCodes: ['VRE.FEASIBILITY.MENTAL_HEALTH', 'VRE.FEASIBILITY.PTSD', 'VRE.FEASIBILITY.MEDICAL_CLEARANCE', 'VRE.FEASIBILITY.EXTENDED_EVALUATION'],
    dashboardEnabled: true,
    priorityRank: 60,
    communitySignalCount: 15,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'VA says my goal is infeasible',
    problemRouterKeywords: ['ptsd', 'can you work', 'therapist letter', 'medical clearance', 'feasible'],
    recommendedPages: ['written_decision_analyzer', 'planning'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Evaluation Phase', 'Entitled, No IPE', 'Appeal Pending'],
    authorityIds: ['38-usc-3106', '38-cfr-21-53'],
    steps: [
      {
        title: 'They say I am too disabled or my goal is infeasible',
        fields: [
          textField('goalDenied', 'Did VA say you are infeasible, not entitled, or that the goal is unsuitable?', 'e.g. Goal found infeasible due to PTSD'),
          textField('limitationsAtIssue', 'Did VA rely on your rating percentage or on specific functional limits?', 'e.g. 100% PTSD cited without job analysis'),
          textField('supportingProvider', 'Do you have medical evidence that the goal is compatible with your limitations?', 'e.g. Treating therapist supports remote work path'),
          textField('contraryEvidence', 'Do you have O*NET, school, or vocational evidence showing feasibility with accommodations?', 'e.g. O*NET shows low physical demands and remote compatibility'),
          textField('extendedEvaluationNeed', 'Do you need extended evaluation instead of denial?', 'e.g. Symptoms stable with treatment but need phased return')
        ]
      }
    ],
    intakeQuestions: [
      'Did VA say you are infeasible, not entitled, or that the specific goal is unsuitable?',
      'Did VA rely on your rating percentage instead of functional evidence?',
      'Do you have medical evidence saying the goal is compatible with your limitations?',
      'Do you have O*NET evidence showing the job demands?',
      'Can you perform the job with accommodations?',
      'Do you need extended evaluation instead of denial?'
    ],
    likelyVaErrors: [
      'The office may be using rating percentage as a shortcut instead of individualized functional analysis.',
      'Favorable medical, O*NET, school, or vocational evidence may have been ignored instead of weighed.'
    ],
    generatedTools: [
      'Feasibility Rebuttal',
      'Accommodation compatibility summary',
      'Extended-evaluation request',
      'Written decision demand'
    ],
    recordsToRequest: [
      'Counselor feasibility rationale',
      'Provider letters or treatment summaries',
      'O*NET work-context and ability data',
      'Any school or vocational evaluations already in the file'
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
    primaryCode: 'VRE.PLAN.IPE_AMENDMENT',
    supportingCodes: ['VRE.TRAINING.PREREQUISITES'],
    dashboardEnabled: true,
    priorityRank: 80,
    communitySignalCount: 8,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'I need to change my IPE',
    problemRouterKeywords: ['change ipe', 'amendment', 'goal change', 'new plan'],
    recommendedPages: ['claim_builder', 'planning'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Entitled, No IPE', 'IPE Signed', 'In School / Training', 'Employment Services'],
    authorityIds: ['38-usc-3107', '38-cfr-21-80'],
    steps: [
      {
        title: 'I need to change my IPE',
        fields: [
          textField('currentGoal', 'What is the current goal or plan?', 'e.g. Business Administration'),
          textField('requestedGoal', 'What goal do you want instead?', 'e.g. Cybersecurity'),
          textField('changeReason', 'Why does the IPE need to change right now?', 'e.g. Current goal worsens disability or no longer fits labor market'),
          textField('supportingEvidence', 'What medical, labor-market, or training evidence best supports the new goal?', 'e.g. O*NET analysis and physician note'),
          textField('amendmentBarrier', 'What did VA say was wrong with the change request?', 'e.g. Says it is only personal preference')
        ]
      }
    ],
    intakeQuestions: [
      'What is your current IPE goal?',
      'What goal do you want instead?',
      'Why is the current goal no longer suitable or feasible?',
      'What evidence shows the new goal fits better?',
      'Did VA say the change is only preference or advancement?'
    ],
    likelyVaErrors: [
      'The office may be treating a rehabilitation-necessity amendment like a personal preference change.',
      'The file may not reflect that the current goal itself has become unsuitable, medically harmful, or labor-market weak.'
    ],
    generatedTools: [
      'IPE amendment request',
      'Goal-change justification memo',
      'Written decision request',
      'Labor-market comparison summary'
    ],
    recordsToRequest: [
      'Current signed IPE and any amendment notes',
      'School program map or certification path for the new goal',
      'Medical or vocational evidence showing the current goal is unsuitable',
      'Any denial email or internal rationale from the VRC'
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
    primaryCode: 'VRE.ENTITLEMENT.EXTENSION',
    supportingCodes: ['VRE.ENTITLEMENT.FORTY_EIGHT_MONTH_LIMIT'],
    dashboardEnabled: true,
    priorityRank: 55,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Entitled, No IPE', 'IPE Signed', 'In School / Training', 'Appeal Pending'],
    authorityIds: ['38-usc-3105', '38-cfr-21-78'],
    steps: [
      {
        title: 'I am running out of entitlement before graduation',
        fields: [
          textField('monthsUsed', 'How many months of GI Bill or Chapter 31 have you already used?', 'e.g. 42 aggregate months'),
          textField('extensionNeed', 'Why is extra time needed to finish?', 'e.g. Clinical hours, accreditation path'),
          textField('sehFactors', 'Do you have serious employment handicap factors or prior delays?', 'e.g. Multiple disabilities, interrupted progress'),
          textField('remainingRequirement', 'What exactly remains before graduation or employability?', 'e.g. 2 semesters + internship'),
          textField('approvedThroughCompletion', 'Did VA already approve the IPE through graduation or close to completion?', 'e.g. Approved through August 2027')
        ]
      }
    ],
    intakeQuestions: [
      'How many months of GI Bill did you use before VR&E?',
      'How many months of Chapter 31 have you used?',
      'What is your planned graduation date?',
      'Did VA already approve the IPE through graduation?',
      'Do you have a serious employment handicap finding?',
      'Will stopping early prevent rehabilitation to employability?'
    ],
    likelyVaErrors: [
      'The office may be blurring accounting questions and actual extension authority.',
      'The record may not clearly show that stopping early defeats completion of an already-approved rehabilitation path.'
    ],
    generatedTools: [
      '48-month / extension analysis',
      'Entitlement audit request',
      'Completion-gap summary',
      'SEH extension argument'
    ],
    recordsToRequest: [
      'Benefit-usage history',
      'Graduation audit or remaining-course list',
      'Any IPE or counselor notes approving completion path',
      'SEH finding or related evaluations if available'
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
    workflowId: 'counselor-no-show',
    title: 'Counselor No-Show / Missed Orientation',
    desc: 'Your counselor missed a scheduled orientation or case meeting and follow-up went nowhere.',
    primaryCode: 'VRE.COUNSELOR.NO_SHOW',
    supportingCodes: ['VRE.COUNSELOR.NONRESPONSE', 'VRE.COUNSELOR.SUPERVISOR_ESCALATION'],
    dashboardEnabled: true,
    priorityRank: 18,
    communitySignalCount: 15,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'My counselor missed an appointment or orientation',
    problemRouterKeywords: ['no show', 'orientation missed', 'teams meeting', 'took off work'],
    recommendedPages: ['directory', 'written_decision_analyzer'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Applied, Waiting Appointment', 'Evaluation Phase', 'Entitled, No IPE', 'IPE Signed'],
    authorityIds: ['38-cfr-21-50', '38-cfr-21-420'],
    steps: [
      {
        title: 'My counselor missed an appointment or orientation',
        fields: [
          textField('meetingDate', 'When was the missed meeting or orientation?', 'e.g. May 27, 2026'),
          textField('meetingType', 'What kind of meeting was it?', 'e.g. Orientation or intake appointment'),
          textField('timeOffImpact', 'Did you take off work or miss class for it?', 'e.g. Took PTO'),
          textField('followUpProof', 'What follow-up attempts did you make after the no-show?', 'e.g. 3 emails and 1 portal message'),
          textField('termRisk', 'Did the no-show affect school start, payment, or other deadlines?', 'e.g. Delayed books and tuition setup')
        ]
      }
    ],
    intakeQuestions: [
      'Was there a scheduled meeting the counselor missed?',
      'Did you take off work or miss class for that meeting?',
      'What follow-up attempts did you make afterward?',
      'Is a term start, payment, or supply deadline now at risk?'
    ],
    likelyVaErrors: [
      'The office missed a scheduled case-development step and then failed to correct the harm quickly.',
      'The veteran now has deadline harm without a formal decision or timely reschedule.'
    ],
    generatedTools: [
      'No-show escalation email',
      'Supervisor escalation request',
      'Timeline exhibit',
      'Term-risk memo'
    ],
    recordsToRequest: [
      'Meeting invite or scheduling email',
      'Screenshot or attendance proof',
      'Follow-up emails or portal messages',
      'School or work evidence showing the impact of the missed meeting'
    ],
    errors: [
      'Missed orientations can delay entitlement, IPE approval, and term-start planning before any written denial exists.',
      'A no-show becomes a stronger escalation issue when the veteran can document lost time, missed work, or continued silence afterward.'
    ],
    templates: ['counselor-escalation'],
    evidenceChecklist: [
      { id: 'meeting_notice', text: 'Calendar invite, email, or Teams notice confirming the appointment', weight: 35 },
      { id: 'attendance_proof', text: 'Screenshot or log showing you attended or were ready for the meeting', weight: 30 },
      { id: 'post_no_show_messages', text: 'Follow-up emails or portal messages after the missed meeting', weight: 20 },
      { id: 'harm_statement', text: 'Short statement explaining work, school, or deadline harm', weight: 15 }
    ],
    deadlineRules: [
      { id: 'orientation_escalation', label: 'Escalate if no reschedule within 7 days', trigger: 'missed_orientation', targetDays: 7 }
    ],
    escalationOptions: [
      'Ask for an immediate reschedule and supervisor visibility in the same written message.',
      'Preserve proof that you appeared for the appointment and the office did not.',
      'Request reassignment if the missed orientation reflects a broader communication breakdown.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'graduate-school-justification',
    title: 'Graduate or Advanced Training Approval',
    desc: 'You need graduate school, professional school, or another advanced training path justified as necessary for suitable employment.',
    primaryCode: 'VRE.TRAINING.GRAD_SCHOOL',
    supportingCodes: [
      'VRE.TRAINING.MBA',
      'VRE.TRAINING.PA_SCHOOL',
      'VRE.TRAINING.NURSING',
      'VRE.TRAINING.LAW_SCHOOL',
      'VRE.TRAINING.PREREQUISITES',
      'VRE.TRAINING.OUT_OF_STATE',
      'VRE.TRAINING.PRIVATE_SCHOOL'
    ],
    dashboardEnabled: true,
    priorityRank: 35,
    communitySignalCount: 15,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'I need graduate school or advanced training approved',
    problemRouterKeywords: ['mba', 'law school', 'pa school', 'nursing', 'prerequisites', 'private school'],
    recommendedPages: ['planning', 'claim_builder'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Evaluation Phase', 'Entitled, No IPE', 'IPE Signed', 'Appeal Pending'],
    authorityIds: ['38-usc-3104', '38-cfr-21-72', '38-cfr-21-80'],
    steps: [
      {
        title: 'Can VR&E pay for grad school or advanced training?',
        fields: [
          textField('targetOccupation', 'What exact occupation are you targeting?', 'e.g. Physician Assistant or Nurse Practitioner'),
          textField('occupationCodes', 'What SOC or O*NET code matches that occupation?', 'e.g. 29-1071.00'),
          textField('targetProgram', 'What degree or program are you requesting, and what CIP code matches it?', 'e.g. PA Studies M.S. / CIP 51.0912'),
          textField('licensureNeed', 'Is the degree required, commonly required, or tied to licensure?', 'e.g. Required for state licensure'),
          textField('whyPriorTrainingFails', 'Why is the prior degree or work path not enough for suitable employment?', 'e.g. Current degree does not lead to non-patient-facing role'),
          textField('lowerCostAlternative', 'Would a lower-cost or shorter program truly reach the same suitable goal?', 'e.g. No, because licensure requires this level')
        ]
      }
    ],
    intakeQuestions: [
      'What exact occupation are you targeting?',
      'What SOC or O*NET code matches the occupation?',
      'What CIP code matches the degree program?',
      'Is the degree required, commonly required, or strongly preferred?',
      'Is licensure required?',
      'Why is the prior degree not enough and why is lower-level training insufficient?'
    ],
    likelyVaErrors: [
      'The office may be applying a blanket objection to degree level, cost, or school type instead of individualized rehabilitation analysis.',
      'The record may not yet connect the requested program to a specific occupation, licensure path, and medically suitable employment outcome.'
    ],
    generatedTools: [
      'Graduate Training Necessity Packet',
      'Occupation-to-degree justification',
      'Cost-reasonableness rebuttal',
      'Written decision request'
    ],
    recordsToRequest: [
      'Program map, admissions materials, or acceptance letter',
      'CIP-to-SOC or occupation evidence',
      'Licensure or employer requirement evidence',
      'Any denial notes comparing cheaper or shorter alternatives'
    ],
    errors: [
      'Advanced-training disputes are often framed as personal preference instead of a necessity question tied to employability, licensure, and disability-compatible work.',
      'Cost objections are weaker when the requested program is clearly linked to a specific occupation, credential, and realistic employment path.'
    ],
    templates: ['advanced-training-justification'],
    evidenceChecklist: [
      { id: 'occupation_link', text: 'SOC, O*NET, or labor-market evidence linking the degree to the target occupation', weight: 30 },
      { id: 'program_map', text: 'Program map, prerequisites, or acceptance materials for the requested school', weight: 25 },
      { id: 'licensure_rule', text: 'Licensure, certification, or employer requirement showing the training is necessary', weight: 25 },
      { id: 'unsuitable_prior_path', text: 'Evidence that prior education or work no longer produces suitable employment', weight: 20 }
    ],
    deadlineRules: [
      { id: 'advanced_training_before_start', label: 'Push for a written decision before deposit, acceptance, or term deadlines', trigger: 'program_acceptance', targetDays: 14 }
    ],
    escalationOptions: [
      'Anchor the request to a specific occupation, not a general desire for more school.',
      'Show why cheaper or shorter alternatives do not satisfy licensure, suitability, or disability-related work constraints.',
      'Preserve every denial reason in writing for appeal or amendment strategy.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'current-degree-denial',
    title: 'Denied Because You Already Have a Degree',
    desc: 'VR&E says your current degrees or credentials already qualify you for work, so additional training is unnecessary.',
    primaryCode: 'VRE.DENIAL.CURRENT_DEGREE_MARKETABLE',
    supportingCodes: ['VRE.DENIAL.GAINFUL_EMPLOYMENT_AVAILABLE', 'VRE.TRAINING.ADDITIONAL_TRAINING_NEEDED', 'VRE.IPE.NEW_GOAL_JUSTIFICATION'],
    dashboardEnabled: true,
    priorityRank: 34,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'They denied me because I already have a degree',
    problemRouterKeywords: ['already have a degree', 'marketable skills', 'gainful employment available', 'current credentials'],
    recommendedPages: ['planning', 'claim_builder'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Evaluation Phase', 'Entitled, No IPE', 'IPE Signed', 'Appeal Pending'],
    authorityIds: ['38-usc-3104', '38-cfr-21-35', '38-cfr-21-80'],
    steps: [
      {
        title: 'They denied me because I already have a degree',
        fields: [
          textField('existingCredentials', 'What degrees or certifications do you already have?', 'e.g. B.S. in Nursing and MBA'),
          textField('currentCredentialJobs', 'What jobs do those credentials usually qualify you for?', 'e.g. Bedside nursing, patient-facing management roles'),
          textField('unsuitableWhy', 'Why are those jobs unsuitable because of service-connected disabilities?', 'e.g. Migraines and PTSD make patient-facing work unsafe'),
          textField('targetOccupation', 'What specific target occupation are you now requesting?', 'e.g. Healthcare administrator'),
          textField('requiredCredential', 'What degree, license, or credential is normally required for that occupation?', 'e.g. MHA strongly preferred'),
          textField('vaRationale', 'Did VA explain why your current credentials already lead to suitable employment?', 'e.g. Said I could work anywhere with my MBA')
        ]
      }
    ],
    intakeQuestions: [
      'What degrees or certifications do you already have?',
      'What jobs do those credentials qualify you for?',
      'Why are those jobs unsuitable because of service-connected disabilities?',
      'Are you unemployed, underemployed, or working in a job that aggravates your conditions?',
      'What specific target occupation are you requesting?',
      'What degree, license, or credential is normally required for that occupation?'
    ],
    likelyVaErrors: [
      'The office may be conflating any employment with suitable employment.',
      'The file may not distinguish between being able to get a job and being able to obtain and maintain suitable work without worsening disabilities.'
    ],
    generatedTools: [
      'Degree suitability rebuttal',
      'New-goal justification memo',
      'Suitable-employment comparison chart',
      'Written decision request'
    ],
    templates: ['degree-suitability-rebuttal'],
    recordsToRequest: [
      'Resume and current credentials list',
      'Evidence that current jobs aggravate service-connected conditions',
      'Labor-market evidence for the requested occupation',
      'Any VA rationale claiming current credentials are already marketable'
    ],
    evidenceChecklist: [
      { id: 'credential_history', text: 'Degree, certification, and transcript history', weight: 20 },
      { id: 'unsuitable_current_work', text: 'Evidence current or qualifying jobs aggravate disabilities or are otherwise unsuitable', weight: 30 },
      { id: 'target_occupation_requirement', text: 'Evidence the requested occupation needs the new degree or credential', weight: 30 },
      { id: 'market_gap', text: 'Evidence current credentials are not producing suitable employment outcomes', weight: 20 }
    ],
    deadlineRules: [
      { id: 'degree_denial_follow_up', label: 'Request written rationale quickly if the office only denies verbally', trigger: 'verbal_denial', targetDays: 7 }
    ],
    escalationOptions: [
      'Force the office to compare current credentials to suitable employment, not generic employability.',
      'Tie the new credential to a specific occupation and medical suitability rationale.',
      'Preserve any blanket statement that a degree alone ends the analysis.'
    ],
    errors: [
      'Denials based on existing degrees often skip the separate question of whether those credentials lead to suitable, sustainable employment.',
      'The record may ignore how the veteran’s disabilities limit the jobs those current credentials usually support.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'entitlement-exhaustion',
    title: 'Remaining Entitlement / 48-Month Exhaustion',
    desc: 'Your file shows little or no entitlement remaining, or VR&E says the program will end before graduation.',
    primaryCode: 'VRE.ENTITLEMENT.FORTY_EIGHT_MONTH_LIMIT',
    supportingCodes: ['VRE.ENTITLEMENT.EXTENSION', 'VRE.ENTITLEMENT.SECOND_USE'],
    dashboardEnabled: true,
    priorityRank: 45,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'I am running out of entitlement',
    problemRouterKeywords: ['0 months 0 days', 'months remaining', 'before graduation', 'aggregate cap'],
    recommendedPages: ['claim_builder', 'calculator'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['IPE Signed', 'In School / Training', 'Appeal Pending'],
    authorityIds: ['38-usc-3105', '38-cfr-21-78'],
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          textField('chapter33Used', 'Chapter 33 Months Used', 'e.g. 24 months'),
          textField('chapter31Used', 'Chapter 31 Months Used', 'e.g. 21 months'),
          textField('remainingShown', 'Remaining Entitlement Shown', 'e.g. 0 months 0 days'),
          textField('programCompletionGap', 'Training Still Needed to Finish', 'e.g. 2 terms and final clinical rotation')
        ]
      }
    ],
    errors: [
      'Entitlement-exhaustion letters often blur accounting issues, aggregate benefit limits, and serious-employment-handicap extension authority.',
      'Veterans near graduation need a completion-focused record showing exactly what remains and why interruption would defeat rehabilitation.'
    ],
    templates: ['entitlement-audit-extension'],
    evidenceChecklist: [
      { id: 'benefit_usage', text: 'Benefit usage history showing Chapter 33 and Chapter 31 months used', weight: 30 },
      { id: 'remaining_requirements', text: 'Graduation audit or term-by-term plan showing what remains', weight: 30 },
      { id: 'approved_completion_path', text: 'Evidence that the plan was previously approved through completion or close to completion', weight: 20 },
      { id: 'seh_support', text: 'Evidence supporting extension factors or serious employment handicap', weight: 20 }
    ],
    deadlineRules: [
      { id: 'entitlement_warning_180', label: 'Escalate when within 180 days of projected exhaustion', trigger: 'low_remaining_entitlement', targetDays: 180 }
    ],
    escalationOptions: [
      'Separate accounting error questions from extension-authority arguments in the same packet.',
      'Ask for a full entitlement audit if the remaining months suddenly changed.',
      'Show the exact completion gap and why stopping now defeats the rehabilitation objective.'
    ]
  }),
  createIssueDefinition({
    workflowId: 'retroactive-induction',
    title: 'Retroactive Induction',
    desc: 'You want prior training, tuition, or supplies recognized retroactively under Chapter 31.',
    primaryCode: 'VRE.ENTITLEMENT.RETROACTIVE_INDUCTION',
    supportingCodes: ['VRE.ENTITLEMENT.GI_BILL_RESTORATION'],
    dashboardEnabled: true,
    priorityRank: 50,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'I need retroactive induction',
    problemRouterKeywords: ['restore gi bill months', 'retro induction', 'past terms', 'previous school terms'],
    recommendedPages: ['claim_builder', 'forms_center'],
    riskLevel: 'high',
    track: 'long_term',
    caseStages: ['Appeal Pending', 'Entitled, No IPE', 'In School / Training'],
    authorityIds: ['38-cfr-21-282', '38-usc-3104'],
    steps: [
      {
        title: 'Retroactive induction: can I get my GI Bill months back?',
        fields: [
          textField('priorTermWindow', 'When did you use GI Bill?', 'e.g. Fall 2022 through Spring 2024'),
          textField('serviceConnectionStatus', 'Were you service connected during those terms, and at what rating?', 'e.g. 80% service connected'),
          textField('laterEntitledDate', 'When were you later found entitled to VR&E?', 'e.g. June 2025'),
          textField('currentGoalAlignment', 'Was the prior training part of the same rehabilitation goal?', 'e.g. Same cybersecurity path later approved'),
          textField('programCompletion', 'Did you complete the program and is GI Bill now expired?', 'e.g. Program completed; GI Bill expires in 2027'),
          textField('recordsAvailable', 'Do you have transcripts, enrollment dates, VA payment records, and rating history?', 'e.g. Yes, transcripts and payment history available')
        ]
      }
    ],
    intakeQuestions: [
      'When did you use GI Bill?',
      'Were you service connected during those terms?',
      'What was your rating during those terms?',
      'Were you later found entitled to VR&E?',
      'Was the prior training part of the same rehabilitation goal?',
      'Do you have transcripts, enrollment dates, VA payment records, and rating history?'
    ],
    likelyVaErrors: [
      'The office may be treating retroactive induction like an informal favor instead of a documented prior-training review.',
      'The record may not yet connect the prior school terms to the later-approved rehabilitation goal clearly enough.'
    ],
    generatedTools: [
      'Eligibility risk screen',
      'Retroactive induction request',
      'Counselor follow-up letter',
      'Records request if VA delays or refuses'
    ],
    recordsToRequest: [
      'Transcripts and enrollment certifications',
      'VA payment history for Chapter 33 usage',
      'Rating history covering the prior terms',
      'Any entitlement determination showing later VR&E approval'
    ],
    errors: [
      'Retroactive induction requests fail when the record does not clearly tie prior training to a later-approved rehabilitation goal.'
    ],
    templates: ['retroactive-induction-request'],
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
    workflowId: 'benefit-strategy-compare',
    title: 'GI Bill vs VR&E Strategy Comparator',
    desc: 'You are deciding whether to use Chapter 33 first, pursue VR&E first, or preserve benefits for later schooling and support needs.',
    primaryCode: 'VRE.STRATEGY.GIBILL_VS_VRE',
    supportingCodes: ['VRE.STRATEGY.PRESERVE_CH33', 'VRE.ENTITLEMENT.RETROACTIVE_INDUCTION_RISK'],
    dashboardEnabled: true,
    priorityRank: 92,
    communitySignalCount: 8,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'Should I use GI Bill or VR&E first?',
    problemRouterKeywords: ['gi bill vs vre', 'preserve ch33', 'benefit strategy', 'use first'],
    recommendedPages: ['calculator', 'planning'],
    riskLevel: 'medium',
    track: 'long_term',
    caseStages: ['Not Applied', 'Applied, Waiting Appointment', 'Evaluation Phase', 'Entitled, No IPE', 'IPE Signed'],
    authorityIds: ['38-usc-3104', '38-cfr-21-70', '38-cfr-21-78'],
    steps: [
      {
        title: 'Should I use GI Bill or VR&E first?',
        fields: [
          textField('vreStatus', 'Are you already entitled to VR&E or only eligible to apply?', 'e.g. Eligible to apply, not yet found entitled'),
          textField('chapter33Remaining', 'How many months of Post-9/11 GI Bill remain?', 'e.g. 18 months'),
          textField('supportNeeds', 'Do you need tuition only, or also equipment, accommodations, counseling, and job-placement support?', 'e.g. Need laptop, counseling, and school coordination'),
          textField('futureSchooling', 'Do you expect future schooling after this program?', 'e.g. May need graduate school later'),
          textField('preserveReason', 'Are you trying to preserve Chapter 33 months or avoid retroactive induction issues later?', 'e.g. Want to preserve Ch33 for doctorate')
        ]
      }
    ],
    intakeQuestions: [
      'Are you already entitled to VR&E or only eligible to apply?',
      'How many months of Post-9/11 GI Bill remain?',
      'Do you need tuition, books, equipment, accommodations, or counseling support?',
      'Do you expect future schooling after this program?',
      'Are you trying to preserve GI Bill months?',
      'Would using GI Bill first create a retroactive induction issue later?'
    ],
    likelyVaErrors: [
      'The strategy decision may be getting reduced to monthly housing amount alone instead of overall rehabilitation support and future benefit preservation.',
      'The veteran may not have compared restoration or retroactive-induction implications before choosing benefit order.'
    ],
    generatedTools: [
      'Benefit Strategy Comparator',
      'Preserve-Chapter-33 memo',
      'Retroactive-induction risk screen',
      'Question list for initial VRC appointment'
    ],
    templates: ['benefit-strategy-memo'],
    recordsToRequest: [
      'Current Chapter 33 entitlement balance',
      'Any prior VR&E entitlement determination',
      'Program cost, equipment, and accommodation needs list',
      'Long-term schooling plan if additional education may be needed later'
    ],
    evidenceChecklist: [
      { id: 'benefit_balance', text: 'Current Chapter 33 remaining entitlement information', weight: 25 },
      { id: 'support_need_map', text: 'List of non-tuition supports that Chapter 31 may be better positioned to provide', weight: 25 },
      { id: 'future_education_plan', text: 'Future education plan showing why preserving Chapter 33 may matter', weight: 25 },
      { id: 'retro_risk', text: 'Evidence or reasoning showing whether retroactive induction could matter later', weight: 25 }
    ],
    escalationOptions: [
      'Use this as a strategy memo before locking yourself into the wrong benefit order.',
      'Compare monthly housing amount alongside support services, equipment needs, and future-schooling preservation.',
      'Bring the memo to the first VRC appointment or initial benefits-planning conversation.'
    ],
    errors: [
      'Veterans often compare only tuition or housing rates instead of the full rehabilitation support package.',
      'Choosing the wrong benefit order early can reduce flexibility for future training or retroactive restoration arguments.'
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
    primaryCode: 'VRE.SCHOOL.AUTHORIZATION_NOT_SENT',
    supportingCodes: ['VRE.SCHOOL.TRANSFER', 'VRE.SCHOOL.SCO_COORDINATION'],
    dashboardEnabled: true,
    priorityRank: 30,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'My school authorization or billing chain is broken',
    problemRouterKeywords: ['authorization not sent', 'school transfer', 'sco', '1905', 'billing'],
    recommendedPages: ['school_payment_tracker', 'directory'],
    riskLevel: 'critical',
    track: 'long_term',
    caseStages: ['IPE Signed', 'In School / Training'],
    authorityIds: ['38-usc-3104', '38-cfr-21-420'],
    intakeQuestions: [
      'Has the counselor sent the authorization to the school?',
      'Does the SCO confirm receipt?',
      'Has the business office received the billing authorization or purchase order?',
      'Is the problem school transfer, wrong program approval, or simple nonresponse?'
    ],
    likelyVaErrors: [
      'The school billing chain is incomplete even though the veteran may already be in a signed plan.',
      'The office may be letting the school and veteran guess where the breakdown occurred instead of identifying it.'
    ],
    generatedTools: [
      'Authorization gap memo',
      'Joint SCO / business office / counselor timeline',
      'Term-start emergency note'
    ],
    recordsToRequest: [
      'SCO correspondence',
      'Business office notices',
      'Any authorization or purchase-order reference',
      'Program approval proof if the school disputes eligibility'
    ],
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
    workflowId: 'written-decision-request',
    title: 'Written Decision Request',
    desc: 'VR&E denied, delayed, or refused action without issuing a real written decision notice.',
    primaryCode: 'VRE.APPEAL.WRITTEN_DECISION_REQUEST',
    supportingCodes: ['VRE.APPEAL.DENIAL', 'VRE.COUNSELOR.NONRESPONSE'],
    dashboardEnabled: true,
    priorityRank: 25,
    communitySignalCount: 10,
    userReportSource: USER_REPORTED_SOURCE_LABEL,
    problemRouterLabel: 'VR&E denied me or refuses to issue a written decision',
    problemRouterKeywords: ['written decision', 'in writing', '20-0998', 'verbal denial', 'email denial'],
    recommendedPages: ['written_decision_analyzer', 'dispute_hub'],
    riskLevel: 'critical',
    track: 'long_term',
    caseStages: ['Evaluation Phase', 'Entitled, No IPE', 'IPE Signed', 'Interrupted Status', 'Discontinued Status', 'Appeal Pending'],
    authorityIds: ['38-cfr-21-420', '38-cfr-21-416', '38-cfr-21-50'],
    steps: [
      {
        title: 'They denied me but will not put it in writing',
        fields: [
          textField('informalDenialDate', 'When did the verbal or email denial happen?', 'e.g. May 22, 2026'),
          textField('issueAtStake', 'What issue is at stake?', 'e.g. laptop package, extension, or IPE amendment'),
          textField('whoSaidNo', 'Who communicated the denial or refusal?', 'e.g. VRC or support specialist'),
          textField('missingNotice', 'What notice is missing?', 'e.g. no written decision, no appeal rights, no rationale'),
          textField('harmOrDeadline', 'What deadline, payment, school, or plan harm is happening while you wait?', 'e.g. Term starts next week')
        ]
      }
    ],
    intakeQuestions: [
      'Did the office deny something verbally or by email only?',
      'Do you have a formal written decision notice yet?',
      'What issue was denied or stalled?',
      'What harm is happening while the office refuses to own the denial in writing?'
    ],
    likelyVaErrors: [
      'The office may be avoiding a formal decision notice and review rights by handling the dispute informally.',
      'The veteran cannot cleanly choose an appeal lane until the issue and reasons are identified in writing.'
    ],
    generatedTools: [
      'Written decision request',
      'Issue-and-reasons demand letter',
      'Appeal-lane readiness note'
    ],
    recordsToRequest: [
      'Email or portal denial messages',
      'Timeline of follow-up requests',
      'Any school or payment harm notice tied to the missing decision',
      'The eventual written decision once issued'
    ],
    errors: [
      'Informal denials prevent veterans from using review rights because there is no formal notice date, rationale, or appeal-lane guidance.',
      'A written-decision request is often the cleanest next move when the office is delaying action instead of owning the denial.'
    ],
    templates: ['written-decision-request'],
    reviewLaneWarning: true,
    evidenceChecklist: [
      { id: 'denial_message', text: 'Email, portal message, or notes showing the office denied or refused action', weight: 35 },
      { id: 'request_history', text: 'Timeline of requests showing repeated attempts to get an answer', weight: 30 },
      { id: 'harm_or_deadline', text: 'School, payment, or enrollment harm caused by the missing decision', weight: 20 },
      { id: 'authority_request', text: 'Request that the office cite the legal basis and review options in writing', weight: 15 }
    ],
    deadlineRules: [
      { id: 'written_decision_follow_up', label: 'Follow up if no written notice within 7 days of request', trigger: 'informal_denial', targetDays: 7 }
    ],
    escalationOptions: [
      'Ask for the written decision, issue decided, reasons, evidence considered, and review rights in one request.',
      'Preserve the informal denial evidence so the office cannot later deny it happened.',
      'Use the written decision to trigger appeal-lane analysis once it is issued.'
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
    primaryCode: 'VRE.APPEAL.DISCONTINUANCE',
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
    primaryCode: 'VRE.APPEAL.DENIAL',
    supportingCodes: ['VRE.TRAINING.GRAD_SCHOOL', 'VRE.TRAINING.PREREQUISITES'],
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

export function getCommunitySignalSummary() {
  return cloneValue({
    label: USER_REPORTED_SOURCE_LABEL,
    disclaimer: 'Community reports are user-reported product signals, not legal authority.',
    reviewedAt: LAST_REVIEWED_AT,
    themes: COMMUNITY_SIGNAL_THEMES
  });
}

export function getProblemRouter() {
  return PROBLEM_ROUTER_BLUEPRINTS.map((option) => ({
    ...cloneValue(option),
    primaryWorkflow: getCaseIssueDefinition(option.primaryWorkflowId),
    supportingWorkflows: option.supportingWorkflowIds
      .map((workflowId) => getCaseIssueDefinition(workflowId))
      .filter(Boolean)
  }));
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
    trackRequested: normalizeOptionalString(payload.trackRequested, 'trackRequested', MAX_SHORT_TEXT_LENGTH),
    trackApproved: normalizeOptionalString(payload.trackApproved, 'trackApproved', MAX_SHORT_TEXT_LENGTH),
    employmentHandicapStatus: normalizeOptionalString(payload.employmentHandicapStatus, 'employmentHandicapStatus', MAX_SHORT_TEXT_LENGTH),
    seriousEmploymentHandicapStatus: normalizeOptionalString(payload.seriousEmploymentHandicapStatus, 'seriousEmploymentHandicapStatus', MAX_SHORT_TEXT_LENGTH),
    feasibilityStatus: normalizeOptionalString(payload.feasibilityStatus, 'feasibilityStatus', MAX_SHORT_TEXT_LENGTH),
    ipeStatus: normalizeIpeStatus(payload.ipeStatus),
    iilpStatus: normalizeOptionalString(payload.iilpStatus, 'iilpStatus', MAX_SHORT_TEXT_LENGTH),
    issueSummary: normalizeOptionalString(payload.issueSummary, 'issueSummary', MAX_LONG_TEXT_LENGTH, issue.desc),
    disputeHistory: normalizeOptionalString(payload.disputeHistory, 'disputeHistory', MAX_LONG_TEXT_LENGTH),
    escalationHistory: normalizeOptionalString(payload.escalationHistory, 'escalationHistory', MAX_LONG_TEXT_LENGTH),
    evidenceSummary: normalizeOptionalString(payload.evidenceSummary, 'evidenceSummary', MAX_LONG_TEXT_LENGTH),
    decisionNoticeDate: normalizeIsoDate(payload.decisionNoticeDate, 'decisionNoticeDate'),
    followUpDeadlineDate: normalizeIsoDate(payload.followUpDeadlineDate, 'followUpDeadlineDate'),
    termStart: normalizeIsoDate(payload.termStart, 'termStart'),
    termEnd: normalizeIsoDate(payload.termEnd, 'termEnd'),
    urgentDeadline: normalizeIsoDate(payload.urgentDeadline, 'urgentDeadline'),
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

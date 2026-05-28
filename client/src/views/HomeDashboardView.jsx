import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, Shield, 
  AlertOctagon, Award, Compass, 
  AlertTriangle, Clock, 
  Briefcase, Mail, Check, Copy, ArrowLeft,
  FileText, Printer, CheckCircle2, Plus, Trash2
} from 'lucide-react';

import { renderTemplate } from '../utils/templateRenderer.js';

// JSON Workflows
import counselorDelayWf from '../data/workflows/counselor-delay.json';
import suppliesDenialWf from '../data/workflows/supplies-denial.json';
import tuitionUnpaidWf from '../data/workflows/tuition-unpaid.json';
import subsistenceIssueWf from '../data/workflows/subsistence-issue.json';
import counselorNoShowWf from '../data/workflows/counselor-no-show.json';
import caseClosedWf from '../data/workflows/case-closed.json';
import feasibilityDenialWf from '../data/workflows/feasibility-denial.json';
import graduateSchoolJustificationWf from '../data/workflows/graduate-school-justification.json';
import currentDegreeDenialWf from '../data/workflows/current-degree-denial.json';
import ipeChangeWf from '../data/workflows/ipe-change.json';
import entitlementExhaustionWf from '../data/workflows/entitlement-exhaustion.json';
import retroactiveInductionWf from '../data/workflows/retroactive-induction.json';
import benefitStrategyCompareWf from '../data/workflows/benefit-strategy-compare.json';
import sehExtensionWf from '../data/workflows/seh-extension.json';
import writtenDecisionRequestWf from '../data/workflows/written-decision-request.json';

// JSON Templates
import suppliesRequestTpl from '../data/templates/supplies-request.json';
import counselorEscalationTpl from '../data/templates/counselor-escalation.json';
import tuitionDelayEscalationTpl from '../data/templates/tuition-delay-escalation.json';
import paymentAuditRequestTpl from '../data/templates/payment-audit-request.json';
import discontinuanceRebuttalTpl from '../data/templates/discontinuance-rebuttal.json';
import feasibilityRebuttalTpl from '../data/templates/feasibility-rebuttal.json';
import advancedTrainingJustificationTpl from '../data/templates/advanced-training-justification.json';
import degreeSuitabilityRebuttalTpl from '../data/templates/degree-suitability-rebuttal.json';
import ipeChangeLetterTpl from '../data/templates/ipe-change-letter.json';
import benefitStrategyMemoTpl from '../data/templates/benefit-strategy-memo.json';
import entitlementAuditExtensionTpl from '../data/templates/entitlement-audit-extension.json';
import retroactiveInductionRequestTpl from '../data/templates/retroactive-induction-request.json';
import sehExtensionLetterTpl from '../data/templates/seh-extension-letter.json';
import writtenDecisionRequestTpl from '../data/templates/written-decision-request.json';

import DISPUTE_AREAS from '../data/workflows/disputeAreas.json';
import { VRE_OFFICES } from '../data/data.js';
import {
  addCurrentCaseActivity,
  addCurrentCaseDeadline,
  addCurrentCaseDocument,
  deleteCurrentCaseActivity,
  fetchCaseDashboard,
  saveCurrentCaseRecord
} from '../utils/backendApi.js';
import { getHiddenToolPages } from '../config/pageRegistry.js';

const LOCAL_WORKFLOWS = [
  counselorDelayWf,
  counselorNoShowWf,
  suppliesDenialWf,
  tuitionUnpaidWf,
  subsistenceIssueWf,
  writtenDecisionRequestWf,
  caseClosedWf,
  feasibilityDenialWf,
  graduateSchoolJustificationWf,
  currentDegreeDenialWf,
  ipeChangeWf,
  entitlementExhaustionWf,
  retroactiveInductionWf,
  benefitStrategyCompareWf,
  sehExtensionWf
];

const LOCAL_WORKFLOW_BY_ID = new Map(LOCAL_WORKFLOWS.map((workflow) => [workflow.workflowId, workflow]));

const LOCAL_COMMUNITY_SIGNALS = {
  label: 'User-reported VR&E patterns from recent r/VeteransBenefits searches',
  disclaimer: 'Community reports are user-reported product signals, not legal authority.',
  themes: [
    {
      id: 'payments_subsistence',
      label: 'Subsistence allowance and MHA confusion',
      signalCount: 15,
      summary: 'Monthly rate elections, one-class-per-month schedules, summer credits, partial months, and delayed allowances are repeated pain points.'
    },
    {
      id: 'counselor_nonresponse',
      label: 'Counselor nonresponse and no-shows',
      signalCount: 15,
      summary: 'Veterans repeatedly report unanswered emails, missed appointments, and uncertainty about how to escalate locally.'
    },
    {
      id: 'advanced_training',
      label: 'Graduate school, retroactive induction, and entitlement exhaustion',
      signalCount: 35,
      summary: 'Graduate training necessity, GI Bill restoration, and 48-month limits show up as recurring approval and timing problems.'
    },
    {
      id: 'school_and_supplies',
      label: 'School authorization, tuition, and equipment disputes',
      signalCount: 20,
      summary: 'School billing failures and laptop or software disputes create immediate term-start risk.'
    }
  ]
};

const LOCAL_PROBLEM_ROUTER_OPTIONS = [
  {
    id: 'counselor_disappeared',
    prompt: 'My counselor disappeared',
    summary: 'Use this when emails, calls, or portal messages are going unanswered, a meeting was missed, or you do not know who can intervene.',
    signalCount: 15,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('counselor-delay'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('counselor-no-show'), LOCAL_WORKFLOW_BY_ID.get('written-decision-request')].filter(Boolean)
  },
  {
    id: 'school_not_paid',
    prompt: 'School starts soon and VA has not authorized anything',
    summary: 'Use this for unpaid tuition, missing authorizations, invoice confusion, account holds, or term-start emergency risk.',
    signalCount: 20,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('tuition-unpaid'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('written-decision-request')].filter(Boolean)
  },
  {
    id: 'monthly_allowance_wrong',
    prompt: 'My monthly payment is wrong or missing',
    summary: 'Use this for subsistence, Post-9/11 Chapter 31 rate, summer, hybrid, online-only, partial-month, OJT, or missing-payment confusion.',
    signalCount: 15,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('subsistence-issue'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('entitlement-exhaustion')].filter(Boolean)
  },
  {
    id: 'supplies_denied',
    prompt: 'I need a laptop, software, tools, or supplies',
    summary: 'Use this when an item tied to curriculum or accommodation needs is denied, reimbursement is demanded, or the bookstore cannot provide it.',
    signalCount: 10,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('supplies-denial'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('written-decision-request')].filter(Boolean)
  },
  {
    id: 'already_have_degree_denial',
    prompt: 'They denied me because I already have a degree',
    summary: 'Use this when VA says your current credentials already lead to gainful employment, but the jobs are not suitable or sustainable.',
    signalCount: 10,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('current-degree-denial'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('graduate-school-justification'), LOCAL_WORKFLOW_BY_ID.get('ipe-change')].filter(Boolean)
  },
  {
    id: 'grad_school_denied',
    prompt: 'Can VR&E pay for grad school, PA school, law school, MBA, nursing, or professional school?',
    summary: 'Use this when the dispute is really about graduate-level training necessity, cost, school choice, prerequisites, or licensure.',
    signalCount: 15,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('graduate-school-justification'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('current-degree-denial'), LOCAL_WORKFLOW_BY_ID.get('ipe-change')].filter(Boolean)
  },
  {
    id: 'told_infeasible',
    prompt: 'VA says I am too disabled or my goal is infeasible',
    summary: 'Use this when mental health, rating percentage, medical clearance, or functional limitations are being used to block the goal.',
    signalCount: 15,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('feasibility-denial'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('written-decision-request')].filter(Boolean)
  },
  {
    id: 'case_closed_discontinued',
    prompt: 'They discontinued or closed my case for lack of cooperation',
    summary: 'Use this when the office interrupted, discontinued, or closed the case and you need reinstatement or appeal analysis.',
    signalCount: 10,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('case-closed'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('written-decision-request')].filter(Boolean)
  },
  {
    id: 'running_out_of_months',
    prompt: 'I am running out of entitlement before graduation',
    summary: 'Use this when the file shows 0 months remaining, a graduation gap exists, or an extension may be needed.',
    signalCount: 10,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('entitlement-exhaustion'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('seh-extension')].filter(Boolean)
  },
  {
    id: 'retroactive_induction',
    prompt: 'Retroactive induction: can I get my GI Bill months back?',
    summary: 'Use this when earlier Chapter 33 usage or prior school terms should be reviewed as part of the same Chapter 31 rehabilitation path.',
    signalCount: 10,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('retroactive-induction'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('entitlement-exhaustion')].filter(Boolean)
  },
  {
    id: 'gi_bill_vs_vre',
    prompt: 'Should I use GI Bill or VR&E first?',
    summary: 'Use this for benefit-order strategy, preserving Chapter 33 months, comparing support types, and spotting retroactive-induction risk.',
    signalCount: 8,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('benefit-strategy-compare'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('retroactive-induction'), LOCAL_WORKFLOW_BY_ID.get('entitlement-exhaustion')].filter(Boolean)
  },
  {
    id: 'need_to_change_ipe',
    prompt: 'I need to change my IPE',
    summary: 'Use this when the current goal is no longer suitable, the labor market changed, or a better-fit goal is supported by evidence.',
    signalCount: 8,
    primaryWorkflow: LOCAL_WORKFLOW_BY_ID.get('ipe-change'),
    supportingWorkflows: [LOCAL_WORKFLOW_BY_ID.get('graduate-school-justification')].filter(Boolean)
  }
];

const MICRO_PROBLEM_CHIPS = [
  { id: 'pell', label: 'Can I use Pell Grant with VR&E?', workflowId: 'benefit-strategy-compare' },
  { id: 'reimbursement', label: 'Can VR&E reimburse what I bought?', workflowId: 'supplies-denial' },
  { id: 'eligible_vs_entitled', label: 'Eligible vs entitled vs signed IPE?', workflowId: 'ipe-change' },
  { id: 'work_while_in_vre', label: 'Can I work while in VR&E?', workflowId: 'benefit-strategy-compare' },
  { id: 'pt_tdiu_ssdi', label: 'Can I be 100% P&T, TDIU, or SSDI and still pursue VR&E?', workflowId: 'feasibility-denial' },
  { id: 'prerequisites', label: 'Can VR&E pay for prerequisites?', workflowId: 'graduate-school-justification' },
  { id: 'cert_exams', label: 'Can VR&E pay for certification exams?', workflowId: 'supplies-denial' },
  { id: 'ergonomic', label: 'Can VR&E pay for ergonomic equipment?', workflowId: 'supplies-denial' },
  { id: 'remote_equipment', label: 'Can VR&E pay for remote-work equipment?', workflowId: 'supplies-denial' },
  { id: 'put_it_in_writing', label: 'What if the counselor refuses to put it in writing?', workflowId: 'written-decision-request' }
];

const TEMPLATE_MAP = {
  'supplies-request': suppliesRequestTpl,
  'counselor-escalation': counselorEscalationTpl,
  'tuition-delay-escalation': tuitionDelayEscalationTpl,
  'payment-audit-request': paymentAuditRequestTpl,
  'discontinuance-rebuttal': discontinuanceRebuttalTpl,
  'feasibility-rebuttal': feasibilityRebuttalTpl,
  'advanced-training-justification': advancedTrainingJustificationTpl,
  'degree-suitability-rebuttal': degreeSuitabilityRebuttalTpl,
  'ipe-change-letter': ipeChangeLetterTpl,
  'benefit-strategy-memo': benefitStrategyMemoTpl,
  'entitlement-audit-extension': entitlementAuditExtensionTpl,
  'retroactive-induction-request': retroactiveInductionRequestTpl,
  'seh-extension-letter': sehExtensionLetterTpl,
  'written-decision-request': writtenDecisionRequestTpl
};

const ICON_MAP = {
  'counselor-delay': <Mail className="text-amber-400" size={20} />,
  'counselor-no-show': <Mail className="text-rose-400" size={20} />,
  'supplies-denial': <Briefcase className="text-blue-400" size={20} />,
  'tuition-unpaid': <Clock className="text-red-400" size={20} />,
  'subsistence-issue': <Clock className="text-cyan-400" size={20} />,
  'written-decision-request': <FileText className="text-fuchsia-400" size={20} />,
  'case-closed': <AlertTriangle className="text-red-500" size={20} />,
  'feasibility-denial': <AlertOctagon className="text-amber-500" size={20} />,
  'graduate-school-justification': <Award className="text-cyan-300" size={20} />,
  'current-degree-denial': <Award className="text-orange-300" size={20} />,
  'ipe-change': <Compass className="text-indigo-400" size={20} />,
  'entitlement-exhaustion': <AlertTriangle className="text-amber-300" size={20} />,
  'retroactive-induction': <Copy className="text-violet-300" size={20} />,
  'benefit-strategy-compare': <Compass className="text-cyan-400" size={20} />,
  'seh-extension': <Award className="text-emerald-400" size={20} />
};

const getCompiledLetter = (wf, facts, stage) => {
  if (!wf || !wf.templates || wf.templates.length === 0) return '';
  const tpl = TEMPLATE_MAP[wf.templates[0]];
  if (!tpl) return '';
  
  const variables = {
    ...facts,
    stage: stage,
    date: new Date().toLocaleDateString()
  };
  return renderTemplate(tpl.body, variables);
};


const getAdjustedLetter = (baseLetter, tone, facts, stage, wfTitle) => {
  const dateStr = new Date().toLocaleDateString();
  const veteranName = facts.veteranName || '[Veteran Name]';
  const caseNumber = facts.caseNumber || '[VA Case Number]';
  const counselorName = facts.counselorName || '[Counselor Name]';
  const vreoOfficer = facts.vreoOfficer || '[VR&E Officer Name]';
  const contactInfo = facts.veteranContact || '[Your Email / Phone]';

  // Clean headers if they already exist in the base letter
  const cleanLetter = baseLetter
    .replace(/^DATE:.*?\n/img, '')
    .replace(/^TO:.*?\n/img, '')
    .replace(/^FROM:.*?\n/img, '')
    .replace(/^SUBJECT:.*?\n/img, '')
    .trim();

  switch (tone) {
    case 'assertive':
      return `DATE: ${dateStr}
TO: VR&E Case Manager ${counselorName}
FROM: Veteran ${veteranName} (Case Reference: ${caseNumber})
SUBJECT: FORMAL STATEMENT OF REHABILITATION NECESSITY - Chapter 31 Services

Dear Case Manager ${counselorName},

I am writing to formally submit this request under the statutory provisions of 38 U.S.C. § 3104 and the binding regulations of 38 C.F.R. Part 21.

${cleanLetter}

Please be advised that pursuant to 38 U.S.C. § 5104(b) and 38 C.F.R. § 21.420, I am entitled to receive a formal, written decision notice (VA Form 20-0998) regarding this request within a reasonable time. This written notice must detail the specific evidence considered, the regulatory rules applied, and full administrative review options.

Respectfully submitted,
${veteranName}
Contact: ${contactInfo}`;

    case 'escalation':
      return `DATE: ${dateStr}
TO: VR&E Officer ${vreoOfficer} / Regional Office Leadership
FROM: Veteran ${veteranName} (Case Reference: ${caseNumber})
SUBJECT: REQUEST FOR SUPERVISORY INTERVENTION - VR&E ADMINISTRATIVE COMPLIANCE

Dear VR&E Officer ${vreoOfficer},

I am writing to request immediate supervisory intervention under 38 C.F.5. § 21.412. I have experienced ongoing administrative delays and/or non-statutory barriers regarding my rehabilitation program for "${wfTitle}".

${cleanLetter}

I have compiled a communication log and evidence package detailing these issues. I request that your office review the facts and direct my case manager to comply with rehabilitation necessity guidelines. If this request is denied, please ensure a formal VA Form 20-0998 decision notice is issued immediately.

Sincerely,
${veteranName}
Contact Info: ${contactInfo}`;

    case 'congressional':
      return `DATE: ${dateStr}
TO: Congressional Liaison / Office of Representative/Senator
FROM: Veteran ${veteranName} (Case Reference: ${caseNumber})
SUBJECT: PRIVACY ACT RELEASE & CONSTITUENT INQUIRY - VA VR&E PROGRAM

Dear Congressional Staff / Liaison,

I am writing to request a formal constituent inquiry regarding my Vocational Rehabilitation and Employment (VR&E) case under 38 U.S.C. Chapter 31. I am facing administrative barriers that are preventing me from achieving my rehabilitation goal.

Specifically, the issue involves: "${wfTitle}".

Below is the context of my request:
${cleanLetter}

I have signed the required Privacy Act Waiver. I request that your office contact the VA Regional Office VR&E Liaison to obtain a status update and ensure compliance with federal regulations. (38 U.S.C. Chapter 31)

Respectfully,
${veteranName}
Contact: ${contactInfo}`;

    case 'professional':
    default:
      return `DATE: ${dateStr}
TO: VR&E Case Manager ${counselorName}
FROM: Veteran ${veteranName}
SUBJECT: Request regarding Chapter 31 Services - ${wfTitle}

Dear Case Manager ${counselorName},

I hope this message finds you well. I am writing to check in on my case status and request services regarding: "${wfTitle}".

${cleanLetter}

I look forward to discussing this at our next appointment. Thank you for your assistance.

Sincerely,
${veteranName}
Contact: ${contactInfo}`;
  }
};


const CASE_STAGES = [
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

const CASE_SYNC_STATUS_LABELS = {
  offline: 'Offline',
  syncing: 'Syncing',
  synced: 'Synced',
  error: 'Sync issue'
};

const CASE_TRACK_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'reemployment', label: 'Reemployment' },
  { value: 'rapid_employment', label: 'Rapid Access to Employment' },
  { value: 'self_employment', label: 'Self-Employment' },
  { value: 'long_term', label: 'Employment Through Long-Term Services' },
  { value: 'independent_living', label: 'Independent Living' }
];

const CASE_HANDICAP_STATUS_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'not_addressed', label: 'Not addressed' },
  { value: 'found', label: 'Found' },
  { value: 'denied', label: 'Denied' },
  { value: 'disputed', label: 'Disputed' }
];

const CASE_FEASIBILITY_STATUS_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'not_addressed', label: 'Not addressed' },
  { value: 'feasible', label: 'Feasible' },
  { value: 'extended_evaluation', label: 'Extended evaluation' },
  { value: 'currently_infeasible', label: 'Currently infeasible' },
  { value: 'disputed', label: 'Disputed' }
];

const CASE_IPE_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not started' },
  { value: 'under_review', label: 'Under review' },
  { value: 'draft_in_progress', label: 'Draft in progress' },
  { value: 'signed', label: 'Signed' },
  { value: 'amendment_requested', label: 'Amendment requested' },
  { value: 'amendment_denied', label: 'Amendment denied' },
  { value: 'interrupted', label: 'Interrupted' },
  { value: 'discontinued', label: 'Discontinued' },
  { value: 'rehabilitated', label: 'Rehabilitated' }
];

const CASE_IILP_STATUS_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'not_requested', label: 'Not requested' },
  { value: 'evaluation_requested', label: 'Evaluation requested' },
  { value: 'draft_in_progress', label: 'Draft in progress' },
  { value: 'active', label: 'Active' },
  { value: 'amendment_requested', label: 'Amendment requested' },
  { value: 'denied', label: 'Denied' },
  { value: 'completed', label: 'Completed' }
];

const CASE_WORKSPACE_DEFAULTS = {
  veteranName: '',
  claimantReference: '',
  counselorName: '',
  regionalOffice: '',
  schoolName: '',
  issueSummary: '',
  trackRequested: '',
  trackApproved: '',
  employmentHandicapStatus: '',
  seriousEmploymentHandicapStatus: '',
  feasibilityStatus: '',
  ipeStatus: 'not_started',
  iilpStatus: '',
  termStart: '',
  termEnd: '',
  urgentDeadline: '',
  disputeHistory: '',
  evidenceSummary: '',
  escalationHistory: ''
};

function formatCaseStageLabel(caseStageValue) {
  if (!caseStageValue) {
    return CASE_STAGES[0];
  }

  const normalizedValue = caseStageValue.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return CASE_STAGES.find((stage) => (
    stage.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') === normalizedValue
  )) || CASE_STAGES[0];
}

function normalizeCaseStageValue(stageLabel) {
  return stageLabel.toLowerCase().replace(/, /g, '_').replace(/ \/ /g, '_').replace(/ /g, '_');
}

function formatCaseWorkspaceValue(value, fallback = 'Not set') {
  if (!value) {
    return fallback;
  }

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function inferIpeStatusFromStage(stageLabel) {
  switch (stageLabel) {
    case 'Entitled, No IPE':
      return 'under_review';
    case 'IPE Signed':
      return 'signed';
    case 'In School / Training':
    case 'Employment Services':
      return 'signed';
    case 'Interrupted Status':
      return 'interrupted';
    case 'Discontinued Status':
      return 'discontinued';
    case 'Rehabilitated':
      return 'rehabilitated';
    default:
      return 'not_started';
  }
}

function summarizeFormFacts(facts) {
  const entries = Object.entries(facts)
    .filter(([, value]) => value != null && String(value).trim())
    .slice(0, 8);

  if (entries.length === 0) {
    return '';
  }

  return entries
    .map(([key, value]) => `${key}: ${String(value).trim()}`)
    .join('\n');
}

function mapActivityToContactLog(activity) {
  return {
    id: activity.id,
    date: activity.occurredAt || '',
    method: activity.activityType || 'Note',
    request: activity.summary || '',
    response: activity.responseStatus || 'No response'
  };
}

function HomeDashboardView({
  reduceMotion,
  setActiveView,
  setSelectedSection,
  privacyMode,
  bookmarksCount,
  userMode,
  currentCaseStage,
  setCurrentCaseStage,
  isBackendOnline,
  openSettings,
  onClearAllData
}) {
  const [workflowCatalog, setWorkflowCatalog] = useState(LOCAL_WORKFLOWS);
  const [caseDashboard, setCaseDashboard] = useState(null);
  const [caseSyncStatus, setCaseSyncStatus] = useState(isBackendOnline ? 'syncing' : 'offline');
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [wizardStep, setWizardStep] = useState(0); // 0: Case Stage, 1: Collect Facts, 2: Report / Letter
  const [tempStage, setTempStage] = useState(formatCaseStageLabel(currentCaseStage));
  const [formFacts, setFormFacts] = useState({});
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [letterTone] = useState('professional'); // 'professional' | 'assertive' | 'escalation' | 'congressional'
  const [selectedOffice, setSelectedOffice] = useState('');
  const [caseWorkspaceDraft, setCaseWorkspaceDraft] = useState(CASE_WORKSPACE_DEFAULTS);
  const [newDeadline, setNewDeadline] = useState({ title: '', dueDate: '', source: '', notes: '' });
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savingLetter, setSavingLetter] = useState(false);

  // Case Packet additional states
  const [packetTab, setPacketTab] = useState('summary'); // 'summary' | 'evidence' | 'timeline' | 'authorities' | 'letter'
  const [checkedEvidence, setCheckedEvidence] = useState({});
  const [contactsLog, setContactsLog] = useState([]);
  const [newContact, setNewContact] = useState({ date: '', method: 'Email', request: '', response: 'No response' });
  const [hasWrittenNoticeState, setHasWrittenNoticeState] = useState('no'); // 'yes' | 'no'

  const getDisputeAreaForWorkflow = (wfId) => {
    const map = {
      'counselor-delay': 'counselor_delay',
      'supplies-denial': 'computer_denial',
      'tuition-unpaid': 'tuition_unpaid',
      'case-closed': 'case_closed',
      'feasibility-denial': 'feasibility_denial',
      'seh-extension': 'seh_extension'
    };
    const areaId = map[wfId];
    return DISPUTE_AREAS.find(a => a.id === areaId);
  };

  useEffect(() => {
    if (!isBackendOnline) {
      return;
    }

    let isCancelled = false;

    fetchCaseDashboard({ privacyMode })
      .then((dashboard) => {
        if (isCancelled) {
          return;
        }

        if (Array.isArray(dashboard.workflows) && dashboard.workflows.length > 0) {
          setWorkflowCatalog(dashboard.workflows);
        } else {
          setWorkflowCatalog(LOCAL_WORKFLOWS);
        }

        setCaseDashboard(dashboard);
        setCaseSyncStatus('synced');
      })
      .catch((error) => {
        console.error('Failed to load case dashboard from backend:', error);
        if (isCancelled) {
          return;
        }

        setWorkflowCatalog(LOCAL_WORKFLOWS);
        setCaseDashboard(null);
        setCaseSyncStatus('error');
      });

    return () => {
      isCancelled = true;
    };
  }, [isBackendOnline, privacyMode]);

  const currentCaseRecord = caseDashboard?.currentCase || null;

  useEffect(() => {
    if (!currentCaseRecord) {
      return;
    }

    setCaseWorkspaceDraft({
      veteranName: currentCaseRecord.veteranName || '',
      claimantReference: currentCaseRecord.claimantReference || '',
      counselorName: currentCaseRecord.counselorName || '',
      regionalOffice: currentCaseRecord.regionalOffice || '',
      schoolName: currentCaseRecord.schoolName || '',
      issueSummary: currentCaseRecord.issueSummary || '',
      trackRequested: currentCaseRecord.trackRequested || '',
      trackApproved: currentCaseRecord.trackApproved || '',
      employmentHandicapStatus: currentCaseRecord.employmentHandicapStatus || '',
      seriousEmploymentHandicapStatus: currentCaseRecord.seriousEmploymentHandicapStatus || '',
      feasibilityStatus: currentCaseRecord.feasibilityStatus || '',
      ipeStatus: currentCaseRecord.ipeStatus || 'not_started',
      iilpStatus: currentCaseRecord.iilpStatus || '',
      termStart: currentCaseRecord.termStart || '',
      termEnd: currentCaseRecord.termEnd || '',
      urgentDeadline: currentCaseRecord.urgentDeadline || '',
      disputeHistory: currentCaseRecord.disputeHistory || '',
      evidenceSummary: currentCaseRecord.evidenceSummary || '',
      escalationHistory: currentCaseRecord.escalationHistory || ''
    });
    setSelectedOffice(currentCaseRecord.regionalOffice || '');
  }, [currentCaseRecord]);

  const buildCurrentCasePayload = (workflow = activeWorkflow, stageLabel = tempStage, extraFacts = formFacts) => {
    if (!workflow) {
      return null;
    }

    const effectiveTrackRequested = caseWorkspaceDraft.trackRequested || currentCaseRecord?.trackRequested || workflow.track || '';
    const effectiveTrackApproved = caseWorkspaceDraft.trackApproved || currentCaseRecord?.trackApproved || '';
    const effectiveIpeStatus = caseWorkspaceDraft.ipeStatus || currentCaseRecord?.ipeStatus || inferIpeStatusFromStage(stageLabel);
    const effectiveUrgentDeadline = caseWorkspaceDraft.urgentDeadline || currentCaseRecord?.urgentDeadline || '';

    return {
      title: workflow.title,
      issueTypeId: workflow.workflowId,
      caseStage: stageLabel,
      track: effectiveTrackApproved || effectiveTrackRequested || workflow.track || 'long_term',
      trackRequested: effectiveTrackRequested,
      trackApproved: effectiveTrackApproved,
      employmentHandicapStatus: caseWorkspaceDraft.employmentHandicapStatus || currentCaseRecord?.employmentHandicapStatus || '',
      seriousEmploymentHandicapStatus: caseWorkspaceDraft.seriousEmploymentHandicapStatus || currentCaseRecord?.seriousEmploymentHandicapStatus || '',
      feasibilityStatus: caseWorkspaceDraft.feasibilityStatus || currentCaseRecord?.feasibilityStatus || '',
      ipeStatus: effectiveIpeStatus,
      iilpStatus: caseWorkspaceDraft.iilpStatus || currentCaseRecord?.iilpStatus || '',
      veteranName: extraFacts.veteranName || caseWorkspaceDraft.veteranName || currentCaseRecord?.veteranName || '',
      claimantReference: extraFacts.caseNumber || caseWorkspaceDraft.claimantReference || currentCaseRecord?.claimantReference || '',
      counselorName: extraFacts.counselorName || extraFacts.vrcName || caseWorkspaceDraft.counselorName || currentCaseRecord?.counselorName || '',
      regionalOffice: selectedOffice || caseWorkspaceDraft.regionalOffice || currentCaseRecord?.regionalOffice || '',
      schoolName: extraFacts.schoolName || extraFacts.schoolOrProgram || extraFacts.courseOrProgram || extraFacts.goalDenied || caseWorkspaceDraft.schoolName || currentCaseRecord?.schoolName || '',
      issueSummary: caseWorkspaceDraft.issueSummary || workflow.desc || currentCaseRecord?.issueSummary || '',
      disputeHistory: caseWorkspaceDraft.disputeHistory || summarizeFormFacts(extraFacts),
      escalationHistory: caseWorkspaceDraft.escalationHistory || currentCaseRecord?.escalationHistory || '',
      evidenceSummary: caseWorkspaceDraft.evidenceSummary || currentCaseRecord?.evidenceSummary || '',
      decisionNoticeDate: '',
      followUpDeadlineDate: effectiveUrgentDeadline || currentCaseRecord?.followUpDeadlineDate || '',
      termStart: caseWorkspaceDraft.termStart || currentCaseRecord?.termStart || '',
      termEnd: caseWorkspaceDraft.termEnd || currentCaseRecord?.termEnd || '',
      urgentDeadline: effectiveUrgentDeadline,
      createdFromWorkflowId: workflow.workflowId
    };
  };

  const persistCurrentCase = async (workflow = activeWorkflow, stageLabel = tempStage, extraFacts = formFacts) => {
    if (!isBackendOnline || !workflow) {
      return null;
    }

    try {
      setCaseSyncStatus('syncing');
      const currentCase = await saveCurrentCaseRecord(buildCurrentCasePayload(workflow, stageLabel, extraFacts), {
        privacyMode
      });
      setCaseDashboard((previousDashboard) => ({
        ...(previousDashboard || {}),
        currentCase,
        workflows: previousDashboard?.workflows || workflowCatalog,
        issueTaxonomy: previousDashboard?.issueTaxonomy,
        privacyGuidance: previousDashboard?.privacyGuidance
      }));
      setCaseSyncStatus('synced');
      return currentCase;
    } catch (error) {
      console.error('Failed to persist structured case record:', error);
      setCaseSyncStatus('error');
      return null;
    }
  };

  const handleWorkspaceDraftChange = (field, value) => {
    setCaseWorkspaceDraft((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const resolveCurrentWorkflowContext = () => (
    activeWorkflow
    || resolveWorkflowById(currentCaseRecord?.issueTypeId)
    || workflowCatalog[0]
    || LOCAL_WORKFLOWS[0]
    || null
  );

  const handleSaveWorkspace = async () => {
    const workflow = resolveCurrentWorkflowContext();
    if (!workflow) {
      window.alert('Start with a problem route or workflow before saving a structured case dashboard.');
      return;
    }

    try {
      setSavingWorkspace(true);
      const stageLabel = currentCaseRecord?.caseStage || tempStage;
      await persistCurrentCase(workflow, stageLabel, formFacts);
    } finally {
      setSavingWorkspace(false);
    }
  };

  const handleAddDeadline = async () => {
    if (!newDeadline.title || !newDeadline.dueDate) {
      window.alert('Please enter both a deadline title and due date.');
      return;
    }

    if (!isBackendOnline || !currentCaseRecord) {
      window.alert('Open or create a structured case record before adding tracked deadlines.');
      return;
    }

    try {
      setCaseSyncStatus('syncing');
      const deadline = await addCurrentCaseDeadline({
        title: newDeadline.title,
        dueDate: newDeadline.dueDate,
        status: 'open',
        source: newDeadline.source,
        notes: newDeadline.notes
      }, { privacyMode });

      setCaseDashboard((previousDashboard) => ({
        ...(previousDashboard || {}),
        currentCase: previousDashboard?.currentCase
          ? {
              ...previousDashboard.currentCase,
              deadlines: [...(previousDashboard.currentCase.deadlines || []), deadline].sort((left, right) => (
                String(left.dueDate || '').localeCompare(String(right.dueDate || ''))
              ))
            }
          : previousDashboard?.currentCase
      }));
      setNewDeadline({ title: '', dueDate: '', source: '', notes: '' });
      setCaseSyncStatus('synced');
    } catch (error) {
      console.error('Failed to save case deadline:', error);
      setCaseSyncStatus('error');
    }
  };

  const handleSaveActionLetter = async (compiledLetter, workflow) => {
    if (!isBackendOnline || !currentCaseRecord || !compiledLetter) {
      return;
    }

    try {
      setSavingLetter(true);
      setCaseSyncStatus('syncing');
      const savedDocument = await addCurrentCaseDocument({
        documentType: 'action_letter',
        title: `${workflow.title} action letter`,
        templateId: workflow.templates?.[0] || workflow.workflowId,
        status: 'draft',
        generatedBody: compiledLetter,
        notes: workflow.problemRouterLabel || workflow.desc || ''
      }, { privacyMode });

      setCaseDashboard((previousDashboard) => ({
        ...(previousDashboard || {}),
        currentCase: previousDashboard?.currentCase
          ? {
              ...previousDashboard.currentCase,
              documents: [savedDocument, ...(previousDashboard.currentCase.documents || [])]
            }
          : previousDashboard?.currentCase
      }));
      setCaseSyncStatus('synced');
    } catch (error) {
      console.error('Failed to save action letter to case record:', error);
      setCaseSyncStatus('error');
    } finally {
      setSavingLetter(false);
    }
  };

  const handleAddContactAttempt = async () => {
    if (!newContact.date || !newContact.request) {
      window.alert('Please fill out date and details.');
      return;
    }

    if (isBackendOnline && caseDashboard?.currentCase) {
      try {
        setCaseSyncStatus('syncing');
        const activity = await addCurrentCaseActivity({
          activityType: newContact.method,
          occurredAt: newContact.date,
          summary: newContact.request,
          responseStatus: newContact.response,
          notes: ''
        }, { privacyMode });

        setContactsLog((previous) => [...previous, mapActivityToContactLog(activity)]);
        setCaseDashboard((previousDashboard) => ({
          ...(previousDashboard || {}),
          currentCase: previousDashboard?.currentCase
            ? {
                ...previousDashboard.currentCase,
                activities: [...(previousDashboard.currentCase.activities || []), activity]
              }
            : previousDashboard?.currentCase
        }));
        setCaseSyncStatus('synced');
      } catch (error) {
        console.error('Failed to save case activity:', error);
        setCaseSyncStatus('error');
      }
    } else {
      setContactsLog((previous) => [
        ...previous,
        {
          ...newContact,
          id: Date.now().toString()
        }
      ]);
    }

    setNewContact({ date: '', method: 'Email', request: '', response: 'No response' });
  };

  const handleRemoveContactAttempt = async (contactId) => {
    if (isBackendOnline && caseDashboard?.currentCase) {
      try {
        setCaseSyncStatus('syncing');
        await deleteCurrentCaseActivity(contactId, { privacyMode });
        setCaseSyncStatus('synced');
      } catch (error) {
        console.error('Failed to delete case activity:', error);
        setCaseSyncStatus('error');
      }
    }

    setContactsLog((previous) => previous.filter((entry) => entry.id !== contactId));
    setCaseDashboard((previousDashboard) => ({
      ...(previousDashboard || {}),
      currentCase: previousDashboard?.currentCase
        ? {
            ...previousDashboard.currentCase,
            activities: (previousDashboard.currentCase.activities || []).filter((entry) => entry.id !== contactId)
          }
        : previousDashboard?.currentCase
    }));
  };

  const getModeAdvice = () => {
    switch (userMode) {
      case 'advocate':
        return {
          title: 'VSO / Advocate Strategy',
          text: 'Focus on building a solid Case Theory. Track evidence metrics, review 38 C.F.R. § 21.412 rules for administrative reviews, and prepare the specific issue-rule-analysis packet before requesting VREO intervention.',
          badge: 'ADVOCATE MODE'
        };
      case 'school':
        return {
          title: 'School SCO Compliance Info',
          text: 'Verify active VR&E authorizations (VAF 28-1905 equivalent in Tungsten/Banner). Ensure invoices are itemized, and note term start dates to initiate payment delay escalations if authorizations lag past 14 days.',
          badge: 'SCHOOL COMPLIANCE MODE'
        };
      case 'legal':
        return {
          title: 'Attorney / Legal Mode',
          text: 'Examine decisions for notice defects. Map errors under 38 U.S.C. § 5104(b) requirements. Rely on controlling statutes (38 U.S.C. Chapter 31) and binding regulations (38 C.F.R. Part 21) rather than manual (M28C) policy guidance.',
          badge: 'LEGAL / LITIGATION MODE'
        };
      default:
        return {
          title: 'Veteran Strategy Tip',
          text: 'Keep communications in writing. Never accept verbal counselor denials. If your counselor refuses a laptop or training goal, request that they provide their decision and reasons in writing on VA Form 20-0998.', // @cite 38-cfr-21-198
          badge: 'VETERAN SELF-ADVOCACY'
        };
    }
  };

  const modeAdvice = getModeAdvice();
  const currentCaseIssueTitle = currentCaseRecord?.issue?.title || currentCaseRecord?.title || 'No active case record';
  const currentCaseNextDeadline = currentCaseRecord?.urgentDeadline
    || currentCaseRecord?.followUpDeadlineDate
    || currentCaseRecord?.deadlines?.[0]?.dueDate
    || '';
  const dashboardHeroMetrics = [
    {
      label: 'Case posture',
      value: currentCaseRecord?.caseStage || tempStage
    },
    {
      label: 'Issue catalog',
      value: `${caseDashboard?.issueTaxonomy?.total || workflowCatalog.length} indexed issues`
    },
    {
      label: 'Workspace mode',
      value: isBackendOnline ? 'Structured backend online' : 'Static workspace mode'
    },
    {
      label: 'Bookmarks',
      value: `${bookmarksCount} saved authorities`
    }
  ];
  const communitySignals = caseDashboard?.communitySignals || LOCAL_COMMUNITY_SIGNALS;
  const problemRouterOptions = Array.isArray(caseDashboard?.problemRouter?.options) && caseDashboard.problemRouter.options.length > 0
    ? caseDashboard.problemRouter.options
    : LOCAL_PROBLEM_ROUTER_OPTIONS;
  const resolveWorkflowById = (workflowId) => (
    workflowCatalog.find((workflow) => workflow.workflowId === workflowId)
    || LOCAL_WORKFLOW_BY_ID.get(workflowId)
    || null
  );
  const microProblemChips = MICRO_PROBLEM_CHIPS
    .map((chip) => ({
      ...chip,
      workflow: resolveWorkflowById(chip.workflowId)
    }))
    .filter((chip) => chip.workflow);
  const dashboardNextMove = currentCaseRecord
    ? 'Review the active issue record, confirm the next deadline, and open the matching workflow only if the record needs a new action packet.'
    : 'Start with the issue that best matches the current barrier, capture only the minimum facts needed, and build the packet from binding authority outward.';
  const activeOfficeDetails = selectedOffice
    ? VRE_OFFICES.find((office) => office.office === selectedOffice)
    : null;
  const workspaceSnapshotCards = currentCaseRecord ? [
    {
      label: 'Track posture',
      value: formatCaseWorkspaceValue(currentCaseRecord.trackApproved || currentCaseRecord.trackRequested || currentCaseRecord.track, 'Not captured')
    },
    {
      label: 'Feasibility',
      value: formatCaseWorkspaceValue(currentCaseRecord.feasibilityStatus, 'Not captured')
    },
    {
      label: 'IPE / IILP',
      value: `${formatCaseWorkspaceValue(currentCaseRecord.ipeStatus, 'Not set')} / ${formatCaseWorkspaceValue(currentCaseRecord.iilpStatus, 'Not set')}`
    },
    {
      label: 'School term',
      value: currentCaseRecord.termStart || currentCaseRecord.termEnd
        ? `${currentCaseRecord.termStart || 'Start TBD'} -> ${currentCaseRecord.termEnd || 'End TBD'}`
        : 'No term dates logged'
    },
    {
      label: 'Contact log',
      value: `${currentCaseRecord.activities?.length || 0} entries`
    },
    {
      label: 'Generated docs',
      value: `${currentCaseRecord.documents?.length || 0} saved drafts`
    }
  ] : [];
  const currentRegionalOffice = selectedOffice || currentCaseRecord?.regionalOffice || '';
  const currentIssueSummary = caseWorkspaceDraft.issueSummary
    || currentCaseRecord?.issueSummary
    || 'No issue summary captured yet.';
  const totalDeadlines = currentCaseRecord?.deadlines?.length || 0;
  const totalDocuments = currentCaseRecord?.documents?.length || 0;
  const totalActivities = currentCaseRecord?.activities?.length || contactsLog.length || 0;
  const recentActivityLog = (contactsLog.length > 0
    ? contactsLog
    : (currentCaseRecord?.activities || []).map(mapActivityToContactLog))
    .slice(-4)
    .reverse();
  const syncStatusClasses = caseSyncStatus === 'synced'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : caseSyncStatus === 'error'
      ? 'border-red-500/30 bg-red-500/10 text-red-300'
      : 'border-slate-700 bg-slate-950/50 text-slate-300';
  const privacyPostureLabel = privacyMode ? 'Session-first local mode' : 'Persistent local mode';
  const caseHealthSignals = [
    {
      label: 'Issue record',
      value: currentCaseRecord ? 'Active case record loaded' : 'No active case record',
      detail: currentCaseRecord ? currentCaseIssueTitle : 'Open a workflow from the problem router to create the case.',
      ready: Boolean(currentCaseRecord)
    },
    {
      label: 'Deadline control',
      value: currentCaseNextDeadline || 'No deadline logged',
      detail: currentCaseNextDeadline ? 'A next action date is on file.' : 'Add the next school, review, or escalation date.',
      ready: Boolean(currentCaseNextDeadline)
    },
    {
      label: 'Escalation path',
      value: currentRegionalOffice || 'Regional office not selected',
      detail: currentRegionalOffice ? 'Office routing is ready for VREO escalation.' : 'Select the regional office and confirm the VREO chain.',
      ready: Boolean(currentRegionalOffice)
    },
    {
      label: 'Packet history',
      value: totalDocuments > 0 ? `${totalDocuments} saved drafts` : 'No saved packet drafts',
      detail: totalDocuments > 0 ? 'Prior letters can be reused and updated.' : 'Save the first action letter into the case file.',
      ready: totalDocuments > 0
    }
  ];
  const workspacePriorityQueue = currentCaseRecord
    ? [
        !currentCaseNextDeadline && {
          id: 'log-deadline',
          title: 'Log the next hard deadline',
          detail: 'Capture the next school, review-lane, or escalation date before building anything else.'
        },
        !currentRegionalOffice && {
          id: 'set-office',
          title: 'Set the regional office and VREO path',
          detail: 'This makes the escalation chain usable when the counselor stalls or a supervisor review is needed.'
        },
        !caseWorkspaceDraft.issueSummary && !currentCaseRecord?.issueSummary && {
          id: 'capture-issue',
          title: 'Write the issue summary in one sentence',
          detail: 'State what VA did, what relief is requested, and why the current posture is wrong.'
        },
        totalActivities === 0 && {
          id: 'log-contact',
          title: 'Start the counselor contact timeline',
          detail: 'Add the first outreach attempt so the packet has a documented contact history.'
        },
        totalDocuments === 0 && {
          id: 'save-draft',
          title: 'Save the first packet draft to the case',
          detail: 'Once a letter is generated, store it in the case file so the record can be reused.'
        }
      ].filter(Boolean)
    : [
        {
          id: 'route-problem',
          title: 'Start from the real VR&E problem',
          detail: 'Open the problem router first so the dashboard builds the right case record instead of a generic note.'
        },
        {
          id: 'capture-core-facts',
          title: 'Capture only the minimum case facts',
          detail: 'Save the issue, next deadline, office, and requested relief before assembling authorities.'
        },
        {
          id: 'build-first-packet',
          title: 'Build a first packet from one workflow',
          detail: 'Use one workflow to produce the opening summary, evidence list, and action letter.'
        }
      ];

  const handleStartWorkflow = (wf) => {
    const currentCase = caseDashboard?.currentCase;
    const stageLabel = formatCaseStageLabel(currentCaseStage);
    setActiveWorkflow(wf);
    setWizardStep(0);
    setTempStage(stageLabel);
    setFormFacts({});
    setCopiedLetter(false);
    setPacketTab('summary');
    setCheckedEvidence({});
    setHasWrittenNoticeState('no');
    setContactsLog(
      currentCase && currentCase.issueTypeId === wf.workflowId && Array.isArray(currentCase.activities)
        ? currentCase.activities.map(mapActivityToContactLog)
        : []
    );
    persistCurrentCase(wf, stageLabel, {});
  };

  const handleRouteProblem = (routeOption) => {
    const workflow = routeOption?.primaryWorkflow || resolveWorkflowById(routeOption?.primaryWorkflowId);

    if (!workflow) {
      return;
    }

    handleStartWorkflow(workflow);
  };

  const handleMicroProblemRoute = (workflowId) => {
    const workflow = resolveWorkflowById(workflowId);

    if (!workflow) {
      return;
    }

    handleStartWorkflow(workflow);
  };

  const handleNextStep = () => {
    if (wizardStep === 0) {
      setCurrentCaseStage(normalizeCaseStageValue(tempStage));
      persistCurrentCase(activeWorkflow, tempStage, formFacts);
    }

    if (wizardStep === 1) {
      persistCurrentCase(activeWorkflow, tempStage, formFacts);
    }

    setWizardStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setWizardStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveWorkflow(null);
    setWizardStep(0);
    setTempStage(formatCaseStageLabel(currentCaseStage));
    setFormFacts({});
    setCopiedLetter(false);
    setPacketTab('summary');
    setCheckedEvidence({});
    setContactsLog([]);
  };

  const handleFactChange = (name, value) => {
    setFormFacts(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyLetter = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleCitationClick = (citationId) => {
    // Navigate to reference tab and load document
    setSelectedSection({ type: citationId.startsWith('38-usc') ? 'usc' : citationId.startsWith('38-cfr') ? 'cfr' : 'm28c', id: citationId });
    setActiveView('authority_library');
  };

  const currentWorkflowContext = resolveCurrentWorkflowContext();
  const counselorRoute = problemRouterOptions.find((option) => option.id === 'counselor_disappeared') || problemRouterOptions[0] || null;
  const schoolRoute = problemRouterOptions.find((option) => option.id === 'school_not_paid') || problemRouterOptions[1] || null;
  const writtenDecisionWorkflow = resolveWorkflowById('written-decision-request');
  const actionAccentStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-400/40',
      badge: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
      button: 'bg-cyan-600 hover:bg-cyan-500'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-400/40',
      badge: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
      button: 'bg-amber-600 hover:bg-amber-500'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-400/40',
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
      button: 'bg-emerald-600 hover:bg-emerald-500'
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-400/40',
      badge: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200',
      button: 'bg-indigo-600 hover:bg-indigo-500'
    },
    violet: {
      border: 'border-fuchsia-500/20 hover:border-fuchsia-400/40',
      badge: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200',
      button: 'bg-fuchsia-600 hover:bg-fuchsia-500'
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-400/40',
      badge: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
      button: 'bg-rose-600 hover:bg-rose-500'
    }
  };
  const quickActionCards = [
    {
      id: 'resume-case',
      eyebrow: 'Case workflow',
      title: currentWorkflowContext ? 'Resume the active issue workflow' : 'Start the first case workflow',
      text: currentWorkflowContext
        ? 'Reopen the matching guided workflow and continue packet assembly from the case record.'
        : 'Open a guided workflow and create the first structured issue record.',
      actionLabel: currentWorkflowContext ? 'Open active workflow' : 'Open first workflow',
      icon: FileText,
      accent: 'cyan',
      onClick: () => {
        if (currentWorkflowContext) {
          handleStartWorkflow(currentWorkflowContext);
        }
      },
      disabled: !currentWorkflowContext
    },
    {
      id: 'counselor-route',
      eyebrow: 'Escalation',
      title: 'Counselor not responding',
      text: 'Launch the intake that builds the written record, supervisor escalation, and follow-up timeline.',
      actionLabel: 'Open counselor route',
      icon: Mail,
      accent: 'amber',
      onClick: () => counselorRoute && handleRouteProblem(counselorRoute),
      disabled: !counselorRoute
    },
    {
      id: 'school-route',
      eyebrow: 'School risk',
      title: 'School, tuition, or allowance problem',
      text: 'Jump into the payment-delay workflow or the school payment tracker when term-start risk is active.',
      actionLabel: 'Open school route',
      icon: Briefcase,
      accent: 'emerald',
      onClick: () => {
        if (schoolRoute) {
          handleRouteProblem(schoolRoute);
        } else {
          setActiveView('school_payment_tracker');
        }
      }
    },
    {
      id: 'authority-library',
      eyebrow: 'Authorities',
      title: 'Open the authority library',
      text: 'Go straight to statutes, regulations, and manual references when the packet needs stronger authority support.',
      actionLabel: 'Browse authorities',
      icon: Award,
      accent: 'indigo',
      onClick: () => setActiveView('authority_library')
    },
    {
      id: 'il-builder',
      eyebrow: 'ILP / Whole Health',
      title: 'Open the ILP activity planner',
      text: 'Route adaptive activity, Whole Health, gym, boxing, or structured independence requests into the dedicated builder.',
      actionLabel: 'Open IL planner',
      icon: Compass,
      accent: 'violet',
      onClick: () => setActiveView('independent_living_builder')
    },
    {
      id: 'written-decision',
      eyebrow: 'Preserve the record',
      title: 'Request a written decision',
      text: 'Use the written-decision workflow when VA gave only a verbal denial or refused to explain the basis.',
      actionLabel: 'Open written-decision path',
      icon: AlertTriangle,
      accent: 'rose',
      onClick: () => {
        if (writtenDecisionWorkflow) {
          handleStartWorkflow(writtenDecisionWorkflow);
        } else {
          setActiveView('document_generator');
        }
      }
    }
  ];
  const allowanceRoute = problemRouterOptions.find((option) => option.id === 'monthly_allowance_wrong') || null;
  const closedCaseRoute = problemRouterOptions.find((option) => option.id === 'case_closed_discontinued') || null;
  const urgentNeedCards = [
    {
      id: 'urgent-school',
      title: 'School starts soon and payment is missing',
      detail: 'Build the school-payment or authorization packet before the term-start risk gets worse.',
      actionLabel: 'Open school emergency',
      icon: Clock,
      onClick: () => {
        if (schoolRoute) {
          handleRouteProblem(schoolRoute);
        } else {
          setActiveView('school_payment_tracker');
        }
      }
    },
    {
      id: 'urgent-counselor',
      title: 'Counselor is not responding',
      detail: 'Start the written outreach and supervisor escalation trail immediately.',
      actionLabel: 'Open response delay route',
      icon: Mail,
      onClick: () => counselorRoute && handleRouteProblem(counselorRoute)
    },
    {
      id: 'urgent-allowance',
      title: 'Allowance stopped or the amount is wrong',
      detail: 'Use the subsistence issue workflow before the payment gap turns into a larger hardship.',
      actionLabel: 'Open payment issue route',
      icon: AlertTriangle,
      onClick: () => {
        if (allowanceRoute) {
          handleRouteProblem(allowanceRoute);
        } else {
          setActiveView('calculator');
        }
      }
    },
    {
      id: 'urgent-denial',
      title: 'A denial or closure just happened',
      detail: 'Force VA to identify the issue, evidence, and review rights in writing before the deadline window slips.',
      actionLabel: 'Open written-decision path',
      icon: FileText,
      onClick: () => {
        if (writtenDecisionWorkflow) {
          handleStartWorkflow(writtenDecisionWorkflow);
        } else if (closedCaseRoute) {
          handleRouteProblem(closedCaseRoute);
        }
      }
    }
  ];
  const hiddenToolPages = getHiddenToolPages().filter((page) => !['accessibility_settings'].includes(page.id));

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 select-text text-slate-100"
    >
      {/* Command Center Hero */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[linear-gradient(145deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 md:p-7 backdrop-blur-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_38%),linear-gradient(120deg,transparent_0%,rgba(99,102,241,0.06)_55%,transparent_100%)]" />
        <div className="relative grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              <ShieldCheck size={12} />
              <span>{modeAdvice.badge}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl md:text-[2.15rem] font-extrabold tracking-tight text-slate-50">
                VR&amp;E Case Command Center
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
                A case-building dashboard for Chapter 31 triage, legal framing, deadline control, and packet generation. Start with what VA did, capture only the facts that matter, and route the next move into the right workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {dashboardHeroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-800/90 bg-slate-950/45 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {metric.label}
                  </span>
                  <strong className="mt-1.5 block text-sm leading-snug text-slate-100">
                    {metric.value}
                  </strong>
                </div>
              ))}
            </div>

            {microProblemChips.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  <CheckCircle2 size={13} className="text-emerald-300" />
                  <span>Fast Lanes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {microProblemChips.slice(0, 6).map((chip) => (
                    <button
                      key={`hero-${chip.id}`}
                      type="button"
                      onClick={() => handleMicroProblemRoute(chip.workflowId)}
                      className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-[11px] font-medium text-slate-200 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-100"
                      title={`Open ${chip.workflow.title}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="xl:col-span-5 space-y-4">
            <div className="rounded-[24px] border border-slate-800/90 bg-slate-950/60 p-5 space-y-4 shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                    Mission Brief
                  </span>
                  <h2 className="text-base font-bold text-slate-100">
                    {currentCaseRecord ? currentCaseIssueTitle : 'No issue packet in motion'}
                  </h2>
                </div>
                {isBackendOnline && (
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${syncStatusClasses}`}>
                    {CASE_SYNC_STATUS_LABELS[caseSyncStatus] || 'Syncing'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Current deadline</span>
                  <strong className="mt-1 block text-slate-100">{currentCaseNextDeadline || 'No deadline logged'}</strong>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Privacy posture</span>
                  <div className="mt-1 flex items-center gap-1.5 font-semibold text-emerald-300">
                    <Shield size={11} />
                    <span>{privacyPostureLabel}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-[11px] leading-relaxed text-slate-300">
                {dashboardNextMove}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800/90 bg-slate-950/45 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                <AlertOctagon size={14} />
                <span>Priority Queue</span>
              </div>
              <div className="space-y-2">
                {workspacePriorityQueue.slice(0, 3).map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-300">
                        {index + 1}
                      </span>
                      <div className="space-y-1">
                        <strong className="block text-xs text-slate-100">{item.title}</strong>
                        <p className="text-[11px] leading-relaxed text-slate-400">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {quickActionCards.map((action) => {
          const styles = actionAccentStyles[action.accent] || actionAccentStyles.cyan;
          const Icon = action.icon;

          return (
            <div
              key={action.id}
              className={`rounded-[24px] border bg-slate-900/45 p-5 transition duration-300 ${styles.border}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${styles.badge}`}>
                      <Icon size={11} />
                      <span>{action.eyebrow}</span>
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold leading-tight text-slate-100">{action.title}</h3>
                      <p className="text-[11px] leading-relaxed text-slate-400">{action.text}</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 ${styles.button}`}
                >
                  {action.actionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mode-Specific Guidance Callout */}
      <div className="rounded-2xl border border-amber-500/15 bg-[linear-gradient(180deg,rgba(146,64,14,0.08),rgba(120,53,15,0.03))] p-4 space-y-1.5">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">{modeAdvice.title}</h4>
        <p className="text-[11px] leading-relaxed text-slate-300">{modeAdvice.text}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 rounded-[24px] border border-red-500/15 bg-[linear-gradient(180deg,rgba(127,29,29,0.12),rgba(15,23,42,0.45))] p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
              <AlertTriangle size={14} />
              <span>I Need Help Now</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100">Start with the emergency, then let the casework engine build the record and packet behind it.</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Use these fast routes for term-start risk, missing payments, counselor silence, denials, or sudden closures. Each route is meant to create an immediate next step, evidence list, and escalation posture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentNeedCards.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-200">
                      <Icon size={14} />
                    </span>
                    <div className="space-y-1">
                      <strong className="block text-xs text-slate-100">{item.title}</strong>
                      <p className="text-[11px] leading-relaxed text-slate-400">{item.detail}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="w-full rounded-xl bg-red-700/90 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-5 rounded-[24px] border border-slate-800 bg-slate-900/35 p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              <Shield size={14} />
              <span>Privacy And Data Handling</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100">Treat the workspace like a case notebook, not a full claim file.</h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4 space-y-3 text-[11px] leading-relaxed text-slate-300">
            <p>
              Privacy mode is currently <strong>{privacyMode ? 'session-only' : 'persistent in this browser'}</strong>.
              {privacyMode
                ? ' Case details stay local to this tab session unless you save through the local backend.'
                : ' Case details can remain in browser storage until you clear them or switch privacy mode back on.'}
            </p>
            <ul className="space-y-2 text-slate-400">
              <li>Use only the minimum facts needed to plan the request, appeal, or escalation.</li>
              <li>Avoid entering full SSNs, full dates of birth, or unnecessary medical details.</li>
              <li>Clear local data when working on a shared device or after exporting the packet you need.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openSettings}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/15"
            >
              Open Data Settings
            </button>
            <button
              type="button"
              onClick={onClearAllData}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-100"
            >
              Clear Local Data
            </button>
          </div>
        </div>
      </div>

      {isBackendOnline ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-5 rounded-[24px] border border-slate-800 bg-slate-900/35 p-5 space-y-4">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Case Workspace Pulse</span>
              <h3 className="text-sm font-bold text-slate-100">The case file should always answer what happened, what is next, and what evidence is missing.</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Deadlines</span>
                <strong className="mt-1 block text-slate-100">{totalDeadlines}</strong>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Contacts</span>
                <strong className="mt-1 block text-slate-100">{totalActivities}</strong>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Saved drafts</span>
                <strong className="mt-1 block text-slate-100">{totalDocuments}</strong>
              </div>
            </div>

            <div className="space-y-2">
              {workspacePriorityQueue.map((item) => (
                <div key={`workspace-${item.id}`} className="rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-3">
                  <strong className="block text-xs text-slate-100">{item.title}</strong>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-4 rounded-[24px] border border-slate-800 bg-slate-900/35 p-5 space-y-4">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Case Health</span>
              <h3 className="text-sm font-bold text-slate-100">Use this as a fast check before you draft or escalate.</h3>
            </div>
            <div className="space-y-3">
              {caseHealthSignals.map((signal) => (
                <div key={signal.label} className="rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{signal.label}</span>
                      <strong className="block text-xs text-slate-100">{signal.value}</strong>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      signal.ready ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}>
                      {signal.ready ? 'Ready' : 'Needs work'}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-3 rounded-[24px] border border-slate-800 bg-slate-950/35 p-5 space-y-4">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Data Handling Standard</span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {caseDashboard?.privacyGuidance?.warning || 'Store only the minimum case facts needed for planning and escalation.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Current record</span>
              <p className="mt-2 text-xs leading-relaxed text-slate-200">
                {currentCaseRecord ? currentCaseIssueTitle : 'No active record yet. Start from the problem router or open a workflow to create one.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Issue summary preview</span>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{currentIssueSummary}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-slate-800 bg-slate-900/35 p-5 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
            <Clock size={14} />
            <span>Static Workspace Mode</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            The local backend is offline, so the dashboard is running in reference-and-planning mode. You can still route issues, open workflows, and draft packets, but case records, deadlines, and saved drafts will not persist until the backend is available.
          </p>
        </div>
      )}

      {isBackendOnline && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                <FileText size={16} />
                <span>Veteran Case Workspace</span>
              </div>
              <h2 className="text-base font-bold text-slate-100">A cleaner case file for posture, deadlines, office routing, evidence notes, and saved packet drafts.</h2>
              <p className="max-w-3xl text-[11px] leading-relaxed text-slate-400">
                Keep this record thin, factual, and synchronized to the actual Chapter 31 problem. Everything below should help the later packet read like one coherent case theory instead of scattered notes.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-3 text-[11px] leading-relaxed text-slate-300">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace sync</span>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${syncStatusClasses}`}>
                  {CASE_SYNC_STATUS_LABELS[caseSyncStatus] || 'Syncing'}
                </span>
                <span>{currentCaseRecord ? 'Active case workspace loaded' : 'Waiting for the first structured case record'}</span>
              </div>
            </div>
          </div>

          {currentCaseRecord ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {workspaceSnapshotCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-3">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      {card.label}
                    </span>
                    <strong className="mt-1.5 block text-sm leading-snug text-slate-100">
                      {card.value}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-8 space-y-4">
                  <div className="rounded-[24px] border border-slate-800 bg-slate-900/35 p-5 space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Case Profile</span>
                        <h3 className="text-sm font-bold text-slate-100">Capture only the status, office, school, and issue details that later packets need.</h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveWorkspace}
                        disabled={savingWorkspace}
                        className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-500 disabled:bg-cyan-900/50 disabled:text-slate-400"
                      >
                        {savingWorkspace ? 'Saving case file...' : 'Save Case Workspace'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4 space-y-4">
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Identity and office routing</span>
                          <p className="text-[11px] leading-relaxed text-slate-400">Keep the claimant, counselor, and regional office current so escalation letters stay correctly addressed.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">Veteran Name</label>
                            <input
                              type="text"
                              value={caseWorkspaceDraft.veteranName}
                              onChange={(e) => handleWorkspaceDraftChange('veteranName', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">Claimant Reference</label>
                            <input
                              type="text"
                              value={caseWorkspaceDraft.claimantReference}
                              onChange={(e) => handleWorkspaceDraftChange('claimantReference', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">Counselor Name</label>
                            <input
                              type="text"
                              value={caseWorkspaceDraft.counselorName}
                              onChange={(e) => handleWorkspaceDraftChange('counselorName', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">Regional Office</label>
                            <select
                              value={selectedOffice}
                              onChange={(e) => {
                                setSelectedOffice(e.target.value);
                                handleWorkspaceDraftChange('regionalOffice', e.target.value);
                              }}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            >
                              <option value="">-- Select VA Regional Office --</option>
                              {VRE_OFFICES.map((off) => (
                                <option key={off.office} value={off.office}>
                                  {off.office}
                                </option>
                              ))}
                            </select>
                            {activeOfficeDetails?.officer ? (
                              <div className="text-[10px] text-indigo-300">VR&amp;E Officer: <strong>{activeOfficeDetails.officer}</strong></div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4 space-y-4">
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Program and issue posture</span>
                          <p className="text-[11px] leading-relaxed text-slate-400">Keep the requested program and one-sentence issue summary clear before you move into authorities and letter drafting.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">School / Program</label>
                            <input
                              type="text"
                              value={caseWorkspaceDraft.schoolName}
                              onChange={(e) => handleWorkspaceDraftChange('schoolName', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">Issue Summary / Requested Relief</label>
                            <textarea
                              value={caseWorkspaceDraft.issueSummary}
                              onChange={(e) => handleWorkspaceDraftChange('issueSummary', e.target.value)}
                              className="h-24 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-400">Track Requested</label>
                              <select
                                value={caseWorkspaceDraft.trackRequested}
                                onChange={(e) => handleWorkspaceDraftChange('trackRequested', e.target.value)}
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                              >
                                {CASE_TRACK_OPTIONS.map((option) => (
                                  <option key={`track-requested-${option.value || 'blank'}`} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-400">Track Approved</label>
                              <select
                                value={caseWorkspaceDraft.trackApproved}
                                onChange={(e) => handleWorkspaceDraftChange('trackApproved', e.target.value)}
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                              >
                                {CASE_TRACK_OPTIONS.map((option) => (
                                  <option key={`track-approved-${option.value || 'blank'}`} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4 space-y-4">
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Chapter 31 posture</span>
                          <p className="text-[11px] leading-relaxed text-slate-400">These status fields drive feasibility, IPE, and Independent Living positioning later in the packet.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">Employment Handicap</label>
                            <select
                              value={caseWorkspaceDraft.employmentHandicapStatus}
                              onChange={(e) => handleWorkspaceDraftChange('employmentHandicapStatus', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            >
                              {CASE_HANDICAP_STATUS_OPTIONS.map((option) => (
                                <option key={`eh-${option.value || 'blank'}`} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">Serious Employment Handicap</label>
                            <select
                              value={caseWorkspaceDraft.seriousEmploymentHandicapStatus}
                              onChange={(e) => handleWorkspaceDraftChange('seriousEmploymentHandicapStatus', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            >
                              {CASE_HANDICAP_STATUS_OPTIONS.map((option) => (
                                <option key={`seh-${option.value || 'blank'}`} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">Feasibility Status</label>
                            <select
                              value={caseWorkspaceDraft.feasibilityStatus}
                              onChange={(e) => handleWorkspaceDraftChange('feasibilityStatus', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            >
                              {CASE_FEASIBILITY_STATUS_OPTIONS.map((option) => (
                                <option key={`feasibility-${option.value || 'blank'}`} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">IPE Status</label>
                            <select
                              value={caseWorkspaceDraft.ipeStatus}
                              onChange={(e) => handleWorkspaceDraftChange('ipeStatus', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            >
                              {CASE_IPE_STATUS_OPTIONS.map((option) => (
                                <option key={`ipe-${option.value}`} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">IILP Status</label>
                            <select
                              value={caseWorkspaceDraft.iilpStatus}
                              onChange={(e) => handleWorkspaceDraftChange('iilpStatus', e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                            >
                              {CASE_IILP_STATUS_OPTIONS.map((option) => (
                                <option key={`iilp-${option.value || 'blank'}`} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4 space-y-4">
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Timing and urgency</span>
                          <p className="text-[11px] leading-relaxed text-slate-400">Use the school window and urgent deadline fields to keep packet timing aligned with the real risk.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-400">Term Start</label>
                              <input
                                type="date"
                                value={caseWorkspaceDraft.termStart}
                                onChange={(e) => handleWorkspaceDraftChange('termStart', e.target.value)}
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-400">Term End</label>
                              <input
                                type="date"
                                value={caseWorkspaceDraft.termEnd}
                                onChange={(e) => handleWorkspaceDraftChange('termEnd', e.target.value)}
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-400">Urgent Deadline</label>
                              <input
                                type="date"
                                value={caseWorkspaceDraft.urgentDeadline}
                                onChange={(e) => handleWorkspaceDraftChange('urgentDeadline', e.target.value)}
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                              />
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-[11px] leading-relaxed text-slate-300">
                            <strong className="block text-xs text-slate-100">What the dashboard should know right now</strong>
                            <p className="mt-2">{dashboardNextMove}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4 space-y-4">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Working notes</span>
                        <p className="text-[11px] leading-relaxed text-slate-400">These note blocks should read like the beginning of the packet: what happened, what proves it, and what escalation path is being preserved.</p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-400">Case Overview / What Happened</label>
                          <textarea
                            value={caseWorkspaceDraft.disputeHistory}
                            onChange={(e) => handleWorkspaceDraftChange('disputeHistory', e.target.value)}
                            className="h-24 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-400">Evidence Matrix Notes</label>
                          <textarea
                            value={caseWorkspaceDraft.evidenceSummary}
                            onChange={(e) => handleWorkspaceDraftChange('evidenceSummary', e.target.value)}
                            className="h-24 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-400">Escalation / Follow-Up Notes</label>
                          <textarea
                            value={caseWorkspaceDraft.escalationHistory}
                            onChange={(e) => handleWorkspaceDraftChange('escalationHistory', e.target.value)}
                            className="h-24 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-4 space-y-4">
                  <div className="rounded-[24px] border border-slate-800 bg-slate-900/35 p-5 space-y-4">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Deadlines</span>
                      <h3 className="text-sm font-bold text-slate-100">Track the next school, review-lane, or escalation date.</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        placeholder="Deadline title"
                        value={newDeadline.title}
                        onChange={(e) => setNewDeadline((previous) => ({ ...previous, title: e.target.value }))}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                      />
                      <input
                        type="date"
                        value={newDeadline.dueDate}
                        onChange={(e) => setNewDeadline((previous) => ({ ...previous, dueDate: e.target.value }))}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Source or trigger"
                        value={newDeadline.source}
                        onChange={(e) => setNewDeadline((previous) => ({ ...previous, source: e.target.value }))}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                      />
                      <textarea
                        placeholder="Notes"
                        value={newDeadline.notes}
                        onChange={(e) => setNewDeadline((previous) => ({ ...previous, notes: e.target.value }))}
                        className="h-20 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddDeadline}
                        className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-500"
                      >
                        Add Deadline
                      </button>
                    </div>

                    <div className="space-y-2">
                      {totalDeadlines > 0 ? (
                        (currentCaseRecord.deadlines || []).slice(0, 5).map((deadline) => (
                          <div key={deadline.id} className="rounded-xl border border-slate-800 bg-slate-950/35 px-3 py-2">
                            <strong className="block text-xs text-slate-100">{deadline.title}</strong>
                            <span className="mt-1 block text-[10px] text-slate-400">
                              Due {deadline.dueDate} {deadline.source ? `- ${deadline.source}` : ''}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-800 px-3 py-4 text-[11px] text-slate-500">
                          No deadlines tracked yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-800 bg-slate-900/35 p-5 space-y-4">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">Recent Contact Activity</span>
                      <h3 className="text-sm font-bold text-slate-100">Keep the counselor timeline visible while the packet develops.</h3>
                    </div>
                    <div className="space-y-2">
                      {recentActivityLog.length > 0 ? (
                        recentActivityLog.map((entry) => (
                          <div key={`recent-${entry.id}`} className="rounded-xl border border-slate-800 bg-slate-950/35 px-3 py-2">
                            <div className="flex items-center justify-between gap-3">
                              <strong className="text-xs text-slate-100">{entry.method}</strong>
                              <span className="text-[10px] text-indigo-300">{entry.date || 'No date'}</span>
                            </div>
                            <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{entry.request || 'No details captured.'}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-800 px-3 py-4 text-[11px] text-slate-500">
                          No contact activity logged yet. Use the workflow timeline tab to start the record.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-800 bg-slate-900/35 p-5 space-y-4">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Generated Documents</span>
                      <h3 className="text-sm font-bold text-slate-100">Saved drafts from case workflows live here.</h3>
                    </div>
                    <div className="space-y-2">
                      {totalDocuments > 0 ? (
                        (currentCaseRecord.documents || []).slice(0, 6).map((document) => (
                          <div key={document.id} className="rounded-xl border border-slate-800 bg-slate-950/35 px-3 py-2">
                            <strong className="block text-xs text-slate-100">{document.title}</strong>
                            <span className="mt-1 block text-[10px] text-slate-400">
                              {formatCaseWorkspaceValue(document.documentType, 'Document')} - {document.status || 'draft'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-800 px-3 py-4 text-[11px] text-slate-500">
                          No generated documents saved yet. Save packet letters from the workflow tabs below.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-800 bg-slate-950/25 px-5 py-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-100">No structured case record yet.</h3>
                <p className="text-[12px] leading-relaxed text-slate-400">
                  Start with the problem router or open a guided workflow. Once the issue record exists, this workspace becomes the Veteran case dashboard for posture, deadlines, office routing, contact logs, and saved packet drafts.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (problemRouterOptions[0]) {
                      handleRouteProblem(problemRouterOptions[0]);
                    }
                  }}
                  className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-500"
                >
                  Open First Problem Route
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('independent_living_builder')}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10 hover:text-fuchsia-100"
                >
                  Open ILP / Whole Health Builder
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {problemRouterOptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-[0.18em]">
                <ShieldCheck size={16} />
                <span>What Went Wrong With Your VR&amp;E Case?</span>
              </div>
              <h2 className="text-base font-bold text-slate-100">Start with the real problem, not a generic eligibility prompt.</h2>
              <p className="text-[11px] text-slate-400 max-w-3xl leading-relaxed">
                Start from the real-world problem instead of guessing the law first. These routes are informed by repeated user-reported Chapter 31 friction points and then mapped to structured workflows.
              </p>
            </div>
            <div className="max-w-md rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[11px] text-slate-300 leading-relaxed">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Signal Source</span>
              <p className="mt-1">{communitySignals?.disclaimer || 'Community reports are user-reported product signals, not legal authority.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {(communitySignals?.themes || []).slice(0, 4).map((theme) => (
              <div key={theme.id} className="rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{theme.label}</span>
                  <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                    {theme.signalCount} signals
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">{theme.summary}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {problemRouterOptions.map((option) => (
              <div
                key={option.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 space-y-4 hover:border-slate-700 hover:bg-slate-900/65 transition duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-100 leading-tight">{option.prompt}</h3>
                    <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                      {option.signalCount || option.primaryWorkflow?.communitySignalCount || 0} signals
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{option.summary}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-slate-300">
                    {option.primaryWorkflow?.title || 'Workflow ready'}
                  </span>
                  {(option.supportingWorkflows || []).slice(0, 2).map((workflow) => (
                    <span
                      key={`${option.id}-${workflow.workflowId}`}
                      className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-slate-400"
                    >
                      {workflow.title}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleRouteProblem(option)}
                  className="w-full px-3 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <span>Open Problem Intake</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>

          {microProblemChips.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-[0.18em]">
                    <CheckCircle2 size={15} />
                    <span>Quick Micro-Problems</span>
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-3xl leading-relaxed">
                    Use these short prompts for the small but common Chapter 31 questions that still need a real workflow, evidence plan, and escalation path.
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {microProblemChips.length} quick routes
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {microProblemChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleMicroProblemRoute(chip.workflowId)}
                    className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-[11px] font-medium text-slate-200 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-100"
                    title={`Open ${chip.workflow.title}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hiddenToolPages.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                <Compass size={15} />
                <span>More Tools In The Workspace</span>
              </div>
              <h2 className="text-base font-bold text-slate-100">Some of the strongest tools were underexposed. They are reachable directly here now.</h2>
              <p className="max-w-3xl text-[11px] leading-relaxed text-slate-400">
                These modules already exist inside the app, but they are easier to miss in the normal navigation. Use this section as an all-tools shortcut when the dashboard needs to branch into deeper specialized work.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {hiddenToolPages.map((page) => {
              const Icon = page.Icon;

              return (
                <button
                  key={`hidden-tool-${page.id}`}
                  type="button"
                  onClick={() => setActiveView(page.id)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left transition hover:border-sky-500/40 hover:bg-slate-900/60"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-xl border border-slate-700 bg-slate-950/60 p-2">
                        <Icon size={18} className={page.iconClassName || 'text-sky-300'} />
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300">
                        {page.readiness}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-100">{page.label}</h3>
                      <p className="text-[11px] leading-relaxed text-slate-400">{page.userNeed}</p>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-500">{page.plannedNext}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN WORKFLOW AREA */}
      <AnimatePresence mode="wait">
        {!activeWorkflow ? (
          <motion.div
            key="console-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-[0.18em]">
                <AlertOctagon size={16} className="text-red-400" />
                <span>Open a Guided Issue Workflow</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Choose the active barrier, then build the record, evidence list, and authority-backed packet from the same workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowCatalog.map((wf) => (
                <div 
                  key={wf.workflowId}
                  className="bg-slate-900/45 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-900/65 transition duration-300 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                          {ICON_MAP[wf.workflowId] || null}
                        </span>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-100 leading-tight">{wf.title}</h3>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            wf.riskLevel === 'high'
                              ? 'border-red-500/30 bg-red-500/10 text-red-300'
                              : wf.riskLevel === 'medium'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          }`}>
                            {wf.riskLevel || 'workflow'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{wf.desc}</p>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-slate-300">
                        {wf.citations?.length || wf.authorityIds?.length || 0} authorities
                      </span>
                      <span className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-slate-300">
                        {wf.evidenceChecklist?.length || 0} evidence items
                      </span>
                      <span className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-slate-300">
                        {wf.caseStages?.length || 0} case stages
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartWorkflow(wf)}
                    className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <span>Open Workflow</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active-wizard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 space-y-6"
          >
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleReset} 
                  className="p-1 bg-slate-950/60 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-slate-200 rounded-md transition"
                >
                  <ArrowLeft size={14} />
                </button>
                <div>
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{activeWorkflow.title}</h2>
                  <span className="text-[10px] text-slate-500">Step {wizardStep + 1} of 3</span>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
              >
                Cancel
              </button>
            </div>

            {/* Stepper Pipeline */}
            <div className="flex items-center justify-between bg-slate-950/45 p-4 border border-slate-850 rounded-xl overflow-x-auto gap-4">
              {[
                { step: 0, label: 'Case Profile', desc: 'Active Stage' },
                { step: 1, label: 'Fact Ingestion', desc: 'Collect Variables' },
                { step: 2, label: 'Strategic Dossier', desc: 'Analyze & Action' }
              ].map((s) => {
                const isCompleted = wizardStep > s.step;
                const isActive = wizardStep === s.step;
                return (
                  <div key={s.step} className="flex-1 min-w-[120px] flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : isActive 
                        ? 'bg-indigo-650 border-indigo-650 text-white font-bold' 
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}>
                      {isCompleted ? <Check size={12} /> : s.step + 1}
                    </div>
                    <div className="space-y-0.5">
                      <span className={`text-[10px] font-bold block ${isActive ? 'text-slate-100' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>{s.label}</span>
                      <span className="text-[9px] text-slate-500 block leading-tight">{s.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STEP 1: SELECT CASE STAGE */}
            {wizardStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-200">What is your current VR&E Case Stage?</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">This helps tailor the letter to your counselor's active file context.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {CASE_STAGES.map((stageName) => (
                    <button
                      key={stageName}
                      onClick={() => setTempStage(stageName)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-semibold border transition text-center cursor-pointer ${
                        tempStage === stageName
                          ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                          : 'bg-slate-950/40 border-slate-855 text-slate-400 hover:border-slate-750'
                      }`}
                    >
                      {stageName}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Continue to Facts</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: COLLECT FACTS */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-200">Tell Us What Actually Went Wrong</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Use the same kind of details Veterans actually mention when payments stall, counselors disappear, or a plan gets blocked. We use these answers for issue diagnosis, evidence gaps, and draft output.</p>
                </div>

                {(activeWorkflow.intakeQuestions?.length > 0 || activeWorkflow.generatedTools?.length > 0) && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    {activeWorkflow.intakeQuestions?.length > 0 && (
                      <div className="xl:col-span-7 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300 block">Real-Problem Intake</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {activeWorkflow.intakeQuestions.map((question, index) => (
                            <div key={`${activeWorkflow.workflowId}-question-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/35 px-3 py-2 text-[11px] text-slate-300 leading-relaxed">
                              {index + 1}. {question}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeWorkflow.generatedTools?.length > 0 && (
                      <div className="xl:col-span-5 rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-4 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300 block">This Route Builds</span>
                        <div className="flex flex-wrap gap-2">
                          {activeWorkflow.generatedTools.map((tool) => (
                            <span key={`${activeWorkflow.workflowId}-${tool}`} className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-[10px] text-slate-300">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Personal Profile Details */}
                  <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <ShieldCheck size={16} className="text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. Case Profile Details</span>
                    </div>
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Veteran Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={formFacts.veteranName || ''}
                          onChange={(e) => handleFactChange('veteranName', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">VR&E Case Number (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. C-1234567"
                          value={formFacts.caseNumber || ''}
                          onChange={(e) => handleFactChange('caseNumber', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Counselor Name (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Counselor Smith"
                          value={formFacts.counselorName || ''}
                          onChange={(e) => handleFactChange('counselorName', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">VA Regional Office (Escalation / VR&E Officer Lookup)</label>
                        <select
                          value={selectedOffice}
                          onChange={(e) => setSelectedOffice(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">-- Select VA Regional Office --</option>
                          {VRE_OFFICES.map((off) => (
                            <option key={off.office} value={off.office}>
                              {off.office}
                            </option>
                          ))}
                        </select>
                        {selectedOffice && (() => {
                          const activeOffice = VRE_OFFICES.find(o => o.office === selectedOffice);
                          return activeOffice && activeOffice.officer ? (
                            <div className="text-[10px] text-indigo-400 mt-1">
                              Identified VR&E Officer: <strong>{activeOffice.officer}</strong>
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Your Email & Phone (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. vet@example.com / 555-555-5555"
                          value={formFacts.veteranContact || ''}
                          onChange={(e) => handleFactChange('veteranContact', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Challenge-Specific Details */}
                  <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <AlertTriangle size={16} className="text-amber-400" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. Dispute Context Details</span>
                    </div>
                    <div className="space-y-3.5">
                      {activeWorkflow.steps[0].fields.map((field) => (
                        <div key={field.name} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">{field.label}</label>
                          {field.type === 'select' ? (
                            <select
                               value={formFacts[field.name] || ''}
                               onChange={(e) => handleFactChange(field.name, e.target.value)}
                               className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                            >
                              <option value="">-- Select Option --</option>
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formFacts[field.name] || ''}
                              onChange={(e) => handleFactChange(field.name, e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-850">
                  <button 
                    onClick={handleBackStep}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-300 rounded-lg text-xs font-bold transition"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Generate Solution</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SOLUTIONS CASE PACKET DRAFT */}
            {wizardStep === 2 && (() => {
              const mappedArea = getDisputeAreaForWorkflow(activeWorkflow.workflowId);
              
              // Compute evidence score
              const currentChecklist = activeWorkflow.evidenceChecklist?.length
                ? activeWorkflow.evidenceChecklist
                : (mappedArea?.evidenceChecklist || []);
              const evidenceScore = currentChecklist.reduce((acc, item) => {
                return checkedEvidence[item.id] ? acc + item.weight : acc;
              }, 0);

              const getScoreStatus = (score) => {
                if (score >= 75) return { label: 'Strong Evidence Package', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20' };
                if (score >= 50) return { label: 'Borderline Evidence Package', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/20' };
                return { label: 'Insufficient Evidence Package', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-950/20' };
              };
              const scoreStatus = getScoreStatus(evidenceScore);
              const likelyVaErrors = activeWorkflow.likelyVaErrors?.length ? activeWorkflow.likelyVaErrors : activeWorkflow.errors;
              const generatedTools = activeWorkflow.generatedTools || [];
              const recordsToRequest = activeWorkflow.recordsToRequest || [];
              const diagnosisCodes = [activeWorkflow.primaryCode, ...(activeWorkflow.supportingCodes || [])].filter(Boolean);
              const deadlineWarnings = activeWorkflow.deadlineRules || [];

              // Compile timeline text for the letter if applicable
              const compiledTimeline = contactsLog.map(c => `* ${c.date} | Method: ${c.method} | Notes: ${c.request}`).join('\n');
              
              const activeOffice = VRE_OFFICES.find(o => o.office === selectedOffice);
              const vreoOfficerName = activeOffice ? activeOffice.officer : '[VR&E Officer Name]';

              // Compile dynamic letter body
              const dynamicFacts = {
                ...formFacts,
                vreoOfficer: vreoOfficerName,
                timelineText: compiledTimeline ? `\nCommunication Timeline:\n${compiledTimeline}` : ''
              };
              const baseCompiledLetter = getCompiledLetter(activeWorkflow, dynamicFacts, tempStage);
              const compiledLetter = getAdjustedLetter(baseCompiledLetter, letterTone, dynamicFacts, tempStage, activeWorkflow.title);

              // Generate Case Packet Markdown File content
              const handleDownloadPacket = () => {
                const mdContent = `# VR&E STRATEGIC CASE PACKET
Compiled: ${new Date().toLocaleDateString()}
Issue: ${activeWorkflow.title}
Case Status Stage: ${tempStage}
User Mode: ${userMode.toUpperCase()}

============================================================
1. STRATEGIC OVERVIEW & STATEMENT OF FACTS
VA Errors Identified:
${activeWorkflow.errors.map((e, idx) => `${idx + 1}. [ERROR] ${e}`).join('\n')}

Next Action Recommended:
${activeWorkflow.workflowId === 'counselor-delay' ? 'Request local supervisor intervention.' : 'Demand formal written decision notice under 38 U.S.C. § 5104.'}

============================================================
2. EVIDENCE SUFFICIENCY INDEX
Score: ${evidenceScore} / 100 (${scoreStatus.label})
${currentChecklist.map(e => `* [${checkedEvidence[e.id] ? 'X' : ' '}] ${e.text} (+${e.weight} pts)`).join('\n')}

============================================================
3. CONTACT TIMELINE RECORDS
${contactsLog.map(c => `* ${c.date} | Method: ${c.method} | details: ${c.request}`).join('\n') || 'No timeline entries logged.'}

============================================================
4. FORMAL ACTION LETTER DRAFT
\`\`\`
${compiledLetter}
\`\`\`

*** CONFIDENTIALITY NOTE: Private case packet generated in local session. Do not commit PII to public files. ***`;

                const blob = new Blob([mdContent], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vre_case_packet_${activeWorkflow.workflowId}.md`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              };

              // Print Layout
              const handlePrintPacket = () => {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>VR&E Case Packet - ${activeWorkflow.title}</title>
                      <style>
                        body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 40px; font-size: 0.9rem; line-height: 1.5; }
                        h1 { font-family: Arial, sans-serif; font-size: 1.4rem; border-bottom: 2px solid #334155; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase; }
                        h2 { font-family: Arial, sans-serif; font-size: 1.1rem; margin-top: 25px; margin-bottom: 10px; color: #334155; }
                        pre { white-space: pre-wrap; font-family: inherit; font-size: inherit; background: #f8fafc; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; }
                        .score { font-weight: bold; color: #059669; }
                      </style>
                    </head>
                    <body>
                      <h1>VR&E Strategic Case Packet Brief</h1>
                      <p><strong>Issue:</strong> ${activeWorkflow.title}</p>
                      <p><strong>Stage:</strong> ${tempStage}</p>
                      <p><strong>Date Compiled:</strong> ${new Date().toLocaleDateString()}</p>
                      <hr/>
                      <h2>1. Identified VA Errors</h2>
                      <ul>${activeWorkflow.errors.map(e => `<li><strong>[ERROR]</strong> ${e}</li>`).join('')}</ul>
                      <h2>2. Evidence Sufficiency Index (Score: ${evidenceScore} / 100)</h2>
                      <ul>${currentChecklist.map(e => `<li>[${checkedEvidence[e.id] ? 'X' : ' '}] ${e.text}</li>`).join('')}</ul>
                      <h2>3. Communication Timeline Logs</h2>
                      <pre>${contactsLog.map(c => `* ${c.date} | ${c.method} | ${c.request}`).join('\n') || 'No timeline records logged.'}</pre>
                      <h2>4. Formal Action Letter Draft</h2>
                      <pre>${compiledLetter}</pre>
                      <script>window.print();</script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              };

              const showTimelineTab = ['counselor-delay', 'counselor-no-show', 'tuition-unpaid', 'case-closed', 'written-decision-request', 'retroactive-induction'].includes(activeWorkflow.workflowId);

              return (
                <div className="space-y-6">
                  {/* Case Packet Header Control Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-4 border border-slate-800 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Case Packet Compiler</span>
                      <h4 className="text-xs font-bold text-slate-200">Assembled Strategy Dossier</h4>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        onClick={handleDownloadPacket}
                        className="btn btn-sm btn-secondary text-xs inline-flex items-center gap-1.5 h-8.5 py-1.5 px-3"
                      >
                        <FileText size={13} />
                        <span>Download Packet (.md)</span>
                      </button>
                      <button
                        onClick={handlePrintPacket}
                        className="btn btn-sm btn-secondary text-xs inline-flex items-center gap-1.5 h-8.5 py-1.5 px-3"
                      >
                        <Printer size={13} />
                        <span>Print Packet</span>
                      </button>
                    </div>
                  </div>

                  {/* Packet Tabs */}
                  <div className="tabs-header border-b border-slate-800 pb-px mb-2">
                    <button
                      className={`tab-btn ${packetTab === 'summary' ? 'active' : ''}`}
                      onClick={() => setPacketTab('summary')}
                    >
                      1. Dossier & Summary
                    </button>
                    {currentChecklist.length > 0 && (
                      <button
                        className={`tab-btn ${packetTab === 'evidence' ? 'active' : ''}`}
                        onClick={() => setPacketTab('evidence')}
                      >
                        2. Evidence Score
                      </button>
                    )}
                    {showTimelineTab && (
                      <button
                        className={`tab-btn ${packetTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setPacketTab('timeline')}
                      >
                        3. Contact Timeline
                      </button>
                    )}
                    <button
                      className={`tab-btn ${packetTab === 'authorities' ? 'active' : ''}`}
                      onClick={() => setPacketTab('authorities')}
                    >
                      {showTimelineTab ? '4. Authorities' : '3. Authorities'}
                    </button>
                    <button
                      className={`tab-btn ${packetTab === 'letter' ? 'active' : ''}`}
                      onClick={() => setPacketTab('letter')}
                    >
                      {showTimelineTab ? '5. Action Letter' : '4. Action Letter'}
                    </button>
                  </div>

                  {/* TAB CONTENT: DOSSIER & SUMMARY */}
                  {packetTab === 'summary' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-7 space-y-5">
                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">Issue Diagnosis</span>
                          <div className="flex flex-wrap gap-2">
                            {diagnosisCodes.map((code) => (
                              <span key={code} className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-[10px] text-slate-300 font-mono">
                                {code}
                              </span>
                            ))}
                            <span className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-[10px] text-slate-400">
                              {activeWorkflow.trackLabel || 'Chapter 31 workflow'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {activeWorkflow.problemRouterLabel || activeWorkflow.desc}
                          </p>
                        </div>

                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Likely VA Error Pattern</span>
                          <div className="space-y-2.5">
                            {likelyVaErrors.map((err, idx) => (
                              <div key={idx} className="flex gap-2.5 items-start p-3 bg-red-950/10 border border-red-900/30 rounded-lg text-xs text-red-300 leading-relaxed">
                                <AlertOctagon size={15} className="shrink-0 mt-0.5" />
                                <span>{err}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Written Decision Branching Warning */}
                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Written Decision Notice Audit</span>
                          <div className="space-y-3">
                            <label className="text-xs text-slate-350 block">Have you received a formal, written VA Decision Notice (such as VA Form 20-0998) regarding this dispute?</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                                <input
                                  type="radio"
                                  name="wf_written_notice"
                                  checked={hasWrittenNoticeState === 'yes'}
                                  onChange={() => setHasWrittenNoticeState('yes')}
                                  className="accent-indigo-500"
                                />
                                <span>Yes, formal written letter</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                                <input
                                  type="radio"
                                  name="wf_written_notice"
                                  checked={hasWrittenNoticeState === 'no'}
                                  onChange={() => setHasWrittenNoticeState('no')}
                                  className="accent-indigo-500"
                                />
                                <span>No, verbal or email only</span>
                              </label>
                            </div>

                            {hasWrittenNoticeState === 'no' ? (
                              <div className="p-4 bg-amber-950/10 border border-amber-500/30 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle size={15} className="text-amber-400" />
                                  <span className="text-xs font-bold text-slate-200 font-sans">HLR Appeals Premature Warning</span>
                                </div>
                                <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed">
                                  An email is not a formal VA decision. Filing a Higher-Level Review (HLR) or Board Appeal requires a completed VA Form 20-0998 decision notice. Your first step is to submit your Action Letter (Tab 5) requesting a formal written decision under 38 C.F.R. § 21.50 or § 21.360. Do not file HLR yet.
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle size={15} className="text-emerald-400" />
                                  <span className="text-xs font-bold text-slate-200 font-sans">Formal Appeal Path Active</span>
                                </div>
                                <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed">
                                  Since you have a written decision letter, you have 1 year from the notice date to file a Higher-Level Review (VAF 20-0996) or a Supplemental Claim (VAF 20-0995). Review the evidence checklist in Tab 2 to strengthen your appeal package before submission.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-5 space-y-4">
                        {generatedTools.length > 0 && (
                          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Generated Outputs</span>
                            <div className="flex flex-wrap gap-2">
                              {generatedTools.map((tool) => (
                                <span key={`${activeWorkflow.workflowId}-${tool}`} className="rounded-full border border-slate-800 bg-slate-950/45 px-2.5 py-1 text-[10px] text-slate-300">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {recordsToRequest.length > 0 && (
                          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Records To Request</span>
                            <div className="space-y-2">
                              {recordsToRequest.map((record, index) => (
                                <div key={`${activeWorkflow.workflowId}-record-${index}`} className="rounded-lg border border-slate-850 bg-slate-950/35 px-3 py-2 text-[11px] text-slate-300 leading-relaxed">
                                  {record}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {deadlineWarnings.length > 0 && (
                          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
                            <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block">Deadline Watch</span>
                            <div className="space-y-2">
                              {deadlineWarnings.map((rule) => (
                                <div key={rule.id} className="rounded-lg border border-slate-850 bg-slate-950/35 px-3 py-2 text-[11px] text-slate-300 leading-relaxed">
                                  <strong className="text-slate-100 block">{rule.label}</strong>
                                  <span className="text-slate-400 block mt-1">Trigger: {rule.trigger} • Target: {rule.targetDays} day{rule.targetDays === 1 ? '' : 's'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Escalation Track</span>
                          <div className="space-y-2.5 text-xs">
                            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
                              <span className="font-semibold text-slate-200 block">Primary Action:</span>
                              <span className="text-slate-400 leading-normal block mt-1">
                                {activeWorkflow.workflowId === 'counselor-delay'
                                  ? 'Request supervisor review by sending the escalation letter (Tab 5) to the Regional office VR&E Officer.'
                                  : 'Transmit the formal written necessity statement to your counselor via QuickSubmit or eVA portal, demanding a formal written decision.'}
                              </span>
                            </div>
                            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
                              <span className="font-semibold text-slate-200 block">Supervisor Referral:</span>
                              <span className="text-slate-400 leading-normal block mt-1">
                                If no response within 5 business days, locate your VARO VR&E Officer contact information using the Authority Library or local directories, and escalate.
                              </span>
                            </div>
                            {activeWorkflow.escalationOptions?.slice(0, 2).map((option, index) => (
                              <div key={`${activeWorkflow.workflowId}-escalation-${index}`} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
                                <span className="font-semibold text-slate-200 block">Strategic Move {index + 1}:</span>
                                <span className="text-slate-400 leading-normal block mt-1">{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: EVIDENCE SUFFICIENCY & SCORE */}
                  {packetTab === 'evidence' && currentChecklist.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: checklist check-boxes */}
                      <div className="lg:col-span-7 space-y-3">
                        <h4 className="text-xs font-bold text-slate-250">Check off documents you possess or can submit:</h4>
                        <div className="space-y-2">
                          {currentChecklist.map(item => (
                            <div
                              key={item.id}
                              onClick={() => setCheckedEvidence(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                              className={`border rounded-lg p-4 cursor-pointer transition select-none flex items-start gap-3.5 ${
                                checkedEvidence[item.id]
                                  ? 'bg-emerald-500/5 border-emerald-800/80'
                                  : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!checkedEvidence[item.id]}
                                onChange={() => {}}
                                className="mt-0.5 pointer-events-none accent-emerald-500"
                                aria-label={item.text}
                              />
                              <div className="flex-1 flex justify-between items-center gap-4">
                                <span className="text-xs text-slate-250 leading-relaxed">{item.text}</span>
                                <span className="text-[10px] bg-slate-900 px-2 py-0.5 border border-slate-800 rounded font-mono text-emerald-400 shrink-0">
                                  +{item.weight} pts
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: sufficiency indicators and gaps */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dossier Strength Index</span>
                            <h4 className="text-xs font-bold text-slate-200">Evidence Weight Meter</h4>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-mono text-slate-400">Total Points:</span>
                              <span className="font-bold text-slate-200">{evidenceScore} / 100</span>
                            </div>
                            <div className="w-full bg-slate-950 border border-slate-850 h-3 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  evidenceScore >= 75 ? 'bg-emerald-500' : evidenceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${evidenceScore}%` }}
                              />
                            </div>
                          </div>

                          <div className={`p-4 border rounded-xl ${scoreStatus.bg} ${scoreStatus.border}`}>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={16} className={scoreStatus.color} />
                              <span className={`text-xs font-bold ${scoreStatus.color}`}>{scoreStatus.label}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                              {evidenceScore >= 75 
                                ? 'Your evidence package is extremely strong and complies fully with C.F.R. regulations. You have minimized VRC pushback opportunities.'
                                : evidenceScore >= 50
                                ? 'Your package is decent, but VRCs may argue lack of necessity. It is highly recommended to append a detailed personal statement or therapist letter.'
                                : 'Your evidence is currently insufficient. Filing appeals with this score has a high probability of denial. Gather required curriculum syllabi or policy letters before escalation.' /* @cite 38-cfr-21-198 */
                              }
                            </p>
                          </div>
                        </div>

                        {/* Missing evidence list */}
                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Missing Evidence Gaps</span>
                          {currentChecklist.filter(e => !checkedEvidence[e.id]).length > 0 ? (
                            <div className="space-y-2">
                              {currentChecklist.filter(e => !checkedEvidence[e.id]).map(e => (
                                <div key={e.id} className="flex gap-2 items-start text-[10px] text-slate-400 bg-slate-950/20 p-2.5 border border-slate-850 rounded">
                                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="text-slate-350 block">Missing: {e.text}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center text-[10px] text-emerald-400 bg-slate-950/20 p-3 border border-emerald-900/30 rounded">
                              <CheckCircle2 size={14} className="shrink-0" />
                              <span>Evidence package fully assembled! Zero gaps detected.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: CONTACT TIMELINE LOG */}
                  {packetTab === 'timeline' && showTimelineTab && (
                    <div className="space-y-4">
                      <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Escalation contact attempt timeline Logger</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Enter your communication timeline records below. This log is appended to your packet and provides proof of the VRC non-responsiveness or delay.
                        </p>

                        {/* Input row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-slate-950/40 p-4 border border-slate-850 rounded-lg">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Date</label>
                            <input
                              type="date"
                              value={newContact.date}
                              onChange={(e) => setNewContact({...newContact, date: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Method</label>
                            <select
                              value={newContact.method}
                              onChange={(e) => setNewContact({...newContact, method: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                              aria-label="Contact method"
                            >
                              <option value="Email">Email</option>
                              <option value="Phone Call">Phone Call</option>
                              <option value="eVA Msg">eVA Msg</option>
                              <option value="Office Visit">Office Visit</option>
                              <option value="Certified Mail">Certified Mail</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Details of Request</label>
                            <input
                              type="text"
                              placeholder="e.g. Sent syllabus and request for laptop voucher"
                              value={newContact.request}
                              onChange={(e) => setNewContact({...newContact, request: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                            />
                          </div>
                          <div>
                            <button
                              onClick={handleAddContactAttempt}
                              className="w-full btn btn-primary flex justify-center items-center gap-1 h-9"
                            >
                              <Plus size={14} />
                              <span>Add Attempt</span>
                            </button>
                          </div>
                        </div>

                        {/* List */}
                        {contactsLog.length > 0 ? (
                          <div className="space-y-2 mt-4">
                            {contactsLog.map((log) => (
                              <div key={log.id} className="flex justify-between items-center bg-slate-950/20 border border-slate-850 rounded-lg p-3 text-xs">
                                <div className="flex flex-wrap gap-2.5 items-center">
                                  <span className="font-mono text-indigo-400 font-semibold">{log.date}</span>
                                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-350 rounded font-semibold">{log.method}</span>
                                  <span className="text-slate-200">{log.request}</span>
                                </div>
                                <button 
                                  onClick={() => handleRemoveContactAttempt(log.id)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-dashed border-slate-850 rounded-lg text-xs text-slate-500 font-semibold">
                            No contact records logged.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: AUTHORITIES */}
                  {packetTab === 'authorities' && (
                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Governing Legal Citations</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeWorkflow.citations.map((cite) => {
                          let display = cite.toUpperCase();
                          let relevanceText = 'Governs this specific vocational rehabilitation dispute.';
                          if (cite.startsWith('38-usc')) {
                            display = `38 U.S.C. § ${cite.split('-').pop()}`;
                            relevanceText = 'Statutory authority establishing Chapter 31 services and parameters.';
                          } else if (cite.startsWith('38-cfr')) {
                            const section = cite.replace('38-cfr-21-', '21.').replace('38-cfr-', '').replace('-', '.');
                            display = `38 C.F.R. § ${section}`;
                            relevanceText = 'Binding regulatory requirements that VA case managers should follow.';
                          }
                          return (
                            <div 
                              key={cite} 
                              onClick={() => handleCitationClick(cite)}
                              className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850 hover:border-slate-750 p-4 rounded-xl cursor-pointer transition flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-200">{display}</span>
                                  <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">
                                    {cite.startsWith('38-usc') ? 'Statute' : 'Regulation'}
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed">{relevanceText}</p>
                              </div>
                              <span className="text-[10px] text-indigo-400 font-semibold mt-3 flex items-center gap-1">
                                <span>View Full Text in Library</span>
                                <ArrowRight size={10} />
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: ACTION LETTER */}
                  {packetTab === 'letter' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Custom Action Letter Draft</span>
                        <div className="flex items-center gap-2">
                          {isBackendOnline && currentCaseRecord && (
                            <button
                              onClick={() => handleSaveActionLetter(compiledLetter, activeWorkflow)}
                              disabled={savingLetter}
                              className="px-3 py-1.5 bg-emerald-900/40 border border-emerald-700/40 hover:border-emerald-500/50 text-emerald-200 hover:text-white rounded-lg text-[10px] font-semibold transition flex items-center gap-1 disabled:opacity-60"
                            >
                              <FileText size={11} />
                              <span>{savingLetter ? 'Saving...' : 'Save to Case File'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyLetter(compiledLetter)}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-semibold transition flex items-center gap-1"
                          >
                            {copiedLetter ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>{copiedLetter ? 'Copied' : 'Copy Text'}</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        readOnly
                        className="w-full h-80 bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-[11px] font-mono text-slate-300 leading-relaxed select-all focus:outline-none focus:border-slate-700"
                        value={compiledLetter}
                      />
                    </div>
                  )}

                  {/* Bottom Reset buttons */}
                  <div className="flex justify-between pt-4 border-t border-slate-850">
                    <button 
                      onClick={handleBackStep}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-300 rounded-lg text-xs font-bold transition"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleReset}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition"
                    >
                      Reset Wizard
                    </button>
                  </div>
                </div>
              );
            })()}

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default HomeDashboardView;

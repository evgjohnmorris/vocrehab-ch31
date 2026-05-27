import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, BookOpen, Shield, 
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
import caseClosedWf from '../data/workflows/case-closed.json';
import feasibilityDenialWf from '../data/workflows/feasibility-denial.json';
import ipeChangeWf from '../data/workflows/ipe-change.json';
import sehExtensionWf from '../data/workflows/seh-extension.json';

// JSON Templates
import suppliesRequestTpl from '../data/templates/supplies-request.json';
import counselorEscalationTpl from '../data/templates/counselor-escalation.json';
import tuitionDelayEscalationTpl from '../data/templates/tuition-delay-escalation.json';
import discontinuanceRebuttalTpl from '../data/templates/discontinuance-rebuttal.json';
import feasibilityRebuttalTpl from '../data/templates/feasibility-rebuttal.json';
import ipeChangeLetterTpl from '../data/templates/ipe-change-letter.json';
import sehExtensionLetterTpl from '../data/templates/seh-extension-letter.json';

import DISPUTE_AREAS from '../data/workflows/disputeAreas.json';
import { VRE_OFFICES } from '../data/data.js';
import { addCurrentCaseActivity, deleteCurrentCaseActivity, fetchCaseDashboard, saveCurrentCaseRecord } from '../utils/backendApi.js';

const LOCAL_WORKFLOWS = [
  counselorDelayWf,
  suppliesDenialWf,
  tuitionUnpaidWf,
  caseClosedWf,
  feasibilityDenialWf,
  ipeChangeWf,
  sehExtensionWf
];

const TEMPLATE_MAP = {
  'supplies-request': suppliesRequestTpl,
  'counselor-escalation': counselorEscalationTpl,
  'tuition-delay-escalation': tuitionDelayEscalationTpl,
  'discontinuance-rebuttal': discontinuanceRebuttalTpl,
  'feasibility-rebuttal': feasibilityRebuttalTpl,
  'ipe-change-letter': ipeChangeLetterTpl,
  'seh-extension-letter': sehExtensionLetterTpl
};

const ICON_MAP = {
  'counselor-delay': <Mail className="text-amber-400" size={20} />,
  'supplies-denial': <Briefcase className="text-blue-400" size={20} />,
  'tuition-unpaid': <Clock className="text-red-400" size={20} />,
  'case-closed': <AlertTriangle className="text-red-500" size={20} />,
  'feasibility-denial': <AlertOctagon className="text-amber-500" size={20} />,
  'ipe-change': <Compass className="text-indigo-400" size={20} />,
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
  isBackendOnline
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

  const buildCurrentCasePayload = (workflow = activeWorkflow, stageLabel = tempStage, extraFacts = formFacts) => {
    if (!workflow) {
      return null;
    }

    return {
      title: workflow.title,
      issueTypeId: workflow.workflowId,
      caseStage: stageLabel,
      track: workflow.track || 'long_term',
      ipeStatus: inferIpeStatusFromStage(stageLabel),
      veteranName: extraFacts.veteranName || '',
      claimantReference: extraFacts.caseNumber || '',
      counselorName: extraFacts.counselorName || extraFacts.vrcName || '',
      regionalOffice: selectedOffice || '',
      schoolName: extraFacts.schoolName || extraFacts.schoolOrProgram || extraFacts.courseOrProgram || extraFacts.goalDenied || '',
      issueSummary: workflow.desc || '',
      disputeHistory: summarizeFormFacts(extraFacts),
      escalationHistory: '',
      evidenceSummary: '',
      decisionNoticeDate: '',
      followUpDeadlineDate: '',
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
  const currentCaseRecord = caseDashboard?.currentCase || null;
  const currentCaseIssueTitle = currentCaseRecord?.issue?.title || currentCaseRecord?.title || 'No structured case record yet';
  const currentCaseNextDeadline = currentCaseRecord?.followUpDeadlineDate
    || currentCaseRecord?.deadlines?.[0]?.dueDate
    || '';

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

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 select-text text-slate-100"
    >
      {/* Title & Info Strip */}
      <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>{modeAdvice.badge}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight">
              Get Help Now Case Console
            </h1>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Problem-first self-advocacy wizards helping Veterans solve Counselor delays, laptop denials, unpaid tuition, and illegal case closures.
            </p>
          </div>

          {/* System parameters display */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Privacy Level</span>
              <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                <Shield size={10} />
                <span>Session-Only</span>
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Bookmarks</span>
              <span className="text-blue-400 font-semibold text-[10px] flex items-center gap-1">
                <BookOpen size={10} />
                <span>{bookmarksCount} Saved</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode-Specific Guidance Callout */}
      <div className="border-l-2 border-amber-500/60 bg-amber-950/10 p-4 rounded-r-xl space-y-1">
        <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{modeAdvice.title}</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed">{modeAdvice.text}</p>
      </div>

      {isBackendOnline && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 bg-slate-900/35 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Structured Case Backend</span>
                <h3 className="text-sm font-bold text-slate-100">{currentCaseIssueTitle}</h3>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                caseSyncStatus === 'synced'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : caseSyncStatus === 'error'
                    ? 'border-red-500/30 bg-red-500/10 text-red-300'
                    : 'border-slate-700 bg-slate-950/50 text-slate-300'
              }`}>
                {CASE_SYNC_STATUS_LABELS[caseSyncStatus] || 'Syncing'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Case Stage</span>
                <strong className="mt-1 block text-slate-100">{currentCaseRecord?.caseStage || tempStage}</strong>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Issue Types</span>
                <strong className="mt-1 block text-slate-100">
                  {caseDashboard?.issueTaxonomy?.total || workflowCatalog.length} cataloged
                </strong>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Next Deadline</span>
                <strong className="mt-1 block text-slate-100">{currentCaseNextDeadline || 'Not logged yet'}</strong>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 bg-slate-950/35 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Storage Guardrail</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {caseDashboard?.privacyGuidance?.warning || 'Store only the minimum case facts needed for planning and escalation.'}
            </p>
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
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
              <AlertOctagon size={16} className="text-red-400" />
              <span>Select Your Active Case Challenge</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowCatalog.map((wf) => (
                <div 
                  key={wf.workflowId}
                  className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:bg-slate-900/60 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                        {ICON_MAP[wf.workflowId] || null}
                      </span>
                      <h3 className="text-xs font-bold text-slate-200">{wf.title}</h3>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{wf.desc}</p>
                  </div>

                  <button
                    onClick={() => handleStartWorkflow(wf)}
                    className="mt-4 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <span>Start Guided Help</span>
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
                  <h3 className="text-xs font-bold text-slate-200">Collect Case Facts</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Input details regarding this occurrence to populate the legal claim brief.</p>
                </div>

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

              const showTimelineTab = ['counselor-delay', 'tuition-unpaid', 'case-closed'].includes(activeWorkflow.workflowId);

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
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Identified VA Errors</span>
                          <div className="space-y-2.5">
                            {activeWorkflow.errors.map((err, idx) => (
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
                        <button
                          onClick={() => handleCopyLetter(compiledLetter)}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-semibold transition flex items-center gap-1"
                        >
                          {copiedLetter ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          <span>{copiedLetter ? 'Copied' : 'Copy Text'}</span>
                        </button>
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

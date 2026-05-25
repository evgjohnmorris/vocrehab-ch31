import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Info, CheckCircle, HelpCircle, 
  ChevronRight, ShieldAlert, Printer, 
  FileText, Check, Calendar, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { renderTemplate } from '../utils/templateRenderer.js';
import { analyzeEntitlement } from '../utils/adjudicationEngine.js';

// JSON Templates
import extendedEvaluationRequestTpl from '../data/templates/extended-evaluation-request.json';
import sehDeterminationRequestTpl from '../data/templates/seh-determination-request.json';
import employmentHandicapStatementTpl from '../data/templates/employment-handicap-statement.json';
import sehStatementTpl from '../data/templates/seh-statement.json';
import writtenRationaleRequestTpl from '../data/templates/written-rationale-request.json';

const CASE_STAGES = [
  { id: 'not_applied', label: 'Not Applied' },
  { id: 'evaluation', label: 'Evaluation & Planning Phase (VRC Evaluation)' },
  { id: 'entitled_no_ipe', label: 'Entitled, No IPE yet' },
  { id: 'ipe_signed', label: 'IPE Signed & Active' },
  { id: 'in_school', label: 'In School / Active Training' },
  { id: 'employment_services', label: 'Employment Services Phase' },
  { id: 'interrupted', label: 'Interrupted Status' },
  { id: 'discontinued', label: 'Discontinued / Closed Case (VRC Denial/Closure)' }
];

const DISCHARGE_OPTIONS = [
  { id: 'honorable', label: 'Honorable' },
  { id: 'general', label: 'General Under Honorable Conditions' },
  { id: 'oth', label: 'Other Than Honorable (OTH)' },
  { id: 'bad_conduct', label: 'Bad Conduct' },
  { id: 'dishonorable', label: 'Dishonorable' }
];

const EH_BARRIERS = [
  { id: 'lifting', label: 'Lifting restrictions (unable to lift > 20 lbs)', category: 'Physical' },
  { id: 'sitting_standing', label: 'Sitting or standing intolerance (unable to remain static > 45 mins)', category: 'Physical' },
  { id: 'repetitive_wrist', label: 'Repetitive hand/wrist pain or limitations (e.g. carpal tunnel)', category: 'Physical' },
  { id: 'mobility', label: 'Mobility/ambulatory limitations (difficulty walking, stairs, or climbing)', category: 'Physical' },
  { id: 'ptsd_crowds', label: 'PTSD triggers or anxiety in crowded/loud workspaces', category: 'Cognitive / Mental' },
  { id: 'concentration', label: 'Concentration, focus, or memory barriers under stress', category: 'Cognitive / Mental' },
  { id: 'social_interaction', label: 'Difficulty managing public contact or supervisor interaction', category: 'Cognitive / Mental' },
  { id: 'appointments', label: 'Frequent VA medical appointments or therapy schedules (> 2 days per month)', category: 'Schedule' },
  { id: 'flareups', label: 'Unpredictable symptom flare-ups causing sudden absences', category: 'Schedule' },
  { id: 'ergonomic', label: 'Requires specialised ergonomic workstations or seating', category: 'Workspace' },
  { id: 'sensory', label: 'Requires low-light, low-noise, or temperature-controlled environments', category: 'Workspace' }
];

const SEH_INDICATORS = [
  { id: 'multiple_disabilities', label: 'Multiple severe rating decisions (combined orthopedic, mental, or neurological)', citation: '38 C.F.R. § 21.52' },
  { id: 'severe_restrictions', label: 'Severe functional restrictions on major daily activities', citation: '38 C.F.R. § 21.52' },
  { id: 'long_term_unemployment', label: 'Long-term unemployment (exceeding 12 consecutive months)', citation: '38 C.F.R. § 21.52' },
  { id: 'repeated_failed_work', label: 'Repeated failed attempts to sustain suitable employment', citation: '38 C.F.R. § 21.52' },
  { id: 'extensive_training_need', label: 'Requires extensive or specialized training (e.g. graduate school)', citation: '38 C.F.R. § 21.52' },
  { id: 'il_need', label: 'Needs Independent Living services to perform basic family/community tasks', citation: '38 C.F.R. § 21.52' },
  { id: 'prior_vre_failure', label: 'Prior Chapter 31 case was interrupted or discontinued without successful placement', citation: '38 C.F.R. § 21.52' },
  { id: 'limit_48_months', label: 'Requires more than 48 months of training to achieve vocational recovery', citation: '38 C.F.R. § 21.78' },
  { id: 'medical_instability', label: 'Medical instability causing frequent absences or disruptions in training/work', citation: '38 C.F.R. § 21.52' }
];

const FEASIBILITY_CHECKLIST = [
  { id: 'unstable', label: 'My medical condition is currently unstable or undergoes frequent severe flare-ups.' },
  { id: 'treatment', label: 'I am currently undergoing intensive medical treatments that prevent consistent work/school attendance.' },
  { id: 'doctor_against', label: 'I have been advised by a physician that working or training at this time is counter-indicated.' },
  { id: 'uncertain', label: 'There is significant uncertainty whether I can perform duties in my target career field.' }
];

const EVIDENCE_ITEMS = [
  { id: 'rating_decision', label: 'VA Disability Rating Decision Letter', weight: 20 },
  { id: 'treatment_notes', label: 'Treatment notes or doctor\'s letter detailing work limitations', weight: 25 },
  { id: 'syllabus', label: 'Syllabus or course requirements for the target program', weight: 15 },
  { id: 'resume', label: 'Resume or work history showing past job attempts and failures', weight: 15 },
  { id: 'job_demand', label: 'Statement of local job demand / labor market information', weight: 15 },
  { id: 'personal_statement', label: 'Personal statement of necessity (Form 21-4138 remarks)', weight: 10 }
];

const SCENARIOS = [
  {
    id: 'clear_20_eh',
    name: '20% Rating with Active EH',
    rating: 20,
    dischargeStatus: 'honorable',
    isActiveDuty: false,
    scContributionPresent: true,
    currentEmploymentStatus: 'unemployed',
    hasProposedDenial: false,
    denialReason: 'none',
    hasWrittenDecision: false,
    barriers: { lifting: true, sitting_standing: true },
    sehIndicators: {},
    feasibility: {},
    evidence: { rating_decision: true, resume: true }
  },
  {
    id: '10_seh_expired',
    name: '10% Rating (Expired 12-Year Window & SEH)',
    rating: 10,
    dischargeStatus: 'honorable',
    isActiveDuty: false,
    scContributionPresent: true,
    currentEmploymentStatus: 'unemployed',
    hasProposedDenial: false,
    denialReason: 'none',
    hasWrittenDecision: false,
    dischargeDate: '2010-05-15',
    ratingDecisionDate: '2012-08-20',
    barriers: { ptsd_crowds: true, concentration: true },
    sehIndicators: { repeated_failed_work: true, long_term_unemployment: true },
    feasibility: {},
    evidence: { rating_decision: true, treatment_notes: true, personal_statement: true }
  },
  {
    id: 'employed_suitability_dispute',
    name: 'Employed, but Unsuitable Job (Proposed Denial)',
    rating: 30,
    dischargeStatus: 'honorable',
    isActiveDuty: false,
    scContributionPresent: true,
    currentEmploymentStatus: 'employed',
    hasProposedDenial: true,
    denialReason: 'suitable_employment',
    hasWrittenDecision: false,
    barriers: { repetitive_wrist: true, ergonomic: true },
    sehIndicators: {},
    feasibility: {},
    evidence: { rating_decision: true, treatment_notes: true }
  },
  {
    id: 'feasibility_extended_eval',
    name: 'Severe Conditions (Feasibility Uncertainty)',
    rating: 40,
    dischargeStatus: 'honorable',
    isActiveDuty: false,
    scContributionPresent: true,
    currentEmploymentStatus: 'unemployed',
    hasProposedDenial: false,
    denialReason: 'none',
    hasWrittenDecision: false,
    barriers: { ptsd_crowds: true, concentration: true, appointments: true, flareups: true },
    sehIndicators: { medical_instability: true },
    feasibility: { unstable: true, uncertain: true },
    evidence: { rating_decision: true, treatment_notes: true }
  },
  {
    id: 'dishonorable_discharge_bar',
    name: 'Dishonorable Discharge statutory bar',
    rating: 30,
    dischargeStatus: 'dishonorable',
    isActiveDuty: false,
    scContributionPresent: true,
    currentEmploymentStatus: 'unemployed',
    hasProposedDenial: false,
    denialReason: 'none',
    hasWrittenDecision: false,
    barriers: { lifting: true },
    sehIndicators: {},
    feasibility: {},
    evidence: {}
  }
];

function EntitlementWizardView({ 
  reduceMotion, 
  setSelectedSection, 
  setActiveView,
  plainLanguageMode,
  setPlainLanguageMode 
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'eh_builder' | 'seh_builder' | 'feasibility' | 'evidence_letters'
  
  // Intake & Profile State
  const [rating, setRating] = useState(20);
  const [dischargeStatus, setDischargeStatus] = useState('honorable');
  const [isActiveDuty, setIsActiveDuty] = useState(false);
  const [caseStage, setCaseStage] = useState('evaluation');
  const [dischargeDate, setDischargeDate] = useState('');
  const [ratingDecisionDate, setRatingDecisionDate] = useState('');
  const [scContributionPresent, setScContributionPresent] = useState(true);

  // Job Suitability Status
  const [currentEmploymentStatus, setCurrentEmploymentStatus] = useState('unemployed');
  const [jobSuitabilityCheckboxes, setJobSuitabilityCheckboxes] = useState({
    aggravates_disability: false,
    underemployed: false,
    job_loss: false,
    accommodations_needed: false
  });

  // Denial Posture State
  const [hasProposedDenial, setHasProposedDenial] = useState(false);
  const [denialReason, setDenialReason] = useState('none');
  const [hasWrittenDecision, setHasWrittenDecision] = useState(false);
  const [dateOfConversation, setDateOfConversation] = useState('');
  const [whatVrcSaid, setWhatVrcSaid] = useState('');

  // Checklist States
  const [checkedBarriers, setCheckedBarriers] = useState({});
  const [manualSehIndicators, setManualSehIndicators] = useState({});
  const [checkedFeasibility, setCheckedFeasibility] = useState({});
  const [checkedEvidence, setCheckedEvidence] = useState({});

  // Letter Options & Info
  const [activeLetterTab, setActiveLetterTab] = useState('remarks');
  const [copiedText, setCopiedText] = useState(false);
  const [userName, setUserName] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [programName, setProgramName] = useState('');
  const [requestedRecords, setRequestedRecords] = useState('1. VA Form 28-1902b Counseling Narrative\n2. Complete vocational assessment and job goal analysis logs\n3. Copy of local LMI (Labor Market Information) and compatibility screens used.');

  // Five Tracks Diagnostic
  const [tracksInterest, setTracksInterest] = useState('rapid'); // 'rapid' | 'employment' | 'self_emp' | 'education' | 'independent'
  const [tracksLimitation, setTracksLimitation] = useState('moderate'); // 'mild' | 'moderate' | 'severe'
  const [tracksMarketability, setTracksMarketability] = useState('yes'); // 'yes' | 'no'

  // Independent Living Pre-Screener Checklist
  const [ilpChecklist, setIlpChecklist] = useState({
    no_vocational_goal: false,
    severe_limitations: false,
    needs_assistance: false,
    cost_warning: false
  });

  // Compute Delimiting Date
  const getDelimitingStatus = useCallback(() => {
    if (!dischargeDate || !ratingDecisionDate) return null;
    const dTime = new Date(dischargeDate).getTime();
    const rTime = new Date(ratingDecisionDate).getTime();
    if (isNaN(dTime) || isNaN(rTime)) return null;

    const baseDate = dTime > rTime ? new Date(dischargeDate) : new Date(ratingDecisionDate);
    const delimitingDate = new Date(baseDate);
    delimitingDate.setFullYear(delimitingDate.getFullYear() + 12);
    
    const today = new Date('2026-05-25');
    const diffTime = delimitingDate.getTime() - today.getTime();
    const isExpired = diffTime < 0;
    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
    const diffYears = (diffDays / 365).toFixed(1);
    const delimitingStr = delimitingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return { isExpired, delimitingStr, diffYears };
  }, [dischargeDate, ratingDecisionDate]);

  const delimitingStatus = getDelimitingStatus();

  // Load Scenario Preset
  const handleLoadScenario = (scenarioId) => {
    const s = SCENARIOS.find(x => x.id === scenarioId);
    if (!s) return;
    setRating(s.rating);
    setDischargeStatus(s.dischargeStatus);
    setIsActiveDuty(s.isActiveDuty);
    setScContributionPresent(s.scContributionPresent);
    setCurrentEmploymentStatus(s.currentEmploymentStatus);
    setHasProposedDenial(s.hasProposedDenial);
    setDenialReason(s.denialReason);
    setHasWrittenDecision(s.hasWrittenDecision);
    setCheckedBarriers(s.barriers || {});
    setManualSehIndicators(s.sehIndicators || {});
    setCheckedFeasibility(s.feasibility || {});
    setCheckedEvidence(s.evidence || {});
    setDischargeDate(s.dischargeDate || '');
    setRatingDecisionDate(s.ratingDecisionDate || '');
    
    // Set some defaults for job suitability checklist if employed
    if (s.currentEmploymentStatus === 'employed') {
      setJobSuitabilityCheckboxes({
        aggravates_disability: true,
        underemployed: true,
        job_loss: false,
        accommodations_needed: false
      });
    } else {
      setJobSuitabilityCheckboxes({
        aggravates_disability: false,
        underemployed: false,
        job_loss: false,
        accommodations_needed: false
      });
    }

    if (s.hasProposedDenial) {
      setCaseStage('discontinued');
      setDateOfConversation('2026-05-20');
      setWhatVrcSaid('The counselor stated verbally that I am not entitled because my current employment indicates I have overcome my disability.'); // @cite 38-cfr-21-51
    } else {
      setCaseStage('evaluation');
      setDateOfConversation('');
      setWhatVrcSaid('');
    }
  };

  // Derive active SEH indicators at render-time
  const getActiveSehIndicators = () => {
    const indicators = { ...manualSehIndicators };
    
    // Exactly 10%
    if (rating === 10) {
      indicators['ten_percent'] = true;
    } else {
      indicators['ten_percent'] = false;
    }

    // OTH Discharge
    if (dischargeStatus === 'oth') {
      indicators['oth_discharge'] = true;
    } else {
      indicators['oth_discharge'] = false;
    }

    // Delimiting date expiration check
    if (delimitingStatus?.isExpired) {
      indicators['expired_12year'] = true;
    } else {
      indicators['expired_12year'] = false;
    }

    return indicators;
  };

  const activeSehIndicators = getActiveSehIndicators();

  // Sequential Adjudication Rules Engine (Imported)
  const adj = analyzeEntitlement({
    rating,
    dischargeStatus,
    isActiveDuty,
    dischargeDate,
    ratingDecisionDate,
    scContributionPresent,
    currentEmploymentStatus,
    jobSuitability: jobSuitabilityCheckboxes,
    hasProposedDenial,
    denialReason,
    hasWrittenDecision,
    checkedBarriers,
    manualSehIndicators,
    checkedFeasibility,
    checkedEvidence,
    caseStage
  });

  // Remarks Narratives (Section IV of VA Form 28-1900)
  const compileRemarksText = () => {
    const activeBarriersText = EH_BARRIERS
      .filter(b => checkedBarriers[b.id])
      .map(b => b.label)
      .join(', ');

    const variables = {
      userName: userName || '[VETERAN NAME]',
      claimNumber: claimNumber || '[CLAIM NUMBER]',
      date: new Date().toLocaleDateString(),
      currentEmploymentStatus: currentEmploymentStatus === 'employed' ? 'Employed' : 'Unemployed',
      programName: programName || '[TARGET GOAL]',
      serviceConnectedConditions: `Rated service-connected conditions (${rating}%)`,
      workLimitations: activeBarriersText || 'Physical and cognitive restrictions arising from service-connected conditions.',
      workHistoryProblems: currentEmploymentStatus === 'unemployed' ? 'Unemployed or unable to maintain steady employment due to rated limitations.' : 'Experiencing difficulties maintaining steady work as detailed in current job suitability assessment.',
      whyCurrentEmploymentNotSuitable: currentEmploymentStatus === 'employed' ? 'Aggravates disabilities or represents underemployment.' : 'Not applicable (currently unemployed).',
      requestedAction: 'I request a collaborative evaluation to formulate a rehabilitation plan and address my occupational barriers.'
    };

    return renderTemplate(employmentHandicapStatementTpl.body, variables);
  };

  // Compile SEH Statement
  const compileSehRemarksText = () => {
    const activeBarriersText = EH_BARRIERS
      .filter(b => checkedBarriers[b.id])
      .map(b => b.label)
      .join(', ');

    const activeSehText = SEH_INDICATORS
      .filter(ind => activeSehIndicators[ind.id] || manualSehIndicators[ind.id])
      .map(ind => ind.label)
      .join(', ');

    const variables = {
      userName: userName || '[VETERAN NAME]',
      claimNumber: claimNumber || '[CLAIM NUMBER]',
      date: new Date().toLocaleDateString(),
      ratingPercent: rating,
      seriousVocationalBarriers: activeSehText || 'Significant vocational barriers identified under 38 C.F.R. § 21.52.',
      failedWorkAttempts: 'Unable to sustain stable employment due to rated limitations.',
      trainingNeeds: 'Requires specialized training, accommodations, or extensions to overcome occupational limitations.',
      functionalRestrictions: activeBarriersText || 'Severe functional restrictions arising from rated conditions.',
      whyExtensiveServicesNeeded: 'Requires extensive rehabilitation services and potential extensions of eligibility or duration to achieve recovery.',
      requestedAction: 'I request a Serious Employment Handicap determination to overcome my significant vocational barriers.'
    };

    return renderTemplate(sehStatementTpl.body, variables);
  };

  // Compile Letters using renderTemplate
  const compileExtendedEvalLetter = () => {
    const variables = {
      date: new Date().toLocaleDateString(),
      userName: userName || '[VETERAN NAME]',
      claimNumber: claimNumber || '[CLAIM NUMBER]'
    };
    return renderTemplate(extendedEvaluationRequestTpl.body, variables);
  };

  const compileSehLetter = () => {
    const barrierList = EH_BARRIERS
      .filter(b => checkedBarriers[b.id])
      .map(b => `* ${b.label}`)
      .join('\n');

    const indicatorList = SEH_INDICATORS
      .filter(ind => activeSehIndicators[ind.id] || manualSehIndicators[ind.id])
      .map(ind => `* ${ind.label} (${ind.citation})`)
      .join('\n');

    const variables = {
      date: new Date().toLocaleDateString(),
      userName: userName || '[VETERAN NAME]',
      claimNumber: claimNumber || '[CLAIM NUMBER]',
      employmentBarriers: barrierList || '* General occupational barriers caused by rated disabilities.',
      sehJustification: indicatorList || '* Statutorily indicated Serious Employment Handicap circumstances.'
    };
    return renderTemplate(sehDeterminationRequestTpl.body, variables);
  };

  // Compile Written Rationale Request
  const compileWrittenRationaleLetter = () => {
    const variables = {
      date: new Date().toLocaleDateString(),
      userName: userName || '[VETERAN NAME]',
      claimNumber: claimNumber || '[CLAIM NUMBER]',
      dateOfConversation: dateOfConversation || '[DATE OF CONVERSATION/DECISION]',
      whatVrcSaid: whatVrcSaid || '[COUNSELOR STATEMENTS]',
      requestedRecords: requestedRecords || '[LIST OF REQUESTED RECORDS]'
    };
    return renderTemplate(writtenRationaleRequestTpl.body, variables);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintText = (title, text) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: monospace; white-space: pre-wrap; padding: 40px; color: #000; font-size: 0.85rem; line-height: 1.5; }
            h1 { font-family: sans-serif; font-size: 1.2rem; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div>${text}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleBarrier = (id) => {
    setCheckedBarriers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSehIndicator = (id) => {
    // If it's an automatically-derived indicator, don't allow manual toggling
    const isAuto = ['ten_percent', 'oth_discharge', 'expired_12year'].includes(id);
    if (isAuto) return;
    setManualSehIndicators(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFeasibility = (id) => {
    setCheckedFeasibility(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEvidence = (id) => {
    setCheckedEvidence(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Five Tracks scoring and results
  const getTracksDiagnosticResult = () => {
    let recommendedTrack = 'Track 1: Rapid Access to Employment';
    let trackExplanation = 'Rapid employment services are recommended for veterans who already possess marketable skills and require only immediate job placement assistance.';
    let trackCfr = '38 C.F.R. § 21.35';

    if (tracksLimitation === 'severe' || tracksInterest === 'independent') {
      recommendedTrack = 'Track 5: Independent Living Services';
      trackExplanation = 'Independent Living services are indicated where severe limitations make achieving a vocational goal currently uncertain or not feasible, focusing on restoring independence in daily life.';
      trackCfr = '38 C.F.R. § 21.76';
    } else if (tracksInterest === 'self_emp') {
      recommendedTrack = 'Track 4: Self-Employment';
      trackExplanation = 'Self-employment is suitable for veterans with complex medical limitations that require a highly customizable schedule and workplace control, or who have strong business proposals.';
      trackCfr = '38 C.F.R. § 21.257';
    } else if (tracksInterest === 'education' || tracksMarketability === 'no') {
      recommendedTrack = 'Track 3: Employment Through Long-Term Services';
      trackExplanation = 'Long-term training or professional education (such as college or vocational certificates) is indicated to acquire the specialized skills required for a suitable, medically compatible career.';
      trackCfr = '38 C.F.R. § 21.51';
    } else if (tracksInterest === 'rapid' || tracksInterest === 'employment') {
      recommendedTrack = 'Track 2: Reemployment';
      trackExplanation = 'Reemployment services assist veterans in returning to their prior employer or field with appropriate adjustments and accommodations.';
      trackCfr = '38 C.F.R. § 21.35';
    }

    return { recommendedTrack, trackExplanation, trackCfr };
  };

  const tracksResult = getTracksDiagnosticResult();

  // Reset all states
  const handleResetWizard = () => {
    setRating(20);
    setDischargeStatus('honorable');
    setIsActiveDuty(false);
    setCaseStage('evaluation');
    setDischargeDate('');
    setRatingDecisionDate('');
    setScContributionPresent(true);
    setCurrentEmploymentStatus('unemployed');
    setJobSuitabilityCheckboxes({
      aggravates_disability: false,
      underemployed: false,
      job_loss: false,
      accommodations_needed: false
    });
    setHasProposedDenial(false);
    setDenialReason('none');
    setHasWrittenDecision(false);
    setDateOfConversation('');
    setWhatVrcSaid('');
    setCheckedBarriers({});
    setManualSehIndicators({});
    setCheckedFeasibility({});
    setCheckedEvidence({});
    setUserName('');
    setClaimNumber('');
    setProgramName('');
    setTracksInterest('rapid');
    setTracksLimitation('moderate');
    setTracksMarketability('yes');
    setIlpChecklist({
      no_vocational_goal: false,
      severe_limitations: false,
      needs_assistance: false,
      cost_warning: false
    });
    setActiveTab('profile');
  };

  const getEvidenceRating = (score) => {
    if (score >= 75) return { label: 'Optimized Evidence Base', color: 'text-emerald-400', progressColor: 'bg-emerald-500' };
    if (score >= 45) return { label: 'Moderate Evidence Base', color: 'text-amber-400', progressColor: 'bg-amber-500' };
    return { label: 'Weak Evidence Base', color: 'text-red-400', progressColor: 'bg-red-500' };
  };

  const evidenceRating = getEvidenceRating(adj.evidenceScore);

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Award size={20} />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Eligibility & Entitlement Adjudication System</h1>
            <p className="text-[11px] text-slate-400">Statutory adjudication prescreener, counselor simulator, and strategic document compiler.</p>
          </div>
        </div>

        {/* Plain Language Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2 border border-slate-800 rounded-lg shrink-0">
          <HelpCircle size={14} className="text-cyan-400" />
          <span className="text-[10px] font-semibold text-slate-350">Plain Language:</span>
          <button
            type="button"
            id="plain-language-toggle"
            onClick={() => setPlainLanguageMode(!plainLanguageMode)}
            className={`text-[9px] font-bold px-2 py-0.5 rounded transition ${
              plainLanguageMode ? 'bg-indigo-650 text-white' : 'bg-slate-950/60 text-slate-450 border border-slate-855'
            }`}
          >
            {plainLanguageMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* Preset Scenarios Panel */}
      <div className="bg-slate-950/65 border border-slate-800/80 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Eligibility Test Lab: Load Preset Profiles</span>
        </div>
        <p className="text-[10.5px] text-slate-400 mb-3">Load a predefined profile to see the rules engine map it to the correct statutory pathway.</p>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleLoadScenario(sc.id)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10.5px] text-indigo-400 hover:text-indigo-300 rounded font-semibold transition"
            >
              {sc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header mb-6">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          1. Service Details
        </button>
        <button 
          className={`tab-btn ${activeTab === 'denial_posture' ? 'active' : ''}`}
          onClick={() => setActiveTab('denial_posture')}
        >
          2. Case Stage & Denial
        </button>
        <button 
          className={`tab-btn ${activeTab === 'eh_builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('eh_builder')}
        >
          3. Occupational Barriers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'seh_builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('seh_builder')}
        >
          4. SEH Extension Indicators
        </button>
        <button 
          className={`tab-btn ${activeTab === 'feasibility' ? 'active' : ''}`}
          onClick={() => setActiveTab('feasibility')}
        >
          5. Feasibility & Evidence
        </button>
        <button 
          className={`tab-btn ${activeTab === 'evidence_letters' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence_letters')}
        >
          6. Document Builder
        </button>
      </div>

      {/* Content Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Active Panel Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: SERVICE DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Service Details & Rating</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Disability Rating from VA</label>
                  <select 
                    id="rating-select"
                    className="form-control bg-slate-950/80 border-slate-800 text-xs text-slate-100"
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                    aria-label="Select disability rating"
                  >
                    <option value={0}>No rating / 0%</option>
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                    <option value={30}>30% or Higher</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Discharge Characterization</label>
                  <select 
                    id="discharge-select"
                    className="form-control bg-slate-950/80 border-slate-800 text-xs text-slate-100"
                    value={dischargeStatus} 
                    onChange={(e) => setDischargeStatus(e.target.value)}
                    aria-label="Select discharge characterisation"
                  >
                    {DISCHARGE_OPTIONS.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-slate-800/80 rounded-xl p-4 bg-slate-950/40 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    id="ides-toggle"
                    checked={isActiveDuty}
                    onChange={(e) => setIsActiveDuty(e.target.checked)}
                    className="mt-1 accent-indigo-500 cursor-pointer"
                    aria-label="Active duty or IDES path toggle"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Active-duty / IDES (Integrated Disability Evaluation System) Pathway</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5 leading-relaxed">
                      Check if you are currently on active-duty undergoing IDES transition. Active-duty service members undergoing IDES or holding a memorandum rating of 20% or more bypass standard veteran intake rules under 38 C.F.R. § 21.40.
                    </span>
                  </div>
                </label>
              </div>

              <div className="border border-slate-800/80 rounded-xl p-4 bg-slate-950/40 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={scContributionPresent}
                    onChange={(e) => setScContributionPresent(e.target.checked)}
                    className="mt-1 accent-indigo-500 cursor-pointer"
                    aria-label="Service-connected contribution toggle"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Service-Connected Contribution Check</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5 leading-relaxed">
                      My rated service-connected conditions directly cause or contribute to my occupational limitations or vocational impairment. (Required under 38 C.F.R. § 21.51 / § 21.52).
                    </span>
                  </div>
                </label>
              </div>

              <div className="border-t border-slate-850 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-400" />
                    <span>12-Year Delimiting Date Calculator</span>
                  </h3>
                  <span className="text-[9px] font-mono text-slate-550 font-bold px-1.5 py-0.5 bg-slate-950 rounded">38 U.S.C. § 3103</span>
                </div>
                
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  VR&E basic eligibility is generally open for 12 years from discharge or first rating notification, whichever is later. Exceeding this requires an SEH finding under 38 C.F.R. § 21.44.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Military Discharge Date (DD-214 12b)</label>
                    <input 
                      type="date"
                      value={dischargeDate}
                      onChange={(e) => setDischargeDate(e.target.value)}
                      className="form-control bg-slate-950/80 border-slate-800 text-xs text-slate-100"
                      aria-label="Discharge date"
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">VA Rating Notification Date</label>
                    <input 
                      type="date"
                      value={ratingDecisionDate}
                      onChange={(e) => setRatingDecisionDate(e.target.value)}
                      className="form-control bg-slate-950/80 border-slate-800 text-xs text-slate-100"
                      aria-label="Rating decision date"
                    />
                  </div>
                </div>

                {delimitingStatus && (
                  <div className={`p-4 border rounded-xl bg-slate-950/40 ${delimitingStatus.isExpired ? 'border-red-500/30' : 'border-emerald-500/30'}`}>
                    <div className="flex gap-2.5 items-start">
                      <Info size={16} className={delimitingStatus.isExpired ? 'text-red-400 mt-0.5' : 'text-emerald-400 mt-0.5'} />
                      <div className="text-xs space-y-1">
                        <strong className={delimitingStatus.isExpired ? 'text-red-300' : 'text-emerald-300'}>
                          {delimitingStatus.isExpired ? 'Basic Eligibility Expired' : 'Basic Eligibility Active'}
                        </strong>
                        <p className="text-slate-400 text-[10.5px] leading-relaxed">
                          Your 12-year window {delimitingStatus.isExpired ? 'expired' : 'remains open'} on <strong>{delimitingStatus.delimitingStr}</strong> (approx. {delimitingStatus.diffYears} years {delimitingStatus.isExpired ? 'ago' : 'remaining'}).
                        </p>
                        {delimitingStatus.isExpired && (
                          <div className="mt-2 text-[10px] text-amber-400 leading-relaxed bg-amber-950/20 p-2.5 border border-amber-900/30 rounded">
                            <strong>Serious Employment Handicap Required:</strong> Under 38 C.F.R. § 21.44, you require an assessed SEH to bypass this expiration and access services.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('denial_posture')}
                  className="btn btn-primary inline-flex items-center gap-1.5"
                >
                  <span>Continue to Case Stage</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CASE STAGE & DENIAL POSTURE */}
          {activeTab === 'denial_posture' && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Case Status & Denial Posture</span>
              
              <div className="form-group">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Select Current Case Stage</label>
                <select 
                  className="form-control bg-slate-950/80 border-slate-800 text-xs text-slate-100"
                  value={caseStage} 
                  onChange={(e) => setCaseStage(e.target.value)}
                  aria-label="Select current case stage"
                >
                  {CASE_STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.label}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-800/80 rounded-xl p-4 bg-slate-950/40 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={hasProposedDenial}
                    onChange={(e) => setHasProposedDenial(e.target.checked)}
                    className="mt-1 accent-indigo-500 cursor-pointer"
                    aria-label="Proposed denial toggle"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Counselor has proposed denial or verbally closed case</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5 leading-relaxed">
                      Check this if a VRC stated verbally that you do not qualify, or if you received an intent to discontinue/deny.
                    </span>
                  </div>
                </label>

                {hasProposedDenial && (
                  <div className="pl-6 space-y-4 border-l-2 border-indigo-500/20 pt-2">
                    <div className="form-group">
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Stated Reason for Denial / Decision</label>
                      <select 
                        className="form-control bg-slate-900 border-slate-800 text-xs text-slate-100"
                        value={denialReason}
                        onChange={(e) => setDenialReason(e.target.value)}
                        aria-label="Denial reason"
                      >
                        <option value="none">-- Select VRC Reason --</option>
                        <option value="not_eligible">"You only have a 10% rating, so you don't qualify"</option>
                        <option value="suitable_employment">"Your current employment shows you have overcome your handicap"</option>
                        <option value="no_eh">"You do not have a vocational/employment handicap"</option>
                        <option value="no_seh">"You do not have a Serious Employment Handicap"</option>
                        <option value="not_feasible">"Achieving a vocational goal is not currently feasible for you"</option>
                      </select>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={hasWrittenDecision}
                        onChange={(e) => setHasWrittenDecision(e.target.checked)}
                        className="mt-1 accent-indigo-500 cursor-pointer"
                        aria-label="Has written decision toggle"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-200 block">I have received the formal written Decision Notice letter</span>
                        <span className="text-slate-400 text-[10px] block mt-0.5 leading-relaxed">
                          {/* @cite 38-cfr-21-198 */}
                          Check only if you have a physical or digital copy of the VA Decision Notice outlining your appeal rights. (Required to file formal appeal lanes).
                        </span>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Date of Denial or VRC Conversation</label>
                        <input 
                          type="date"
                          value={dateOfConversation}
                          onChange={(e) => setDateOfConversation(e.target.value)}
                          className="form-control bg-slate-900 border-slate-800 text-xs text-slate-100"
                          aria-label="Denial date"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">What did the counselor verbally tell you?</label>
                      <textarea
                        placeholder="e.g. Counselor said my BS degree is too long, or since I am working as an IT specialist I am suitable..."
                        value={whatVrcSaid}
                        onChange={(e) => setWhatVrcSaid(e.target.value)}
                        className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="btn btn-secondary text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('eh_builder')}
                  className="btn btn-primary inline-flex items-center gap-1.5"
                >
                  <span>Continue to Barriers</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: OCCUPATIONAL BARRIERS (EH) */}
          {activeTab === 'eh_builder' && (
            <div className="space-y-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Vocational Impairment Checklist</span>
                <h2 className="text-xs font-bold text-slate-200 mt-0.5">Factual Occupational Barriers</h2>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                  Select all active physical or cognitive limitations that interfere with your suitability for standard employment.
                </p>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {['Physical', 'Cognitive / Mental', 'Schedule', 'Workspace'].map(cat => {
                  const barriers = EH_BARRIERS.filter(b => b.category === cat);
                  return (
                    <div key={cat} className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-850 pb-1">{cat} Restrictions</span>
                      <div className="grid grid-cols-1 gap-2">
                        {barriers.map(b => (
                          <div
                            key={b.id}
                            onClick={() => toggleBarrier(b.id)}
                            className={`border rounded-lg p-3 cursor-pointer select-none flex items-start gap-2.5 transition ${
                              checkedBarriers[b.id]
                                ? 'bg-indigo-500/5 border-indigo-800/80'
                                : 'bg-slate-950/20 border-slate-855 hover:border-slate-800'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={!!checkedBarriers[b.id]}
                              onChange={() => {}}
                              className="mt-0.5 pointer-events-none accent-indigo-500"
                              aria-label={b.label}
                            />
                            <span className="text-[11px] text-slate-300 leading-normal">{b.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-850 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Employment Status & Job Suitability</span>
                
                <div className="form-group">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Current Employment Status</label>
                  <select 
                    className="form-control bg-slate-950/80 border-slate-800 text-xs text-slate-100"
                    value={currentEmploymentStatus} 
                    onChange={(e) => setCurrentEmploymentStatus(e.target.value)}
                    aria-label="Select employment status"
                  >
                    <option value="unemployed">Unemployed or unable to maintain stable work</option>
                    <option value="employed">Employed (Full-time or Part-time)</option>
                  </select>
                </div>

                {currentEmploymentStatus === 'employed' && (
                  <div className="p-4 border border-slate-800/80 rounded-xl bg-slate-950/40 space-y-3">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Job Suitability Factors</span>
                    <p className="text-[10px] text-slate-450 leading-relaxed">
                      If you are employed, you must prove the current job is unsuitable under 38 C.F.R. § 21.51. Select all that apply:
                    </p>

                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={jobSuitabilityCheckboxes.aggravates_disability}
                          onChange={(e) => setJobSuitabilityCheckboxes(prev => ({ ...prev, aggravates_disability: e.target.checked }))}
                          className="mt-0.5 accent-indigo-500"
                        />
                        <span className="text-[11px] text-slate-300">This job aggravates my rated service-connected conditions.</span>
                      </label>
                      
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={jobSuitabilityCheckboxes.underemployed}
                          onChange={(e) => setJobSuitabilityCheckboxes(prev => ({ ...prev, underemployed: e.target.checked }))}
                          className="mt-0.5 accent-indigo-500"
                        />
                        <span className="text-[11px] text-slate-300">I am underemployed (working below my skill, education level, or potential).</span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={jobSuitabilityCheckboxes.job_loss}
                          onChange={(e) => setJobSuitabilityCheckboxes(prev => ({ ...prev, job_loss: e.target.checked }))}
                          className="mt-0.5 accent-indigo-500"
                        />
                        <span className="text-[11px] text-slate-300">I experience frequent absences or threat of job loss due to flare-ups.</span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={jobSuitabilityCheckboxes.accommodations_needed}
                          onChange={(e) => setJobSuitabilityCheckboxes(prev => ({ ...prev, accommodations_needed: e.target.checked }))}
                          className="mt-0.5 accent-indigo-500"
                        />
                        <span className="text-[11px] text-slate-300">I require significant workplace accommodations that are not fully provided.</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('denial_posture')}
                  className="btn btn-secondary text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('seh_builder')}
                  className="btn btn-primary inline-flex items-center gap-1.5"
                >
                  <span>Continue to SEH</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SEH EXTENSION INDICATORS */}
          {activeTab === 'seh_builder' && (
            <div className="space-y-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Serious Employment Handicap Assessment</span>
                <h2 className="text-xs font-bold text-slate-200 mt-0.5">Serious Employment Handicap (SEH) Checklist</h2>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                  Under 38 C.F.R. § 21.52, an SEH is established if service-connected conditions produce significant vocational impairment. This bypasses the 12-year window and is mandatory for 10% ratings. Select indicators in your case:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {SEH_INDICATORS.map(ind => {
                  const isAuto = ['ten_percent', 'oth_discharge', 'expired_12year'].includes(ind.id);
                  const isChecked = !!activeSehIndicators[ind.id] || !!manualSehIndicators[ind.id];
                  return (
                    <div
                      key={ind.id}
                      onClick={() => toggleSehIndicator(ind.id)}
                      className={`border rounded-lg p-3 select-none flex items-start gap-3 transition ${
                        isAuto ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isChecked
                          ? 'bg-amber-500/5 border-amber-800/80'
                          : 'bg-slate-950/20 border-slate-855 hover:border-slate-800'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        readOnly={isAuto}
                        onChange={() => {}}
                        className="mt-0.5 pointer-events-none accent-amber-500"
                        aria-label={ind.label}
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-305 leading-normal font-semibold">{ind.label}</span>
                          {isAuto && (
                            <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 py-0.2 rounded shrink-0 uppercase font-bold">Auto-derived</span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-amber-400 block">{ind.citation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('eh_builder')}
                  className="btn btn-secondary text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('feasibility')}
                  className="btn btn-primary inline-flex items-center gap-1.5"
                >
                  <span>Continue to Feasibility</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: FEASIBILITY & EVIDENCE */}
          {activeTab === 'feasibility' && (
            <div className="space-y-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Vocational Feasibility Pre-screener</span>
                <h2 className="text-xs font-bold text-slate-200 mt-0.5">Uncertain Feasibility & Extended Evaluation Checklist</h2>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                  Under 38 C.F.R. § 21.57 / § 21.74, if vocational feasibility is uncertain, the counselor should authorize an Extended Evaluation period (up to 12 months) to evaluate capacity rather than issuing an immediate denial. Check if any apply:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 mb-6">
                {FEASIBILITY_CHECKLIST.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleFeasibility(item.id)}
                    className={`border rounded-lg p-3 cursor-pointer select-none flex items-start gap-3 transition ${
                      checkedFeasibility[item.id]
                        ? 'bg-red-500/5 border-red-800/80'
                        : 'bg-slate-950/20 border-slate-855 hover:border-slate-800'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={!!checkedFeasibility[item.id]}
                      onChange={() => {}}
                      className="mt-0.5 pointer-events-none accent-red-500"
                      aria-label={item.label}
                    />
                    <span className="text-[11px] text-slate-300 leading-relaxed">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Evidence Strength Checklist */}
              <div className="space-y-3 border-t border-slate-850 pt-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Claim Preparation</span>
                  <h2 className="text-xs font-bold text-slate-200 mt-0.5">Evidence Checklist</h2>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed">Select corroborating records you possess to determine the sufficiency index of your application package.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {EVIDENCE_ITEMS.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleEvidence(item.id)}
                      className={`border rounded-lg p-3 cursor-pointer select-none flex items-start gap-2.5 transition ${
                        checkedEvidence[item.id]
                          ? 'bg-emerald-500/5 border-emerald-800/80'
                          : 'bg-slate-950/20 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={!!checkedEvidence[item.id]}
                        onChange={() => {}}
                        className="mt-0.5 pointer-events-none accent-emerald-500"
                        aria-label={item.label}
                      />
                      <div className="flex-1 flex justify-between items-center gap-2">
                        <span className="text-[11px] text-slate-300 leading-tight">{item.label}</span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">+{item.weight} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Independent Living (ILP) Pre-Screener */}
              <div className="p-4 border border-slate-800 bg-slate-950/45 rounded-xl space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">Independent Living (ILP) Pre-Screener</span>
                  <span className="text-[9px] font-mono text-slate-550 font-bold px-1.5 py-0.5 bg-slate-950 rounded">38 U.S.C. § 3109</span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Screen for ILP feasibility when standard vocational goals are not viable due to rating limitations (38 C.F.R. § 21.76):
                </p>

                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={ilpChecklist.no_vocational_goal}
                      onChange={(e) => setIlpChecklist(prev => ({ ...prev, no_vocational_goal: e.target.checked }))}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <span className="text-[10.5px] text-slate-300">Achieving a vocational goal is currently not reasonably feasible for me.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={ilpChecklist.severe_limitations}
                      onChange={(e) => setIlpChecklist(prev => ({ ...prev, severe_limitations: e.target.checked }))}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <span className="text-[10.5px] text-slate-300">I have severe limitations that interfere with independent living in my family/community.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={ilpChecklist.needs_assistance}
                      onChange={(e) => setIlpChecklist(prev => ({ ...prev, needs_assistance: e.target.checked }))}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <span className="text-[10.5px] text-slate-300">I require specialized services (home/workspace modifications, assistive technology).</span>
                  </label>

                  {ilpChecklist.no_vocational_goal && ilpChecklist.severe_limitations && (
                    <div className="p-2.5 bg-red-950/20 border border-red-900/30 text-[10px] text-red-300 rounded leading-relaxed">
                      <strong>ILP Strategy:</strong> Request an Independent Living program. Note: VRCs require regional office supervisor approval for programs estimated to cost more than $25k, or VREO/higher approval for costs above $50k-$75k.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('seh_builder')}
                  className="btn btn-secondary text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('evidence_letters')}
                  className="btn btn-primary inline-flex items-center gap-1.5"
                >
                  <span>Continue to Letters</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: EVIDENCE & LETTER BUILDER */}
          {activeTab === 'evidence_letters' && (
            <div className="space-y-5 bg-slate-900/30 border border-slate-800 rounded-xl p-5">
              
              {/* Facts Input Form for Letter Compiling */}
              <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl space-y-3.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Custom Fact Interpolation</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Veteran Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)}
                      className="form-control bg-slate-900 border-slate-800 text-xs text-slate-100"
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">VA Claim Number / SSN</label>
                    <input 
                      type="text" 
                      placeholder="XXX-XX-XXXX" 
                      value={claimNumber} 
                      onChange={(e) => setClaimNumber(e.target.value)}
                      className="form-control bg-slate-900 border-slate-800 text-xs text-slate-100"
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Goal / Program</label>
                    <input 
                      type="text" 
                      placeholder="e.g. BS in Computer Science" 
                      value={programName} 
                      onChange={(e) => setProgramName(e.target.value)}
                      className="form-control bg-slate-900 border-slate-800 text-xs text-slate-100"
                    />
                  </div>
                </div>

                {hasProposedDenial && activeLetterTab === 'written_rationale' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Written Decision Request Details</span>
                    <div className="form-group">
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">List Specific Records / Narratives Requested</label>
                      <textarea
                        value={requestedRecords}
                        onChange={(e) => setRequestedRecords(e.target.value)}
                        className="w-full h-20 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Compilation Tab Switcher */}
              <div className="border-t border-slate-850 pt-4 space-y-4">
                <div className="tabs-header">
                  <button 
                    className={`tab-btn text-[10px] ${activeLetterTab === 'remarks' ? 'active' : ''}`}
                    onClick={() => setActiveLetterTab('remarks')}
                  >
                    1. Remarks Statement
                  </button>
                  <button 
                    className={`tab-btn text-[10px] ${activeLetterTab === 'seh_statement' ? 'active' : ''}`}
                    onClick={() => setActiveLetterTab('seh_statement')}
                  >
                    2. SEH Statement
                  </button>
                  <button 
                    className={`tab-btn text-[10px] ${activeLetterTab === 'seh_letter' ? 'active' : ''}`}
                    onClick={() => setActiveLetterTab('seh_letter')}
                  >
                    3. SEH Request Letter
                  </button>
                  <button 
                    className={`tab-btn text-[10px] ${activeLetterTab === 'ext_eval' ? 'active' : ''}`}
                    onClick={() => setActiveLetterTab('ext_eval')}
                  >
                    4. Extended Eval Request
                  </button>
                  <button 
                    className={`tab-btn text-[10px] ${activeLetterTab === 'written_rationale' ? 'active' : ''}`}
                    onClick={() => setActiveLetterTab('written_rationale')}
                  >
                    5. Written Rationale Request
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                      {activeLetterTab === 'remarks' && 'VA Form 28-1900 Section IV: Remarks'}
                      {activeLetterTab === 'seh_statement' && 'Serious Employment Handicap Statement (38 C.F.R. § 21.52)'}
                      {activeLetterTab === 'seh_letter' && 'Formal Written Request (38 C.F.R. § 21.52)'}
                      {activeLetterTab === 'ext_eval' && 'Formal Written Request (38 C.F.R. § 21.74)'}
                      {activeLetterTab === 'written_rationale' && 'Written Rationale Request (38 C.F.R. § 21.50)'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = 
                            activeLetterTab === 'remarks' ? compileRemarksText() :
                            activeLetterTab === 'seh_statement' ? compileSehRemarksText() :
                            activeLetterTab === 'seh_letter' ? compileSehLetter() :
                            activeLetterTab === 'ext_eval' ? compileExtendedEvalLetter() :
                            compileWrittenRationaleLetter();
                          handleCopyText(text);
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 hover:text-indigo-300 rounded font-semibold cursor-pointer transition flex items-center gap-1"
                      >
                        {copiedText ? <Check size={11} className="text-emerald-400" /> : <FileText size={11} />}
                        <span>{copiedText ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const title = 
                            activeLetterTab === 'remarks' ? 'Remarks Narrative' :
                            activeLetterTab === 'seh_statement' ? 'SEH Remarks Statement' :
                            activeLetterTab === 'seh_letter' ? 'SEH Request Letter' :
                            activeLetterTab === 'ext_eval' ? 'Extended Evaluation Request' :
                            'Written Rationale Request';
                          const text = 
                            activeLetterTab === 'remarks' ? compileRemarksText() :
                            activeLetterTab === 'seh_statement' ? compileSehRemarksText() :
                            activeLetterTab === 'seh_letter' ? compileSehLetter() :
                            activeLetterTab === 'ext_eval' ? compileExtendedEvalLetter() :
                            compileWrittenRationaleLetter();
                          handlePrintText(title, text);
                        }}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 hover:text-indigo-300 rounded font-semibold cursor-pointer transition flex items-center gap-1"
                      >
                        <Printer size={11} />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    className="w-full h-56 bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-[10.5px] font-mono text-slate-350 leading-relaxed select-all focus:outline-none focus:border-slate-700 resize-none"
                    value={
                      activeLetterTab === 'remarks' ? compileRemarksText() :
                      activeLetterTab === 'seh_statement' ? compileSehRemarksText() :
                      activeLetterTab === 'seh_letter' ? compileSehLetter() :
                      activeLetterTab === 'ext_eval' ? compileExtendedEvalLetter() :
                      compileWrittenRationaleLetter()
                    }
                    aria-label="Generated letter text preview"
                  />
                </div>
              </div>

              {/* Five Tracks Diagnostic Tool */}
              <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Five Tracks to Employment Diagnostic</span>
                  <span className="text-[9px] font-mono text-slate-550 font-bold px-1.5 py-0.5 bg-slate-950 rounded">38 C.F.R. § 21.35</span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Briefly select parameters matching your career goals and limitation profiles to find your recommended counseling track:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="text-[9px] font-bold text-slate-450 block mb-1">Career Goal Focus</label>
                    <select
                      className="form-control bg-slate-900 border-slate-800 text-[10px] text-slate-200"
                      value={tracksInterest}
                      onChange={(e) => setTracksInterest(e.target.value)}
                    >
                      <option value="rapid">Immediate Employment (Same Field)</option>
                      <option value="employment">Reemployment assistance</option>
                      <option value="education">Acquiring New Degree / Credentials</option>
                      <option value="self_emp">Self-Employment / Business Setup</option>
                      <option value="independent">Restoring Daily Independence</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="text-[9px] font-bold text-slate-450 block mb-1">Rating Severity / Limits</label>
                    <select
                      className="form-control bg-slate-900 border-slate-800 text-[10px] text-slate-200"
                      value={tracksLimitation}
                      onChange={(e) => setTracksLimitation(e.target.value)}
                    >
                      <option value="mild">Mild limitations (no major physical blocks)</option>
                      <option value="moderate">Moderate restrictions (some work blocks)</option>
                      <option value="severe">Severe restrictions (unable to work standard jobs)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="text-[9px] font-bold text-slate-450 block mb-1">Possess Marketable Job Skills?</label>
                    <select
                      className="form-control bg-slate-900 border-slate-800 text-[10px] text-slate-200"
                      value={tracksMarketability}
                      onChange={(e) => setTracksMarketability(e.target.value)}
                    >
                      <option value="yes">Yes, in high-demand fields</option>
                      <option value="no">No, requires retraining</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1">
                  <strong className="text-[11px] text-indigo-300 block">{tracksResult.recommendedTrack}</strong>
                  <p className="text-[10px] text-slate-400 leading-normal">{tracksResult.trackExplanation}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('feasibility')}
                  className="btn btn-secondary text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={handleResetWizard}
                >
                  Reset Wizard
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Real-time Adjudication Dashboard */}
        <div className="lg:col-span-4 space-y-5 h-fit sticky top-6">
          
          {/* Adjudication Analysis Panel */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Adjudication Analysis Dashboard</span>
              <h3 className="text-xs font-bold text-slate-250">Statutory Entitlement Assessment</h3>
            </div>

            {/* Visual Split Indicators */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className={`p-2 rounded-lg border text-center ${
                adj.visualSplit.eligibleToApply 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/5 border-red-500/20 text-red-400'
              }`}>
                <span className="text-[8px] font-bold uppercase tracking-wider block">Eligibility to Apply</span>
                <span className="text-xs font-bold">{adj.visualSplit.eligibleToApply ? 'Eligible' : 'Ineligible'}</span>
              </div>
              <div className={`p-2 rounded-lg border text-center ${
                adj.visualSplit.entitledToServices 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
              }`}>
                <span className="text-[8px] font-bold uppercase tracking-wider block">Entitlement to Services</span>
                <span className="text-xs font-bold">{adj.visualSplit.entitledToServices ? 'Likely Entitled' : 'Evidence Needed'}</span>
              </div>
            </div>

            {/* Pathway Status Card */}
            <div className={`p-4 border rounded-xl bg-slate-950/40 ${
              adj.pathCode.startsWith('LIKELY') 
                ? 'border-emerald-500/30' 
                : adj.pathCode === 'STATUTORY_BAR_ACTIVE'
                ? 'border-red-500/30'
                : 'border-amber-500/30'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {adj.pathCode.startsWith('LIKELY') ? (
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                ) : adj.pathCode === 'STATUTORY_BAR_ACTIVE' ? (
                  <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className={`text-[11px] font-bold block ${
                    adj.pathCode.startsWith('LIKELY') ? 'text-emerald-400' : adj.pathCode === 'STATUTORY_BAR_ACTIVE' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {adj.pathTitle}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 block mt-0.5">Controlling Law: {adj.pathLaw}</span>
                </div>
              </div>

              {/* Facts Assessment */}
              <div className="border-t border-slate-850 pt-2.5 mt-2.5 space-y-2.5">
                {adj.factsSupport.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Supporting Facts:</span>
                    <ul className="list-none space-y-1 pl-0">
                      {adj.factsSupport.map((f, idx) => (
                        <li key={idx} className="text-[10px] text-slate-350 leading-relaxed flex items-start gap-1">
                          <span className="text-emerald-500 font-bold shrink-0">&bull;</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {adj.factsHurt.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">Adverse Facts:</span>
                    <ul className="list-none space-y-1 pl-0">
                      {adj.factsHurt.map((f, idx) => (
                        <li key={idx} className="text-[10px] text-slate-350 leading-relaxed flex items-start gap-1">
                          <span className="text-red-500 font-bold shrink-0">&bull;</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Evidence Index */}
              <div className="border-t border-slate-850 pt-2.5 mt-2.5 space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-mono text-slate-400">Evidence Index:</span>
                  <span className={`font-bold ${evidenceRating.color}`}>{adj.evidenceScore} / 100</span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-855 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${evidenceRating.progressColor}`}
                    style={{ width: `${adj.evidenceScore}%` }}
                  />
                </div>
                <span className="text-[8px] text-slate-500 block font-semibold text-center uppercase tracking-wider">{evidenceRating.label}</span>
                
                {adj.evidenceMissing.length > 0 && (
                  <div className="pt-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Missing Verification Evidence:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {adj.evidenceMissing.map((m, idx) => (
                        <span key={idx} className="text-[8.5px] bg-slate-950/60 border border-slate-850 px-1.5 py-0.5 rounded text-slate-400">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Errors */}
              {adj.activeErrors.length > 0 && (
                <div className="border-t border-slate-850 pt-2.5 mt-2.5 space-y-2">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">Procedural VA Errors Detected:</span>
                  {adj.activeErrors.map((err, idx) => (
                    <div key={idx} className="p-2 bg-amber-950/10 border border-amber-900/30 rounded text-[9.5px] space-y-1">
                      <strong className="text-amber-400 block">{err.error}</strong>
                      <p className="text-slate-400 leading-normal">{err.whyItMatters}</p>
                      <div className="text-slate-450 leading-relaxed font-semibold">
                        Corrective action: {err.bestMove}
                      </div>
                      <span className="text-[8px] font-mono text-amber-500/80 block">Authority: {err.authorities.join(', ')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Action Plan */}
              <div className="border-t border-slate-850 pt-2.5 mt-2.5 space-y-1.5">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Recommended Strategy:</span>
                <ul className="list-none space-y-1 pl-0">
                  {adj.nextSteps.map((step, idx) => (
                    <li key={idx} className="text-[10px] text-slate-350 leading-relaxed flex items-start gap-1">
                      <span className="text-indigo-400 font-bold shrink-0">&rarr;</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Review-Lane Guardrails */}
              <div className="border-t border-slate-850 pt-2.5 mt-2.5 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Review-Lane Warning:</span>
                <p className="text-[9.5px] text-slate-400 leading-relaxed bg-slate-900/60 p-2 border border-slate-850 rounded">
                  {adj.reviewLaneWarning}
                </p>
              </div>

              {/* Authorities Badge references */}
              {adj.authorities.length > 0 && (
                <div className="border-t border-slate-850 pt-2.5 mt-2.5 space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Legal Authorities:</span>
                  <div className="flex flex-wrap gap-1">
                    {adj.authorities.map((cite, idx) => {
                      const cleanId = cite.toLowerCase().replace(/[\s.§()]/g, '-').replace(/--/g, '-');
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedSection({ 
                              type: cleanId.includes('cfr') ? 'cfr' : 'usc', 
                              id: cleanId.includes('cfr') ? '38-cfr-21-35' : '38-usc-3102' 
                            });
                            setActiveView('authority_library');
                          }}
                          className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded hover:bg-indigo-500/20 transition cursor-pointer"
                        >
                          {cite}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1 text-slate-450">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Information Purpose Only</span>
              <p className="text-[9.5px] leading-relaxed">
                This prescreener acts as an educational and planning aid for veterans. Actual determinations are made solely by VA counselors using clinical judgment under Title 38. The outcome does not guarantee approval.
              </p>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

export default EntitlementWizardView;

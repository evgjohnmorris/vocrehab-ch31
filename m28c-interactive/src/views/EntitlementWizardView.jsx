import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Info, CheckCircle, HelpCircle, 
  ChevronRight, ShieldAlert, Printer, 
  FileText, Check, Calendar
} from 'lucide-react';
import { renderTemplate } from '../utils/templateRenderer.js';

// JSON Templates
import extendedEvaluationRequestTpl from '../data/templates/extended-evaluation-request.json';
import sehDeterminationRequestTpl from '../data/templates/seh-determination-request.json';

const CASE_STAGES = [
  { id: 'not_applied', label: 'Not Applied' },
  { id: 'evaluation', label: 'Evaluation & Planning Phase' },
  { id: 'entitled_no_ipe', label: 'Entitled, No IPE yet' },
  { id: 'ipe_signed', label: 'IPE Signed & Active' },
  { id: 'in_school', label: 'In School / Active Training' },
  { id: 'employment_services', label: 'Employment Services Phase' },
  { id: 'interrupted', label: 'Interrupted Status' },
  { id: 'discontinued', label: 'Discontinued / Closed Case' }
];

const DISCHARGE_OPTIONS = [
  { id: 'honorable', label: 'Honorable' },
  { id: 'general', label: 'General Under Honorable Conditions' },
  { id: 'oth', label: 'Other Than Honorable (OTH)' },
  { id: 'bad_conduct', label: 'Bad Conduct' },
  { id: 'dishonorable', label: 'Dishonorable' }
];

const EH_BARRIERS = [
  { id: 'lifting', label: 'Lifting restrictions (e.g. unable to lift > 20 lbs)', category: 'Physical' },
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
  { id: 'oth_discharge', label: 'Other Than Honorable (OTH) discharge requiring character review', citation: '38 C.F.R. § 21.44' },
  { id: 'expired_12year', label: 'Basic 12-year period of eligibility has expired (delimiting date passed)', citation: '38 C.F.R. § 21.44' },
  { id: 'exhausted_48month', label: 'Entitlement limit has been reached or is near (48-month point)', citation: '38 C.F.R. § 21.78' },
  { id: 'ten_percent', label: 'Disability rating is exactly 10% (requires SEH to establish entitlement)', citation: '38 C.F.R. § 21.52' },
  { id: 'severe_neuro', label: 'Severe neuropsychiatric or physical limitations that severely restrict career options', citation: '38 C.F.R. § 21.52' }
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

  // Checklist States
  const [checkedBarriers, setCheckedBarriers] = useState({});
  const [manualSehIndicators, setManualSehIndicators] = useState({});
  const [checkedFeasibility, setCheckedFeasibility] = useState({});
  const [checkedEvidence, setCheckedEvidence] = useState({});

  // Letter Options
  const [activeLetterTab, setActiveLetterTab] = useState('remarks');
  const [copiedText, setCopiedText] = useState(false);
  const [userName, setUserName] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [programName, setProgramName] = useState('');

  // Compute Delimiting Date
  const getDelimitingStatus = () => {
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
  };

  const delimitingStatus = getDelimitingStatus();

  // Derive active SEH indicators at render-time (removes useEffect setState side-effects)
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

  // Evaluated Entitlement Assessment (Uses softened terminology)
  const assessLikelihood = () => {
    // Dishonorable character of discharge is a statutory bar under 38 U.S.C. § 5303
    if (dischargeStatus === 'dishonorable' && !isActiveDuty) {
      return {
        likelyEligible: false,
        likelyEntitled: false,
        status: 'Unlikely to Meet Criteria',
        reason: 'Character of discharge is listed as Dishonorable, which represents a statutory bar under 38 U.S.C. § 5303.',
        plainReason: 'Federal law does not permit the VA to grant VR&E benefits to individuals with a dishonorable discharge characterization.',
        guidance: 'You may apply to the VA Discharge Review Board (DRB) or Board for Correction of Military Records (BCMR) for a character of discharge upgrade.',
        cfr: '38 C.F.R. § 21.42'
      };
    }

    // Active duty / IDES exception
    if (isActiveDuty) {
      return {
        likelyEligible: true,
        likelyEntitled: true,
        status: 'Likely Criteria Satisfied (IDES Referral Pathway)',
        reason: 'Active-duty service members undergoing the Integrated Disability Evaluation System (IDES) or holding a memorandum rating of 20% or more satisfy basic eligibility criteria under 38 C.F.R. § 21.40.',
        plainReason: 'As an active-duty service member in the IDES process, you are fast-tracked for eligibility without needing a finalized DD-214 or VA rating decision.',
        guidance: 'Ensure your IDES coordinator forwards your packet to the local VR&E office to schedule your initial evaluation.',
        cfr: '38 C.F.R. § 21.40'
      };
    }

    // 0% rating
    if (rating === 0) {
      return {
        likelyEligible: false,
        likelyEntitled: false,
        status: 'Intake Threshold Not Met',
        reason: 'A service-connected disability rating of at least 10% is required to apply for Chapter 31 VR&E under 38 U.S.C. § 3102.',
        plainReason: 'To apply, you must first receive a service-connected disability rating of 10% or higher from the VA.',
        guidance: 'If you have rated conditions that have worsened, consider filing for an increase or new service-connections on VA.gov.',
        cfr: '38 C.F.R. § 21.40'
      };
    }

    const barrierCount = Object.values(checkedBarriers).filter(Boolean).length;
    const hasBarriers = barrierCount > 0;

    // 10% rating requires an SEH
    if (rating === 10) {
      const hasSehIndicator = Object.values(activeSehIndicators).filter(Boolean).length > 0;
      if (hasSehIndicator && hasBarriers) {
        return {
          likelyEligible: true,
          likelyEntitled: true,
          status: 'Likely Entitled (10% Rating + Serious Employment Handicap)',
          reason: 'Veterans with a 10% rating satisfy entitlement criteria when a Serious Employment Handicap (SEH) is established under 38 C.F.R. § 21.52.',
          plainReason: 'Even with a 10% rating, you are likely entitled to services because you have documented significant barriers to finding or keeping work (SEH).',
          guidance: 'Prepare to explain to your counselor how your service-connected conditions severely restrict your employment options.',
          cfr: '38 C.F.R. § 21.52'
        };
      } else {
        return {
          likelyEligible: true,
          likelyEntitled: false,
          status: 'Likely Eligible, but Entitlement Criteria Unmet',
          reason: 'Basic eligibility to apply is satisfied at 10%, but entitlement requires establishing a Serious Employment Handicap (SEH) under 38 C.F.R. § 21.52.',
          plainReason: 'You meet the baseline rules to apply, but the VA cannot provide services unless you establish that your disabilities create severe work barriers.',
          guidance: 'Focus on gathering medical statements or occupational evidence that details the severity of your employment limitations.',
          cfr: '38 C.F.R. § 21.52'
        };
      }
    }

    // 20% or higher rating requires an EH
    if (rating >= 20) {
      if (hasBarriers) {
        return {
          likelyEligible: true,
          likelyEntitled: true,
          status: 'Likely Entitled (20%+ Rating + Employment Handicap)',
          reason: 'A rating of 20% or higher satisfies entitlement criteria when an Employment Handicap (EH) is established under 38 C.F.R. § 21.51.',
          plainReason: 'With a 20% or higher rating, you are likely entitled because your disabilities create clear barriers to preparing for, getting, or keeping a job.',
          guidance: 'You are ready to proceed with your application. Submit VA Form 28-1900 to initiate your intake.',
          cfr: '38 C.F.R. § 21.51'
        };
      } else {
        return {
          likelyEligible: true,
          likelyEntitled: false,
          status: 'Likely Eligible, but Entitlement Criteria Unmet',
          reason: 'Basic eligibility to apply is satisfied, but entitlement requires finding an Employment Handicap (EH) under 38 C.F.R. § 21.51.',
          plainReason: 'You can apply, but you must show that your disability creates a handicap in getting or keeping suitable employment.',
          guidance: 'Identify physical or cognitive tasks in your past or current job that aggravate your service-connected conditions.',
          cfr: '38 C.F.R. § 21.51'
        };
      }
    }

    return {
      likelyEligible: false,
      likelyEntitled: false,
      status: 'Undetermined Profile',
      reason: 'Please complete the intake parameters to assess your potential entitlement path.',
      plainReason: 'Complete the intake details on the screen to view your personalized assessment.',
      guidance: 'Select your disability rating, discharge character, and active barriers.',
      cfr: '38 C.F.R. § 21.40'
    };
  };

  const assessment = assessLikelihood();

  // Feasibility Check
  const getFeasibilityStatus = () => {
    const checkedCount = Object.values(checkedFeasibility).filter(Boolean).length;
    if (checkedCount > 0) {
      return {
        status: 'Uncertain Feasibility / Extended Evaluation Indicated',
        reason: 'One or more indicators suggest that achieving a vocational goal is currently uncertain. Under 38 C.F.R. § 21.74, you should request an Extended Evaluation rather than accepting a feasibility denial.',
        action: 'Recommending request for an Extended Evaluation (up to 12 months) to test capacity with support services.'
      };
    }
    return {
      status: 'Goal Achievement Likely Feasible',
      reason: 'No critical medical or rehabilitation instability indicators are checked. Your profile suggests you can successfully complete vocational training.',
      action: 'Suggest proceeding directly with plan development (IWRP) once entitlement is approved.'
    };
  };

  const feasibilityStatus = getFeasibilityStatus();

  // Evidence Strength Meter Calculation
  const evidenceScore = EVIDENCE_ITEMS.reduce((acc, item) => {
    return checkedEvidence[item.id] ? acc + item.weight : acc;
  }, 0);

  const getEvidenceRating = (score) => {
    if (score >= 75) return { label: 'Optimized Evidence Base', color: 'text-emerald-400', progressColor: 'bg-emerald-500' };
    if (score >= 45) return { label: 'Moderate Evidence Base', color: 'text-amber-400', progressColor: 'bg-amber-500' };
    return { label: 'Weak Evidence Base', color: 'text-red-400', progressColor: 'bg-red-500' };
  };

  const evidenceRating = getEvidenceRating(evidenceScore);

  // Remarks Narratives (Section IV of VA Form 28-1900)
  const compileRemarksText = () => {
    const activeBarriersText = EH_BARRIERS
      .filter(b => checkedBarriers[b.id])
      .map(b => b.label)
      .join(', ');

    let text = `I am formally applying for Chapter 31 Veteran Readiness and Employment (VR&E) services to overcome my disability employment barriers.`;

    if (isActiveDuty) {
      text += ` As an active-duty service member in the Integrated Disability Evaluation System (IDES) pathway, I request fast-track evaluation under 38 C.F.R. § 21.40.`;
    }

    if (activeBarriersText) {
      text += ` My service-connected disabilities create specific occupational obstacles including: ${activeBarriersText}. These barriers interfere with my ability to obtain or maintain suitable, injury-free employment.`;
    } else {
      text += ` My service-connected conditions interfere with my ability to perform standard duties, and I request vocational evaluation to identify suitable, medically compatible career options.`;
    }

    if (delimitingStatus?.isExpired) {
      text += ` Although my basic 12-year window has expired, I request an extension of my eligibility period based on a Serious Employment Handicap (SEH) under 38 C.F.R. § 21.44.`;
    }

    text += ` I request a collaborative evaluation to formulate a rehabilitation plan.`;
    return text;
  };

  // Compile Letters using renderTemplate
  const compileExtendedEvalLetter = () => {
    const variables = {
      date: new Date().toLocaleDateString(),
      'Your Name': userName || '[VETERAN NAME]',
      'Your Claim Number': claimNumber || '[CLAIM NUMBER]'
    };
    return renderTemplate(extendedEvaluationRequestTpl.body, variables);
  };

  const compileSehLetter = () => {
    const barrierList = EH_BARRIERS
      .filter(b => checkedBarriers[b.id])
      .map(b => `* ${b.label}`)
      .join('\n');

    const indicatorList = SEH_INDICATORS
      .filter(ind => activeSehIndicators[ind.id])
      .map(ind => `* ${ind.label} (${ind.citation})`)
      .join('\n');

    const variables = {
      date: new Date().toLocaleDateString(),
      'Your Name': userName || '[VETERAN NAME]',
      'Your Claim Number': claimNumber || '[CLAIM NUMBER]',
      employmentBarriers: barrierList || '* General occupational barriers caused by rated disabilities.',
      sehJustification: indicatorList || '* Statutorily indicated Serious Employment Handicap circumstances.'
    };
    return renderTemplate(sehDeterminationRequestTpl.body, variables);
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
            <h1 className="text-lg font-bold text-slate-100">Eligibility, Entitlement & Employment Handicap Builder</h1>
            <p className="text-[11px] text-slate-400">Step-by-step statutory screening and claim package compilation tool for Chapter 31 VR&E benefits.</p>
          </div>
        </div>

        {/* Plain Language Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2 border border-slate-800 rounded-lg shrink-0">
          <HelpCircle size={14} className="text-cyan-400" />
          <span className="text-[10px] font-semibold text-slate-350">Plain Language:</span>
          <button
            type="button"
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

      {/* Tabs */}
      <div className="tabs-header mb-6">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          1. Profile & Intake
        </button>
        <button 
          className={`tab-btn ${activeTab === 'eh_builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('eh_builder')}
        >
          2. Occupational Barriers (EH)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'seh_builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('seh_builder')}
        >
          3. SEH Extension Indicators
        </button>
        <button 
          className={`tab-btn ${activeTab === 'feasibility' ? 'active' : ''}`}
          onClick={() => setActiveTab('feasibility')}
        >
          4. Feasibility Screening
        </button>
        <button 
          className={`tab-btn ${activeTab === 'evidence_letters' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence_letters')}
        >
          5. Evidence & Letter Builder
        </button>
      </div>

      {/* Content Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Active Panel Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: PROFILE & INTAKE */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Intake Parameters</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Disability Rating from VA</label>
                  <select 
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
                    checked={isActiveDuty}
                    onChange={(e) => setIsActiveDuty(e.target.checked)}
                    className="mt-1 accent-indigo-500 cursor-pointer"
                    aria-label="Active duty or IDES path toggle"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Active-duty / IDES (Integrated Disability Evaluation System) Pathway</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5 leading-relaxed">
                      Check if you are currently on active-duty undergoing IDES transition. Active-duty service members with a memorandum rating of 20% or more bypass standard veteran intake rules under 38 C.F.R. § 21.40.
                    </span>
                  </div>
                </label>
              </div>

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

              <div className="border-t border-slate-850 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-400" />
                    <span>12-Year Delimiting Date Calculator</span>
                  </h3>
                  <span className="text-[9px] font-mono text-slate-550 font-bold px-1.5 py-0.5 bg-slate-950 rounded">38 U.S.C. § 3103</span>
                </div>
                
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  VR&E basic eligibility is generally open for 12 years from discharge or first rating notification, whichever is later. Exceeding this requires an SEH finding.
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
                            <strong>Note:</strong> Under 38 C.F.R. § 21.44, you require an assessed Serious Employment Handicap (SEH) to bypass this expiration and access services.
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
                  onClick={() => setActiveTab('eh_builder')}
                  className="btn btn-primary inline-flex items-center gap-1.5"
                >
                  <span>Continue to Barriers</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OCCUPATIONAL BARRIERS (EH) */}
          {activeTab === 'eh_builder' && (
            <div className="space-y-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Employment Handicap Assessment</span>
                <h2 className="text-xs font-bold text-slate-200 mt-0.5">Factual Occupational Barriers Checklist</h2>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                  An Employment Handicap requires a vocational impairment caused in substantial part by your service-connected disabilities. Select all active restrictions that interfere with your suitability for standard employment.
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
                  onClick={() => setActiveTab('seh_builder')}
                  className="btn btn-primary inline-flex items-center gap-1.5"
                >
                  <span>Continue to SEH</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SEH EXTENSION INDICATORS */}
          {activeTab === 'seh_builder' && (
            <div className="space-y-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Serious Employment Handicap Assessment</span>
                <h2 className="text-xs font-bold text-slate-200 mt-0.5">Serious Employment Handicap (SEH) Checklist</h2>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                  An SEH requires finding a significant impairment of employability, which unlocks extensions beyond 12 years (basic eligibility) or 48 months (program duration), and is mandatory for 10% ratings. Select indicators present in your case.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {SEH_INDICATORS.map(ind => {
                  const isAuto = ['ten_percent', 'oth_discharge', 'expired_12year'].includes(ind.id);
                  const isChecked = !!activeSehIndicators[ind.id];
                  return (
                    <div
                      key={ind.id}
                      onClick={() => toggleSehIndicator(ind.id)}
                      className={`border rounded-lg p-3 select-none flex items-start gap-3 transition ${
                        isAuto ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isChecked
                          ? 'bg-amber-500/5 border-amber-800/80'
                          : 'bg-slate-950/20 border-slate-850 hover:border-slate-800'
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
                          <span className="text-[11px] text-slate-350 leading-normal font-semibold">{ind.label}</span>
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

          {/* TAB 4: FEASIBILITY SCREENING */}
          {activeTab === 'feasibility' && (
            <div className="space-y-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Vocational Feasibility Pre-screener</span>
                <h2 className="text-xs font-bold text-slate-200 mt-0.5">Uncertain Feasibility & Extended Evaluation Checklist</h2>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                  Under 38 C.F.R. § 21.57 / § 21.74, if the feasibility of achieving a vocational goal is uncertain due to health, treatment, or capacity, the counselor should authorize an Extended Evaluation plan (Track 5) to test capacity with support services, rather than denying entry. Check if any apply:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {FEASIBILITY_CHECKLIST.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleFeasibility(item.id)}
                    className={`border rounded-lg p-3.5 cursor-pointer select-none flex items-start gap-3 transition ${
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

              <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl space-y-2 mt-3">
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">Diagnostic Result</span>
                <div className="space-y-1">
                  <strong className="text-xs text-slate-200 block">{feasibilityStatus.status}</strong>
                  <p className="text-[10.5px] text-slate-450 leading-relaxed">{feasibilityStatus.reason}</p>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-850 text-[10.5px] text-red-300/90 leading-relaxed rounded mt-1">
                  <strong>Recommended Action:</strong> {feasibilityStatus.action}
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

          {/* TAB 5: EVIDENCE & LETTER BUILDER */}
          {activeTab === 'evidence_letters' && (
            <div className="space-y-5 bg-slate-900/30 border border-slate-800 rounded-xl p-5">
              
              {/* Evidence Strength Checklist */}
              <div className="space-y-3">
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
                    className={`tab-btn text-[10px] ${activeLetterTab === 'prep_sheet' ? 'active' : ''}`}
                    onClick={() => setActiveLetterTab('prep_sheet')}
                  >
                    2. VRC Orientation Prep Sheet
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
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                      {activeLetterTab === 'remarks' && 'VA Form 28-1900 Section IV: Remarks'}
                      {activeLetterTab === 'prep_sheet' && 'Personal Counseling Strategy Prep Sheet'}
                      {activeLetterTab === 'seh_letter' && 'Formal Written Request (38 C.F.R. § 21.52)'}
                      {activeLetterTab === 'ext_eval' && 'Formal Written Request (38 C.F.R. § 21.74)'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = 
                            activeLetterTab === 'remarks' ? compileRemarksText() :
                            activeLetterTab === 'prep_sheet' ? `OCCUPATIONAL PREP SHEET\n\n${compileRemarksText()}` :
                            activeLetterTab === 'seh_letter' ? compileSehLetter() :
                            compileExtendedEvalLetter();
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
                            activeLetterTab === 'prep_sheet' ? 'Interview Prep Sheet' :
                            activeLetterTab === 'seh_letter' ? 'SEH Request Letter' :
                            'Extended Evaluation Request';
                          const text = 
                            activeLetterTab === 'remarks' ? compileRemarksText() :
                            activeLetterTab === 'prep_sheet' ? `OCCUPATIONAL PREP SHEET\n\n${compileRemarksText()}` :
                            activeLetterTab === 'seh_letter' ? compileSehLetter() :
                            compileExtendedEvalLetter();
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
                      activeLetterTab === 'prep_sheet' ? `OCCUPATIONAL PREP SHEET\n\n${compileRemarksText()}` :
                      activeLetterTab === 'seh_letter' ? compileSehLetter() :
                      compileExtendedEvalLetter()
                    }
                    aria-label="Generated letter text preview"
                  />
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
                  className="btn btn-primary text-xs"
                  onClick={() => {
                    setRating(20);
                    setDischargeStatus('honorable');
                    setIsActiveDuty(false);
                    setCaseStage('evaluation');
                    setDischargeDate('');
                    setRatingDecisionDate('');
                    setCheckedBarriers({});
                    setManualSehIndicators({});
                    setCheckedFeasibility({});
                    setCheckedEvidence({});
                    setUserName('');
                    setClaimNumber('');
                    setProgramName('');
                    setActiveTab('profile');
                  }}
                >
                  Start Over
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Real-time Likelihood and Logic Auditor */}
        <div className="lg:col-span-4 space-y-5 h-fit">
          
          {/* Entitlement Rating Panel */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Entitlement Probability</span>
              <h3 className="text-xs font-bold text-slate-250">Softened Logic Auditor</h3>
            </div>

            <div className={`p-4 border rounded-xl bg-slate-950/40 ${assessment.likelyEntitled ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
              <div className="flex items-center gap-1.5 mb-2">
                {assessment.likelyEntitled ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <ShieldAlert size={16} className="text-red-400" />
                )}
                <span className={`text-[11px] font-bold ${assessment.likelyEntitled ? 'text-emerald-400' : 'text-red-400'}`}>
                  {assessment.status}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-350 leading-relaxed mb-3">
                {plainLanguageMode ? assessment.plainReason : assessment.reason}
              </p>
              
              <div className="bg-slate-900/50 p-2.5 border border-slate-850 rounded text-[9.5px] text-slate-400">
                <strong className="text-indigo-400 block mb-0.5">Recommended Actions:</strong>
                {assessment.guidance}
              </div>

              {assessment.cfr && (
                <button
                  type="button"
                  onClick={() => {
                    const cleanId = assessment.cfr.toLowerCase().replace(/[\s.§()]/g, '-').replace(/--/g, '-');
                    setSelectedSection({ 
                      type: cleanId.includes('cfr') ? 'cfr' : 'usc', 
                      id: cleanId.includes('cfr') ? '38-cfr-21-35' : '38-usc-3102' 
                    });
                    setActiveView('authority_library');
                  }}
                  className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 font-bold block mt-3 cursor-pointer text-left"
                >
                  Source: {assessment.cfr} &rarr;
                </button>
              )}
            </div>

            {/* Evidence Strength Meter */}
            <div className="space-y-2 border-t border-slate-850 pt-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-mono text-slate-400">Evidence index:</span>
                <span className={`font-bold ${evidenceRating.color}`}>{evidenceScore} / 100</span>
              </div>
              <div className="w-full bg-slate-950 border border-slate-855 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${evidenceRating.progressColor}`}
                  style={{ width: `${evidenceScore}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500 block font-semibold text-center">{evidenceRating.label}</span>
            </div>
          </div>

          {/* VA Error Spotter (Counselor Level Common Violations) */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3.5">
            <div>
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">Intake Error Spotter</span>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">VA Procedural Mistakes</h4>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-1.5">
                <strong className="text-[10.5px] text-red-400 block font-semibold">Error: "You only have a 10% rating, so you don\'t qualify."</strong>
                <p className="text-[10px] text-slate-400 leading-normal">
                  VRCs occasionally tell 10% rated claimants they are barred from Chapter 31. Under <strong>38 C.F.R. § 21.40</strong>, a 10% rating is eligible to apply, requiring an SEH determination for entitlement.
                </p>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-1.5">
                <strong className="text-[10.5px] text-red-400 block font-semibold">Error: "Your 12-year basic period is expired, you are barred."</strong>
                <p className="text-[10px] text-slate-400 leading-normal">
                  An expired delimiting date is not a bar. Under <strong>38 C.F.R. § 21.44</strong>, a finding of a Serious Employment Handicap (SEH) overrides the 12-year window.
                </p>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-1.5">
                <strong className="text-[10.5px] text-red-400 block font-semibold">Error: "You have used 48 months of educational benefits, you cannot get more."</strong>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Under <strong>38 C.F.R. § 21.78</strong>, a VRC has the authority to authorize training beyond the 48-month cap if the veteran is found to have an SEH.
                </p>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-1.5">
                <strong className="text-[10.5px] text-red-400 block font-semibold">Error: "A college degree is too complex/long for your health, so we are closing your case."</strong>
                <p className="text-[10px] text-slate-400 leading-normal">
                  If feasibility is uncertain, a VRC should not deny the case outright. <strong>38 C.F.R. § 21.74</strong> requires initiating an Extended Evaluation (up to 12 months) to test feasibility with support.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

export default EntitlementWizardView;

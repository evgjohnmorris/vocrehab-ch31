import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, BookOpen, Shield, 
  AlertOctagon, Scale, Award, Compass, 
  AlertTriangle, Clock, 
  Briefcase, Mail, Check, Copy, ArrowLeft
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

const WORKFLOWS = [
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

function HomeDashboardView({ 
  reduceMotion, 
  setActiveView, 
  setSelectedSection,
  bookmarksCount,
  userMode,
  currentCaseStage,
  setCurrentCaseStage
}) {
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [wizardStep, setWizardStep] = useState(0); // 0: Case Stage, 1: Collect Facts, 2: Report / Letter
  const [tempStage, setTempStage] = useState(currentCaseStage ? currentCaseStage.replace(/_/g, ' ') : CASE_STAGES[0]);
  const [formFacts, setFormFacts] = useState({});
  const [copiedLetter, setCopiedLetter] = useState(false);

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
          text: 'Keep communications in writing. Never accept verbal counselor denials. If your counselor refuses a laptop or training goal, request that they provide their decision and reasons in writing on VA Form 20-0998.',
          badge: 'VETERAN SELF-ADVOCACY'
        };
    }
  };

  const modeAdvice = getModeAdvice();

  const handleStartWorkflow = (wf) => {
    setActiveWorkflow(wf);
    setWizardStep(0);
    setFormFacts({});
    setCopiedLetter(false);
  };

  const handleNextStep = () => {
    if (wizardStep === 0) {
      // Sync temp stage back to App state if needed
      const normalizedStage = tempStage.toLowerCase().replace(/, /g, '_').replace(/ \/ /g, '_').replace(/ /g, '_');
      setCurrentCaseStage(normalizedStage);
    }
    setWizardStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setWizardStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveWorkflow(null);
    setWizardStep(0);
    setFormFacts({});
    setCopiedLetter(false);
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
              {WORKFLOWS.map((wf) => (
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

                <div className="space-y-4 max-w-lg">
                  {activeWorkflow.steps[0].fields.map((field) => (
                    <div key={field.name} className="space-y-1.5">
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

            {/* STEP 3: SOLUTION REPORT & LETTER DRAFT */}
            {wizardStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left col: Errors and Citations */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Identified VA Errors</h3>
                    <div className="space-y-2.5">
                      {activeWorkflow.errors.map((err, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start p-3 bg-red-950/20 border border-red-900/35 rounded-lg text-[11px] text-red-300 leading-relaxed">
                          <AlertOctagon size={14} className="shrink-0 mt-0.5" />
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Governing Legal Citations</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeWorkflow.citations.map((cite) => {
                        let display = cite.toUpperCase();
                        if (cite.startsWith('38-usc')) {
                          display = `38 U.S.C. § ${cite.split('-').pop()}`;
                        } else if (cite.startsWith('38-cfr')) {
                          const section = cite.replace('38-cfr-21-', '21.').replace('38-cfr-', '').replace('-', '.');
                          display = `38 C.F.R. § ${section}`;
                        }
                        return (
                          <button
                            key={cite}
                            onClick={() => handleCitationClick(cite)}
                            className="text-[10px] bg-slate-950 hover:bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-emerald-400 font-semibold px-2.5 py-1.5 rounded inline-flex items-center gap-1 transition"
                          >
                            <Scale size={11} />
                            <span>{display}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Next Action</span>
                    <p className="text-slate-300 leading-relaxed font-bold">
                      {activeWorkflow.workflowId === 'counselor-delay' ? 'Submit this letter to the VR&E Officer at your local VA Regional Office.' : 'Submit this formal written request via the eVA portal or via certified mail, and demand a written decision notice (VA Form 20-0998).'}
                    </p>
                  </div>
                </div>

                {/* Right col: Letter Generation */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Custom Action Letter Draft</span>
                    <button
                      onClick={() => handleCopyLetter(getCompiledLetter(activeWorkflow, formFacts, tempStage))}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-semibold transition flex items-center gap-1"
                    >
                      {copiedLetter ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedLetter ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <textarea
                    readOnly
                    className="w-full h-80 bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-[11px] font-mono text-slate-300 leading-relaxed select-all focus:outline-none focus:border-slate-700"
                    value={getCompiledLetter(activeWorkflow, formFacts, tempStage)}
                  />

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

              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default HomeDashboardView;

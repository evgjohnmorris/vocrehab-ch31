import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, BookOpen, Shield, CheckSquare, 
  CheckCircle2, RefreshCw, AlertOctagon, Scale, Award, Compass, 
  Calculator, FileEdit, Users, HelpCircle, AlertTriangle, Clock, Briefcase
} from 'lucide-react';

const CASE_STAGES_DATA = [
  {
    id: 'not_applied',
    label: 'Not Applied',
    title: 'Not Applied Yet',
    description: 'You are researching VR&E (Chapter 31) and want to know if you qualify and how to apply.',
    nextAction: 'File VA Form 28-1900 on VA.gov to establish eligibility.',
    actionRoute: 'wizard',
    checklist: [
      'Confirm compensable VA disability rating of 10% or higher',
      'Verify discharge characterization is other than dishonorable',
      'Check basic 12-year eligibility period'
    ]
  },
  {
    id: 'waiting_appointment',
    label: 'Applied, Waiting Appointment',
    title: 'Applied & Waiting for VRC Appointment',
    description: 'You submitted VAF 28-1900 and are waiting for your initial evaluation call.',
    nextAction: 'Prepare employment handicap statements and collect medical records.',
    actionRoute: 'wizard',
    checklist: [
      'Document active physical/mental limitations at work',
      'Gather recent treatment reports showing job barriers',
      'Draft vocational goals compatible with limitations'
    ]
  },
  {
    id: 'evaluation',
    label: 'Evaluation Phase',
    title: 'Entitlement Evaluation',
    description: 'Your VRC is determining if you have an Employment Handicap (EH) or Serious Employment Handicap (SEH).',
    nextAction: 'Focus on explaining how disability prevents you from securing suitable employment.',
    actionRoute: 'wizard',
    checklist: [
      'Review EH definition under 38 CFR § 21.51',
      'Prepare to show past job attempts that aggravated conditions',
      'Organize educational transcripts'
    ]
  },
  {
    id: 'entitled_no_ipe',
    label: 'Entitled, No IPE',
    title: 'Entitlement Approved, Plan Pending',
    description: 'You are entitled to services, but your Individualized Written Rehabilitation Plan (IWRP) is not signed.',
    nextAction: 'Perform O*NET labor market research and school cost evaluations.',
    actionRoute: 'planning',
    checklist: [
      'Identify target SOC codes and employment projections',
      'Ensure target program is approved in WebLAMS',
      'Document required supplies, computer, or tools'
    ]
  },
  {
    id: 'ipe_signed',
    label: 'IPE Signed',
    title: 'IWRP Plan Signed & Active',
    description: 'Your rehabilitation plan is signed. Services are formally authorized.',
    nextAction: 'Ensure school certifying official receives VAF 28-1905 / tungsten auth.',
    actionRoute: 'calculator',
    checklist: [
      'Verify term start date auth is active',
      'Review supplies listing in signed plan objectives',
      'Compare Chapter 31 standard rates vs Post-9/11 MHA'
    ]
  },
  {
    id: 'in_training',
    label: 'In School / Training',
    title: 'Active Education or Vocational Training',
    description: 'You are actively attending classes, OJT, or vocational courses.',
    nextAction: 'Submit supply lists early and track monthly subsistence payments.',
    actionRoute: 'calculator',
    checklist: [
      'Coordinate with School Certifying Official (SCO) for enrollment certs',
      'Log monthly attendance hours if OJT or coop training',
      'Submit tech package requests at least 30 days prior to term'
    ]
  },
  {
    id: 'employment_services',
    label: 'Employment Services',
    title: 'Job Search & Placement Track',
    description: 'You completed training and are receiving job search assistance (EES).',
    nextAction: 'Request resume assistance, placement tools, and job interview clothes.',
    actionRoute: 'self_employment',
    checklist: [
      'Submit job logs to VRC to claim Job Search Allowance (up to 2 months)',
      'Confirm employer hiring tax incentives (WOTC)',
      'Request workplace accommodations or assistive technology'
    ]
  },
  {
    id: 'interrupted',
    label: 'Interrupted Status',
    title: 'Case Placed in Interrupted Status',
    description: 'Your plan is temporarily paused due to medical, personal, or administrative reasons.',
    nextAction: 'Gather documentation to resume services or request plan amendment.',
    actionRoute: 'dispute_hub',
    checklist: [
      'Review counselor interruption notice for accuracy',
      'Document medical stability or capability to return',
      'Request counselor conference under M28C guidelines'
    ]
  },
  {
    id: 'discontinued',
    label: 'Discontinued Status',
    title: 'Case Closed / Discontinued',
    description: 'VA closed your case before rehabilitation, claiming lack of cooperation or progress.',
    nextAction: 'File a reentrance request or appeal the case closure within 1 year.',
    actionRoute: 'dispute_hub',
    checklist: [
      'Demand written decision notice (VA Form 20-0998)',
      'Identify notice defects or failure of counselor duty to assist',
      'Build reentrance brief arguing Serious Employment Handicap'
    ]
  },
  {
    id: 'rehabilitated',
    label: 'Rehabilitated',
    title: 'Rehabilitated / Case Completed',
    description: 'VA formally declared you rehabilitated after holding suitable employment for 60+ days.',
    nextAction: 'Keep records of completed training and credentials.',
    checklist: [
      'Ensure final subsistence payments are fully cleared',
      'Retain copies of certification approvals',
      'Note that rehabilitation does not block future VR&E applications if conditions worsen'
    ]
  },
  {
    id: 'independent_living',
    label: 'Independent Living',
    title: 'Independent Living (IL) Track Active',
    description: 'You are receiving services to increase daily living independence in home and community.',
    nextAction: 'Verify adaptive equipment deliveries and home modifications.',
    actionRoute: 'special_programs',
    checklist: [
      'Maintain contact logs for home health evaluations',
      'Ensure required ergonomic or structural mods are active',
      'Identify community integration opportunities'
    ]
  },
  {
    id: 'appeal_pending',
    label: 'Appeal Pending',
    title: 'Appellate Review In Progress',
    description: 'You filed a Higher-Level Review (HLR), Supplemental Claim, or Board Appeal.',
    nextAction: 'Track review deadlines and submit new evidence if in Supplemental lane.',
    actionRoute: 'dispute_hub',
    checklist: [
      'Confirm HLR receipt or Board docket status',
      'Log communications with decision review officer',
      'Keep records of original VAF 20-0998 decision notices'
    ]
  }
];

function HomeDashboardView({ 
  reduceMotion, 
  setActiveView, 
  setSelectedSection,
  privacyMode,
  bookmarksCount,
  userMode,
  currentCaseStage,
  setCurrentCaseStage
}) {
  const activeStageObj = CASE_STAGES_DATA.find(s => s.id === currentCaseStage) || CASE_STAGES_DATA[0];
  const handleRoute = (view, context) => {
    if (context) {
      sessionStorage.setItem('dispute_hub_prefill', context);
      localStorage.setItem('dispute_hub_prefill', context);
      window.dispatchEvent(new CustomEvent('change-dispute-area', { detail: context }));
    }
    setActiveView(view);
  };

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const handleEmergencyClick = (workflowContext, targetView = 'dispute_hub') => {
    sessionStorage.setItem('dispute_hub_prefill', workflowContext);
    localStorage.setItem('dispute_hub_prefill', workflowContext);
    window.dispatchEvent(new CustomEvent('change-dispute-area', { detail: workflowContext }));
    setActiveView(targetView);
  };

  // Plain-language advice adapted to User Modes
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

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 select-text text-slate-100"
    >
      {/* EMERGENCY URGENT STRIP */}
      <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
          <AlertOctagon size={16} />
          <span>Urgent Issue? Select a Case Emergency Pathway</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button 
            onClick={() => handleEmergencyClick('tuition_unpaid')}
            className="px-3 py-1 bg-red-950/60 hover:bg-red-900/40 text-red-300 border border-red-900/40 rounded text-[11px] font-semibold cursor-pointer transition"
          >
            School starts soon
          </button>
          <button 
            onClick={() => handleEmergencyClick('case_closed')}
            className="px-3 py-1 bg-red-950/60 hover:bg-red-900/40 text-red-300 border border-red-900/40 rounded text-[11px] font-semibold cursor-pointer transition"
          >
            Benefits stopped
          </button>
          <button 
            onClick={() => handleEmergencyClick('tuition_unpaid')}
            className="px-3 py-1 bg-red-950/60 hover:bg-red-900/40 text-red-300 border border-red-900/40 rounded text-[11px] font-semibold cursor-pointer transition"
          >
            Tuition/books unpaid
          </button>
          <button 
            onClick={() => handleEmergencyClick('case_closed')}
            className="px-3 py-1 bg-red-950/60 hover:bg-red-900/40 text-red-300 border border-red-900/40 rounded text-[11px] font-semibold cursor-pointer transition"
          >
            Case closed
          </button>
          <button 
            onClick={() => handleEmergencyClick('seh_extension')}
            className="px-3 py-1 bg-red-950/60 hover:bg-red-900/40 text-red-300 border border-red-900/40 rounded text-[11px] font-semibold cursor-pointer transition"
          >
            Deadline approaching
          </button>
          <button 
            onClick={() => handleEmergencyClick('counselor_delay')}
            className="px-3 py-1 bg-red-950/60 hover:bg-red-900/40 text-red-300 border border-red-900/40 rounded text-[11px] font-semibold cursor-pointer transition"
          >
            Counselor not responding
          </button>
        </div>
      </div>

      {/* Main Banner */}
      <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={12} />
            <span>{modeAdvice.badge}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Get Help With Your VR&E Case
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            A self-advocacy console helping Veterans, VSOs, and attorneys build case strategies, track deadlines, spot VA errors, and generate legal appeal briefs.
          </p>
        </div>

        {/* System parameters display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Privacy Level</span>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
              <Shield size={12} />
              <span>{privacyMode ? 'Session-Only (Safe)' : 'Browser Storage'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Database Integrity</span>
            <div className="flex items-center gap-1 text-slate-200 font-semibold text-xs">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>100% Verifiable eCFR</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified Rates</span>
            <div className="flex items-center gap-1 text-slate-200 font-semibold text-xs">
              <RefreshCw size={12} className="text-indigo-400" />
              <span>FY 2026 Active Rates</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Your Bookmarks</span>
            <div className="flex items-center gap-1 text-slate-200 font-semibold text-xs">
              <BookOpen size={12} className="text-blue-400" />
              <span>{bookmarksCount} Saved Sections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Onboarding Case Stage & Next Best Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Onboarding Stage Selector */}
        <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Where are you in the VR&E process?</span>
            <h2 className="text-sm font-bold text-slate-200">Interactive Onboarding Stage Selector</h2>
          </div>

          {/* Selector Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b border-slate-800 pb-5">
            {CASE_STAGES_DATA.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setCurrentCaseStage(stage.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition cursor-pointer text-center ${
                  currentCaseStage === stage.id
                    ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {/* Stage Specific Details */}
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">{activeStageObj.title}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{activeStageObj.description}</p>
            </div>

            {/* Next Best Action Card */}
            <div className="bg-slate-950/40 border border-indigo-500/20 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} className="text-indigo-400" />
                <span>Next Best Action Step</span>
              </span>
              <p className="text-xs text-slate-200 font-bold leading-normal">{activeStageObj.nextAction}</p>
              
              <div className="space-y-1.5 pt-1.5 border-t border-slate-850">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Required Checklist:</span>
                <ul className="space-y-1">
                  {activeStageObj.checklist.map((item, idx) => (
                    <li key={idx} className="flex gap-2 items-center text-[11px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mode-Specific Guidance */}
            <div className="border-l-2 border-amber-500/60 bg-amber-950/10 p-4 rounded-r-xl space-y-1">
              <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{modeAdvice.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">{modeAdvice.text}</p>
            </div>

            {/* Route Action Button */}
            {activeStageObj.actionRoute && (
              <button
                onClick={() => handleRoute(activeStageObj.actionRoute)}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <span>Navigate to Phase Tool</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 12 Primary Cards: Problem Navigation Grid */}
        <div className="lg:col-span-4 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Find solutions by topic</span>
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <span>Browse Primary Situation Cards</span>
            </h2>
          </div>

          <div 
            tabIndex={0}
            aria-label="Primary Situation Solutions"
            className="grid grid-cols-1 gap-2.5 max-h-[460px] overflow-y-auto pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded-xl"
          >
            
            <div 
              onClick={() => handleRoute('wizard')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('wizard'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <Award size={14} className="text-indigo-400" />
                <span>Apply for VR&E</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Form 28-1900 filing instructions and eligibility limits.</p>
            </div>

            <div 
              onClick={() => handleRoute('wizard')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('wizard'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Check Eligibility / Entitlement</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Determine if you qualify for Chapter 31 Vocational Rehab.</p>
            </div>

            <div 
              onClick={() => handleRoute('planning')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('planning'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <Compass size={14} className="text-blue-400" />
                <span>Plan College or Training</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Conduct labor-market match reviews and select targets.</p>
            </div>

            <div 
              onClick={() => handleRoute('calculator')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('calculator'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <Calculator size={14} className="text-amber-400" />
                <span>Calculate Monthly Payment</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Compare traditional subsistence allowance vs Post-9/11 rates.</p>
            </div>

            <div 
              onClick={() => handleRoute('dispute_hub', 'computer_denial')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('dispute_hub', 'computer_denial'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <Briefcase size={14} className="text-indigo-400" />
                <span>Fix Tuition / Books / Supplies</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Obtain technology supply packages, course gear, and tools.</p>
            </div>

            <div 
              onClick={() => handleRoute('dispute_hub')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('dispute_hub'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <Scale size={14} className="text-red-400" />
                <span>Challenge a Denial</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Identify counselor mistakes and construct formal appeals.</p>
            </div>

            <div 
              onClick={() => handleRoute('dispute_hub', 'counselor_delay')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('dispute_hub', 'counselor_delay'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <Clock size={14} className="text-amber-400" />
                <span>Fix Counselor Delay</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Generate escalation packets if counselor stops responding.</p>
            </div>

            <div 
              onClick={() => handleRoute('dispute_hub', 'case_closed')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('dispute_hub', 'case_closed'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                <span>Case Interrupted or Closed</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">re-enter the program or argue notice defect violations.</p>
            </div>

            <div 
              onClick={() => handleRoute('document_generator')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('document_generator'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <FileEdit size={14} className="text-indigo-400" />
                <span>Request IPE Change</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Change vocational goals or programs mid-stream.</p>
            </div>

            <div 
              onClick={() => handleRoute('special_programs')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('special_programs'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <Shield size={14} className="text-emerald-400" />
                <span>Independent Living Help</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Access services for veterans unable to seek employment.</p>
            </div>

            <div 
              onClick={() => handleRoute('document_generator')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('document_generator'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <FileEdit size={14} className="text-blue-400" />
                <span>Build a Letter</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Draft FOIA, extension, or technology request memos.</p>
            </div>

            <div 
              onClick={() => handleRoute('authority_library')}
              onKeyDown={(e) => handleKeyDown(e, () => handleRoute('authority_library'))}
              role="button"
              tabIndex={0}
              className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl cursor-pointer hover:border-slate-700 transition space-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <h4 className="text-xs font-bold text-slate-250 flex items-center gap-2">
                <BookOpen size={14} className="text-slate-400" />
                <span>Research the Law</span>
              </h4>
              <p className="text-[10px] text-slate-405 leading-normal">Examine 38 U.S.C. Chapter 31, C.F.R. regulations, and M28C.</p>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default HomeDashboardView;

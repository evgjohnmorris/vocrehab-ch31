import React, { useState, useEffect } from 'react';
import { 
  Scale, Compass, FileText, Search, CheckCircle, AlertTriangle, Info 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CAREERS_DATABASE } from '../data/school_data';
import { INDUSTRIES_LOOKUP } from '../data/industry_data';
import { generateJustificationLetter } from '../utils/letterGenerators';

function CareerStrategyView({ reduceMotion }) {
  // Localized Career Strategy States
  const [selectedCareerIndex, setSelectedCareerIndex] = useState(0);
  const [limitStanding, setLimitStanding] = useState(false);
  const [limitLifting, setLimitLifting] = useState(false);
  const [limitBending, setLimitBending] = useState(false);
  const [limitEnvironment, setLimitEnvironment] = useState(false);
  const [limitSitting, setLimitSitting] = useState(false);
  const [limitRepetitive, setLimitRepetitive] = useState(false);
  const [limitSensory, setLimitSensory] = useState(false);
  const [limitStress, setLimitStress] = useState(false);
  const [limitRespiratory, setLimitRespiratory] = useState(false);

  const [riasecR, setRiasecR] = useState(3);
  const [riasecI, setRiasecI] = useState(3);
  const [riasecA, setRiasecA] = useState(3);
  const [riasecS, setRiasecS] = useState(3);
  const [riasecE, setRiasecE] = useState(3);
  const [riasecC, setRiasecC] = useState(3);
  const [showProfiler, setShowProfiler] = useState(false);

  const [justCurrentGoal, setJustCurrentGoal] = useState('Operations Specialist');
  const [justProposedGoal, setJustProposedGoal] = useState('Software Developer');
  const [justReason, setJustReason] = useState('disability_worsened');
  const [justMedicalEvidence, setJustMedicalEvidence] = useState(true);
  const [justPhysicalImpact, setJustPhysicalImpact] = useState(
    'Current job requires frequent bending, lifting, and carrying gear up to 50 lbs, which exacerbates my service-connected spinal stenosis and lumbar strain. Sitting at a computer desk is medically recommended.'
  );
  const [justGeneratedLetter, setJustGeneratedLetter] = useState('');

  const [industrySearchQuery, setIndustrySearchQuery] = useState('');
  const [showIndustryFinder, setShowIndustryFinder] = useState(false);

  // Sync selected career to justProposedGoal
  useEffect(() => {
    const career = CAREERS_DATABASE[selectedCareerIndex];
    if (career) {
      setJustProposedGoal(career.title);
    }
  }, [selectedCareerIndex]);

  const getCareerCompatibility = (career) => {
    if (!career) return { compatible: true, reasons: [] };
    const reasons = [];
    let compatible = true;

    if (limitStanding) {
      if (career.physicalDemand === 'Light' || career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
        compatible = false;
        reasons.push(`Career requires standing/walking ("${career.physicalDemand}" strength rating), which conflicts with standing constraints.`);
      }
    }

    if (limitLifting) {
      if (career.physicalDemand === 'Light' || career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
        compatible = false;
        reasons.push(`Career requires lifting capabilities beyond 15 lbs ("${career.physicalDemand}" strength rating).`);
      }
    }

    if (limitBending) {
      if (career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
        compatible = false;
        reasons.push(`Medium/Heavy demand roles require frequent bending, kneeling, or crouching.`);
      }
    }

    if (limitEnvironment) {
      if (career.title === 'Solar Photovoltaic Installer' || career.title === 'CNC Machinist' || career.title === 'Commercial Pilot') {
        compatible = false;
        reasons.push(`Career involves outdoor exposure, non-climate-controlled environments, or specific pressure/altitude factors.`);
      }
    }

    if (limitSitting && career.requiresSitting) {
      compatible = false;
      reasons.push(`Career requires prolonged sitting ("Sedentary" or flight-deck posture), which conflicts with sitting tolerance limits.`);
    }

    if (limitRepetitive && career.requiresRepetitiveMotion) {
      compatible = false;
      reasons.push(`Role involves extensive keyboarding or repetitive wrist-finger motions, which conflicts with upper extremity limitations.`);
    }

    if (limitSensory && career.requiresVisionHearing) {
      compatible = false;
      reasons.push(`Career has strict FAA/DOT sensory, vision (20/20 corrected), or hearing thresholds that conflict with sensory limitations.`);
    }

    if (limitStress && career.requiresHighStressConfinement) {
      compatible = false;
      reasons.push(`High-stress operations, cockpit confinement, or rapid decision-making requirements conflict with stress tolerance thresholds.`);
    }

    if (limitRespiratory && career.requiresRespiratorFumes) {
      compatible = false;
      reasons.push(`Role requires exposure to machine coolant mist, dust, or potential pulmonary irritants, which conflicts with respiratory limits.`);
    }

    return { compatible, reasons };
  };

  const getRiasecRecommendations = () => {
    const scores = [
      { name: 'Realistic', value: riasecR, description: 'Hands-on, machine-oriented, outdoors, or physical work.' },
      { name: 'Investigative', value: riasecI, description: 'Analytical, research-oriented, problem-solving, science/math.' },
      { name: 'Artistic', value: riasecA, description: 'Creative, designing, layout, writing, expressive work.' },
      { name: 'Social', value: riasecS, description: 'Helping, instructing, advising, coordinating, teaching.' },
      { name: 'Enterprising', value: riasecE, description: 'Leadership, project management, operations, business ventures.' },
      { name: 'Conventional', value: riasecC, description: 'Data processing, spreadsheets, audit, systematic records.' }
    ];
    
    scores.sort((a, b) => b.value - a.value);
    const topScore = scores[0];
    
    let matches = [];
    if (topScore.name === 'Realistic') {
      matches = CAREERS_DATABASE.filter(c => c.physicalDemand === 'Medium' || c.physicalDemand === 'Heavy');
    } else if (topScore.name === 'Investigative') {
      matches = CAREERS_DATABASE.filter(c => c.oohGroup === 'Computer and Information Technology');
    } else if (topScore.name === 'Artistic') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Software Developer');
    } else if (topScore.name === 'Social') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Logistics Manager');
    } else if (topScore.name === 'Enterprising') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Logistics Manager' || c.title === 'Commercial Pilot');
    } else if (topScore.name === 'Conventional') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Accountant' || c.title === 'Logistics Manager');
    }
    
    return { topScore, matches };
  };

  const handleGenerateLetter = () => {
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const career = CAREERS_DATABASE[selectedCareerIndex] || CAREERS_DATABASE[0];
    const letter = generateJustificationLetter({
      dateStr,
      career,
      justReason,
      justCurrentGoal,
      justPhysicalImpact,
      justMedicalEvidence
    });
    setJustGeneratedLetter(letter);
  };

  return (
    <motion.div 
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? {} : { opacity: 0, y: -15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="doc-card"
    >
      <span className="doc-tag">VA Career Plan and Strategy</span>
      <h1 className="doc-title">Career Plan, Strategy and Justification Wizard</h1>
      <p className="doc-subtitle">Generate legally structured VRC justification letters, assess physical compatibility, and find industry classification codes.</p>
      <div className="doc-divider"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bento Grid for Input Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Labor Market & Disability Compatibility Strategist */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <h4 className="text-sm font-bold text-amber-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Scale size={16} />
              Labor Market & Disability Compatibility Strategist
            </h4>
            
            <div className="form-group">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Target Occupational Goal (OOH/O*NET Classification Database)</label>
              <select
                className="form-control"
                value={selectedCareerIndex}
                onChange={(e) => setSelectedCareerIndex(parseInt(e.target.value))}
              >
                {CAREERS_DATABASE.map((c, i) => (
                  <option key={i} value={i}>{c.title} ({c.soc})</option>
                ))}
              </select>
            </div>

            {/* Disability / Physical Constraints Checkboxes */}
            <div className="my-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 mb-3">Indicated Disability & Functional Limitations</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Standing Limit", checked: limitStanding, set: setLimitStanding },
                  { label: "Lifting Limit (>15 lbs)", checked: limitLifting, set: setLimitLifting },
                  { label: "Bending/Kneeling", checked: limitBending, set: setLimitBending },
                  { label: "Climate/Altitude", checked: limitEnvironment, set: setLimitEnvironment },
                  { label: "Prolonged Sitting", checked: limitSitting, set: setLimitSitting },
                  { label: "Repetitive Motion", checked: limitRepetitive, set: setLimitRepetitive },
                  { label: "Sensory (Vision/Hearing)", checked: limitSensory, set: setLimitSensory },
                  { label: "High Stress/Confinement", checked: limitStress, set: setLimitStress },
                  { label: "Respiratory/Dust Limit", checked: limitRespiratory, set: setLimitRespiratory }
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-2 cursor-pointer text-xs text-slate-200 hover:text-white select-none">
                    <input 
                      type="checkbox" 
                      className="accent-amber-500" 
                      checked={item.checked} 
                      onChange={(e) => item.set(e.target.checked)} 
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Compatibility Badge & Reasons */}
            {(() => {
              const currentCareer = CAREERS_DATABASE[selectedCareerIndex] || CAREERS_DATABASE[0];
              const { compatible, reasons } = getCareerCompatibility(currentCareer);
              return (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                  compatible 
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                    : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
                } mb-4`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {compatible ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div className="text-xs leading-relaxed">
                    <strong className="block text-slate-200 mb-0.5">Status: {compatible ? "Medically Compatible" : "Potential Physical Conflict"}</strong>
                    {reasons.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-400 mt-1">
                        {reasons.map((r, idx) => <li key={idx}>{r}</li>)}
                      </ul>
                    ) : (
                      <span className="text-slate-400 block">
                        The demands of this role are fully compatible with your physical capacities.
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* LMI & Compatibility Test Lab */}
            <div className="p-4 bg-slate-950/20 border border-slate-800/80 rounded-xl mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Compatibility Test Lab & Auditor</h5>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">Active</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                Load a pre-configured veteran profile to instantly populate disability limitations and audit compatibility calculations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  className="text-left p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLimitStanding(true);
                    setLimitLifting(true);
                    setLimitBending(true);
                    setLimitEnvironment(false);
                    setLimitSitting(false);
                    setLimitRepetitive(false);
                    setLimitSensory(false);
                    setLimitStress(false);
                    setLimitRespiratory(false);
                    setSelectedCareerIndex(CAREERS_DATABASE.findIndex(c => c.title === 'Software Developer'));
                  }}
                >
                  <strong className="text-[11px] text-slate-200 block">Profile A: Orthopedic Limits</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Standing & lifting limits. Software Dev target (Compatible).</span>
                </button>
                
                <button
                  type="button"
                  className="text-left p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLimitStanding(true);
                    setLimitLifting(false);
                    setLimitBending(true);
                    setLimitEnvironment(true);
                    setLimitSitting(false);
                    setLimitRepetitive(false);
                    setLimitSensory(false);
                    setLimitStress(false);
                    setLimitRespiratory(true);
                    setSelectedCareerIndex(CAREERS_DATABASE.findIndex(c => c.title === 'Solar Photovoltaic Installer'));
                  }}
                >
                  <strong className="text-[11px] text-slate-200 block">Profile B: Outdoors & Dust</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Climate & respiratory limits. Solar Installer (Conflict).</span>
                </button>

                <button
                  type="button"
                  className="text-left p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLimitStanding(false);
                    setLimitLifting(false);
                    setLimitBending(false);
                    setLimitEnvironment(false);
                    setLimitSitting(true);
                    setLimitRepetitive(true);
                    setLimitSensory(false);
                    setLimitStress(false);
                    setLimitRespiratory(false);
                    setSelectedCareerIndex(CAREERS_DATABASE.findIndex(c => c.title === 'Accountant'));
                  }}
                >
                  <strong className="text-[11px] text-slate-200 block">Profile C: Hand Repetition</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Sitting & keyboard limits. Accountant (Conflict).</span>
                </button>

                <button
                  type="button"
                  className="text-left p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLimitStanding(false);
                    setLimitLifting(false);
                    setLimitBending(false);
                    setLimitEnvironment(true);
                    setLimitSitting(true);
                    setLimitRepetitive(false);
                    setLimitSensory(true);
                    setLimitStress(true);
                    setLimitRespiratory(false);
                    setSelectedCareerIndex(CAREERS_DATABASE.findIndex(c => c.title === 'Commercial Pilot'));
                  }}
                >
                  <strong className="text-[11px] text-slate-200 block">Profile D: Sensory & Flight</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Sensory, stress & climate limits. Pilot (Conflict).</span>
                </button>
              </div>
            </div>

            {/* Official Classification Info Grid */}
            {(() => {
              const currentCareer = CAREERS_DATABASE[selectedCareerIndex] || CAREERS_DATABASE[0];
              return (
                <div className="text-xs">
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-300 mb-3">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>O*NET-SOC Code:</strong> <span className="text-slate-100 font-mono">{currentCareer.soc}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>DOT Code:</strong> <span className="text-slate-100 font-mono">{currentCareer.dot}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>SVP Preparation:</strong> <span className="text-slate-100">{currentCareer.svp} ({currentCareer.svp >= 8 ? "4-10 yrs" : currentCareer.svp >= 7 ? "2-4 yrs" : "Under 2 yrs"})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>DOT Physical Demand:</strong> <span className="text-slate-100 font-semibold">{currentCareer.physicalDemand}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>Industry SIC Code:</strong> <span className="text-slate-100 font-mono">{currentCareer.sic}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>NAICS Sector:</strong> <span className="text-slate-100 font-mono">{currentCareer.naics}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>BLS Median Pay:</strong> <span className="text-amber-500 font-semibold">${currentCareer.medianPay.toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>BLS Growth Rate:</strong> <span className="text-slate-100">{currentCareer.outlook}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed p-2">
                    <strong>Essential Duties:</strong> {currentCareer.duties}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* O*NET Interest Profiler (Holland Codes) */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                <Compass size={16} />
                O*NET Interest Profiler (Holland Codes)
              </h4>
              <button
                type="button"
                className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-amber-500 rounded border border-slate-700 cursor-pointer transition-colors duration-150"
                onClick={() => setShowProfiler(!showProfiler)}
              >
                {showProfiler ? "Hide Profiler" : "Open Profiler"}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Assess your vocational interests using Holland's RIASEC model and get matched with suitable goals from the career database.
            </p>

            {showProfiler && (
              <div className="border-t border-dashed border-slate-800 pt-4 space-y-4">
                <span className="text-[11px] text-slate-400 block mb-2">Rate your interest in each vocational category (1 = Dislike, 5 = Strongly Enjoy):</span>
                
                <div className="space-y-3">
                  {[
                    { label: "Realistic (R): Hands-on/Build", val: riasecR, set: setRiasecR },
                    { label: "Investigative (I): Analytical/Tech", val: riasecI, set: setRiasecI },
                    { label: "Artistic (A): Design/Creative", val: riasecA, set: setRiasecA },
                    { label: "Social (S): Helping/Mentoring", val: riasecS, set: setRiasecS },
                    { label: "Enterprising (E): Leadership/Biz", val: riasecE, set: setRiasecE },
                    { label: "Conventional (C): Audit/Details", val: riasecC, set: setRiasecC }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="w-48 text-slate-300">{item.label}</span>
                      <input 
                        type="range" min="1" max="5" value={item.val} 
                        onChange={(e) => item.set(parseInt(e.target.value))} 
                        className="flex-1 mx-4 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-4 font-bold text-slate-100 text-right">{item.val}</span>
                    </div>
                  ))}
                </div>

                {/* Profiler Recommendation Result */}
                {(() => {
                  const { topScore, matches } = getRiasecRecommendations();
                  return (
                    <div className="mt-4 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-200 mb-3 pb-3 border-b border-slate-900">
                        Primary Interest Match: <strong className="text-amber-500 font-semibold">{topScore.name}</strong>
                        <p className="margin-0 text-[10px] text-slate-400 mt-1 leading-normal">{topScore.description}</p>
                      </div>
                      {matches.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Matched Careers:</span>
                          <div className="space-y-2">
                            {matches.map((c, idx) => {
                              const originalIndex = CAREERS_DATABASE.findIndex(dbC => dbC.title === c.title);
                              return (
                                <div key={idx} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                                  <span className="text-xs text-slate-200 font-medium">{c.title} <span className="text-[10px] text-slate-400 font-mono">({c.soc})</span></span>
                                  <button
                                    type="button"
                                    className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded cursor-pointer transition-colors duration-150"
                                    onClick={() => setSelectedCareerIndex(originalIndex)}
                                  >
                                    Set as Goal
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No exact database matches. Try raising Realistic, Investigative, Enterprising, or Conventional categories.</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* VRC Program Change Justification Generator */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <h4 className="text-sm font-bold text-amber-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <FileText size={16} />
              VRC Program Change Justification Generator
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="form-group mb-0">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Vocational Goal (IWRP)</label>
                <input
                  type="text"
                  className="form-control"
                  value={justCurrentGoal}
                  onChange={(e) => setJustCurrentGoal(e.target.value)}
                />
              </div>

              <div className="form-group mb-0">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Proposed Vocational Goal</label>
                <input
                  type="text"
                  className="form-control"
                  value={justProposedGoal}
                  onChange={(e) => setJustProposedGoal(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason for Change of Program</label>
              <select
                className="form-control"
                value={justReason}
                onChange={(e) => setJustReason(e.target.value)}
              >
                <option value="disability_worsened">Medical/Disability constraints worsened</option>
                <option value="market_demand">Career market suitability change</option>
                <option value="counselor_advice">VRC directive and guidance</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Explain physical impact of the current goal</label>
              <textarea
                className="form-control h-20 p-3 text-xs resize-y"
                value={justPhysicalImpact}
                onChange={(e) => setJustPhysicalImpact(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 mb-4 cursor-pointer select-none">
              <input
                type="checkbox"
                id="justMedical"
                className="accent-amber-500"
                checked={justMedicalEvidence}
                onChange={(e) => setJustMedicalEvidence(e.target.checked)}
              />
              <label htmlFor="justMedical" className="text-xs text-slate-300 cursor-pointer">
                Medical evidence is available to support this change
              </label>
            </div>

            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={handleGenerateLetter}
            >
              Generate Formal Justification Letter
            </button>
          </div>

          {/* SEC SIC & NAICS Industry Finder */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                <Search size={16} />
                SEC SIC & NAICS Industry Code Finder
              </h4>
              <button
                type="button"
                className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-amber-500 rounded border border-slate-700 cursor-pointer transition-colors duration-150"
                onClick={() => setShowIndustryFinder(!showIndustryFinder)}
              >
                {showIndustryFinder ? "Hide Finder" : "Open Finder"}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Search classifications from the SEC SIC Standard Industrial Classification list and BLS Industry Groups.
            </p>

            {showIndustryFinder && (
              <div className="border-t border-dashed border-slate-800 pt-4 space-y-4">
                <div className="form-group mb-3">
                  <input
                    type="text"
                    className="form-control text-xs"
                    placeholder="Search by keyword (e.g. software, logistics, pilot, CNC)..."
                    value={industrySearchQuery}
                    onChange={(e) => setIndustrySearchQuery(e.target.value)}
                  />
                </div>

                {/* Industry Search Results */}
                {(() => {
                  const q = industrySearchQuery.trim().toLowerCase();
                  const isSearchActive = q.length >= 2;

                  const filtered = INDUSTRIES_LOOKUP.filter(ind => {
                    if (!isSearchActive) {
                      return INDUSTRIES_LOOKUP.indexOf(ind) < 8;
                    }
                    return (
                      ind.title.toLowerCase().includes(q) ||
                      ind.desc.toLowerCase().includes(q) ||
                      ind.keyword.toLowerCase().includes(q) ||
                      ind.sic.includes(q) ||
                      ind.naics.includes(q)
                    );
                  });

                  if (filtered.length === 0) {
                    return <p className="text-xs text-slate-400 italic">No matching industries found. Try searching by keywords like "software", "aviation", "electrical", or codes.</p>;
                  }

                  const maxResults = 100;
                  const displayed = filtered.slice(0, maxResults);
                  const hasMore = filtered.length > maxResults;

                  return (
                    <div className="space-y-3">
                      {!isSearchActive && (
                        <p className="text-[10px] text-slate-400 italic leading-normal">
                          Showing common industry groups. Type 2+ characters to search the full SEC database of 2,100+ classifications.
                        </p>
                      )}
                      {isSearchActive && hasMore && (
                        <p className="text-[10px] text-amber-500 font-medium">
                          Showing top {maxResults} of {filtered.length} matches. Please refine search query for more specific results.
                        </p>
                      )}
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {displayed.map((ind, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5">
                            <div className="flex justify-between items-center">
                              <strong className="text-xs text-slate-200">{ind.title}</strong>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{ind.desc}</p>
                            <div className="flex gap-4 text-[10px] text-slate-400">
                              <span>SIC: <strong className="text-slate-300 font-mono">{ind.sic}</strong></span>
                              <span>NAICS: <strong className="text-slate-300 font-mono">{ind.naics}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outcomes Panel */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none rounded-xl" />
            
            <div className="relative z-10 space-y-6">
              {/* Request Letter Display */}
              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-amber-500" />
                  Justification Letter Output
                </h4>
                {justGeneratedLetter ? (
                  <div className="space-y-3">
                    <textarea
                      readOnly
                      value={justGeneratedLetter}
                      className="w-full h-80 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono resize-none leading-relaxed"
                    />
                    <button
                      type="button"
                      className="btn btn-primary w-full text-xs font-semibold py-2.5"
                      onClick={() => {
                        navigator.clipboard.writeText(justGeneratedLetter);
                        alert("Justification letter copied to clipboard!");
                      }}
                    >
                      Copy Letter to Clipboard
                    </button>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-950/50 border border-slate-850 rounded-xl text-center">
                    <Info size={24} className="text-slate-600 mb-2 mx-auto" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Fill out the parameters on the left and click "Generate" to construct your program change justification letter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CareerStrategyView;

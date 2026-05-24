import React, { useState } from 'react';
import { Award, Info, Settings, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function EntitlementWizardView({ setSelectedSection, setActiveView, reduceMotion }) {
  // Localized Wizard States
  const [rating, setRating] = useState(20);
  const [dischargeStatus, setDischargeStatus] = useState('other-than-dishonorable');
  const [employmentHandicap, setEmploymentHandicap] = useState(true);
  const [sehAssessment, setSehAssessment] = useState(null); // 'yes' | 'no'
  const [wizardResult, setWizardResult] = useState(null);

  // Localized Extension Pre-Screener States
  const [extHasSeh, setExtHasSeh] = useState(false);
  const [extApproachingLimit, setExtApproachingLimit] = useState(false);
  const [extNeedMoreTime, setExtNeedMoreTime] = useState(false);

  // Localized Eligibility Wizard Logic
  const calculateEligibility = () => {
    if (dischargeStatus === 'dishonorable') {
      setWizardResult({
        eligible: false,
        entitled: false,
        status: 'Not Entitled',
        reason: "Discharge character of 'Dishonorable' is a statutory bar to Chapter 31 benefits under 38 U.S.C. § 5303.",
        recommendedAction: "You may apply to the VA Discharge Review Board (DRB) or Board for Correction of Military Records (BCMR) for a discharge upgrade.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.42', label: '38 CFR § 21.42' }
        ]
      });
      return;
    }

    if (rating < 10) {
      setWizardResult({
        eligible: false,
        entitled: false,
        status: 'Not Entitled',
        reason: "You must have a service-connected disability rating of at least 10% from the VA to apply for Chapter 31 VR&E.",
        recommendedAction: "If your service-connected conditions have worsened, you can file a claim for an increased rating via VA.gov.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' }
        ]
      });
      return;
    }

    if (rating === 10) {
      if (sehAssessment === 'yes') {
        setWizardResult({
          eligible: true,
          entitled: true,
          status: "Entitled (10% Rating + Serious Employment Handicap)",
          reason: "Veterans with a 10% rating are entitled to VR&E services if they are determined by a VRC to have a Serious Employment Handicap (SEH).",
          recommendedAction: "Submit VA Form 28-1900. Your evaluation will focus on establishing how your disability severely limits your employability.",
          tracks: ["Reemployment", "Rapid Access", "Self-Employment", "Long-Term Services", "Independent Living"],
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.35', label: '38 CFR § 21.35' },
            { type: 'cfr', id: '21.52', label: '38 CFR § 21.52' }
          ]
        });
      } else {
        setWizardResult({
          eligible: true,
          entitled: false,
          status: "Eligible but Not Entitled (10% Rating, No Serious Employment Handicap)",
          reason: "Veterans with a 10% rating require a finding of a Serious Employment Handicap (SEH) to establish entitlement. Since no SEH was determined, entitlement cannot be granted.",
          recommendedAction: "You may appeal the VRC's determination or provide additional medical evidence showing the severity of your employment limitations.",
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
            { type: 'cfr', id: '21.52', label: '38 CFR § 21.52' }
          ]
        });
      }
      return;
    }

    // Rating is 20% or more
    if (employmentHandicap) {
      setWizardResult({
        eligible: true,
        entitled: true,
        status: "Entitled (20%+ Rating + Employment Handicap)",
        reason: "Veterans with a rating of 20% or higher are entitled to VR&E benefits if they have an Employment Handicap (EH) resulting in part from their service-connected condition.",
        recommendedAction: "Submit VA Form 28-1900. You will collaborate with a VRC to complete an initial assessment and select one of the five tracks.",
        tracks: ["Reemployment", "Rapid Access", "Self-Employment", "Long-Term Services"],
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
          { type: 'cfr', id: '21.51', label: '38 CFR § 21.51' }
        ]
      });
    } else {
      setWizardResult({
        eligible: true,
        entitled: false,
        status: "Eligible but Not Entitled (20%+ Rating, No Employment Handicap)",
        reason: "While you meet the basic disability rating requirement, your counselor determined that your disability does not cause a current handicap in preparing for, obtaining, or retaining suitable employment.",
        recommendedAction: "Request a review of the decision if you believe your counselor overlooked critical barriers to employment caused by your service-connected conditions.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
          { type: 'cfr', id: '21.51', label: '38 CFR § 21.51' }
        ]
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="doc-card"
    >
      <span className="doc-tag">Interactive Tools</span>
      <h1 className="doc-title">Entitlement & Eligibility Wizard</h1>
      <p className="doc-subtitle">Evaluate vocational rehabilitation and serious employment handicap criteria side-by-side.</p>
      <div className="doc-divider"></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <div className="form-group">
            <label>Disability Rating from VA</label>
            <select 
              className="form-control" 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={0}>No Rating / 0%</option>
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={30}>30% or Higher</option>
            </select>
          </div>

          <div className="form-group">
            <label>Discharge Characterization</label>
            <select 
              className="form-control" 
              value={dischargeStatus} 
              onChange={(e) => setDischargeStatus(e.target.value)}
            >
              <option value="other-than-dishonorable">Other Than Dishonorable</option>
              <option value="dishonorable">Dishonorable</option>
            </select>
          </div>

          {rating >= 20 && (
            <div className="form-group">
              <label>Does the disability cause barriers to obtaining or retaining suitable employment?</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="eh" 
                    checked={employmentHandicap === true} 
                    onChange={() => setEmploymentHandicap(true)} 
                  />
                  Yes (Employment Handicap exists)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="eh" 
                    checked={employmentHandicap === false} 
                    onChange={() => setEmploymentHandicap(false)} 
                  />
                  No
                </label>
              </div>
            </div>
          )}

          {rating === 10 && (
            <div className="form-group">
              <label>Does the disability cause significant barriers, requiring comprehensive services?</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="seh" 
                    checked={sehAssessment === 'yes'} 
                    onChange={() => setSehAssessment('yes')} 
                  />
                  Yes (Serious Employment Handicap exists)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="seh" 
                    checked={sehAssessment === 'no'} 
                    onChange={() => setSehAssessment('no')} 
                  />
                  No
                </label>
              </div>
            </div>
          )}

          <button 
            className="btn btn-primary" 
            onClick={calculateEligibility}
            style={{ marginTop: '16px', width: '100%' }}
          >
            <Award size={18} />
            <span>Evaluate Entitlement</span>
          </button>
        </div>

        <div>
          {wizardResult ? (
            <div className="result-box" style={{ borderLeft: `4px solid ${wizardResult.entitled ? 'var(--success-color)' : 'var(--danger-color)'}` }}>
              <h4 style={{ color: wizardResult.entitled ? 'var(--success-color)' : 'var(--danger-color)', marginBottom: '10px' }}>
                {wizardResult.entitled ? 'Entitled to Benefits' : 'Not Entitled'}
              </h4>
              <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>{wizardResult.status}</p>
              <p style={{ marginBottom: '12px', fontSize: '0.85rem' }}>{wizardResult.reason}</p>
              
              <div className="doc-divider" style={{ margin: '12px 0' }}></div>
              
              <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Recommended Steps:</h5>
              <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>{wizardResult.recommendedAction}</p>

              {wizardResult.tracks && (
                <div style={{ marginBottom: '12px' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Eligible Vocational Tracks:</h5>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {wizardResult.tracks.map(t => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              )}

              {wizardResult.keyRegs && (
                <div style={{ marginTop: '16px' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Key Regulations Applied:</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {wizardResult.keyRegs.map(reg => (
                      <button
                        key={reg.id}
                        className="btn"
                        style={{
                          padding: '6px 10px',
                          height: 'auto',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--hover-bg)',
                          color: 'var(--accent-color)',
                          border: '1px solid var(--card-border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => {
                          setSelectedSection({ type: reg.type, id: reg.id });
                          setActiveView('reference');
                        }}
                      >
                        {reg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="result-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '220px', borderStyle: 'dashed' }}>
              <Info size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fill out the evaluation form on the left to determine entitlement status and eligible rehabilitation tracks.</p>
            </div>
          )}
        </div>
      </div>

      {/* Entitlement Extensions Section */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute -inset-px bg-gradient-to-r from-amber-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Settings className="text-amber-500 animate-pulse" size={20} />
                VR&E Entitlement Extensions Pre-Screener
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
                38 CFR § 21.44 & § 21.78
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Find out how having a Serious Employment Handicap (SEH) allows you to extend services past 48 months or bypass the 12-year basic eligibility window.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">Extension Pre-Screening Criteria</h4>
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-amber-500 cursor-pointer"
                    checked={extHasSeh} 
                    onChange={(e) => setExtHasSeh(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Serious Employment Handicap (SEH)</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Do you have an assessed serious employment handicap (usually rating of 10% or barriers)?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-amber-500 cursor-pointer"
                    checked={extApproachingLimit} 
                    onChange={(e) => setExtApproachingLimit(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Approaching Limits</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Have you reached or are you near the 48-month limit or basic 12-year expiration?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-amber-500 cursor-pointer"
                    checked={extNeedMoreTime} 
                    onChange={(e) => setExtNeedMoreTime(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Additional Retraining Needed</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Do you require additional vocational retraining to achieve suitable employment?</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col justify-center">
                {extHasSeh && extApproachingLimit && extNeedMoreTime ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-emerald-400 relative overflow-hidden animate-fade-in">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={22} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm font-semibold text-emerald-300 block mb-1">Pre-screen Recommendation Approved</strong>
                        <p className="text-xs text-emerald-400/90 leading-relaxed">
                          Under statutory rules 38 CFR § 21.44 (bypassing 12-year basic period) and 38 CFR § 21.78 (extending past 48 months), you meet the criteria for a VRC extension grant. Inform your counselor to classify your case as an SEH to unlock these extensions.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 text-slate-400 flex flex-col items-center justify-center text-center py-8">
                    <Info size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] max-w-xs leading-relaxed">
                      Toggle all three criteria checkboxes on the left to verify if you qualify for a statutory program extension.
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

export default EntitlementWizardView;

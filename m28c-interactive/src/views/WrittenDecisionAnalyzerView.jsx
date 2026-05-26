import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, HelpCircle, Info, ShieldAlert, ExternalLink
} from 'lucide-react';

function WrittenDecisionAnalyzerView({ reduceMotion }) {
  const [hasWrittenNotice, setHasWrittenNotice] = useState('no'); // 'yes' | 'email' | 'no'
  const [noticeDate, setNoticeDate] = useState('');
  const [deniedBenefit, setDeniedBenefit] = useState('supplies');
  const [hasForm200998, setHasForm200998] = useState('yes'); // 'yes' | 'no'
  const [listsEvidence, setListsEvidence] = useState('yes'); // 'yes' | 'no'
  const [hasNewEvidence, setHasNewEvidence] = useState('yes'); // 'yes' | 'no'
  
  const [analysisResult, setAnalysisResult] = useState(null);

  // Calculate days remaining or elapsed
  const getDeadlineStats = () => {
    if (!noticeDate) return null;
    const parsedDate = new Date(noticeDate + 'T00:00:00');
    const deadline = new Date(parsedDate);
    deadline.setFullYear(deadline.getFullYear() + 1);
    
    const today = new Date();
    const msDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    
    return {
      deadlineDate: deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysRemaining: daysDiff,
      isExpired: daysDiff < 0
    };
  };

  const handleAnalyze = () => {
    const stats = getDeadlineStats();
    let status;
    let recommendation;
    let description;
    let formNeeded = '';
    let formUrl = '';
    let alertLevel;
    let errors = [];

    // Check for procedural errors
    if (hasWrittenNotice === 'yes') {
      status = 'formal';
      
      if (hasForm200998 === 'no') {
        errors.push({
          title: 'Missing VA Form 20-0998 (Review Rights)',
          desc: 'VA failed to attach standard notice of procedural review rights. Under 38 C.F.R. § 21.420 and 38 U.S.C. § 5104, all formal decisions must contain review-lane rights. This is a procedural violation.'
        });
      }
      if (listsEvidence === 'no') {
        errors.push({
          title: 'Missing Evidence Considered List',
          desc: 'Under 38 U.S.C. § 5104(b), the VA must explicitly list the evidence considered in making a decision. The absence of this list makes it difficult to verify if the VRC ignored relevant records.'
        });
      }

      if (stats && stats.isExpired) {
        recommendation = 'Supplemental Claim (New Evidence Needed)';
        description = `Your 1-year appeal deadline expired on ${stats.deadlineDate} (${Math.abs(stats.daysRemaining)} days ago). Under the Appeals Modernization Act (AMA), you cannot file a Higher-Level Review or Board Appeal. Your only option to reopen this issue is to file a Supplemental Claim with new, relevant evidence that the VA has not previously considered.`;
        formNeeded = 'VA Form 20-0995';
        formUrl = 'https://www.va.gov/find-forms/about-form-20-0995/';
        alertLevel = 'critical';
      } else {
        if (hasNewEvidence === 'yes') {
          recommendation = 'Supplemental Claim (VA Form 20-0995)';
          description = 'Because you have new and relevant evidence (such as a syllabus, medical provider statement, or quote) that the VA has not reviewed, a Supplemental Claim is the optimal route. This triggers the VA\'s duty to assist in gathering additional evidence and yields a new decision.';
          formNeeded = 'VA Form 20-0995';
          formUrl = 'https://www.va.gov/find-forms/about-form-20-0995/';
          alertLevel = 'warning';
        } else {
          recommendation = 'Higher-Level Review (VA Form 20-0996)';
          description = 'If you have no new evidence but believe the VRC made a clear factual or legal error based strictly on the current records in your eFolder, request a Higher-Level Review (HLR). A senior reviewer will perform a de novo review. No new evidence can be submitted.';
          formNeeded = 'VA Form 20-0996';
          formUrl = 'https://www.va.gov/find-forms/about-form-20-0996/';
          alertLevel = 'warning';
        }
      }
    } else if (hasWrittenNotice === 'email') {
      status = 'informal';
      recommendation = 'Written Rationale Request & Supervisor Escalation';
      description = 'An email, phone call, or verbal notification is NOT a legally binding decision. Under 38 U.S.C. § 5104, the VA is required to provide formal written notice with reasons and bases. A Higher-Level Review or Board Appeal cannot be filed yet; doing so will result in an administrative rejection. You must first request a formal written decision.';
      formNeeded = 'Custom Written Rationale Request Letter';
      alertLevel = 'important';
    } else {
      status = 'none';
      recommendation = 'Administrative Inquiry / VRC Follow-Up';
      description = 'No formal decision has been communicated. If your request is delayed, do not attempt to file formal appeals. Log your contact timeline, draft a formal status query, and escalate to a supervisor if the counselor does not respond within 5 business days.';
      alertLevel = 'info';
    }

    setAnalysisResult({
      status,
      recommendation,
      description,
      formNeeded,
      formUrl,
      alertLevel,
      errors,
      deadline: stats
    });
  };

  const resetAnalyzer = () => {
    setHasWrittenNotice('no');
    setNoticeDate('');
    setDeniedBenefit('supplies');
    setHasForm200998('yes');
    setListsEvidence('yes');
    setHasNewEvidence('yes');
    setAnalysisResult(null);
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <ShieldAlert size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Written Decision Analyzer</h1>
          <p className="text-[11px] text-slate-400">Determine whether counselor pushback constitutes a legally appealable decision and map your optimal review lane.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intake Form (7 Columns) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Question 1 */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Decision Communication</span>
            <label className="text-xs font-semibold text-slate-200 block">How did the VA communicate the denial or pushback?</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer select-none">
                <input
                  type="radio"
                  name="decision_notice"
                  checked={hasWrittenNotice === 'yes'}
                  onChange={() => setHasWrittenNotice('yes')}
                  className="accent-indigo-500"
                />
                <span>Formal Written Decision Notice Letter</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer select-none">
                <input
                  type="radio"
                  name="decision_notice"
                  checked={hasWrittenNotice === 'email'}
                  onChange={() => setHasWrittenNotice('email')}
                  className="accent-indigo-500"
                />
                <span>Email, Text Message, or Phone Call only</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer select-none">
                <input
                  type="radio"
                  name="decision_notice"
                  checked={hasWrittenNotice === 'no'}
                  onChange={() => setHasWrittenNotice('no')}
                  className="accent-indigo-500"
                />
                <span>No official notice has been given (Delay)</span>
              </label>
            </div>
          </div>

          {/* Conditional Formal Questions */}
          {hasWrittenNotice === 'yes' && (
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4"
            >
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Formal Notice Auditing</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Letter Date</label>
                  <input
                    type="date"
                    value={noticeDate}
                    onChange={(e) => setNoticeDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-205 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Denied Benefit / Item</label>
                  <select
                    value={deniedBenefit}
                    onChange={(e) => setDeniedBenefit(e.target.value)}
                    className="w-full h-10 bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-205"
                    aria-label="Select denied benefit"
                  >
                    <option value="supplies">Supplies / Laptop Package</option>
                    <option value="tuition">Tuition / Private School Billing</option>
                    <option value="feasibility">Entitlement / Feasibility Determination</option>
                    <option value="seh">48-Month Limit / SEH Extension</option>
                    <option value="il">Independent Living (IL) Services</option>
                    <option value="status">Rehab Status / Case Closure</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-slate-200 block">Does the letter include VA Form 20-0998 (Your Rights to Seek Further Review)?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                    <input
                      type="radio"
                      name="form_rights"
                      checked={hasForm200998 === 'yes'}
                      onChange={() => setHasForm200998('yes')}
                      className="accent-indigo-500"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                    <input
                      type="radio"
                      name="form_rights"
                      checked={hasForm200998 === 'no'}
                      onChange={() => setHasForm200998('no')}
                      className="accent-indigo-500"
                    />
                    <span>No (Missing)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-200 block">Does the letter explicitly list the specific evidence considered?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                    <input
                      type="radio"
                      name="evidence_list"
                      checked={listsEvidence === 'yes'}
                      onChange={() => setListsEvidence('yes')}
                      className="accent-indigo-500"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                    <input
                      type="radio"
                      name="evidence_list"
                      checked={listsEvidence === 'no'}
                      onChange={() => setListsEvidence('no')}
                      className="accent-indigo-500"
                    />
                    <span>No (Missing)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-200 block">Do you have new and relevant evidence to submit that the VA has not reviewed yet?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                    <input
                      type="radio"
                      name="new_evidence"
                      checked={hasNewEvidence === 'yes'}
                      onChange={() => setHasNewEvidence('yes')}
                      className="accent-indigo-500"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                    <input
                      type="radio"
                      name="new_evidence"
                      checked={hasNewEvidence === 'no'}
                      onChange={() => setHasNewEvidence('no')}
                      className="accent-indigo-500"
                    />
                    <span>No, strictly legal dispute</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={resetAnalyzer} className="btn btn-secondary text-xs py-2">Reset</button>
            <button onClick={handleAnalyze} className="btn btn-primary text-xs py-2">Run Analysis</button>
          </div>
        </div>

        {/* Right Column: Output Strategy (5 Columns) */}
        <div className="lg:col-span-5">
          {analysisResult ? (
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Core recommendation panel */}
              <div className={`p-5 border rounded-xl bg-slate-950/40 space-y-3 ${
                analysisResult.alertLevel === 'critical' 
                  ? 'border-red-500/30 bg-red-950/5' 
                  : analysisResult.alertLevel === 'important'
                  ? 'border-amber-500/30 bg-amber-950/5'
                  : 'border-blue-500/30 bg-blue-950/5'
              }`}>
                <div className="flex gap-2 items-center">
                  <AlertTriangle size={18} className={
                    analysisResult.alertLevel === 'critical' 
                      ? 'text-red-400' 
                      : analysisResult.alertLevel === 'important'
                      ? 'text-amber-400'
                      : 'text-blue-400'
                  } />
                  <span className="text-xs font-bold text-slate-100">Optimal Lane: {analysisResult.recommendation}</span>
                </div>

                <p className="text-[10px] text-slate-350 leading-relaxed">
                  {analysisResult.description}
                </p>

                {analysisResult.formNeeded && (
                  <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Required Document:</span>
                    {analysisResult.formUrl ? (
                      <a 
                        href={analysisResult.formUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>{analysisResult.formNeeded}</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-slate-200 font-bold">{analysisResult.formNeeded}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Deadline countdown */}
              {analysisResult.deadline && (
                <div className={`p-4 border rounded-xl text-xs bg-slate-950/20 ${
                  analysisResult.deadline.isExpired 
                    ? 'border-red-950 text-red-400' 
                    : analysisResult.deadline.daysRemaining <= 60
                    ? 'border-amber-950 text-amber-400'
                    : 'border-slate-850 text-slate-300'
                }`}>
                  <span className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Time Remaining to Appeal</span>
                  {analysisResult.deadline.isExpired ? (
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Deadine Passed ({Math.abs(analysisResult.deadline.daysRemaining)} days ago)</span>
                    </div>
                  ) : (
                    <div className="font-bold flex items-center justify-between">
                      <span>{analysisResult.deadline.daysRemaining} Days Left</span>
                      <span className="font-normal text-[10px] text-slate-450">Deadline: {analysisResult.deadline.deadlineDate}</span>
                    </div>
                  )}
                  {!analysisResult.deadline.isExpired && (
                    <div className="w-full bg-slate-950 border border-slate-850 h-2 rounded mt-2 overflow-hidden">
                      <div 
                        className={`h-full ${
                          analysisResult.deadline.daysRemaining <= 60 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, (analysisResult.deadline.daysRemaining / 365) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Procedural errors checklist */}
              {analysisResult.errors.length > 0 && (
                <div className="bg-red-950/10 border border-red-950/50 rounded-xl p-5 space-y-3">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <ShieldAlert size={12} />
                    VA Procedural Violations Identified
                  </span>
                  <div className="space-y-2">
                    {analysisResult.errors.map((err, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/40 border border-red-950/40 rounded-lg text-xs leading-normal">
                        <span className="font-semibold text-slate-200 block">{err.title}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">{err.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Guidelines box */}
              <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-4 text-[10px] text-slate-400 leading-relaxed space-y-2">
                <div className="flex gap-1 items-center">
                  <Info size={14} className="text-indigo-400 shrink-0" />
                  <span className="font-bold text-slate-300">Appeal Modernization Act (AMA) Rules</span>
                </div>
                <p>
                  Always preserve your 365-day appeal timeline. Filing a Supplemental Claim maintains your original effective date of benefits if filed within one year of the decision. Filing an appeal on the wrong form or without a written notice causes administrative delays.
                </p>
              </div>

            </motion.div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 border border-dashed border-slate-850 rounded-xl text-xs text-slate-500 font-semibold min-h-[300px]">
              <HelpCircle size={32} className="text-slate-700 mb-3" />
              <span>Enter your decision details and click "Run Analysis" to receive strategic review recommendations.</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default WrittenDecisionAnalyzerView;

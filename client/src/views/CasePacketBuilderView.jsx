/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import disputeAreas from '../data/workflows/disputeAreas.json';

function CasePacketBuilderView({ reduceMotion, userMode, setUserMode }) {
  const [step, setStep] = useState(1); // 1: Issue & Intake, 2: Evidence Scoring, 3: Errors & Citations, 4: Compiled Packet
  const [selectedArea, setSelectedArea] = useState(disputeAreas[0]);
  
  // Intake Inputs
  const [userName, setUserName] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [schoolOrProgram, setSchoolOrProgram] = useState('');
  const [personalContext, setPersonalContext] = useState('');
  const [caseStage, setCaseStage] = useState('evaluation_planning');
  
  // Written Decision Analyzer inputs
  const [hasWrittenNotice, setHasWrittenNotice] = useState('no'); // 'yes' | 'no' | 'email'
  const [noticeDate, setNoticeDate] = useState('');
  const [noticeReason, setNoticeReason] = useState('');


  // Checked Evidence Checkboxes
  const [checkedEvidence, setCheckedEvidence] = useState({}); // { [evidenceId]: boolean }

  // Selected Errors & Citations
  const [selectedErrors, setSelectedErrors] = useState({});
  const [selectedCitations, setSelectedCitations] = useState({});

  const [copySuccess, setCopySuccess] = useState(false);

  // Initialize checks on area change
  useEffect(() => {
    const initialErrors = {};
    selectedArea.vrcArguments.forEach(err => { initialErrors[err.id] = true; });
    setSelectedErrors(initialErrors);

    const initialCitations = {};
    selectedArea.citations.forEach((_, idx) => { initialCitations[idx] = true; });
    setSelectedCitations(initialCitations);

    setCheckedEvidence({});
    setCopySuccess(false);
  }, [selectedArea]);

  const toggleEvidence = (id) => {
    setCheckedEvidence(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleError = (id) => {
    setSelectedErrors(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCitation = (idx) => {
    setSelectedCitations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Score Evidence
  const evidenceScore = selectedArea.evidenceChecklist.reduce((acc, item) => {
    return checkedEvidence[item.id] ? acc + item.weight : acc;
  }, 0);

  const getScoreInfo = (score) => {
    if (score >= 75) return { label: 'Strong Evidence Package', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20' };
    if (score >= 50) return { label: 'Medium / Developing Evidence', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/20' };
    return { label: 'Weak / Incomplete Evidence', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-950/20' };
  };

  const scoreInfo = getScoreInfo(evidenceScore);
  const missingEvidence = selectedArea.evidenceChecklist.filter(e => !checkedEvidence[e.id]);

  // Review Lane selector rules
  const getReviewLaneRecommendation = () => {
    if (hasWrittenNotice === 'yes') {
      return {
        lane: 'Decision Review Request (HLR or Supplemental Claim)',
        why: 'Since you received a formal written decision (VA Form 20-0998) on ' + (noticeDate || '[DATE]') + ', you can file a Higher-Level Review (VAF 20-0996) or Supplemental Claim (VAF 20-0995). Reason given was: "' + (noticeReason || 'Unspecified') + '".',
        alertLevel: 'warning'
      };
    }
    if (hasWrittenNotice === 'email') {
      return {
        lane: 'Written Rationale Request & VREO Escalation',
        why: 'An email is NOT a formal VA decision. Under 38 U.S.C. § 5104, the VA must issue a formal decision notice. Do NOT file HLR/Board appeals yet; request a written decision first.',
        alertLevel: 'important'
      };
    }
    return {
      lane: 'Administrative Correction / Supervisor Contact',
      why: 'No formal written decision has been made. Escalating to formal HLR appeals is premature and will result in rejection. Work with a supervisor first.',
      alertLevel: 'info'
    };
  };

  const reviewLane = getReviewLaneRecommendation();

  // Compile Strategy Brief based on selected userMode
  const compileStrategyBrief = () => {
    const activeCitations = selectedArea.citations.filter((_, idx) => selectedCitations[idx]);
    const activeErrors = selectedArea.vrcArguments.filter(err => selectedErrors[err.id]);
    const activeEvidence = selectedArea.evidenceChecklist.filter(e => checkedEvidence[e.id]);

    const headerText = `CASE PACKET MEMORANDUM\nDISPUTE: ${selectedArea.name.toUpperCase()}\nVETERAN: ${userName || '[VETERAN NAME]'}\nCLAIM NUMBER: ${claimNumber || '[CLAIM NUMBER]'}\nDATE: ${new Date().toLocaleDateString()}\nUSER MODE: ${userMode.toUpperCase()}\n`;

    // 1. Veteran Mode: Simple, plain-English, actions
    if (userMode === 'veteran') {
      return `${headerText}
============================================================
SUMMARY OF WHAT HAPPENED:
I am currently in the "${caseStage.replace(/_/g, ' ')}" stage of my rehabilitation.
I requested: "${schoolOrProgram || '[EXPLAIN REQUEST]'}"
My counselor denied this, saying: "${noticeReason || '[VRC DENIAL STATEMENT]'}"
This denial is causing me issues because: "${personalContext || '[EXPLAIN IMPACT]'}"

EVIDENCE I HAVE COLLECTED:
${activeEvidence.map(e => `* [x] ${e.text}`).join('\n') || 'No evidence checked'}

MISSING EVIDENCE GAPS:
${missingEvidence.map(e => `* [ ] Need to get: ${e.text}`).join('\n') || 'None'}

BEST NEXT ACTION STEPS:
1. ${reviewLane.lane}
   Why: ${reviewLane.why}
2. Send a counselor email requesting a supervisor conference if they refuse to respond.
3. Attach the completed evidence items to your email.`;
    }

    // 2. Advocate Mode: IRAC Format (Issue, Rule, Analysis, Conclusion)
    if (userMode === 'advocate') {
      return `${headerText}
============================================================
1. ISSUE:
Whether the Department of Veterans Affairs erred in denying the Veteran's request for "${schoolOrProgram || '[REQUEST]'}" under Chapter 31 VR&E guidelines.

2. RULE:
Under Chapter 31 regulations, the VA has a duty to assist the claimant and provide necessary rehabilitation services:
${activeCitations.map(c => `* ${c.citation}: ${c.relevance}`).join('\n')}

3. ANALYSIS & ERRORS IDENTIFIED:
The counselor asserted that: "${noticeReason || '[VRC DENIAL STATEMENT]'}".
This argument contains the following administrative errors:
${activeErrors.map((err, i) => `${i+1}. Error: ${err.label}\n   Correction: ${err.correction}`).join('\n')}

We mitigate the counselor's stance by submitting the following evidence:
${activeEvidence.map(e => `* Submitted: ${e.text}`).join('\n')}

4. CONCLUSION & ACTION:
Based on the rules and evidence, the denial should be reversed. We recommend: ${reviewLane.lane}.`;
    }

    // 3. School Mode: Billing compliance & invoice checklists
    if (userMode === 'school') {
      return `${headerText}
============================================================
SCHOOL COMPLIANCE & BILLING STATUS:
Veteran is enrolled in program: "${schoolOrProgram || '[PROGRAM NAME]'}"
VA Authorization Status: ${hasWrittenNotice === 'yes' ? 'Decision Issued' : 'Awaiting Authorization'}

TUITION BILLING CHECKLIST (38 C.F.R. § 21.262):
* [ ] Verify enrollment certification is uploaded in Enrollment Manager.
* [ ] Confirm VRC submitted billing authorization in Tungsten portal.
* [ ] Ensure the school invoice matches the authorization parameters.

38 C.F.R. § 21.262 BILLING COMPLIANCE STATEMENT:
The training facility is advised that under federal regulations, the VA is billed directly. The student is protected from enrollment drop penalties, course cancellations, or late fees due to payment delays by the VA Regional Office.`;
    }

    // 4. Legal Mode: Full citations, hierarchical brief
    return `${headerText}
============================================================
FORMAL STRATEGIC BRIEF IN SUPPORT OF CLAIM
SUBJECT: VR&E Chapter 31 Objection Brief — ${selectedArea.name}

1. JURISDICTION & GOVERNING AUTHORITY
The Claimant asserts that this dispute is governed by the following hierarchical legal authorities:
A. STATUTORY MANDATE:
${activeCitations.filter(c => c.level === 'binding-statute').map(c => `* ${c.citation}: ${c.relevance}`).join('\n') || '* 38 U.S.C. Chapter 31'}

B. REGULATORY REQUIREMENT:
${activeCitations.filter(c => c.level === 'binding-regulation').map(c => `* ${c.citation}: ${c.relevance}`).join('\n') || '* 38 C.F.R. Part 21'}

C. VA POLICY MANUAL:
${activeCitations.filter(c => c.level === 'va-policy').map(c => `* ${c.citation}: ${c.relevance}`).join('\n') || '* M28C Manual Guidelines'}

2. SUBSTANTIVE ERRORS OF THE DECISION
The administrative decision notice issued on ${noticeDate || '[DATE]'} contains the following errors:
${activeErrors.map((err, i) => `${i+1}. Procedural Error: ${err.label}\n   Controlling Correction: ${err.correction}`).join('\n')}

3. REBUTTAL NARRATIVE & MITIGATION STRATEGY
The Claimant submits that the physical/cognitive limitations from service-connected conditions ({{serviceConnectedConditions}}) constitute a barrier to suitable employment, satisfying the entitlement requirements under 38 C.F.R. § 21.51.

4. REQUESTED PROCEDURAL RELIEF
Claimant requests an administrative review under 38 C.F.R. § 21.416 and a supervisor conference.`;
  };

  const handleCopy = () => {
    const text = compileStrategyBrief();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    const text = compileStrategyBrief();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Case Packet - ${selectedArea.name}</title>
          <style>
            body { font-family: Courier, monospace; white-space: pre-wrap; padding: 45px; color: #000; font-size: 0.85rem; line-height: 1.5; }
            h1 { font-family: sans-serif; font-size: 1.3rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>VR&E Strategic Case Brief</h1>
          <div>${text}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadJson = () => {
    const packet = {
      userName,
      claimNumber,
      schoolOrProgram,
      caseStage,
      selectedArea: selectedArea.id,
      checkedEvidence,
      selectedErrors,
      selectedCitations,
      date: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vre_case_packet_${selectedArea.id}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetPacket = () => {
    setStep(1);
    setUserName('');
    setClaimNumber('');
    setSchoolOrProgram('');
    setPersonalContext('');
    setHasWrittenNotice('no');
    setNoticeDate('');
    setNoticeReason('');
    setCheckedEvidence({});
    setCopySuccess(false);
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <FileText size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Case Packet Builder</h1>
          <p className="text-[11px] text-slate-400">Compile litigation-grade folders containing facts, evidence checkpoints, legal codes, and custom letters.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* Step Stepper Header */}
      <div className="flex items-center justify-between mb-6 bg-slate-900/20 p-3 border border-slate-850 rounded-xl text-[11px] font-semibold text-slate-400">
        <span className={step === 1 ? 'text-indigo-400' : ''}>1. Issue & Intake</span>
        <span>&rarr;</span>
        <span className={step === 2 ? 'text-indigo-400' : ''}>2. Evidence Scorer</span>
        <span>&rarr;</span>
        <span className={step === 3 ? 'text-indigo-400' : ''}>3. Citations & Errors</span>
        <span>&rarr;</span>
        <span className={step === 4 ? 'text-indigo-400' : ''}>4. Compile Packet</span>
      </div>

      {/* STEP 1: ISSUE & INTAKE */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Select Dispute / Denial Area</label>
              <select
                className="form-control bg-slate-950 border-slate-800 text-xs text-slate-100 h-10 w-full"
                value={selectedArea.id}
                onChange={(e) => {
                  const area = disputeAreas.find(a => a.id === e.target.value);
                  if (area) setSelectedArea(area);
                }}
                aria-label="Select dispute area"
              >
                {disputeAreas.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">{selectedArea.description}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Active Case Stage</label>
              <select
                className="form-control bg-slate-950 border-slate-800 text-xs text-slate-100 h-10 w-full"
                value={caseStage}
                onChange={(e) => setCaseStage(e.target.value)}
                aria-label="Select case stage"
              >
                <option value="applicant">Applicant Status</option>
                <option value="evaluation_planning">Evaluation and Planning</option>
                <option value="extended_evaluation">Extended Evaluation</option>
                <option value="rehabilitation_employability">RTE (Rehabilitation to Employability)</option>
                <option value="independent_living">Independent Living Program</option>
                <option value="employment_services">Employment Services</option>
                <option value="interrupted">Interrupted</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Decision Review Intake</span>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-200 block">Did the VA issue a formal written decision? (Form 20-0998)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                  <input
                    type="radio"
                    name="written_notice"
                    checked={hasWrittenNotice === 'yes'}
                    onChange={() => setHasWrittenNotice('yes')}
                    className="accent-indigo-500"
                  />
                  <span>Yes, formal letter</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                  <input
                    type="radio"
                    name="written_notice"
                    checked={hasWrittenNotice === 'email'}
                    onChange={() => setHasWrittenNotice('email')}
                    className="accent-indigo-500"
                  />
                  <span>Email or verbal notice only</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                  <input
                    type="radio"
                    name="written_notice"
                    checked={hasWrittenNotice === 'no'}
                    onChange={() => setHasWrittenNotice('no')}
                    className="accent-indigo-500"
                  />
                  <span>No decision issued yet</span>
                </label>
              </div>

              {hasWrittenNotice === 'yes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Notice Date</label>
                    <input
                      type="date"
                      value={noticeDate}
                      onChange={(e) => setNoticeDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-205"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Reason Stated in Notice</label>
                    <input
                      type="text"
                      placeholder="e.g. entry-level jobs do not require graduate degrees"
                      value={noticeReason}
                      onChange={(e) => setNoticeReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-205"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Veteran Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-slate-205"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">VA Claim Number</label>
              <input
                type="text"
                placeholder="XXX-XX-1234"
                value={claimNumber}
                onChange={(e) => setClaimNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-slate-205"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Disputed Program / Item</label>
              <input
                type="text"
                placeholder="e.g. MS in Counseling tuition, or supplies"
                value={schoolOrProgram}
                onChange={(e) => setSchoolOrProgram(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-slate-205"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Describe Personal Impact / Disability Restrictions</label>
            <textarea
              placeholder="Explain why this request is medically necessary or how the delay is causing academic drop risks..."
              value={personalContext}
              onChange={(e) => setPersonalContext(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-205 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="btn btn-primary">
              Next: Evidence Scorer &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: EVIDENCE SCORING */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-xs font-bold text-slate-200">Select Enclosed Evidence</h3>
              <div className="space-y-2">
                {selectedArea.evidenceChecklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleEvidence(item.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition select-none flex items-center justify-between text-xs ${
                      checkedEvidence[item.id]
                        ? 'bg-indigo-500/5 border-indigo-800/80 text-slate-200'
                        : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!checkedEvidence[item.id]}
                        onChange={() => {}}
                        className="pointer-events-none accent-indigo-500"
                      />
                      <span>{item.text}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">+{item.weight} pts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Sufficiency</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-350">{scoreInfo.label}</span>
                  <span className="font-bold font-mono text-slate-200">{evidenceScore} / 100</span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-850 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-350 ${
                      evidenceScore >= 75 ? 'bg-emerald-500' : evidenceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${evidenceScore}%` }}
                  />
                </div>
              </div>

              {/* Gaps Panel */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Evidence Gap Warnings</span>
                {missingEvidence.length > 0 ? (
                  <div className="space-y-2">
                    {missingEvidence.map(e => (
                      <div key={e.id} className="flex gap-2 items-start text-[10px] text-slate-400 bg-slate-950/20 p-2.5 border border-slate-850 rounded">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Missing:</strong> {e.text} (Gathering this prevents VRC claims of lack of necessity).</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2 items-center text-[10px] text-emerald-400 bg-slate-950/20 p-3 border border-emerald-900/30 rounded">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>All core evidence items checked! Case strength maximized.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              &larr; Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary">
              Next: Citations & Errors &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CITATIONS & ERRORS */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Citations list */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Governing Citations</span>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {selectedArea.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleCitation(idx)}
                    className={`border rounded-lg p-3 cursor-pointer transition select-none flex items-start gap-2.5 ${
                      selectedCitations[idx]
                        ? 'bg-indigo-500/5 border-indigo-800/80'
                        : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedCitations[idx]}
                      onChange={() => {}}
                      className="mt-0.5 pointer-events-none accent-indigo-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-200">{cite.citation}</span>
                      <p className="text-[10px] text-slate-400 leading-normal">{cite.relevance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Counselor Errors */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Refute Counselor Errors</span>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {selectedArea.vrcArguments.map(err => (
                  <div
                    key={err.id}
                    onClick={() => toggleError(err.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition select-none flex items-start gap-2.5 ${
                      selectedErrors[err.id]
                        ? 'bg-indigo-500/5 border-indigo-800/80'
                        : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedErrors[err.id]}
                      onChange={() => {}}
                      className="mt-0.5 pointer-events-none accent-indigo-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-205">{err.label}</span>
                      <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                        <strong>Legal Correction:</strong> {err.correction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rebuttal/Pushback Info */}
          {selectedArea.rebuttalPushback && (
            <div className="bg-amber-950/10 border border-amber-900/20 rounded-xl p-4 flex gap-2 text-xs text-amber-400">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>Rebuttal/Pushback warning:</strong> {selectedArea.rebuttalPushback}
              </div>
            </div>
          )}

          {/* Adverse Facts / Weaknesses Panel */}
          {selectedArea.adverseFacts && selectedArea.adverseFacts.length > 0 && (
            <div className="bg-red-950/10 border border-red-900/20 rounded-xl p-5 space-y-3">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle size={12} />
                Adverse Facts & Weaknesses ("VA May Argue")
              </span>
              <div className="space-y-2">
                {selectedArea.adverseFacts.map(fact => (
                  <div key={fact.id} className="p-3 bg-slate-950/40 border border-red-950/50 rounded-lg text-xs">
                    <span className="font-semibold text-slate-200 block">{fact.text}</span>
                    <span className="text-[10px] text-slate-450 block mt-1">
                      <strong className="text-indigo-400">How to strengthen:</strong> {fact.rule}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              &larr; Back
            </button>
            <button onClick={() => setStep(4)} className="btn btn-primary">
              Next: Compile Packet &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: COMPILED PACKET PREVIEW */}
      {step === 4 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between bg-slate-950/30 border border-slate-800 rounded-xl p-4 gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-350">
              <span>Select Output User Mode:</span>
              <select
                value={userMode}
                onChange={(e) => setUserMode(e.target.value)}
                className="bg-slate-900 border-slate-800 text-[11px] rounded p-1 text-slate-202"
                aria-label="Select brief mode"
              >
                <option value="veteran">Veteran Mode (Plain English)</option>
                <option value="advocate">Advocate Mode (IRAC Format)</option>
                <option value="school">School Mode (Compliance)</option>
                <option value="legal">Legal Mode (Hierarchical Brief)</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadJson} className="btn btn-sm btn-secondary flex items-center gap-1.5 h-8">
                <Download size={14} />
                <span>Save JSON Packet</span>
              </button>
              <button onClick={handleCopy} className="btn btn-sm btn-secondary flex items-center gap-1.5 h-8">
                {copySuccess ? <CheckCircle size={14} className="text-emerald-400" /> : <FileText size={14} />}
                <span>{copySuccess ? 'Copied' : 'Copy Brief'}</span>
              </button>
              <button onClick={handlePrint} className="btn btn-sm btn-primary flex items-center gap-1.5 h-8">
                <Printer size={14} />
                <span>Print Packet Brief</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Brief preview */}
            <div className="lg:col-span-8 bg-slate-950/40 border border-slate-800 rounded-xl p-6 overflow-y-auto max-h-[500px]">
              <pre className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                {compileStrategyBrief()}
              </pre>
            </div>

            {/* Action plan details */}
            <div className="lg:col-span-4 space-y-4 h-fit">
              {/* Review lane warning */}
              <div className={`p-4 border rounded-xl bg-slate-950/40 ${
                reviewLane.alertLevel === 'important' ? 'border-red-500/30' : reviewLane.alertLevel === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className={
                    reviewLane.alertLevel === 'important' ? 'text-red-400' : reviewLane.alertLevel === 'warning' ? 'text-amber-400' : 'text-blue-400'
                  } />
                  <span className="text-xs font-bold text-slate-200">Appeal Status: {reviewLane.lane}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  {reviewLane.why}
                </p>
              </div>

              {/* Ingestion warning */}
              <div className="p-4 border border-indigo-900/30 bg-indigo-950/10 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Source Confidence & Verification</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Note: While statutes and CFR rules are verified as 100% complete, M28C guidelines displayed are partial summaries. Please check the official KnowVA repository to verify recent manual updates.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="btn btn-secondary">
              &larr; Back
            </button>
            <button onClick={resetPacket} className="btn btn-secondary">
              Reset Packet
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default CasePacketBuilderView;

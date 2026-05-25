import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Clipboard, Printer, CheckCircle, Scale, ShieldAlert, 
  ChevronRight, RotateCcw, ArrowRight 
} from 'lucide-react';
import AuthorityBadge from '../components/AuthorityBadge';

const DISPUTE_AREAS = [
  {
    id: 'computer_denial',
    name: 'Computer & Supplies Denial',
    description: 'VRC denied a computer package, laptop, or other training supplies by claiming a flat dollar cap or that VR&E does not cover tech.',
    evidenceChecklist: [
      'Official syllabus showing the computer/software requirement',
      'School policy letter stating all students require a laptop',
      'VRC denial letter (if written) or email correspondence',
      'Medical or VRC statement describing physical or cognitive necessity for adaptive tech'
    ],
    legalErrors: [
      { id: 'flat_cap', label: 'VRC claimed a flat dollar cap (e.g., $500/year) for supplies.', correction: 'VA policy and 38 C.F.R. § 21.212 dictate that approved supplies are 100% covered and uncapped based on individual necessity.' },
      { id: 'no_necessity_analysis', label: 'VRC denied without conducting a written, individualized necessity analysis.', correction: 'M28C procurement rules require VRCs to document a structured necessity analysis before denying.' },
      { id: 'ch33_conflation', label: 'VRC conflated Chapter 31 with Chapter 33 GI Bill limits.', correction: 'Chapter 31 VR&E is a rehabilitation program with uncapped necessary supplies, unlike the fixed Chapter 33 book stipend.' }
    ],
    citations: [
      { citation: '38 U.S.C. § 3104(a)(7)', level: 'binding_law', relevance: 'Authorizes the provision of books, supplies, and equipment necessary for rehabilitation.' },
      { citation: '38 C.F.R. § 21.212', level: 'binding_law', relevance: 'Declares the general policy that VA will furnish necessary supplies for a veteran to pursue training.' },
      { citation: '38 C.F.R. § 21.220', level: 'binding_law', relevance: 'Governs computer packages and assistive technology packages based on Peer Disadvantage or Disability.' },
      { citation: 'M28C.V.B.5.01', level: 'va_manual', relevance: 'Outlines cost approval thresholds and requires counselors to analyze individual necessity.' }
    ]
  },
  {
    id: 'seh_extension',
    name: '48-Month Entitlement Extension Denial',
    description: 'VRC refused to extend the 48-month entitlement cap, asserting that the limit is statutory and cannot be waived.',
    evidenceChecklist: [
      'Initial entitlement letter showing a Serious Employment Handicap (SEH) finding',
      'Current IPE/IWRP copy',
      'Transcripts showing incomplete coursework/rehabilitation objectives',
      'Labor market reports showing that the current objective is the only viable path to suitable employment'
    ],
    legalErrors: [
      { id: 'hard_cap', label: 'VRC stated the 48-month cap is absolute and cannot be extended.', correction: '38 U.S.C. § 3105 and 38 C.F.R. § 21.78 explicitly permit extensions beyond 48 months for veterans with an SEH.' },
      { id: 'delegation_denial', label: 'VRC claimed only the Central Office or VREO can sign extensions.', correction: 'Under the 2024 final rule, extension concurrence authority is fully delegable to ease administrative processing.' }
    ],
    citations: [
      { citation: '38 U.S.C. § 3105(c)', level: 'binding_law', relevance: 'Explicitly permits the Secretary to authorize services beyond 48 months to overcome a Serious Employment Handicap.' },
      { citation: '38 C.F.R. § 21.44', level: 'binding_law', relevance: 'Authorizes extension of the basic period of eligibility for veterans with an SEH.' },
      { citation: '38 C.F.R. § 21.78', level: 'binding_law', relevance: 'Sets forth criteria for approving programs of rehabilitation services beyond 48 months.' }
    ]
  },
  {
    id: 'retroactive_induction',
    name: 'Retroactive Induction Reimbursement Denial',
    description: 'VRC denied reimbursement for past tuition or supplies, claiming dual benefit rules prohibit retroactive adjustments.',
    evidenceChecklist: [
      'DD-214 and VA Rating Decision establishing disability rating existed during the past training',
      'Tuition invoices, itemized school bills, and payment receipts',
      'Transcripts showing completed courses and grades during the retroactive period',
      'Approved IPE/IWRP showing the vocational goal is related to past training'
    ],
    legalErrors: [
      { id: 'pre_app_denial', label: 'VRC asserted that retroactive induction cannot cover periods before the date of VR&E application.', correction: '38 C.F.R. § 21.282 and M28C.V.B.6 permit retroactive induction covering training prior to application date.' },
      { id: 'ch33_used', label: 'VRC claimed retroactive adjustment is barred because Chapter 33 Post-9/11 GI Bill was used.', correction: 'VA manual M28C.V.B.6 authorizes adjusting past Chapter 33 usage to Chapter 31, restoring the GI Bill months.' }
    ],
    citations: [
      { citation: '38 U.S.C. § 3104(a)(1)', level: 'binding_law', relevance: 'Authorizes retroactively adjusting benefits and providing reimbursement for past training.' },
      { citation: '38 C.F.R. § 21.282', level: 'binding_law', relevance: 'Sets rules for effective date of induction, authorizing retroactive induction for eligible veterans.' },
      { citation: 'M28C.V.B.6', level: 'va_manual', relevance: 'Details operational steps for VRCs to process retroactive adjustments and restore GI Bill months.' }
    ]
  },
  {
    id: 'feasibility_denial',
    name: 'Reasonable Feasibility / Extended Evaluation Denial',
    description: 'VRC denied feasibility of achieving a vocational goal, refusing to offer an Extended Evaluation and pushing straight to program closure.',
    evidenceChecklist: [
      'VRC evaluation report asserting unfeasibility',
      'Physician or therapist statement asserting employment is possible with accommodations',
      'Records of recent volunteer work, courses completed, or hobbies showing capacity to perform tasks'
    ],
    legalErrors: [
      { id: 'checklist_decision', label: 'VRC denied feasibility based on a standardized checklist or test score rather than individualized assessment.', correction: 'Feasibility decisions require a comprehensive, multidisciplinary assessment under 38 C.F.R. § 21.50.' },
      { id: 'doubt_resolved_against', label: 'VRC resolved clinical or vocational ambiguities against the veteran.', correction: '38 C.F.R. § 21.57 commands that VRCs must resolve all reasonable doubt in favor of the veteran.' }
    ],
    citations: [
      { citation: '38 U.S.C. § 3106(a)', level: 'binding_law', relevance: 'Requires the Secretary to conduct initial evaluations and determine feasibility.' },
      { citation: '38 C.F.R. § 21.57', level: 'binding_law', relevance: 'Requires VRCs to resolve all doubts about feasibility in favor of the veteran.' },
      { citation: '38 C.F.R. § 21.74', level: 'binding_law', relevance: 'Governs Extended Evaluations, which must be provided to determine feasibility when uncertainty exists.' }
    ]
  },
  {
    id: 'il_denial',
    name: 'Independent Living Services Denial',
    description: 'VRC denied Independent Living services, claiming the veteran is capable of some sedentary work or that home modifications are capped.',
    evidenceChecklist: [
      'VRC written determination stating vocational training is currently unfeasible',
      'Independent occupational therapy evaluation detailing daily living boundaries',
      'Medical statements detailing severe limitations in bathing, mobility, or home accessibility'
    ],
    legalErrors: [
      { id: 'sedentary_capacity', label: 'VRC denied IL services solely because the veteran has minor sedentary vocational capacity.', correction: 'Under 38 C.F.R. § 21.160, VRC must analyze home-independence limitations even if some work capacity remains.' },
      { id: 'modification_cap', label: 'VRC asserted there is an arbitrary local cap on home modifications.', correction: 'Home adaptions are governed by statutory limits and require specialized engineering surveys, not local office limits.' }
    ],
    citations: [
      { citation: '38 U.S.C. § 3120', level: 'binding_law', relevance: 'Authorizes programs of independent living services and assistance.' },
      { citation: '38 C.F.R. § 21.160', level: 'binding_law', relevance: 'Sets forth the general overview and purposes of independent living services.' },
      { citation: '38 C.F.R. § 21.162', level: 'binding_law', relevance: 'Details participation criteria for independent living service programs.' }
    ]
  }
];

function ClaimArgumentBuilderView({ reduceMotion }) {
  const [step, setStep] = useState(1); // 1: Select Area, 2: Input Facts, 3: Citations & Errors, 4: Compiled Brief
  const [selectedArea, setSelectedArea] = useState(DISPUTE_AREAS[0]);
  
  // User Inputs
  const [userFacts, setUserFacts] = useState({
    veteranName: '',
    claimNumber: '',
    schoolOrProgram: '',
    counselorArgument: '', // what the VRC said/denied
    personalContext: '', // veteran's side of story
  });

  const [selectedErrors, setSelectedErrors] = useState({}); // { [errorId]: boolean }
  const [selectedCitations, setSelectedCitations] = useState({}); // { [citationIndex]: boolean }
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    // Reset selections for new area
    const initialErrors = {};
    area.legalErrors.forEach(err => { initialErrors[err.id] = true; }); // check all by default
    setSelectedErrors(initialErrors);

    const initialCitations = {};
    area.citations.forEach((_, idx) => { initialCitations[idx] = true; }); // check all by default
    setSelectedCitations(initialCitations);
    
    setStep(2);
  };

  const handleTextChange = (field, value) => {
    setUserFacts(prev => ({ ...prev, [field]: value }));
  };

  const toggleError = (id) => {
    setSelectedErrors(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCitation = (idx) => {
    setSelectedCitations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const resetBuilder = () => {
    setStep(1);
    setUserFacts({
      veteranName: '',
      claimNumber: '',
      schoolOrProgram: '',
      counselorArgument: '',
      personalContext: '',
    });
    setCopySuccess(false);
  };

  // Compile Brief Content
  const compileBrief = () => {
    const activeCitations = selectedArea.citations.filter((_, idx) => selectedCitations[idx]);
    const activeErrors = selectedArea.legalErrors.filter(err => selectedErrors[err.id]);
    
    return `CASE STRATEGY & ARGUMENT BRIEF
DISPUTE: ${selectedArea.name}
DATE GENERATED: ${new Date().toLocaleDateString()}
VETERAN: ${userFacts.veteranName || '[VETERAN NAME]'}
CLAIM NUMBER: ${userFacts.claimNumber || '[CLAIM NUMBER]'}

============================================================
1. EXECUTIVE SUMMARY & STATEMENT OF FACTS
The Veteran has requested VR&E services/supplies for: ${userFacts.schoolOrProgram || '[SCHOOL/PROGRAM/ITEMS REQUESTED]'}.
The Vocational Rehabilitation Counselor (VRC) denied/refused the request stating: "${userFacts.counselorArgument || '[VRC REASON FOR DENIAL]'}"
The Veteran submits that this denial is based on administrative error, contrary to the regulations and manual provisions cited below.
Personal circumstances/necessity: ${userFacts.personalContext || '[ADDITIONAL CONTEXT ENTERED BY VETERAN]'}

============================================================
2. BINDING LEGAL AUTHORITY
The Veteran asserts that the following statutory and regulatory authorities govern this dispute:

${activeCitations.map(c => `* ${c.citation}: ${c.relevance}`).join('\n\n')}

============================================================
3. PROCEDURAL & SUBSTANTIVE ERRORS FOR REBUTTAL
Based on the record, the following counselor errors are identified and refuted:

${activeErrors.map((err, i) => `${i + 1}. Error Statement: ${err.label}\n   Legal Correction: ${err.correction}`).join('\n\n')}

============================================================
4. EVIDENCE CHECKLIST & SUBMISSIONS
The Veteran is compiling and submitting the following documentation in support of this brief:

${selectedArea.evidenceChecklist.map(item => `[ ] ${item}`).join('\n')}

============================================================
5. REQUESTED RELIEF & ESCALATION
The Veteran formally requests:
1. An immediate written administrative review of this decision under 38 C.F.R. § 21.416 or § 21.94.
2. A formal written decision outlining the specific C.F.R. citations utilized for the denial as required by 38 U.S.C. § 5104.
3. If unresolved at the VRC level, this brief will be escalated to the VR&E Officer (VREO) for regional office administrative review.`;
  };

  const handleCopy = () => {
    const text = compileBrief();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    const text = compileBrief();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>VR&E Case Brief - ${selectedArea.name}</title>
          <style>
            body { font-family: Courier, monospace; white-space: pre-wrap; padding: 40px; color: #0f172a; font-size: 0.9rem; line-height: 1.5; }
            h1 { font-family: sans-serif; font-size: 1.4rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>VR&E Strategic Brief</h1>
          <div>${text}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
          <FileText size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Claim Argument Builder</h1>
          <p className="text-[11px] text-slate-400">Interactively construct litigation-grade briefs to counter common VA counselor errors.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* STEP 1: SELECT DISPUTE AREA */}
      {step === 1 && (
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Step 1: Choose a dispute or denial area</span>
          <div className="grid grid-cols-1 gap-4">
            {DISPUTE_AREAS.map(area => (
              <div
                key={area.id}
                onClick={() => handleSelectArea(area)}
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:bg-slate-900/60 transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-200">{area.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">{area.description}</p>
                </div>
                <button className="btn btn-sm btn-primary inline-flex items-center gap-1 shrink-0 self-end md:self-auto">
                  <span>Start Strategy</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: INPUT FACTS */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 2: Enter Case Details</span>
            <button onClick={resetBuilder} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition">
              <RotateCcw size={12} />
              <span>Restart</span>
            </button>
          </div>

          <div className="bg-slate-950/20 border border-slate-800/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Veteran Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={userFacts.veteranName}
                  onChange={(e) => handleTextChange('veteranName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">VA Claim Number / SSN</label>
                <input
                  type="text"
                  placeholder="e.g. 123-45-6789"
                  value={userFacts.claimNumber}
                  onChange={(e) => handleTextChange('claimNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Disputed program or items requested</label>
                <input
                  type="text"
                  placeholder="e.g. BS in Cybersecurity computer package"
                  value={userFacts.schoolOrProgram}
                  onChange={(e) => handleTextChange('schoolOrProgram', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">What was the counselor's reason for denial?</label>
                <textarea
                  placeholder="e.g. Counselor stated they cannot approve laptops over $500, or that graduate school is capped at 48 months."
                  value={userFacts.counselorArgument}
                  onChange={(e) => handleTextChange('counselorArgument', e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Explain why these items/services are necessary for your rehabilitation</label>
                <textarea
                  placeholder="e.g. I have orthopedic limits that make it difficult to carry heavy text books, or my curriculum requires running specific programming virtual environments."
                  value={userFacts.personalContext}
                  onChange={(e) => handleTextChange('personalContext', e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button onClick={() => setStep(1)} className="btn btn-sm btn-secondary">
              Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-sm btn-primary inline-flex items-center gap-1">
              <span>Next: Cite Authority</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CITATIONS & ERRORS */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 3: Select Governing Citations & Counselor Errors</span>
            <button onClick={resetBuilder} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition">
              <RotateCcw size={12} />
              <span>Restart</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Citations list */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Scale size={12} className="text-emerald-400" />
                <span>Include Binding Legal Citations</span>
              </span>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {selectedArea.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleCitation(idx)}
                    className={`border rounded-lg p-3 cursor-pointer transition select-none flex items-start gap-2.5 ${
                      selectedCitations[idx]
                        ? 'bg-emerald-500/5 border-emerald-800/80 hover:border-emerald-700'
                        : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedCitations[idx]}
                      onChange={() => {}} // handled by parent onClick
                      className="mt-0.5 pointer-events-none accent-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-200">{cite.citation}</span>
                        <AuthorityBadge level={cite.level} />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{cite.relevance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Counselor Errors */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert size={12} className="text-indigo-400" />
                <span>Select Counselor Errors to Refute</span>
              </span>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {selectedArea.legalErrors.map(err => (
                  <div
                    key={err.id}
                    onClick={() => toggleError(err.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition select-none flex items-start gap-2.5 ${
                      selectedErrors[err.id]
                        ? 'bg-indigo-500/5 border-indigo-800/80 hover:border-indigo-700'
                        : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedErrors[err.id]}
                      onChange={() => {}} // handled by parent onClick
                      className="mt-0.5 pointer-events-none accent-indigo-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-200">{err.label}</span>
                      <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                        <strong>Correction:</strong> {err.correction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button onClick={() => setStep(2)} className="btn btn-sm btn-secondary">
              Back
            </button>
            <button onClick={() => setStep(4)} className="btn btn-sm btn-primary inline-flex items-center gap-1">
              <span>Compile Strategy Brief</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: COMPILED BRIEF PREVIEW */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 4: Review Compiled Appeal Brief</span>
            <div className="flex items-center gap-3">
              <button onClick={resetBuilder} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition">
                <RotateCcw size={12} />
                <span>Restart</span>
              </button>
            </div>
          </div>

          {/* Action Panel */}
          <div className="flex flex-wrap items-center justify-between bg-slate-950/30 border border-slate-800 rounded-xl p-4 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-300 font-semibold">Argument Brief Ready to Submit</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="btn btn-sm btn-secondary inline-flex items-center gap-1">
                {copySuccess ? <CheckCircle size={14} className="text-emerald-400" /> : <Clipboard size={14} />}
                <span>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
              <button onClick={handlePrint} className="btn btn-sm btn-primary inline-flex items-center gap-1">
                <Printer size={14} />
                <span>Print Strategy Brief</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Brief display block */}
            <div className="lg:col-span-8 bg-slate-950/40 border border-slate-800 rounded-xl p-6 overflow-y-auto max-h-[500px]">
              <pre className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                {compileBrief()}
              </pre>
            </div>

            {/* Next Steps Card */}
            <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4 h-fit">
              <div>
                <h3 className="text-xs font-bold text-slate-200">Recommended Action Steps</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Use this compiled legal strategy to escalate your request.</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <span className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-slate-300">Submit Brief to VRC</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Email this text directly to your Vocational Rehabilitation Counselor (VRC), requesting a formal decision.</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <span className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-slate-300">Gather Listed Evidence</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Do not submit arguments without evidence. Compile the items in the Evidence Checklist and attach them to your message.</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <span className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-slate-300">Request Written Rationale</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">If VRC verbally denies again, submit a "Written Rationale Request" using the Document Generator to force a formal decision notice.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ClaimArgumentBuilderView;

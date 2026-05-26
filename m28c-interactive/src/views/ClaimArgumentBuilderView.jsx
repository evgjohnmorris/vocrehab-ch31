import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Compass
} from 'lucide-react';

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
  }
];

function ClaimArgumentBuilderView({ reduceMotion }) {
  const [activeTab, setActiveTab] = useState('plan_builder'); // 'plan_builder' | 'brief_builder'
  
  // Tab 1: IPE Plan Builder State
  const [vocGoal, setVocGoal] = useState('');
  const [onetCode, setOnetCode] = useState('');
  const [riasecCode, setRiasecCode] = useState('Realistic');
  const [trainingObjectives, setTrainingObjectives] = useState('');
  const requiredServices = {
    books: true,
    tuition: true,
    placement: false,
    dental: false,
    tutoring: false
  };
  const [accommodations, setAccommodations] = useState({
    ergoChair: false,
    textToSpeech: false,
    extraTime: false,
    dyslexiaFont: false
  });
  const [subsistenceElection, setSubsistenceElection] = useState('ch31'); // 'ch31' | 'ch33'
  const [copyPlanSuccess, setCopyPlanSuccess] = useState(false);

  // Tab 2: Brief Builder State
  const [step, setStep] = useState(1);
  const [selectedArea, setSelectedArea] = useState(DISPUTE_AREAS[0]);
  const [userFacts, setUserFacts] = useState({
    veteranName: '',
    claimNumber: '',
    schoolOrProgram: '',
    counselorArgument: '',
    personalContext: '',
  });
  const [selectedErrors, setSelectedErrors] = useState({});
  const [selectedCitations, setSelectedCitations] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    const initialErrors = {};
    area.legalErrors.forEach(err => { initialErrors[err.id] = true; });
    setSelectedErrors(initialErrors);

    const initialCitations = {};
    area.citations.forEach((_, idx) => { initialCitations[idx] = true; });
    setSelectedCitations(initialCitations);
    setStep(2);
  };

  const handleTextChange = (field, value) => {
    setUserFacts(prev => ({ ...prev, [field]: value }));
  };


  // Compile Plan Summary Letter
  const compilePlanLetter = () => {
    return `VR&E CAREER GOAL & PLAN AMENDMENT JUSTIFICATION
DATE: ${new Date().toLocaleDateString()}
VOCATIONAL GOAL: ${vocGoal || '[GOAL TITLE]'}
O*NET CODE: ${onetCode || '[O*NET CODE]'}
RIASEC CLASSIFICATION: ${riasecCode}

============================================================
1. REHABILITATION GOAL DETAILS
The Veteran requested plan update or formulation for: ${vocGoal || '[GOAL]'}.
O*NET code research indicates that entry into this field requires the specified coursework 
and certifications. Labor market statistics support viability in the target area.

2. MANDATORY ACCOMMODATIONS & EQUIPMENT (38 C.F.R. § 21.212)
The following accommodations are requested as necessary additions to the IPE:
${Object.entries(accommodations).filter(([, val]) => val).map(([key]) => {
  if (key === 'ergoChair') return '* Ergonomic orthopedic desk/chair package';
  if (key === 'textToSpeech') return '* Screen reader / text-to-speech software';
  if (key === 'extraTime') return '* Extended testing times / class breaks';
  return '* OpenDyslexic / clean accessibility font configurations';
}).join('\n') || '* No accommodations selected'}

3. REHABILITATION SERVICES REQUESTED
* Tuition Payments: ${requiredServices.tuition ? 'REQUESTED' : 'NO'}
* Book Vouchers: ${requiredServices.books ? 'REQUESTED' : 'NO'}
* Job Placement Assistance: ${requiredServices.placement ? 'REQUIRED' : 'NO'}
* Dental Treatment Access: ${requiredServices.dental ? 'REQUIRED' : 'NO'}
* Tutoring Services: ${requiredServices.tutoring ? 'REQUIRED' : 'NO'}

4. SUBSISTENCE ALLOWANCE ELECTION
Veteran elects: ${subsistenceElection === 'ch31' ? 'Chapter 31 standard rate scale' : 'Post-9/11 GI Bill rate (Chapter 33 election)'}

Plan Modification Rationale:
${trainingObjectives || '[ENTER COMPREHENSIVE CAREER AMENDMENT RATIONALE]'}`;
  };

  const handleCopyPlan = () => {
    const text = compilePlanLetter();
    navigator.clipboard.writeText(text);
    setCopyPlanSuccess(true);
    setTimeout(() => setCopyPlanSuccess(false), 2000);
  };

  const handlePrintPlan = () => {
    const text = compilePlanLetter();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Plan Justification</title></head>
        <body style="font-family: Courier; white-space: pre-wrap; padding: 40px; color: #000;">${text}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const compileBrief = () => {
    const activeCitations = selectedArea.citations.filter((_, idx) => selectedCitations[idx]);
    const activeErrors = selectedArea.legalErrors.filter(err => selectedErrors[err.id]);
    
    return `CASE STRATEGY & ARGUMENT BRIEF
DISPUTE: ${selectedArea.name}
VETERAN: ${userFacts.veteranName || '[VETERAN NAME]'}
CLAIM NUMBER: ${userFacts.claimNumber || '[CLAIM NUMBER]'}

============================================================
1. EXECUTIVE SUMMARY & STATEMENT OF FACTS
The Veteran requested VR&E services/supplies for: ${userFacts.schoolOrProgram || '[SCHOOL/PROGRAM/ITEMS REQUESTED]'}.
VRC denied/refused stating: "${userFacts.counselorArgument || '[VRC DENIAL STATEMENT]'}"
Personal context: ${userFacts.personalContext || '[EXPLAIN DISABILITY IMPACTS]'}

============================================================
2. BINDING LEGAL AUTHORITY
${activeCitations.map(c => `* ${c.citation}: ${c.relevance}`).join('\n\n')}

============================================================
3. REBUTTAL ARGUMENTS & ERRORS
${activeErrors.map((err, i) => `${i + 1}. Error Statement: ${err.label}\n   Correction: ${err.correction}`).join('\n\n')}

============================================================
4. EVIDENCE CHECKLIST
${selectedArea.evidenceChecklist.map(item => `[ ] ${item}`).join('\n')}`;
  };

  const handleCopyBrief = () => {
    const text = compileBrief();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
          <Compass size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">IPE / Plan Builder Workspace</h1>
          <p className="text-[11px] text-slate-400">Design training goals, vocational goals, required services lists, and draft plan amendments.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      <div className="tabs-header mb-6">
        <button 
          className={`tab-btn ${activeTab === 'plan_builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan_builder')}
        >
          Vocational IPE Plan Builder
        </button>
        <button 
          className={`tab-btn ${activeTab === 'brief_builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('brief_builder')}
        >
          Claim Argument Brief Builder
        </button>
      </div>

      {/* TAB 1: IPE PLAN BUILDER */}
      {activeTab === 'plan_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Vocational Goal Details</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Vocational Goal Title</label>
                <input 
                  type="text" 
                  value={vocGoal} 
                  onChange={(e) => setVocGoal(e.target.value)} 
                  placeholder="e.g. Software Engineer"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-205"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">O*NET Code</label>
                <input 
                  type="text" 
                  value={onetCode} 
                  onChange={(e) => setOnetCode(e.target.value)} 
                  placeholder="e.g. 15-1252.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-205"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-semibold">RIASEC Code Matching</label>
              <select
                value={riasecCode}
                onChange={(e) => setRiasecCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-202"
                aria-label="RIASEC Code Matching"
              >
                <option value="Realistic">Realistic (R)</option>
                <option value="Investigative">Investigative (I)</option>
                <option value="Artistic">Artistic (A)</option>
                <option value="Social">Social (S)</option>
                <option value="Enterprising">Enterprising (E)</option>
                <option value="Conventional">Conventional (C)</option>
              </select>
            </div>

            {/* Accommodation needs */}
            <div className="space-y-2 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Accommodation Needs</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accommodations.ergoChair}
                    onChange={(e) => setAccommodations({...accommodations, ergoChair: e.target.checked})}
                    className="accent-indigo-500"
                  />
                  <span>Ergonomic Desk / Chair</span>
                </label>
                <label className="flex items-center gap-2 text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accommodations.textToSpeech}
                    onChange={(e) => setAccommodations({...accommodations, textToSpeech: e.target.checked})}
                    className="accent-indigo-500"
                  />
                  <span>Text-To-Speech / Screen Reader</span>
                </label>
                <label className="flex items-center gap-2 text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accommodations.extraTime}
                    onChange={(e) => setAccommodations({...accommodations, extraTime: e.target.checked})}
                    className="accent-indigo-500"
                  />
                  <span>Extended Test Time</span>
                </label>
                <label className="flex items-center gap-2 text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accommodations.dyslexiaFont}
                    onChange={(e) => setAccommodations({...accommodations, dyslexiaFont: e.target.checked})}
                    className="accent-indigo-500"
                  />
                  <span>Clean Accessibility Font</span>
                </label>
              </div>
            </div>

            {/* Subsistence Allowance Election */}
            <div className="space-y-2 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Subsistence Allowance Election</span>
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1.5 text-slate-350 cursor-pointer">
                  <input
                    type="radio"
                    name="subsistence"
                    checked={subsistenceElection === 'ch31'}
                    onChange={() => setSubsistenceElection('ch31')}
                    className="accent-indigo-500"
                  />
                  <span>Chapter 31 Institutional Rate</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-350 cursor-pointer">
                  <input
                    type="radio"
                    name="subsistence"
                    checked={subsistenceElection === 'ch33'}
                    onChange={() => setSubsistenceElection('ch33')}
                    className="accent-indigo-500"
                  />
                  <span>Post-9/11 MHA Election Rate</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Goal-Change / Plan amendment justification</label>
              <textarea
                placeholder="Explain the specific medical or vocational reasons that require this plan update..."
                value={trainingObjectives}
                onChange={(e) => setTrainingObjectives(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-202 resize-none"
              />
            </div>
          </div>

          {/* Preview Renders */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex justify-between items-center bg-slate-950/30 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-300 font-semibold">IPE Justification Memo</span>
              <div className="flex gap-2">
                <button onClick={handleCopyPlan} className="btn btn-sm btn-secondary">
                  {copyPlanSuccess ? 'Copied' : 'Copy'}
                </button>
                <button onClick={handlePrintPlan} className="btn btn-sm btn-primary">
                  Print Justification
                </button>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6 overflow-y-auto max-h-[500px]">
              <pre className="text-[11px] text-slate-350 font-mono leading-relaxed whitespace-pre-wrap select-text">
                {compilePlanLetter()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRIEF BUILDER (PREVIOUS WORK RE-BUILT CLEANLY) */}
      {activeTab === 'brief_builder' && (
        <div className="space-y-4">
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
                    <button className="btn btn-sm btn-primary shrink-0 self-end md:self-auto flex items-center gap-1">
                      <span>Start Strategy</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Step 2: Enter case details</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-xl">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Veteran Name</label>
                    <input
                      type="text"
                      value={userFacts.veteranName}
                      onChange={(e) => handleTextChange('veteranName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">VA Claim Number</label>
                    <input
                      type="text"
                      value={userFacts.claimNumber}
                      onChange={(e) => handleTextChange('claimNumber', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Dispute Description</label>
                    <textarea
                      value={userFacts.personalContext}
                      onChange={(e) => handleTextChange('personalContext', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
                <button onClick={handleCopyBrief} className="btn btn-primary">{copySuccess ? 'Copied' : 'Copy Brief'}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default ClaimArgumentBuilderView;

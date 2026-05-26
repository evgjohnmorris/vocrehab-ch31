// @allow-modal
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Compass, Plus, Trash2, Printer, Copy, Info, CheckCircle2, Scale,
  FileText, Sparkles, DollarSign, MapPin, Check
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

const TRACK_DETAILS = [
  {
    id: 'reemployment',
    name: 'Reemployment Track',
    statute: '38 U.S.C. § 3105 / 38 C.F.R. § 21.48',
    description: 'For veterans returning to their pre-service employer. Focuses on workplace adjustments and job retention.',
    colorClass: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
  },
  {
    id: 'rapid_employment',
    name: 'Rapid Employment Services',
    statute: '38 U.S.C. § 3105 / 38 C.F.R. § 21.49',
    description: 'For veterans who already possess the skills to secure employment. Focuses on immediate job search and resume coaching.',
    colorClass: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
  },
  {
    id: 'self_employment',
    name: 'Self-Employment Track',
    statute: '38 U.S.C. § 3117 / 38 C.F.R. § 21.50',
    description: 'For veterans with Serious Employment Handicaps requiring business start-up services, licensing, and supply coordination.',
    colorClass: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
  },
  {
    id: 'long_term',
    name: 'Long-Term Services',
    statute: '38 U.S.C. § 3105 / 38 C.F.R. § 21.51',
    description: 'For veterans requiring college degrees, technical certifications, or extended vocational training to overcome limitations.',
    colorClass: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
  },
  {
    id: 'independent_living',
    name: 'Independent Living',
    statute: '38 U.S.C. § 3120 / 38 C.F.R. § 21.53',
    description: 'For veterans unable to pursue immediate employment. Focuses on gaining independence in daily activities.',
    colorClass: 'border-rose-500/30 text-rose-400 bg-rose-500/10'
  }
];

function ClaimArgumentBuilderView({ reduceMotion }) {
  const [activeTab, setActiveTab] = useState('plan_builder'); // 'plan_builder' | 'brief_builder'
  
  // Tab 1: IPE Plan Builder State
  const [vocGoal, setVocGoal] = useState('');
  const [onetCode, setOnetCode] = useState('');
  const [riasecCode, setRiasecCode] = useState('Realistic');
  const [selectedTrack, setSelectedTrack] = useState('long_term');
  const [trainingObjectives, setTrainingObjectives] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [estimatedMha, setEstimatedMha] = useState('');
  const [subsistenceElection, setSubsistenceElection] = useState('ch31'); // 'ch31' | 'ch33'
  const [copyPlanSuccess, setCopyPlanSuccess] = useState(false);

  // Intermediate Objectives array
  const [objectives, setObjectives] = useState([
    { id: '1', desc: 'Complete academic training requirements for the target vocational goal', targetDate: 'Year 3', measure: 'Maintain GPA >= 2.0 and submit term transcripts' },
    { id: '2', desc: 'Acquire required industry certifications or complete capstone/internship', targetDate: 'Year 3', measure: 'Provide passing scores / supervisor evaluation' },
    { id: '3', desc: 'Transition to IEAP (Employment Plan) and secure suitable direct placement', targetDate: 'Year 4', measure: '60 days continuous employment in target field' }
  ]);

  // Services checklist
  const [requiredServices, setRequiredServices] = useState({
    tuition: true,
    books: true,
    laptop: true,
    ergoChair: false,
    dental: false,
    tutoring: false,
    placement: true,
    clothing: false,
    certs: true
  });

  const handleAddObjective = () => {
    const newId = (objectives.length > 0 ? Math.max(...objectives.map(o => parseInt(o.id) || 0)) + 1 : 1).toString();
    setObjectives([
      ...objectives,
      { id: newId, desc: '', targetDate: '', measure: '' }
    ]);
  };

  const handleRemoveObjective = (id) => {
    setObjectives(objectives.filter(o => o.id !== id));
  };

  const handleObjectiveChange = (id, field, value) => {
    setObjectives(objectives.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleSuggestObjectives = () => {
    const goal = vocGoal || 'Target Career';
    let suggested = [];
    if (selectedTrack === 'long_term') {
      suggested = [
        { id: '1', desc: `Complete official academic coursework or degree program required for ${goal}`, targetDate: 'Graduation Term', measure: 'Maintain a cumulative GPA of 2.0 or higher' },
        { id: '2', desc: `Acquire required professional licenses or complete practical internship for ${goal}`, targetDate: 'Academic Term 6', measure: 'Provide official credential certifications' },
        { id: '3', desc: `Transition to IEAP employment assistance and secure suitable placement in target field`, targetDate: 'Post-Graduation', measure: 'Successful employment retention for 60 consecutive days' }
      ];
    } else if (selectedTrack === 'rapid_employment') {
      suggested = [
        { id: '1', desc: `Optimize professional resume, LinkedIn, and vocational portfolio for ${goal}`, targetDate: 'Month 2', measure: 'VRC counselor formal review and approval' },
        { id: '2', desc: `Complete specialized short-term bootcamps or vocational certificates`, targetDate: 'Month 4', measure: 'Provide certificate of completion' },
        { id: '3', desc: `Actively apply to job vacancies and participate in interviews as documented in job logs`, targetDate: 'Month 6', measure: 'Secure placement matching physical tolerances' }
      ];
    } else if (selectedTrack === 'self_employment') {
      suggested = [
        { id: '1', desc: `Formulate a comprehensive business plan and conduct local market feasibility study`, targetDate: 'Month 4', measure: 'Concurrence and approval by VRC and VREO' },
        { id: '2', desc: `Obtain official business licensing, tax registration, and secure commercial/office space`, targetDate: 'Month 8', measure: 'Provide copy of business license and lease' },
        { id: '3', desc: `Procure initial inventory/supplies and launch marketing campaigns`, targetDate: 'Month 12', measure: 'Document first sales and operational records' }
      ];
    } else if (selectedTrack === 'reemployment') {
      suggested = [
        { id: '1', desc: `Conduct job site accommodation analysis with current employer and VRC`, targetDate: 'Month 2', measure: 'Provide completed safety/accommodation report' },
        { id: '2', desc: `Procure and install necessary ergonomic equipment and adaptive workstation software`, targetDate: 'Month 4', measure: 'VRC verification of equipment installation' },
        { id: '3', desc: `Complete workplace adjustment period to ensure stable job retention`, targetDate: 'Month 6', measure: 'Employer letter confirming satisfactory performance' }
      ];
    } else if (selectedTrack === 'independent_living') {
      suggested = [
        { id: '1', desc: `Complete comprehensive medical, cognitive, and daily living safety assessments`, targetDate: 'Month 2', measure: 'Provide physician and specialist evaluations' },
        { id: '2', desc: `Implement home adjustments and procure daily living assistive equipment`, targetDate: 'Month 8', measure: 'VRC verification of home inspection and receipt of daily living aids' },
        { id: '3', desc: `Achieve personal independence in activities of daily living (ADLs) without assistance`, targetDate: 'Month 12', measure: 'Final case worker evaluation and closure report' }
      ];
    }
    setObjectives(suggested);
  };

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
    const goalText = vocGoal || '[GOAL TITLE]';
    const onetText = onetCode || '[O*NET CODE]';
    
    // Map tracks to full names
    const trackNames = {
      reemployment: 'Reemployment Track (38 U.S.C. § 3105 / 38 C.F.R. § 21.48)',
      rapid_employment: 'Rapid Employment Services Track (38 U.S.C. § 3105 / 38 C.F.R. § 21.49)',
      self_employment: 'Self-Employment Track (38 U.S.C. § 3117 / 38 C.F.R. § 21.50)',
      long_term: 'Employment through Long-Term Services Track (38 U.S.C. § 3105 / 38 C.F.R. § 21.51)',
      independent_living: 'Independent Living Services Track (38 U.S.C. § 3120 / 38 C.F.R. § 21.53)'
    };
    const trackName = trackNames[selectedTrack];

    // Format objectives
    const objectivesText = objectives.map((o, idx) => 
      `${idx + 1}. OBJECTIVE: ${o.desc || '[Enter objective description]'}
   TARGET COMPLETION: ${o.targetDate || '[Target date]'}
   MEASURE OF PROGRESS: ${o.measure || '[Progress metric]'}`
    ).join('\n\n');

    // Format services
    const servicesList = [];
    if (requiredServices.tuition) servicesList.push('* Tuition and Mandatory Fees (100% uncapped - 38 C.F.R. § 21.212)');
    if (requiredServices.books) servicesList.push('* Required Textbooks, Supplies, and Tools (38 C.F.R. § 21.212)');
    if (requiredServices.laptop) servicesList.push('* High-Performance Computer & Software package (38 C.F.R. § 21.220)');
    if (requiredServices.ergoChair) servicesList.push('* Ergonomic desk, chair, and adaptive workstation equipment');
    if (requiredServices.dental) servicesList.push('* VA Dental Referral and Treatment (under 38 U.S.C. § 3117 to prevent training interruption)');
    if (requiredServices.tutoring) servicesList.push('* Individualized Tutoring support services');
    if (requiredServices.placement) servicesList.push('* Job placement assistance and employment services (IEAP under 38 C.F.R. § 21.88)');
    if (requiredServices.clothing) servicesList.push('* Initial professional work clothing allowance');
    if (requiredServices.certs) servicesList.push('* Professional licensing and certification exam fees');

    const servicesText = servicesList.length > 0 ? servicesList.join('\n') : '* No specific services selected';

    // Format MHA details
    const mhaText = subsistenceElection === 'ch31'
      ? 'Chapter 31 Standard Institutional Subsistence Rate scale (38 U.S.C. § 3108)'
      : `Post-9/11 MHA Election Rate based on school ZIP ${zipCode || '[ZIP]'} (Estimated MHA: $${estimatedMha || '[BAH Rate]'} / Mo - 38 U.S.C. § 3108(f))`;

    return `MEMORANDUM FOR RECORD
DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
TO: Vocational Rehabilitation & Employment Division (VR&E)
SUBJECT: Request for Initial IPE Formulation / IWRP Plan Amendment

1. SELECTED REHABILITATION TRACK
Track: ${trackName}

2. VOCATIONAL GOAL & INDUSTRY CODES (38 C.F.R. § 21.84)
Target Occupational Goal: ${goalText}
O*NET-SOC Classification Code: ${onetText}
RIASEC Vocational Classification: ${riasecCode}

3. INTERMEDIATE OBJECTIVES
The following structured milestones are proposed to measure progress toward rehabilitation:

${objectivesText || 'No intermediate objectives defined.'}

4. REQUIRED SERVICES & ACCOMMODATIONS (38 C.F.R. § 21.212)
Under 38 U.S.C. § 3104(a)(7) and 38 C.F.R. § 21.212, the VA will furnish necessary books, supplies, equipment, and services. The following items are requested as necessary components of my rehabilitation plan:

${servicesText}

5. SUBSISTENCE ALLOWANCE ELECTION
Election Option: ${mhaText}

6. PLAN MODIFICATION RATIONALE / PERSONAL JUSTIFICATION
${trainingObjectives || '[Enter a detailed justification explaining why this rehabilitation plan and target occupational goal is suitable for your physical tolerances and vocational interests. Explain how it overcomes your service-connected disability limitations.]'}

Respectfully Submitted,

___________________________________
[Veteran Signature]`;
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Rehabilitation Track Cards */}
            <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5">
                <Compass size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Vocational Rehabilitation Track (38 U.S.C. § 3105)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRACK_DETAILS.map(track => {
                  const isSelected = selectedTrack === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        setSelectedTrack(track.id);
                        // Trigger immediate suggestion to help user
                        setTimeout(() => {
                          const goal = vocGoal || 'Target Career';
                          let suggested = [];
                          if (track.id === 'long_term') {
                            suggested = [
                              { id: '1', desc: `Complete official academic coursework or degree program required for ${goal}`, targetDate: 'Graduation Term', measure: 'Maintain a cumulative GPA of 2.0 or higher' },
                              { id: '2', desc: `Acquire required professional licenses or complete practical internship for ${goal}`, targetDate: 'Academic Term 6', measure: 'Provide official credential certifications' },
                              { id: '3', desc: `Transition to IEAP employment assistance and secure suitable placement in target field`, targetDate: 'Post-Graduation', measure: 'Successful employment retention for 60 consecutive days' }
                            ];
                          } else if (track.id === 'rapid_employment') {
                            suggested = [
                              { id: '1', desc: `Optimize professional resume, LinkedIn, and vocational portfolio for ${goal}`, targetDate: 'Month 2', measure: 'VRC counselor formal review and approval' },
                              { id: '2', desc: `Complete specialized short-term bootcamps or vocational certificates`, targetDate: 'Month 4', measure: 'Provide certificate of completion' },
                              { id: '3', desc: `Actively apply to job vacancies and participate in interviews as documented in job logs`, targetDate: 'Month 6', measure: 'Secure placement matching physical tolerances' }
                            ];
                          } else if (track.id === 'self_employment') {
                            suggested = [
                              { id: '1', desc: `Formulate a comprehensive business plan and conduct local market feasibility study`, targetDate: 'Month 4', measure: 'Concurrence and approval by VRC and VREO' },
                              { id: '2', desc: `Obtain official business licensing, tax registration, and secure commercial/office space`, targetDate: 'Month 8', measure: 'Provide copy of business license and lease' },
                              { id: '3', desc: `Procure initial inventory/supplies and launch marketing campaigns`, targetDate: 'Month 12', measure: 'Document first sales and operational records' }
                            ];
                          } else if (track.id === 'reemployment') {
                            suggested = [
                              { id: '1', desc: `Conduct job site accommodation analysis with current employer and VRC`, targetDate: 'Month 2', measure: 'Provide completed safety/accommodation report' },
                              { id: '2', desc: `Procure and install necessary ergonomic equipment and adaptive workstation software`, targetDate: 'Month 4', measure: 'VRC verification of equipment installation' },
                              { id: '3', desc: `Complete workplace adjustment period to ensure stable job retention`, targetDate: 'Month 6', measure: 'Employer letter confirming satisfactory performance' }
                            ];
                          } else if (track.id === 'independent_living') {
                            suggested = [
                              { id: '1', desc: `Complete comprehensive medical, cognitive, and daily living safety assessments`, targetDate: 'Month 2', measure: 'Provide physician and specialist evaluations' },
                              { id: '2', desc: `Implement home adjustments and procure daily living assistive equipment`, targetDate: 'Month 8', measure: 'VRC verification of home inspection and receipt of daily living aids' },
                              { id: '3', desc: `Achieve personal independence in activities of daily living (ADLs) without assistance`, targetDate: 'Month 12', measure: 'Final case worker evaluation and closure report' }
                            ];
                          }
                          setObjectives(suggested);
                        }, 50);
                      }}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-500/10 border-indigo-500 shadow-md shadow-indigo-500/5' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                          {track.name}
                        </span>
                        {isSelected && (
                          <span className="p-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mb-2">{track.statute}</div>
                      <p className="text-[10px] text-slate-450 leading-snug">{track.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vocational Goal Title, ONET, RIASEC */}
            <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Vocational Goal Specification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Goal Title</label>
                  <input 
                    type="text" 
                    value={vocGoal} 
                    onChange={(e) => setVocGoal(e.target.value)} 
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">O*NET-SOC Code</label>
                  <input 
                    type="text" 
                    value={onetCode} 
                    onChange={(e) => setOnetCode(e.target.value)} 
                    placeholder="e.g. 15-1252.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">RIASEC Matching</label>
                  <select
                    value={riasecCode}
                    onChange={(e) => setRiasecCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                * RIASEC interest profiling ensures the vocational goal is compatible with your aptitude and personality traits under 38 C.F.R. § 21.84.
              </p>
            </div>

            {/* Intermediate Objectives Builder */}
            <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Intermediate Objectives (38 C.F.R. § 21.84)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSuggestObjectives}
                    className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded text-slate-300 flex items-center gap-1 transition cursor-pointer"
                    title="Auto-fill recommended objectives based on selected track"
                  >
                    <Compass size={12} />
                    <span>Auto-Suggest</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 rounded text-white flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Objective</span>
                  </button>
                </div>
              </div>

              {objectives.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                  No objectives defined. Click "Auto-Suggest" or "Add Objective" to begin.
                </div>
              ) : (
                <div className="space-y-3">
                  {objectives.map((obj, idx) => (
                    <div key={obj.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-3 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500">Objective #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(obj.id)}
                          className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                          title="Delete Objective"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-6">
                          <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Description</label>
                          <input
                            type="text"
                            value={obj.desc}
                            onChange={(e) => handleObjectiveChange(obj.id, 'desc', e.target.value)}
                            placeholder="e.g. Complete core computer programming curriculum"
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Target Completion</label>
                          <input
                            type="text"
                            value={obj.targetDate}
                            onChange={(e) => handleObjectiveChange(obj.id, 'targetDate', e.target.value)}
                            placeholder="e.g. Term 4"
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Measure of Progress</label>
                          <input
                            type="text"
                            value={obj.measure}
                            onChange={(e) => handleObjectiveChange(obj.id, 'measure', e.target.value)}
                            placeholder="e.g. Cumulative GPA >= 3.0"
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services and Supplies Checklist */}
            <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5">
                <Scale size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Required Services & Supplies (38 C.F.R. § 21.212)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'tuition', label: 'Tuition & Mandatory Fees', cite: '38 C.F.R. § 21.212', desc: '100% uncapped payment for approved programs' },
                  { id: 'books', label: 'Books, Supplies & Tools', cite: '38 C.F.R. § 21.212', desc: 'Required academic materials and kits' },
                  { id: 'laptop', label: 'High-Performance PC Package', cite: '38 C.F.R. § 21.220', desc: 'Laptops, adaptive hardware, or specialized tech' },
                  { id: 'ergoChair', label: 'Ergonomic Workstation Setup', cite: '38 C.F.R. § 21.212', desc: 'Desk, chair, and physical support gear' },
                  { id: 'dental', label: 'VA Dental Referral', cite: '38 U.S.C. § 3117', desc: 'Priority dental care to prevent training interruption' },
                  { id: 'tutoring', label: 'Individualized Tutoring', cite: '38 C.F.R. § 21.212', desc: 'Academic tutoring if difficulty is documented' },
                  { id: 'certs', label: 'Exam & Licensure Fees', cite: '38 C.F.R. § 21.212', desc: 'Licensing exams and professional credentials' },
                  { id: 'clothing', label: 'Professional Clothing', cite: '38 C.F.R. § 21.212', desc: 'Initial employment attire or specific uniforms' },
                  { id: 'placement', label: 'Job Placement Services', cite: '38 C.F.R. § 21.88', desc: 'Job search, interview prep, and placement' }
                ].map(service => {
                  const isChecked = requiredServices[service.id];
                  return (
                    <label 
                      key={service.id} 
                      className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-indigo-500/5 border-indigo-500/50' 
                          : 'bg-slate-950/20 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setRequiredServices({
                          ...requiredServices,
                          [service.id]: e.target.checked
                        })}
                        className="mt-0.5 accent-indigo-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-xs font-semibold text-slate-200">{service.label}</span>
                          <span className="text-[8px] font-mono text-slate-500 bg-slate-900 px-1 rounded">{service.cite}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">{service.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Subsistence Allowance and MHA Estimator */}
            <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Subsistence Allowance Election (38 U.S.C. § 3108)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                  subsistenceElection === 'ch31' ? 'bg-indigo-500/5 border-indigo-500' : 'bg-slate-950/20 border-slate-850 hover:border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="subsistence_election"
                      checked={subsistenceElection === 'ch31'}
                      onChange={() => setSubsistenceElection('ch31')}
                      className="accent-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-200">Standard Chapter 31 Rate</span>
                  </div>
                  <p className="text-[10px] text-slate-450 pl-5">
                    Paid based on dependency count (spouse, children, parents). Ideal for low-cost living areas.
                  </p>
                </label>

                <label className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${
                  subsistenceElection === 'ch33' ? 'bg-indigo-500/5 border-indigo-500' : 'bg-slate-950/20 border-slate-850 hover:border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="subsistence_election"
                      checked={subsistenceElection === 'ch33'}
                      onChange={() => setSubsistenceElection('ch33')}
                      className="accent-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-200">Post-9/11 MHA Election Rate</span>
                  </div>
                  <p className="text-[10px] text-slate-450 pl-5">
                    Paid based on the ZIP code of your school (E-5 with dependents BAH rate). Ideal for high-cost areas.
                  </p>
                </label>
              </div>

              {subsistenceElection === 'ch33' && (
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Training Location ZIP Code</label>
                      <div className="relative">
                        <MapPin size={12} className="absolute left-2.5 top-3 text-slate-500" />
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="e.g. 20001"
                          className="w-full bg-slate-900 border border-slate-800 rounded py-2 pl-8 pr-2 text-xs text-slate-100 focus:border-indigo-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Monthly MHA ($)</label>
                      <input
                        type="number"
                        value={estimatedMha}
                        onChange={(e) => setEstimatedMha(e.target.value)}
                        placeholder="e.g. 2450"
                        className="w-full bg-slate-900 border border-slate-800 rounded py-2 px-2 text-xs text-slate-100 focus:border-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-start gap-2 text-[10px] text-indigo-300 leading-relaxed">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <strong>Election Criteria (38 U.S.C. § 3108(f)):</strong> To qualify for the Post-9/11 rate scale, you must possess remaining non-exhausted entitlement under the Post-9/11 GI Bill (Chapter 33) and sign a formal election form (VA Form 22-1995 or VRC equivalent) prior to the start of training.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Plan Modification Justification Textarea */}
            <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5">
                <Info size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Plan Justification & Necessity Statement</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                  Detailed Explanation / Personal Rationale
                </label>
                <textarea
                  placeholder="Explain how this specific career goal matches your capabilities and interest, and how the requested services directly accommodate your service-connected disabilities..."
                  value={trainingObjectives}
                  onChange={(e) => setTrainingObjectives(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                * A strong Statement of Necessity addresses physical/cognitive tolerances and documents that the requested services are required to prevent disability aggravation during training.
              </p>
            </div>
          </div>

          {/* Preview & Compiled Letter / Supporting Evidence */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex justify-between items-center bg-slate-900/30 border border-slate-850 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                  <Compass size={14} />
                </span>
                <span className="text-xs font-bold text-slate-200">IPE Justification Memo</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopyPlan} 
                  className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded text-slate-205 flex items-center gap-1 cursor-pointer transition"
                >
                  <Copy size={13} />
                  <span>{copyPlanSuccess ? 'Copied' : 'Copy'}</span>
                </button>
                <button 
                  onClick={handlePrintPlan} 
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 rounded text-white flex items-center gap-1 cursor-pointer transition"
                >
                  <Printer size={13} />
                  <span>Print Memo</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-5 overflow-y-auto max-h-[450px]">
              <pre className="text-[10px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                {compilePlanLetter()}
              </pre>
            </div>

            {/* Supporting Evidence Checklist */}
            <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Required Supporting Evidence</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Before submitting this plan/amendment to your VRC, secure the following supporting documents to guarantee approval and block arbitrary denials:
              </p>
              <div className="space-y-2 text-xs">
                <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                  <span className="text-[11px] text-slate-300">
                    <strong>Service-Connected Disability Rating Letter</strong> showing limitations matching the target occupational goal physical profile.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                  <span className="text-[11px] text-slate-300">
                    <strong>Local Labor Market Research (LMR)</strong> showing at least 3 job postings in the target occupation in your local area.
                  </span>
                </label>
                
                {selectedTrack === 'self_employment' && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-850 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] text-slate-300 text-indigo-300">
                      <strong>Draft Business Plan & Market Feasibility Study</strong> (Required for Category I/II Self-Employment under M28C.IV.C.3).
                    </span>
                  </label>
                )}
                {selectedTrack === 'independent_living' && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-850 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] text-slate-300 text-rose-300">
                      <strong>Independent Living Specialist Assessment</strong> detailing limitations in ADLs.
                    </span>
                  </label>
                )}
                {requiredServices.laptop && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] text-slate-300 text-indigo-300">
                      <strong>Course Syllabus / IT Requirement Policy</strong> showing computer requirements.
                    </span>
                  </label>
                )}
                {requiredServices.ergoChair && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] text-slate-300 text-indigo-300">
                      <strong>Medical Recommendation / PT Assessment</strong> justifying specific ergonomic furniture.
                    </span>
                  </label>
                )}
                {requiredServices.dental && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] text-slate-300 text-emerald-300">
                      <strong>VR&E Dental Referral Form (VA Form 10-10d)</strong> signed or requested from your VRC counselor.
                    </span>
                  </label>
                )}
                {requiredServices.tutoring && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] text-slate-300 text-indigo-300">
                      <strong>Midterm Deficiency Letter or Instructor Statement</strong> noting academic assistance is required.
                    </span>
                  </label>
                )}
                {subsistenceElection === 'ch33' && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] text-slate-300 text-indigo-300">
                      <strong>VA Certificate of Eligibility (COE)</strong> showing remaining Post-9/11 GI Bill eligibility.
                    </span>
                  </label>
                )}
              </div>
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

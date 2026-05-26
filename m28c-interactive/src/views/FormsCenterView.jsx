import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, Clipboard, Check, RotateCcw } from 'lucide-react';
import { renderTemplate } from '../utils/templateRenderer.js';

// Official VA Forms Directory Data
const OFFICIAL_FORMS = [
  {
    id: 'vaf_28_1900',
    number: 'VA Form 28-1900',
    name: 'Application for Vocational Rehabilitation for Claimants With Service-Connected Disabilities',
    purpose: 'Use this form to apply for VR&E Chapter 31 services. Veterans rated at 10% or higher with an employment handicap are eligible to apply.',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-28-1900-ARE.pdf'
  },
  {
    id: 'vaf_28_1902w',
    number: 'VA Form 28-1902w',
    name: 'Rehabilitation Needs Inventory (RNI)',
    purpose: 'Helps the Vocational Rehabilitation Counselor (VRC) evaluate your employment barriers, work history, physical limits, and independent living goals.',
    url: 'https://www.vba.va.gov/pubs/forms/VBA-28-1902w-ARE.pdf'
  },
  {
    id: 'vaf_28_0791',
    number: 'VA Form 28-0791',
    name: 'Pre- and Post-Independent Living Assessment',
    purpose: 'Standardized assessment tool used by the VRC or occupational therapists to evaluate independent living barriers and home/community modification needs.',
    url: 'https://www.va.gov/find-forms/about-form-28-0791/'
  },
  {
    id: 'vaf_28_1905',
    number: 'VA Form 28-1905',
    name: 'Authorization and Certification of Entrance or Reentrance into Rehabilitation and Certification of Status',
    purpose: 'The official authorization form issued by the VA to your school or facility, enabling them to bill the VA directly for your tuition, fees, and books.',
    url: 'https://www.va.gov/find-forms/about-form-28-1905/'
  },
  {
    id: 'vaf_28_1902n',
    number: 'VA Form 28-1902n',
    name: 'Counseling Record - Narrative Report',
    purpose: 'The document where the VRC records their official decision and narrative justification regarding your Serious Employment Handicap (SEH) and Feasibility.',
    url: 'https://www.va.gov/find-forms/about-form-28-1902n/'
  },
  {
    id: 'vaf_28_8872',
    number: 'VA Form 28-8872',
    name: 'Travel Voucher for Vocational Rehabilitation',
    purpose: 'Use this form to request reimbursement for travel mileage and expenses incurred during counseling appointments, evaluations, or job hunting.',
    url: 'https://www.va.gov/find-forms/about-form-28-8872/'
  },
  {
    id: 'vaf_20_0998',
    number: 'VA Form 20-0998',
    name: 'Your Rights to Seek Further Review of our Decision',
    purpose: 'The mandatory decision-notice attachment outlining your procedural rights and the timelines for supplemental claims, higher-level reviews, or board appeals.',
    url: 'https://www.va.gov/find-forms/about-form-20-0998/'
  },
  {
    id: 'vaf_20_10206',
    number: 'VA Form 20-10206',
    name: 'Freedom of Information Act (FOIA) / Privacy Act Request',
    purpose: 'Use this to request a complete copy of your VA Claims File (C-File), VR&E Counseling record, or medical logs.',
    url: 'https://www.va.gov/find-forms/about-form-20-10206/'
  },
  {
    id: 'vaf_21_4138',
    number: 'VA Form 21-4138',
    name: 'Statement in Support of Claim',
    purpose: 'A formal document used to submit personal statements, factual clarifications, or secondary evidence to support your VR&E claims or appeals.',
    url: 'https://www.va.gov/find-forms/about-form-21-4138/'
  },
  {
    id: 'vaf_21_22',
    number: 'VA Form 21-22',
    name: 'Appointment of Veterans Service Organization as Claimant\'s Representative',
    purpose: 'Appoints a chartered Veterans Service Organization (VSO) like the VFW, DAV, or American Legion to represent you and manage your VA claims.',
    url: 'https://www.va.gov/find-forms/about-form-21-22/'
  },
  {
    id: 'vaf_21_22a',
    number: 'VA Form 21-22a',
    name: 'Appointment of Individual as Claimant\'s Representative',
    purpose: 'Appoints a specific individual (attorney, accredited agent, or private advocate) to represent you in VA proceedings.',
    url: 'https://www.va.gov/find-forms/about-form-21-22a/'
  },
  {
    id: 'vaf_20_0995',
    number: 'VA Form 20-0995',
    name: 'Decision Review Request: Supplemental Claim',
    purpose: 'Submit this form if you have new and relevant evidence to reopen a disputed issue or denial within one year of the decision notice.',
    url: 'https://www.va.gov/find-forms/about-form-20-0995/'
  },
  {
    id: 'vaf_20_0996',
    number: 'VA Form 20-0996',
    name: 'Decision Review Request: Higher-Level Review (HLR)',
    purpose: 'Request a de novo review of your case record by a senior staff reviewer. No new evidence is permitted for HLR appeals.',
    url: 'https://www.va.gov/find-forms/about-form-20-0996/'
  },
  {
    id: 'vaf_10182',
    number: 'VA Form 10182',
    name: 'Decision Review Request: Board Appeal (Notice of Disagreement)',
    purpose: 'Appeal a VR&E decision directly to the Board of Veterans\' Appeals (BVA) in Washington, D.C. for a Veterans Law Judge review.',
    url: 'https://www.va.gov/find-forms/about-form-10182/'
  }
];

// Custom Templates List (matching the requested templates)
const CUSTOM_LETTERS = [
  { id: 'app_prep', name: 'Initial VRC Appointment Prep Sheet', authority: '38 C.F.R. § 21.50', template: 'VRC APPOINTMENT PREPARATION MEMORANDUM\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\nDate: {{date}}\n\n1. VOCATIONAL OBJECTIVES\nI am applying for VR&E Chapter 31 to pursue the following career goal: {{programName}}.\n\n2. PHYSICAL & COGNITIVE BARRIERS\nMy service-connected conditions are: {{serviceConnectedConditions}}.\nThese conditions restrict my capacity to perform work requiring: {{workLimitations}}.\n\n3. PROPOSED REHABILITATION TRACK\nI believe the optimal route for my case is the RTE (Rehabilitation to Employability) track to complete academic training, enabling me to enter a suitable, sedentary role. I request that the counselor complete VA Form 28-1902w to support this path.' },
  { id: 'eh_stmt', name: 'Employment Handicap Statement', authority: '38 C.F.R. § 21.51', template: 'STATEMENT IN SUPPORT OF EMPLOYMENT HANDICAP FINDING (38 C.F.R. § 21.51)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\nDate: {{date}}\n\n1. LIMITATIONS AT WORK\nMy service-connected disabilities ({{serviceConnectedConditions}}) cause the following barriers on the job: {{workLimitations}}.\n\n2. UNFITNESS OF RECENT JOBS\nMy recent employment was medically unsuitable because: {{workHistoryProblems}}.\n\n3. ACTION REQUESTED\nI request that the VA formally find that an Employment Handicap exists, qualifying me for rehabilitation services under Chapter 31.' },
  { id: 'sc_contrib', name: 'Service-Connected Contribution Statement', authority: '38 C.F.R. § 21.51', template: 'STATEMENT IN SUPPORT OF SERVICE CONNECTION CONTRIBUTION (38 C.F.R. § 21.51)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI assert that my service-connected disabilities contribute materially to my overall employment handicap. Specifically, the following rated conditions: {{serviceConnectedConditions}} prevent me from performing core duties of my past occupation, necessitating vocational retraining.' },
  { id: 'seh_stmt', name: 'Serious Employment Handicap Statement', authority: '38 C.F.R. § 21.52', template: 'STATEMENT IN SUPPORT OF SERIOUS EMPLOYMENT HANDICAP FINDING (38 C.F.R. § 21.52)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\n1. EVIDENCE OF SERIOUS IMPAIRMENT\nMy daily and occupational functioning is severely restricted by: {{serviceConnectedConditions}}.\n\n2. OCCUPATIONAL INSTABILITY\nI have faced frequent job losses and periods of unemployment due to my disabilities: {{workHistoryProblems}}.\n\n3. RELIEF REQUESTED\nI request an official Serious Employment Handicap (SEH) finding to extend my eligibility window and support program goals exceeding 48 months.' },
  { id: 'feas_rebut', name: 'Feasibility Rebuttal', authority: '38 C.F.R. § 21.53', template: 'REQUEST FOR RECONSIDERATION OF VOCATIONAL FEASIBILITY (38 C.F.R. § 21.53)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI dispute the counselor\'s determination that achieving a vocational goal is not currently reasonably feasible. While I experience severe limitations from {{serviceConnectedConditions}}, I can train and work if provided with: {{workLimitations}}.\nI request an Extended Evaluation plan (up to 12 months) under 38 C.F.R. § 21.74 to test my capacity in a supportive environment rather than closing my program.' },
  { id: 'ext_eval', name: 'Extended Evaluation Request', authority: '38 C.F.R. § 21.74', template: 'REQUEST FOR EXTENDED EVALUATION PLAN (38 C.F.R. § 21.74)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request a formal Extended Evaluation under 38 C.F.R. § 21.74. Ambiguity exists regarding my feasibility to enter employment due to {{serviceConnectedConditions}}. A structured trial period with therapy and assistive technology will help the VA make an accurate feasibility assessment, resolving reasonable doubts in my favor under 38 C.F.R. § 21.57.' },
  { id: 'ipe_amend', name: 'IPE Amendment Request', authority: '38 C.F.R. § 21.94', template: 'REQUEST FOR INDIVIDUALIZED WRITTEN REHABILITATION PLAN AMENDMENT (38 C.F.R. § 21.94)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request to amend my current signed IPE. Since signing, my vocational circumstances have changed: {{workHistoryProblems}}.\nI request that the primary vocational goal be updated to: {{programName}}, which is medically suitable and consistent with my limitations.' },
  { id: 'grad_just', name: 'Graduate School Justification', authority: 'M28C.IV.B.3', template: 'ADVANCED/GRADUATE DEGREE JUSTIFICATION STATEMENT (M28C.IV.B.3)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request authorization for graduate-level training to pursue: {{programName}}.\n1. ENTRY-LEVEL REQUIREMENTS\nO*NET and local labor market indices show that entry into this field requires a Master\'s or Professional degree.\n2. PHYSICAL FEASIBILITY\nMy service-connected conditions ({{serviceConnectedConditions}}) prevent me from performing lower-level, physically demanding roles in this industry. An advanced degree is required to secure a suitable, sedentary position consistent with my limitations.' },
  { id: 'supplies_req', name: 'Supplies/Computer Request', authority: '38 C.F.R. § 21.212', template: 'REQUEST FOR NECESSARY SUPPLIES AND TECHNOLOGY PACKAGE (38 C.F.R. § 21.212)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request authorization for the following required technology supplies: {{programName}}.\n1. PROGRAM REQUIREMENT\nEnclosed is the official school syllabus and course policy stating that these items are required for all enrolled students.\n2. PEER DISADVANTAGE\nWithout personal access to these tools, I am placed at a vocational and academic disadvantage relative to my peers, contrary to 38 C.F.R. § 21.212.' },
  { id: 'assist_tech', name: 'Assistive Technology Request', authority: '38 C.F.R. § 21.220', template: 'REQUEST FOR ASSISTIVE TECHNOLOGY & ADAPTIVE DEVICES (38 C.F.R. § 21.220)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request authorization for assistive technology/adaptive equipment: {{workLimitations}}.\nThese items are required to accommodate my service-connected orthopedic and cognitive limitations ({{serviceConnectedConditions}}), enabling me to complete coursework and avoid severe physical strain.' },
  { id: 'tuition_esc', name: 'Tuition/Books Emergency Escalation', authority: '38 C.F.R. § 21.262', template: 'EMERGENCY TUITION AND BOOK AUTHORIZATION ESCALATION (38 C.F.R. § 21.262)\n\nTo: VR&E Regional Officer / VRC Counselor\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nThis is an emergency escalation regarding unpaid tuition/books for my term starting: {{programName}}.\nDue to lack of VA authorization, my classes are at risk of being dropped on the deadline: {{workHistoryProblems}}.\nI request immediate Tungsten portal authorization under 38 C.F.R. § 21.262 to prevent academic disruption.' },
  { id: 'il_just', name: 'Independent Living Justification', authority: '38 U.S.C. § 3120', template: 'INDEPENDENT LIVING JUSTIFICATION MEMORANDUM (38 U.S.C. § 3120)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request an Independent Living Program (ILP) assessment under 38 C.F.R. § 21.160.\nMy service-connected conditions ({{serviceConnectedConditions}}) cause severe limitations in daily functioning: {{workLimitations}}.\nI request home safety evaluations and grab rail/ramp modifications to improve my community independence and reduce caregiver reliance.' },
  { id: 'retro_ind', name: 'Retroactive Induction Request', authority: '38 C.F.R. § 21.282', template: 'FORMAL REQUEST FOR RETROACTIVE INDUCTION REIMBURSEMENT (38 C.F.R. § 21.282)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request retroactive induction covering past training terms from {{programName}}.\nDuring this period, I held an active service-connected disability rating, and the training was related to my vocational goal. I request reimbursement of tuition and the restoration of utilized GI Bill months under manual chapter M28C.V.B.6.' },
  { id: 'reentrance_disc', name: 'Reentrance After Discontinuance', authority: '38 C.F.R. § 21.284', template: 'REQUEST FOR RE-ENTRY INTO VR&E SERVICES (38 C.F.R. § 21.284)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request to re-enter Chapter 31 services after my case was discontinued. Since closure, my circumstances have changed: {{workHistoryProblems}}.\nMy service-connected conditions ({{serviceConnectedConditions}}) continue to cause an employment handicap, and I am prepared to cooperate fully with a rehabilitation plan.' },
  { id: 'written_rat', name: 'Written Rationale Request', authority: '38 U.S.C. § 5104', template: 'FORMAL REQUEST FOR WRITTEN DECISION RATIONALE (38 U.S.C. § 5104)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI request a formal written Decision Notice regarding the verbal denial of my request for {{programName}} on date: {{date}}.\nUnder 38 U.S.C. § 5104, the VA is required to provide a written decision notice containing the reasons and bases, the evidence considered, and clear statement of appeal rights (VA Form 20-0998).' },
  { id: 'records_req', name: 'VR&E Records Request', authority: '38 C.F.R. § 1.577', template: 'REQUEST FOR ADMINISTRATIVE VR&E COUNSELING RECORDS (38 C.F.R. § 1.577)\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nUnder the Privacy Act of 1974, I request a complete copy of my VR&E counseling record, including all counselor case notes, emails, and VA Form 28-1902b evaluation summaries in my file.' },
  { id: 'sup_escalation', name: 'Supervisor/VREO Escalation', authority: 'M28C Case Standards', template: 'FORMAL CASE SUPERVISOR CONTEXT ESCALATION\n\nTo: VR&E Officer (VREO) / Assistant VREO\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI am escalating my case regarding a lack of response or billing delay. I have made multiple attempts to contact my counselor: {{workHistoryProblems}}.\nI request a supervisory conference to resolve these delays and prevent course drop deadlines.' },
  { id: 'cong_inq', name: 'Congressional Inquiry Summary', authority: 'Advocacy Action', template: 'CONGRESSIONAL INQUIRY STATEMENT OF BENEFITS DELAY\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nThis statement outlines a severe benefits delay by the VA Regional Office in my Chapter 31 case. Despite active enrollment, the VA has delayed payments and failed to respond to requests: {{workHistoryProblems}}.\nI request assistance in resolving this delay to prevent financial and academic harm.' },
  { id: 'oig_complaint', name: 'OIG Complaint Summary', authority: 'Administrative Oversight', template: 'OFFICE OF INSPECTOR GENERAL ADMINISTRATIVE COMPLAINT BRIEF\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\n\nI am filing an administrative complaint regarding procedural errors and refusal to issue written decision notices by the Regional Office VR&E staff. Counselor verbally denied my requests and refused to issue VA Form 20-0998 decision notices, violating 38 U.S.C. § 5104.' },
  { id: 'school_memo', name: 'School Compliance Memo', authority: '38 C.F.R. § 21.262', template: 'SCHOOL COMPLIANCE AND PROTECTIONS MEMORANDUM\n\nAttention: School Billing / Registrar Office\nVeteran Student: {{userName}}\n\nThis memorandum confirms that the student is an active participant in Chapter 31 VR&E. Under 38 C.F.R. § 21.262, the VA agrees to pay tuition directly. The school is prohibited from dropping courses or charging late fees due to payment delays by the VA.' },
  { id: 'cover_sheet', name: 'Authority Packet Cover Sheet', authority: 'Legal Submission', template: 'VR&E ADMINISTRATIVE DISPUTE SUBMISSION\n\nVeteran: {{userName}}\nClaim Number: {{claimNumber}}\nDISPUTE ITEM: {{programName}}\n\nENCLOSED LEGISLATION & CITATIONS:\n* Governing Statutes: 38 U.S.C. Chapter 31\n* Governing Regulations: 38 C.F.R. Part 21\n* Evidence Attached: Syllabi, Medical statements, and communication logs.' }
];

function FormsCenterView({ reduceMotion }) {
  const [activeTab, setActiveTab] = useState('va_forms'); // 'va_forms' | 'custom_letters'
  const [selectedLetter, setSelectedLetter] = useState(CUSTOM_LETTERS[0]);
  
  // Custom Letter Form Fields
  const [userName, setUserName] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [programName, setProgramName] = useState('');
  const [serviceConnectedConditions, setServiceConnectedConditions] = useState('');
  const [workLimitations, setWorkLimitations] = useState('');
  const [workHistoryProblems, setWorkHistoryProblems] = useState('');
  
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSelectLetter = (letter) => {
    setSelectedLetter(letter);
    setCopySuccess(false);
  };

  const compileLetterText = () => {
    const variables = {
      userName: userName || '[VETERAN NAME]',
      claimNumber: claimNumber || '[CLAIM NUMBER]',
      programName: programName || '[TARGET PROGRAM/ITEM]',
      serviceConnectedConditions: serviceConnectedConditions || '[LIST RATED CONDITIONS]',
      workLimitations: workLimitations || '[LIST PHYSICAL/COGNITIVE LIMITS]',
      workHistoryProblems: workHistoryProblems || '[LIST DATES/SPECIFIC DETAILS]',
      date: new Date().toLocaleDateString()
    };
    return renderTemplate(selectedLetter.template, variables);
  };

  const handleCopy = () => {
    const text = compileLetterText();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    const text = compileLetterText();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedLetter.name}</title>
          <style>
            body { font-family: Courier, monospace; white-space: pre-wrap; padding: 45px; color: #0f172a; font-size: 0.9rem; line-height: 1.5; }
          </style>
        </head>
        <body>${text}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const resetForm = () => {
    setUserName('');
    setClaimNumber('');
    setProgramName('');
    setServiceConnectedConditions('');
    setWorkLimitations('');
    setWorkHistoryProblems('');
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
          <h1 className="text-lg font-bold text-slate-100">Forms & Packets Center</h1>
          <p className="text-[11px] text-slate-400">Access official VA forms and generate customized strategic letters to advocate for your benefits.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      <div className="tabs-header mb-6">
        <button 
          className={`tab-btn ${activeTab === 'va_forms' ? 'active' : ''}`}
          onClick={() => setActiveTab('va_forms')}
        >
          Official VA Forms
        </button>
        <button 
          className={`tab-btn ${activeTab === 'custom_letters' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom_letters')}
        >
          Custom Letters & Prep Sheets
        </button>
      </div>

      {/* TAB 1: OFFICIAL VA FORMS DIRECTORY */}
      {activeTab === 'va_forms' && (
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Official VA PDF Forms</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_FORMS.map((form) => (
              <div 
                key={form.id}
                className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex flex-col justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-400 font-mono">{form.number}</span>
                    <span className="text-[9px] bg-slate-950 px-2 py-0.5 border border-slate-800 rounded font-semibold text-slate-400">PDF Form</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 leading-snug">{form.name}</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{form.purpose}</p>
                </div>
                
                <a 
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-secondary w-full text-center flex items-center justify-center gap-1.5 py-2"
                >
                  <Download size={14} />
                  <span>Download Form from VA.gov</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM VR&E LETTERS & PREP SHEETS */}
      {activeTab === 'custom_letters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Letters List Column */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Custom Templates (21)</span>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {CUSTOM_LETTERS.map((letter) => (
                <button
                  key={letter.id}
                  onClick={() => handleSelectLetter(letter)}
                  className={`w-full text-left p-3 rounded-lg border transition select-none flex items-center justify-between text-xs ${
                    selectedLetter.id === letter.id
                      ? 'bg-indigo-500/5 border-indigo-800/80 text-slate-100'
                      : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80 text-slate-350'
                  }`}
                >
                  <div className="font-semibold">{letter.name}</div>
                  <span className="text-[8px] font-mono text-indigo-400 border border-indigo-900/30 px-1.5 py-0.5 rounded bg-indigo-950/20">
                    {letter.authority.split('§')[1] ? '§' + letter.authority.split('§')[1].trim() : letter.authority}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form & Renders Column */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">{selectedLetter.name}</h3>
                  <span className="text-[9px] text-slate-450 block">Authority: <strong>{selectedLetter.authority}</strong></span>
                </div>
                <div className="flex gap-2">
                  <button onClick={resetForm} className="btn btn-sm btn-secondary flex items-center gap-1.5 h-8">
                    <RotateCcw size={12} />
                    <span>Clear</span>
                  </button>
                  <button onClick={handleCopy} className="btn btn-sm btn-secondary flex items-center gap-1.5 h-8">
                    {copySuccess ? <Check size={14} className="text-emerald-400" /> : <Clipboard size={14} />}
                    <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button onClick={handlePrint} className="btn btn-sm btn-primary flex items-center gap-1.5 h-8">
                    <Printer size={14} />
                    <span>Print Letter</span>
                  </button>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Veteran Name</label>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">VA Claim Number</label>
                  <input 
                    type="text" 
                    value={claimNumber} 
                    onChange={(e) => setClaimNumber(e.target.value)} 
                    placeholder="e.g. XXX-XX-1234"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Target Program / Goal / Item</label>
                  <input 
                    type="text" 
                    value={programName} 
                    onChange={(e) => setProgramName(e.target.value)} 
                    placeholder="e.g. BS in Computer Science"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Rated Service-Connected Conditions</label>
                  <input 
                    type="text" 
                    value={serviceConnectedConditions} 
                    onChange={(e) => setServiceConnectedConditions(e.target.value)} 
                    placeholder="e.g. PTSD, Degenerative disc disease"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Physical / Cognitive Limitations</label>
                  <input 
                    type="text" 
                    value={workLimitations} 
                    onChange={(e) => setWorkLimitations(e.target.value)} 
                    placeholder="e.g. Cannot sit/stand for more than 30 mins"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Dates / Specific Contact Attempts / History</label>
                  <input 
                    type="text" 
                    value={workHistoryProblems} 
                    onChange={(e) => setWorkHistoryProblems(e.target.value)} 
                    placeholder="e.g. Emailed on April 5th and 12th"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Rended Text Preview */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-5 overflow-y-auto max-h-[300px]">
                <pre className="text-[11px] text-slate-350 font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {compileLetterText()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default FormsCenterView;

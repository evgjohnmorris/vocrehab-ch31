import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, BookOpen, Shield, 
  AlertOctagon, Scale, Award, Compass, 
  AlertTriangle, Clock, 
  Briefcase, Mail, Check, Copy, ArrowLeft
} from 'lucide-react';

const WORKFLOWS = [
  {
    id: 'counselor_delay',
    title: 'Counselor Nonresponse',
    desc: 'Your VRC hasn\'t answered your email, eVA, or phone calls for weeks.',
    icon: <Mail className="text-amber-400" size={20} />,
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          { name: 'vrcName', label: 'Counselor\'s Name', type: 'text', placeholder: 'e.g. John Doe' },
          { name: 'lastContactDate', label: 'Date of Last Response', type: 'text', placeholder: 'e.g. April 12, 2026' },
          { name: 'followUpCount', label: 'Number of Follow-up Attempts', type: 'number', placeholder: 'e.g. 3' },
          { name: 'contactMethod', label: 'Primary Contact Method Used', type: 'select', options: ['eVA Portal', 'Email', 'Phone Call', 'Certified Mail'] }
        ]
      }
    ],
    generateLetter: (facts, stage) => {
      return `Date: ${new Date().toLocaleDateString()}

To: Vocational Rehabilitation and Employment Officer (VREO)
VA Regional Office

Subject: Request for Administrative Intervention – Counselor Nonresponse
Veteran: [Your Name]
Case Status Stage: ${stage}

Dear Vocational Rehabilitation and Employment Officer,

I am writing to formally request administrative intervention regarding my Chapter 31 Vocational Rehabilitation case. My assigned Vocational Rehabilitation Counselor (VRC), ${facts.vrcName || '[VRC Name]'}, has not responded to my repeated inquiries for an extended period.

My last successful contact with my counselor was on ${facts.lastContactDate || '[Date]'}. Since that date, I have attempted to follow up ${facts.followUpCount || 'several'} times via ${facts.contactMethod || 'email/eVA'}, with no response.

Under M28C guidelines and the VA's statutory duty to assist (38 U.S.C. § 5103A and 38 C.F.R. § 21.33), counselors are required to maintain active communication and assist veterans in executing their rehabilitation plans. The lack of response has caused significant administrative delay in my program.

Please contact me at your earliest convenience to assist in resolving this communication block, or assign an alternate counselor to my file.

Sincerely,

[Your Name]
[Your Contact Information]`;
    },
    errors: [
      'Failure to maintain contact constitutes a violation of the VA\'s Duty to Assist under 38 C.F.R. § 21.33.',
      'M28C policy guidelines require timely counselor action on veteran inquiries (typically 5 business days).'
    ],
    citations: ['38-usc-3115', '38-cfr-21-33']
  },
  {
    id: 'supplies_denial',
    title: 'Supplies / Laptop Denial',
    desc: 'VA counselor verbally denied a computer or claimed a flat annual spending cap.',
    icon: <Briefcase className="text-blue-400" size={20} />,
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          { name: 'programName', label: 'Degree / Training Program Name', type: 'text', placeholder: 'e.g. BS in Computer Science' },
          { name: 'schoolRequired', label: 'Does the school require a computer for all students in this program?', type: 'select', options: ['Yes', 'No'] },
          { name: 'disabilityNeed', label: 'Is a computer package necessary to accommodate your disability limitations?', type: 'select', options: ['Yes', 'No'] },
          { name: 'verbalDenialReason', label: 'What reason did the counselor give for the verbal denial?', type: 'text', placeholder: 'e.g. Said there is a flat $500 cap on supplies' }
        ]
      }
    ],
    generateLetter: (facts, stage) => {
      return `Date: ${new Date().toLocaleDateString()}

To: Assigned Vocational Rehabilitation Counselor (VRC)
VA Regional Office

Subject: Formal Request for Computer Technology Package (38 C.F.R. § 21.212)
Veteran: [Your Name]
Case Status Stage: ${stage}

Dear Counselor,

Please accept this letter as a formal, written request for authorization of a computer technology package required to pursue my approved rehabilitation plan in ${facts.programName || '[Program Name]'}.

Under 38 C.F.R. § 21.212 and § 21.220, the Department of Veterans Affairs is required to furnish all necessary supplies, including computer technology packages, when:
1. The school requires such supplies for all students in the program (School Required: ${facts.schoolRequired || 'Yes'}), or
2. The supplies are necessary to mitigate my disability limitations (Disability Necessity: ${facts.disabilityNeed || 'Yes'}), or
3. Lacking these supplies would place me at a distinct disadvantage.

Chapter 31 supplies are uncapped and based strictly on individual need. Any verbal assertion of flat annual dollar limits (such as a $500 cap) contradicts controlling regulations.

Please provide a formal written decision on VA Form 20-0998 explaining the legal basis and reasons for your decision if this request is denied, as required by 38 U.S.C. § 5104(b).

Sincerely,

[Your Name]`;
    },
    errors: [
      'VA counselor verbally denying necessary supplies instead of providing a written decision notice (VA Form 20-0998).',
      'Citing Post-9/11 GI Bill cap rules ($1,000/yr) or a flat $500 VR&E limit — Chapter 31 supplies are legally uncapped under 38 C.F.R. § 21.212.'
    ],
    citations: ['38-usc-3104', '38-cfr-21-210', '38-cfr-21-212', '38-cfr-21-220']
  },
  {
    id: 'tuition_unpaid',
    title: 'Tuition or Books Not Paid',
    desc: 'The school hasn\'t received payment, threatening late fees or registration holds.',
    icon: <Clock className="text-red-400" size={20} />,
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          { name: 'schoolName', label: 'Name of Educational Institution', type: 'text', placeholder: 'e.g. State University' },
          { name: 'termDates', label: 'Term Dates (e.g. Fall 2026)', type: 'text', placeholder: 'e.g. Sept - Dec 2026' },
          { name: 'daysDelayed', label: 'Days Payment is Overdue', type: 'number', placeholder: 'e.g. 45' },
          { name: 'hasHold', label: 'Has the school threatened registration holds or late fees?', type: 'select', options: ['Yes', 'No'] }
        ]
      }
    ],
    generateLetter: (facts, stage) => {
      return `Date: ${new Date().toLocaleDateString()}

To: Vocational Rehabilitation and Employment Officer (VREO)
VA Regional Office

Subject: URGENT: Overdue Tuition / Fee Payment to ${facts.schoolName || '[School Name]'}
Veteran: [Your Name]
Case Status Stage: ${stage}

Dear Vocational Rehabilitation and Employment Officer,

I am writing to bring an urgent payment delay to your attention. My tuition and fees for the term ${facts.termDates || '[Term Dates]'} at ${facts.schoolName || '[School Name]'} remain unpaid. This payment is currently ${facts.daysDelayed || 'many'} days overdue.

Due to this delay, the institution has threatened administrative holds or late fees (Hold Status: ${facts.hasHold || 'Yes'}). 

Under 38 C.F.R. § 21.260 and M28C guidelines, Chapter 31 services are direct-payment authorizations. The veteran is not responsible for tuition payment when acting under an approved IPE. Furthermore, VA billing guidelines protect veterans from registration holds or penalties due to VA administrative delays.

I request that my case file be reviewed immediately and the overdue payment authorization be transmitted via Tungsten/VA channels to prevent enrollment cancellation.

Sincerely,

[Your Name]`;
    },
    errors: [
      'Allowing administrative delays to penalize the veteran\'s active enrollment.',
      'Failing to coordinate with the School Certifying Official to resolve billing errors.'
    ],
    citations: ['38-usc-3108', '38-cfr-21-260']
  },
  {
    id: 'case_closed',
    title: 'Interrupted / Discontinued Case',
    desc: 'Your counselor paused (interrupted) or closed (discontinued) your case.',
    icon: <AlertTriangle className="text-red-500" size={20} />,
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          { name: 'reasonGiven', label: 'Reason counselor gave for pause/closure', type: 'text', placeholder: 'e.g. Claimed lack of contact or no progress' },
          { name: 'hadNotice', label: 'Did you receive a written 10-day warning before closure?', type: 'select', options: ['Yes', 'No'] },
          { name: 'hadVaf200998', label: 'Did you receive a formal written decision (VA Form 20-0998)?', type: 'select', options: ['Yes', 'No'] }
        ]
      }
    ],
    generateLetter: (facts, stage) => {
      return `Date: ${new Date().toLocaleDateString()}

To: Assigned Vocational Rehabilitation Counselor (VRC) / VREO
VA Regional Office

Subject: Request for Reinstatement and Administrative Review of Case Status
Veteran: [Your Name]
Case Status Stage: ${stage}

Dear VRC / VREO,

I am writing to formally request an administrative review and reinstatement of my Chapter 31 case, which was recently interrupted or discontinued.

My case was paused/closed based on the assertion: "${facts.reasonGiven || '[Reason]'}"
Notice Defect Details:
- Written 10-day warning received: ${facts.hadNotice || 'No'}
- Formal decision VA Form 20-0998 received: ${facts.hadVaf200998 || 'No'}

Under 38 C.F.R. § 21.197, § 21.198, and M28C guidelines, the VA cannot discontinue or interrupt a veteran's active rehabilitation plan without issuing prior written warning and a formal opportunity to respond. Closing a case without providing these notices is a procedural violation.

I request a local administrative conference to discuss the reinstatement of my case and to amend my IPE if medical or vocational adjustments are needed.

Sincerely,

[Your Name]`;
    },
    errors: [
      'Closing a case without sending a written 10-day notice of intent to discontinue.',
      'Failing to issue a formal written decision notice (VA Form 20-0998) explaining appeal rights.'
    ],
    citations: ['38-cfr-21-197', '38-cfr-21-198', '38-cfr-21-362']
  },
  {
    id: 'feasibility_denial',
    title: 'Feasibility Denial',
    desc: 'VRC claims training is not feasible because your disabilities are too severe.',
    icon: <AlertOctagon className="text-amber-500" size={20} />,
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          { name: 'ratingPercentage', label: 'Disability Rating Percentage', type: 'text', placeholder: 'e.g. 70%' },
          { name: 'hasDoctorLetter', label: 'Do you have a letter from a physician supporting training?', type: 'select', options: ['Yes', 'No'] },
          { name: 'proposedGoal', label: 'Proposed Vocational Goal', type: 'text', placeholder: 'e.g. Accountant' }
        ]
      }
    ],
    generateLetter: (facts, stage) => {
      return `Date: ${new Date().toLocaleDateString()}

To: Assigned Vocational Rehabilitation Counselor (VRC)
VA Regional Office

Subject: Request for Extended Evaluation / Rebuttal of Feasibility Denial (38 C.F.R. § 21.57)
Veteran: [Your Name]
Case Status Stage: ${stage}

Dear Counselor,

I am writing to formally rebut the determination that it is not reasonably feasible for me to achieve a vocational goal under Chapter 31 due to the severity of my service-connected disabilities.

I hold a disability rating of ${facts.ratingPercentage || '[Rating]'}. My proposed vocational goal is ${facts.proposedGoal || '[Goal]'}. 

Under 38 C.F.R. § 21.57, the counselor must resolve all reasonable doubt in favor of the veteran regarding feasibility. If there is doubt, the VA must authorize an Extended Evaluation under 38 C.F.R. § 21.74 to assess my capability rather than issuing an immediate feasibility denial.

I have medical support (Doctor Letter Available: ${facts.hasDoctorLetter || 'Yes'}) confirming that with reasonable accommodations, I am fully capable of training and pursuing employment in my proposed field.

I request that my file be placed in Extended Evaluation status to formally evaluate my feasibility over a structured period.

Sincerely,

[Your Name]`;
    },
    errors: [
      'Failing to resolve reasonable doubt in favor of feasibility as mandated by 38 C.F.R. § 21.57.',
      'Denying feasibility without offering an Extended Evaluation (38 C.F.R. § 21.74) to fully evaluate capabilities.'
    ],
    citations: ['38-usc-3106', '38-cfr-21-53', '38-cfr-21-57', '38-cfr-21-74']
  },
  {
    id: 'ipe_change',
    title: 'IPE Amendment / Goal Change',
    desc: 'You want to change your training goal, but your VRC refuses to update the plan.',
    icon: <Compass className="text-indigo-400" size={20} />,
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          { name: 'currentGoal', label: 'Current Approved Goal in IPE', type: 'text', placeholder: 'e.g. Sales Manager' },
          { name: 'newGoal', label: 'Proposed New Goal', type: 'text', placeholder: 'e.g. Software Engineer' },
          { name: 'changeReason', label: 'Reason for the change (e.g. condition worsened)', type: 'text', placeholder: 'e.g. Physical standing requirements aggravate back condition' }
        ]
      }
    ],
    generateLetter: (facts, stage) => {
      return `Date: ${new Date().toLocaleDateString()}

To: Assigned Vocational Rehabilitation Counselor (VRC)
VA Regional Office

Subject: Request for Individualized Written Rehabilitation Plan (IWRP) Amendment
Veteran: [Your Name]
Case Status Stage: ${stage}

Dear Counselor,

I am writing to formally request an amendment to my Individualized Written Rehabilitation Plan (IWRP) under 38 C.F.R. § 21.94.

My current approved goal is ${facts.currentGoal || '[Goal]'}. I request to amend my plan to target the vocational goal of ${facts.newGoal || '[Goal]'}.

This amendment is necessary due to the following changes/facts:
${facts.changeReason || '[Reason]'}

Under 38 C.F.R. § 21.94, a rehabilitation plan may be changed or amended when there is a documented change in the veteran's condition, new vocational limitations, or when the original goal is determined to no longer be suitable.

I request a counselor conference to discuss and formally sign the amended plan.

Sincerely,

[Your Name]`;
    },
    errors: [
      'Arbitrarily denying plan changes when medical condition or limitations have changed.',
      'Refusing to issue a written decision notice when IPE amendment request is denied.'
    ],
    citations: ['38-cfr-21-80', '38-cfr-21-94']
  },
  {
    id: 'seh_extension',
    title: '48-Month Extension / SEH',
    desc: 'You are approaching 48 months of benefits and need an extension to graduate.',
    icon: <Award className="text-emerald-400" size={20} />,
    steps: [
      {
        title: 'Collected Facts',
        fields: [
          { name: 'monthsUsed', label: 'Months of Entitlement Used So Far', type: 'number', placeholder: 'e.g. 44' },
          { name: 'hasSeh', label: 'Has the VRC declared you have a Serious Employment Handicap (SEH)?', type: 'select', options: ['Yes', 'No'] },
          { name: 'extensionReason', label: 'Reason extension is needed to complete plan', type: 'text', placeholder: 'e.g. Double major required to secure suitable entry-level placement' }
        ]
      }
    ],
    generateLetter: (facts, stage) => {
      return `Date: ${new Date().toLocaleDateString()}

To: Assigned Vocational Rehabilitation Counselor (VRC)
VA Regional Office

Subject: Request for Program Extension Beyond 48 Months (38 C.F.R. § 21.78)
Veteran: [Your Name]
Case Status Stage: ${stage}

Dear Counselor,

I am writing to formally request an extension of my Chapter 31 entitlement beyond the standard 48-month limitation, as authorized under 38 U.S.C. § 3105 and 38 C.F.R. § 21.78.

I have currently used ${facts.monthsUsed || '44'} months of entitlement. (Serious Employment Handicap Status: ${facts.hasSeh || 'Yes'}).

Under 38 C.F.R. § 21.78, the VA may approve training beyond 48 months when the veteran is determined to have a Serious Employment Handicap (SEH) and additional training is necessary to achieve the rehabilitation goal. 

An extension is required to complete my vocational program due to:
${facts.extensionReason || '[Reason]'}

I request that you review my eligibility and process this extension to prevent any interruption in my academic enrollment.

Sincerely,

[Your Name]`;
    },
    errors: [
      'Asserting that the 48-month limit is a hard statutory cap that can never be extended.',
      'Claiming VREO signature is always required when extension concurrence was legally delegated under the 2024 final rule.'
    ],
    citations: ['38-usc-3105', '38-cfr-21-44', '38-cfr-21-78']
  }
];

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
                  key={wf.id}
                  className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:bg-slate-900/60 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                        {wf.icon}
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
                  <p className="text-[11px] text-slate-400 leading-relaxed">This helps tailor the letter to your counselor\'s active file context.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {CASE_STAGES.map((stageName) => (
                    <button
                      key={stageName}
                      onClick={() => setTempStage(stageName)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-semibold border transition text-center cursor-pointer ${
                        tempStage === stageName
                          ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                          : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-750'
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
                      {activeWorkflow.id === 'counselor_delay' ? 'Submit this letter to the VR&E Officer at your local VA Regional Office.' : 'Submit this formal written request via the eVA portal or via certified mail, and demand a written decision notice (VA Form 20-0998).'}
                    </p>
                  </div>
                </div>

                {/* Right col: Letter Generation */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Custom Action Letter Draft</span>
                    <button
                      onClick={() => handleCopyLetter(activeWorkflow.generateLetter(formFacts, tempStage))}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-semibold transition flex items-center gap-1"
                    >
                      {copiedLetter ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedLetter ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <textarea
                    readOnly
                    className="w-full h-80 bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-[11px] font-mono text-slate-300 leading-relaxed select-all focus:outline-none focus:border-slate-700"
                    value={activeWorkflow.generateLetter(formFacts, tempStage)}
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

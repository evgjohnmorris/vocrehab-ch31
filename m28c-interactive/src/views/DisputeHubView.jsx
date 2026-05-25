import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Scale, Clipboard, Printer, 
  ChevronRight, BarChart2, Calendar, Plus, Trash2, 
  AlertTriangle, Shield, Check, Info, FileText
} from 'lucide-react';
import AuthorityBadge from '../components/AuthorityBadge';

const DISPUTE_AREAS = [
  {
    id: 'computer_denial',
    name: 'Computer & Technology Supplies',
    description: 'Counselor denied a laptop, printer, or software, claiming a local budget cap (e.g. $500) or that tech is not covered.',
    vrcArguments: [
      { id: 'flat_cap', label: 'VRC claims a flat $500 cap on computer purchases.', correction: 'VA regulations and M28C guidelines contain NO flat dollar cap for necessary supplies. Supplies are authorized based on individual rehabilitation necessity.' },
      { id: 'no_need', label: 'VRC claims a laptop is not required because the school has a public computer lab.', correction: 'Under 38 C.F.R. § 21.220, if lack of a personal computer puts the veteran at a peer disadvantage or if disability limits computer lab use, a computer package must be provided.' },
      { id: 'gi_bill_stipend', label: 'VRC states books/supplies are covered by a fixed stipend like the GI Bill.', correction: 'Chapter 31 is a rehabilitation program and covers 100% of all required books, tools, and supplies, unlike the fixed Chapter 33 book stipend.' }
    ],
    evidenceChecklist: [
      { id: 'syllabus', text: 'Official course syllabus showing computer or software requirements', weight: 25 },
      { id: 'school_policy', text: 'School policy letter stating a personal computer is required for all enrolled students', weight: 25 },
      { id: 'personal_statement', text: 'Personal statement of necessity outlining why a personal computer is required due to disability or peer disadvantages', weight: 30 },
      { id: 'medical_backing', text: 'Medical letter or OT recommendation outlining physical/cognitive need for adaptive technology', weight: 20 }
    ],
    citations: [
      { citation: '38 U.S.C. § 3104(a)(7)', level: 'binding-statute', relevance: 'Authorizes provision of necessary books, supplies, and equipment.' },
      { citation: '38 C.F.R. § 21.212', level: 'binding-regulation', relevance: 'Establishes policy that VA will furnish necessary supplies for training.' },
      { citation: '38 C.F.R. § 21.220', level: 'binding-regulation', relevance: 'Governs computer packages based on peer disadvantage or disability.' },
      { citation: 'M28C.V.A.3', level: 'va-policy', relevance: 'Governs provision of services, supplies, and equipment, prohibiting flat spending caps.' }
    ],
    rebuttalPushback: 'VA often pushes back claiming that they have a standard package. Rebut by demanding an individualized analysis tied to your training syllabus and disability restrictions under 38 C.F.R. § 21.212.'
  },
  {
    id: 'seh_extension',
    name: '48-Month Entitlement Extension',
    description: 'Counselor refused to extend training beyond 48 months or extend the 12-year period of eligibility.',
    vrcArguments: [
      { id: 'hard_48', label: 'VRC claims the 48-month limit is statutory and cannot be extended.', correction: '38 U.S.C. § 3105(c) and 38 C.F.R. § 21.78 explicitly authorize extensions beyond 48 months for veterans with a Serious Employment Handicap (SEH).' },
      { id: 'no_seh_extension', label: 'VRC asserts your 12-year basic eligibility window is closed and cannot be bypassed.', correction: '38 C.F.R. § 21.44 mandates that the eligibility period must be extended if the veteran has an SEH and requires training to overcome it.' }
    ],
    evidenceChecklist: [
      { id: 'seh_finding', text: 'Initial VRC evaluation document showing a Serious Employment Handicap (SEH) finding', weight: 30 },
      { id: 'iwrp_copy', text: 'Copy of your current signed IWRP/IPE detailing the course of study', weight: 20 },
      { id: 'transcript_incomplete', text: 'Official transcripts showing incomplete coursework and credits remaining', weight: 25 },
      { id: 'lmi_proof', text: 'Labor market reports showing that the current target goal is the only viable path to suitable employment', weight: 25 }
    ],
    citations: [
      { citation: '38 U.S.C. § 3105(c)', level: 'binding-statute', relevance: 'Authorizes services beyond 48 months to overcome a Serious Employment Handicap.' },
      { citation: '38 C.F.R. § 21.44', level: 'binding-regulation', relevance: 'Authorizes extension of the basic period of eligibility for veterans with an SEH.' },
      { citation: '38 C.F.R. § 21.78', level: 'binding-regulation', relevance: 'Defines VREO/VRC authority to approve programs exceeding 48 months.' },
      { citation: 'M28C.IV.A.2', level: 'va-policy', relevance: 'Outlines serious employment handicap (SEH) definitions and counselor decision boundaries.' }
    ],
    rebuttalPushback: 'VA will assert that the 48-month cap is strict. Rebut by proving that you have an SEH, meaning your disabilities are severe enough to create a significant barrier to employment, which triggers the mandatory extension rules.'
  },
  {
    id: 'retroactive_induction',
    name: 'Retroactive Induction / GI Bill Restore',
    description: 'Counselor denied retroactive authorization for past training, claiming you cannot restore GI Bill months already used.',
    vrcArguments: [
      { id: 'pre_apply', label: 'VRC claims retroactive induction cannot cover periods prior to your formal application date.', correction: '38 C.F.R. § 21.282 and manual M28C.V.B.6 explicitly allow retroactive induction covering past periods of training prior to application.' },
      { id: 'gi_bill_used', label: 'VRC asserts retroactive adjustments are barred if Chapter 33 Post-9/11 GI Bill was already utilized.', correction: 'VA policy commands that past GI Bill usage must be adjusted to Chapter 31, and all utilized GI Bill months restored to the veteran.' }
    ],
    evidenceChecklist: [
      { id: 'rating_during_training', text: 'DD-214 and VA Rating Decisions proving you held a disability rating during the past training', weight: 30 },
      { id: 'tuition_invoices', text: 'Itemized tuition invoices and receipts proving you paid for the school terms', weight: 25 },
      { id: 'transcripts_grades', text: 'Official transcripts showing completed courses and passing grades during the retroactive terms', weight: 25 },
      { id: 'iwrp_goal_match', text: 'Approved IWRP detailing a vocational goal directly matching the past program of study', weight: 20 }
    ],
    citations: [
      { citation: '38 U.S.C. § 3104(a)(1)', level: 'binding-statute', relevance: 'Authorizes retroactive adjustments and reimbursements for past training.' },
      { citation: '38 C.F.R. § 21.282', level: 'binding-regulation', relevance: 'Defines rules for retroactive induction effective dates.' },
      { citation: 'M28C.V.B.6', level: 'va-policy', relevance: 'Sets detailed operational procedures for VRCs to process retroactive adjustments and restore GI Bill months under sections 6.03 (self-pay) and 6.04 (Chapter 33).' }
    ],
    rebuttalPushback: 'VA often claims that retroactive induction is only for extreme cases. Point to M28C.V.B.6 which outlines clear conditions for self-pay and Chapter 33 transfers.'
  },
  {
    id: 'feasibility_denial',
    name: 'Vocational Feasibility Rebuttal',
    description: 'Counselor declared you "not feasible" to achieve a vocational goal, attempting to close your case without services.',
    vrcArguments: [
      { id: 'checklist_close', label: 'VRC denied feasibility based on standard aptitude tests or a brief review rather than individualized evaluation.', correction: 'Feasibility decisions require a comprehensive, multidisciplinary assessment under 38 C.F.R. § 21.50.' },
      { id: 'doubt_resolved', label: 'VRC resolved clinical or vocational ambiguities against the veteran.', correction: '38 C.F.R. § 21.57 commands that VRCs must resolve all reasonable doubt in favor of the veteran.' }
    ],
    evidenceChecklist: [
      { id: 'medical_accommodations', text: 'Physician or therapist statement explaining how you can work with specific accommodations', weight: 35 },
      { id: 'capacity_proof', text: 'Documentation of recent volunteer work, courses completed, or hobbies showing functional capacity', weight: 35 },
      { id: 'vrc_eval_copy', text: 'Copy of the VRC assessment report detailing specific objections', weight: 30 }
    ],
    citations: [
      { citation: '38 U.S.C. § 3106(a)', level: 'binding-statute', relevance: 'Requires VA to conduct initial evaluations to determine vocational feasibility.' },
      { citation: '38 C.F.R. § 21.57', level: 'binding-regulation', relevance: 'Commands VRCs to resolve all doubts in favor of the veteran.' },
      { citation: '38 C.F.R. § 21.74', level: 'binding-regulation', relevance: 'Mandates Extended Evaluation (up to 12 months) when feasibility is uncertain.' },
      { citation: 'M28C.IV.B.3', level: 'va-policy', relevance: 'Governs VRC feasibility determinations and guidelines for graduate education and advanced degree approvals.' }
    ],
    rebuttalPushback: 'Counselors use unfeasibility to exit veterans who are expensive to rehabilitate. Rebut by demanding an Extended Evaluation under 38 C.F.R. § 21.74 to test your capacity with support.'
  },
  {
    id: 'counselor_delay',
    name: 'Counselor Non-Response / Delay',
    description: 'Your VRC has stopped responding to emails/calls, missed appointments, or delayed authorizing classes/vouchers.',
    vrcArguments: [
      { id: 'delay_unresponsive', label: 'Counselor does not respond or states that they have high caseloads and cannot follow up.', correction: 'M28C service standards require timely case management. Long communication gaps disrupt active training plans and violate the VA duty to assist.' }
    ],
    evidenceChecklist: [
      { id: 'email_logs', text: 'Log of emails sent with read receipts or date stamps showing no reply', weight: 40 },
      { id: 'call_timeline', text: 'Interactive contact timeline entered below outlining method and result', weight: 40 },
      { id: 'school_delay_impact', text: 'Letter from school certifying official stating classes are at risk of drop due to lack of auth', weight: 20 }
    ],
    citations: [
      { citation: '38 U.S.C. § 5103A', level: 'binding-statute', relevance: 'Establishes the VA Duty to Assist claimants throughout the benefits process.' },
      { citation: '38 C.F.R. § 21.362', level: 'binding-regulation', relevance: 'Governs case manager responsibilities to coordinate, schedule, and maintain participant progress.' },
      { citation: 'M28C.IV.C.1', level: 'va-policy', relevance: 'Sets detailed casework procedures and timelines for counselor response and service provision.' }
    ],
    rebuttalPushback: 'VRCs may claim they never received your request. Protect yourself by uploading documentation through QuickSubmit so the date is legally stamped in your VA file.'
  },
  {
    id: 'tuition_unpaid',
    name: 'School Tuition / Books Unpaid',
    description: 'School term starts soon or has started, but VA has not authorized tuition payments or book vouchers.',
    vrcArguments: [
      { id: 'auth_late', label: 'Counselor states the authorization (tungsten auth/VAF 28-1905) will be processed when workload allows.', correction: 'VA must authorize tuition and supplies prior to term start to prevent veterans from facing drop deadlines or book shortages.' }
    ],
    evidenceChecklist: [
      { id: 'term_start_proof', text: 'Official term class schedule showing start date', weight: 30 },
      { id: 'tuition_invoice', text: 'Unpaid school account statement or invoice showing billing deadline', weight: 30 },
      { id: 'sco_statement', text: 'Email or statement from School Certifying Official indicating lack of active VA authorization', weight: 40 }
    ],
    citations: [
      { citation: '38 C.F.R. § 21.262', level: 'binding-regulation', relevance: 'Dictates rules for payment of school tuition and fees directly by VA.' },
      { citation: '38 C.F.R. § 21.212', level: 'binding-regulation', relevance: 'Mandates the provision of required books, tools, and supplies prior to the commencement of courses.' },
      { citation: 'M28C.V.B.1', level: 'va-policy', relevance: 'Outlines standard business processes for generating authorizations in Tungsten portal.' }
    ],
    rebuttalPushback: 'VA may blame school billing systems. Check with your School Certifying Official (SCO) to confirm if the VA has submitted VAF 28-1905 in the portal first.'
  },
  {
    id: 'case_closed',
    name: 'Case Closed / Discontinued',
    description: 'Your case was closed or placed in interrupted status due to supposed lack of cooperation or progress.',
    vrcArguments: [
      { id: 'cooperation_fail', label: 'VRC closed the case claiming you failed to cooperate or did not attend appointments.', correction: 'VA must issue a formal 30-day warning letter (VAF 28-0950 equivalent) outlining exact actions required to avoid closure, and must offer a supervisor conference.' },
      { id: 'no_notice', label: 'VRC closed the case without issuing a formal written decision and statement of appeal rights.', correction: '38 U.S.C. § 5104 requires written decision notices with detailed rationales and appeal options for all benefits terminations.' }
    ],
    evidenceChecklist: [
      { id: 'no_warning_letter', text: 'Lack of written 30-day intent to discontinue letter in your possession', weight: 35 },
      { id: 'contact_proof_closure', text: 'Evidence of emails or letters sent to counselor during the closure period proving cooperation', weight: 35 },
      { id: 'medical_excuse', text: 'Doctor note outlining medical emergency that prevented attendance at the missed appointment', weight: 30 }
    ],
    citations: [
      { citation: '38 U.S.C. § 5104', level: 'binding-statute', relevance: 'Requires VA to provide written notice of decisions affecting benefits, including appeal rights.' },
      { citation: '38 C.F.R. § 21.360', level: 'binding-regulation', relevance: 'Governs procedures for interrupting a veteran\'s program of rehabilitation.' },
      { citation: '38 C.F.R. § 21.197', level: 'binding-regulation', relevance: 'Details standard procedures for case discontinuation and the required 30-day warning notice.' }
    ],
    rebuttalPushback: 'VRCs close cases to clean their logs. Rebut by proving that you did not receive the mandatory 30-day warning letter or that you responded within the window.'
  },
  {
    id: 'grad_school',
    name: 'Graduate School Denied',
    description: 'Counselor denied graduate school or advanced degree training, claiming Chapter 31 only covers entry-level bachelor degrees.',
    vrcArguments: [
      { id: 'entry_only', label: 'VRC claims VR&E only rehabilitates to entry-level jobs and cannot pay for masters or professional degrees.', correction: 'VA manual rules and C.F.R. policies allow graduate training if it is required for entry into the target field or if severe disabilities restrict placement to fields requiring advanced degrees.' }
    ],
    evidenceChecklist: [
      { id: 'onet_credentials', text: 'O*NET or BLS printout showing target job requires a graduate degree for entry', weight: 30 },
      { id: 'job_listings_grad', text: '3 local entry-level job listings in the field showing a Master\'s/Juris Doctor is mandatory', weight: 30 },
      { id: 'medical_sedentary_grad', text: 'Medical statement showing physical limits block all Bachelor-level roles but allow advanced roles', weight: 40 }
    ],
    citations: [
      { citation: '38 C.F.R. § 21.80', level: 'binding-regulation', relevance: 'Dictates the selection and formulation of the vocational goal.' },
      { citation: '38 C.F.R. § 21.50', level: 'binding-regulation', relevance: 'Requires that the rehabilitation plan enable the veteran to attain suitable employment.' },
      { citation: 'M28C.IV.B.3', level: 'va-policy', relevance: 'Confirms advanced degrees may be approved if required to overcome employment barriers.' }
    ],
    rebuttalPushback: 'VA will push back saying that you can get a lower-level job. Rebut by showing that your service-connected disabilities rule out those lower-level jobs, making advanced education the only viable path to a suitable career.'
  }
];

function DisputeHubView({ 
  reduceMotion,
  userMode = 'veteran',
  currentCaseStage = 'not_applied',
  setCurrentCaseStage
}) {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'timeline' | 'evidence' | 'brief' | 'packet'
  const [selectedArea, setSelectedArea] = useState(() => {
    const prefill = sessionStorage.getItem('dispute_hub_prefill') || localStorage.getItem('dispute_hub_prefill');
    if (prefill) {
      const match = DISPUTE_AREAS.find(a => a.id === prefill);
      if (match) return match;
    }
    return DISPUTE_AREAS[0];
  });
  
  // State for Denial Analyzer
  const [selectedArgumentId, setSelectedArgumentId] = useState(selectedArea.vrcArguments[0]?.id || '');
  const [hasWrittenNotice, setHasWrittenNotice] = useState('no'); // 'yes' | 'no' | 'email'
  
  // State for Evidence Sufficiency
  const [checkedEvidence, setCheckedEvidence] = useState({}); // { [evidenceId]: boolean }

  // State for Contact Timeline Logger
  const [contactsLog, setContactsLog] = useState(() => {
    const saved = sessionStorage.getItem('m28c_contacts_log');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: '2026-05-01', method: 'Email', person: 'VRC Counselor', request: 'Requested laptop voucher update', response: 'No response' },
      { id: '2', date: '2026-05-10', method: 'Email', person: 'VRC Counselor', request: 'Second follow-up on laptop', response: 'No response' }
    ];
  });
  const [newContact, setNewContact] = useState({ date: '', method: 'Email', person: 'VRC Counselor', request: '', response: 'No response' });

  // State for Rebuttal Brief
  const [userFacts, setUserFacts] = useState({
    veteranName: '',
    claimNumber: '',
    schoolOrProgram: '',
    counselorArgument: selectedArea.vrcArguments[0]?.label || '',
    personalContext: ''
  });

  const [selectedCitations, setSelectedCitations] = useState(() => {
    const initialCerts = {};
    selectedArea.citations.forEach((_, idx) => {
      initialCerts[idx] = true;
    });
    return initialCerts;
  });
  const [copySuccess, setCopySuccess] = useState(false);

  // Synchronize dynamic pre-fills
  useEffect(() => {
    const handleDisputeArea = (e) => {
      const match = DISPUTE_AREAS.find(a => a.id === e.detail);
      if (match) handleAreaChange(match);
    };
    const handleDisputeTab = (e) => {
      setActiveTab(e.detail);
    };

    window.addEventListener('change-dispute-area', handleDisputeArea);
    window.addEventListener('change-dispute-tab', handleDisputeTab);

    // Clean pre-fills from storage on mount
    sessionStorage.removeItem('dispute_hub_prefill');
    localStorage.removeItem('dispute_hub_prefill');

    return () => {
      window.removeEventListener('change-dispute-area', handleDisputeArea);
      window.removeEventListener('change-dispute-tab', handleDisputeTab);
    };
  }, []);

  const handleAreaChange = (area) => {
    setSelectedArea(area);
    setSelectedArgumentId(area.vrcArguments[0]?.id || '');
    
    const initialCerts = {};
    area.citations.forEach((_, idx) => {
      initialCerts[idx] = true;
    });
    setSelectedCitations(initialCerts);
    setCheckedEvidence({});
    setUserFacts(prev => ({
      ...prev,
      counselorArgument: area.vrcArguments[0]?.label || ''
    }));
  };

  const handleArgumentSelect = (argId) => {
    setSelectedArgumentId(argId);
    const arg = selectedArea.vrcArguments.find(a => a.id === argId);
    if (arg) {
      setUserFacts(prev => ({
        ...prev,
        counselorArgument: arg.label
      }));
    }
  };

  // Add Contact log entry
  const handleAddContact = () => {
    if (!newContact.date || !newContact.request) {
      alert('Please fill out the contact date and request details.');
      return;
    }
    const item = {
      id: Date.now().toString(),
      ...newContact
    };
    const updated = [...contactsLog, item];
    setContactsLog(updated);
    sessionStorage.setItem('m28c_contacts_log', JSON.stringify(updated));
    setNewContact({ date: '', method: 'Email', person: 'VRC Counselor', request: '', response: 'No response' });
  };

  // Delete Contact log entry
  const handleDeleteContact = (id) => {
    const updated = contactsLog.filter(c => c.id !== id);
    setContactsLog(updated);
    sessionStorage.setItem('m28c_contacts_log', JSON.stringify(updated));
  };

  // Calculate Evidence Sufficiency Score
  const evidenceScore = selectedArea.evidenceChecklist.reduce((acc, item) => {
    return checkedEvidence[item.id] ? acc + item.weight : acc;
  }, 0);

  const getScoreRating = (score) => {
    if (score >= 75) return { label: 'Strong Evidence Package', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20' };
    if (score >= 50) return { label: 'Borderline Evidence Package', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/20' };
    return { label: 'Insufficient Evidence Package', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-950/20' };
  };

  const scoreRating = getScoreRating(evidenceScore);

  const toggleEvidence = (id) => {
    setCheckedEvidence(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCitation = (idx) => {
    setSelectedCitations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleTextChange = (field, value) => {
    setUserFacts(prev => ({ ...prev, [field]: value }));
  };

  // Written Decision Review Lane Selector
  const getReviewLaneRecommendation = () => {
    if (hasWrittenNotice === 'yes') {
      return {
        lane: 'Decision Review Request (HLR or Supplemental Claim)',
        why: 'Since you received a formal written decision (such as VA Form 20-0998), you have access to the AMA appeals process. File a Higher-Level Review (VAF 20-0996) if you want a senior reviewer to check the decision on the record, or a Supplemental Claim (VAF 20-0995) if you have new medical or occupational evidence.',
        alertLevel: 'warning'
      };
    }
    if (hasWrittenNotice === 'email') {
      return {
        lane: 'Written Rationale Request & VREO Escalation',
        why: 'An email is NOT a formal VA decision. Under 38 U.S.C. § 5104, the VA must issue a formal decision notice with statements of reasons and bases. Your first step is to generate a Written Rationale Request letter. Send it to your counselor, and escalate to the local VR&E Officer (VREO) if ignored.',
        alertLevel: 'important'
      };
    }
    return {
      lane: 'Administrative Correction / Supervisor Contact',
      why: 'No formal written decision has been made. Escalating to formal HLR appeals is premature. Log your contact attempts, generate a supervisor/VREO escalation letter, and request a collaborative conference to adjust the plan before filing appeals.',
      alertLevel: 'info'
    };
  };

  const reviewLane = getReviewLaneRecommendation();

  // Compile Strategic Brief
  const compileBrief = () => {
    const activeCitations = selectedArea.citations.filter((_, idx) => selectedCitations[idx]);
    const selectedArg = selectedArea.vrcArguments.find(arg => arg.id === selectedArgumentId);
    const activeEvidence = selectedArea.evidenceChecklist.filter(item => checkedEvidence[item.id]);

    let timelineText = '';
    if (selectedArea.id === 'counselor_delay' || selectedArea.id === 'tuition_unpaid') {
      timelineText = '\n============================================================\nCONTACT LOG TIMELINE:\n' + 
        contactsLog.map(c => `* ${c.date} | Method: ${c.method} | To: ${c.person} | Topic: ${c.request} | Result: ${c.response}`).join('\n') + '\n';
    }

    return `VETERAN READINESS AND EMPLOYMENT (VR&E) STRATEGIC DISPUTE BRIEF
DISPUTE TYPE: ${selectedArea.name}
DATE: ${new Date().toLocaleDateString()}
VETERAN: ${userFacts.veteranName || '[VETERAN NAME]'}
CLAIM NUMBER: ${userFacts.claimNumber || '[CLAIM NUMBER]'}
ACTIVE USER MODE: ${userMode.toUpperCase()}

============================================================
1. STATEMENT OF FACTS & GOAL DETAILS
The Veteran requested services or supplies regarding: ${userFacts.schoolOrProgram || '[SCHOOL/PROGRAM/ITEMS REQUESTED]'}.
Active Case Stage: ${currentCaseStage.toUpperCase().replace(/_/g, ' ')}
Counselor Argument / Reason Given: "${userFacts.counselorArgument || selectedArg?.label || '[VRC STATE NOTICE]'}"

Veteran Rationale & Accommodation Statement:
${userFacts.personalContext || '[EXPLAIN HOW DISABILITY RESTRICTS YOUR PROGRESS AND WHY THIS IS REQUIRED FOR THE IWRP OUTCOMES]'}
${timelineText}
============================================================
2. CORE REGULATORY DEFICIENCIES & ERRORS
The VRC's argument is refuted by the following corrective authorities:
* Error Assertion: ${selectedArg?.label || '[VRC REASON]'}
  Legal Correction: ${selectedArg?.correction || '[REGULATORY CORRECTION]'}

============================================================
3. BINDING LEGAL AUTHORITY
The Veteran asserts the following regulations govern this dispute:
${activeCitations.map(c => `* ${c.citation}: ${c.relevance}`).join('\n')}

============================================================
4. EVIDENCE PACKET INCLUDED
The following corroborating documentation is attached to support this dispute:
${activeEvidence.map(e => `[x] Attached: ${e.text}`).join('\n')}
${selectedArea.evidenceChecklist.filter(e => !checkedEvidence[e.id]).map(e => `[ ] Pending: ${e.text}`).join('\n')}

============================================================
5. ACTION REQUESTED
The Veteran formally requests:
1. Immediate administrative review of the VRC's decision under 38 C.F.R. § 21.416 / § 21.94 guidelines.
2. A formal written decision notice (VA Form 20-0998) detailing the specific regulatory citations utilized for the denial as required by 38 U.S.C. § 5104.
3. Referral of this dispute package to the Regional VR&E Officer (VREO) for administrative correction.

*** CONFIDENTIALITY NOTE: Private document compiled locally in session storage. Confirmed by claimant. ***`;
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
          <title>VR&E Strategic Brief - ${selectedArea.name}</title>
          <style>
            body { font-family: Courier, monospace; white-space: pre-wrap; padding: 40px; color: #000; font-size: 0.85rem; line-height: 1.5; }
            h1 { font-family: sans-serif; font-size: 1.3rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <h1>VR&E Strategic Appeal Brief</h1>
          <div>${text}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Evidence Gap Analysis Alerts
  const missingEvidence = selectedArea.evidenceChecklist.filter(e => !checkedEvidence[e.id]);

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      {/* View Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Scale size={20} />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Dispute & Appeal Hub</h1>
            <p className="text-[11px] text-slate-400">Assemble complete legal objection packages to contest case closures and counselor denials.</p>
          </div>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* Select Dispute Type */}
      <div className="form-group bg-slate-900/40 p-4 border border-slate-800 rounded-xl mb-6">
        <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Select Dispute / Denial Area</label>
        <select 
          className="form-control bg-slate-950/80 border-slate-800 text-xs text-slate-100"
          value={selectedArea.id}
          onChange={(e) => {
            const area = DISPUTE_AREAS.find(a => a.id === e.target.value);
            if (area) handleAreaChange(area);
          }}
          aria-label="Select active dispute area"
        >
          {DISPUTE_AREAS.map(area => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{selectedArea.description}</p>
      </div>

      {/* Tabs */}
      <div className="tabs-header mb-6">
        <button 
          className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          1. Denial Analyzer
        </button>
        { (selectedArea.id === 'counselor_delay' || selectedArea.id === 'tuition_unpaid') && (
          <button 
            className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            2. Contact Timeline
          </button>
        )}
        <button 
          className={`tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          { (selectedArea.id === 'counselor_delay' || selectedArea.id === 'tuition_unpaid') ? '3. Evidence Tracker' : '2. Evidence Tracker' }
        </button>
        <button 
          className={`tab-btn ${activeTab === 'brief' ? 'active' : ''}`}
          onClick={() => setActiveTab('brief')}
        >
          { (selectedArea.id === 'counselor_delay' || selectedArea.id === 'tuition_unpaid') ? '4. Rebuttal Builder' : '3. Rebuttal Builder' }
        </button>
        <button 
          className={`tab-btn ${activeTab === 'packet' ? 'active' : ''}`}
          onClick={() => setActiveTab('packet')}
        >
          { (selectedArea.id === 'counselor_delay' || selectedArea.id === 'tuition_unpaid') ? '5. Objections Packet' : '4. Objections Packet' }
        </button>
      </div>

      {/* TAB 1: DENIAL ANALYZER & REVIEW LANE SELECTOR */}
      {activeTab === 'analyzer' && (
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Decision Review-Lane Selector</span>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-200 block">Do you have a written decision notice from the VA? (e.g. Form 20-0998)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                  <input
                    type="radio"
                    name="written_notice"
                    checked={hasWrittenNotice === 'yes'}
                    onChange={() => setHasWrittenNotice('yes')}
                    className="accent-indigo-500"
                  />
                  <span>Yes, formal letter (Form 20-0998)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                  <input
                    type="radio"
                    name="written_notice"
                    checked={hasWrittenNotice === 'email'}
                    onChange={() => setHasWrittenNotice('email')}
                    className="accent-indigo-500"
                  />
                  <span>Email or verbal notice only</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                  <input
                    type="radio"
                    name="written_notice"
                    checked={hasWrittenNotice === 'no'}
                    onChange={() => setHasWrittenNotice('no')}
                    className="accent-indigo-500"
                  />
                  <span>No decision issued yet (Delay)</span>
                </label>
              </div>

              {/* Review Lane Output */}
              <div className={`p-4 border rounded-xl mt-3 bg-slate-950/40 ${
                reviewLane.alertLevel === 'important' ? 'border-red-500/30' : reviewLane.alertLevel === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={
                    reviewLane.alertLevel === 'important' ? 'text-red-400' : reviewLane.alertLevel === 'warning' ? 'text-amber-400' : 'text-blue-400'
                  } />
                  <span className="text-xs font-bold text-slate-200">Recommended Action: {reviewLane.lane}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{reviewLane.why}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200">What argument did the counselor make?</h3>
            <div className="grid grid-cols-1 gap-3">
              {selectedArea.vrcArguments.map(arg => (
                <div
                  key={arg.id}
                  onClick={() => handleArgumentSelect(arg.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition select-none flex items-start gap-3 ${
                    selectedArgumentId === arg.id
                      ? 'bg-indigo-500/5 border-indigo-800/80'
                      : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="vrc_argument"
                    checked={selectedArgumentId === arg.id}
                    onChange={() => {}}
                    className="mt-0.5 pointer-events-none accent-indigo-500"
                    aria-label={arg.label}
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-250">{arg.label}</span>
                    <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 border border-slate-800 rounded mt-1.5">
                      <strong className="text-red-400">Legal Correction:</strong> {arg.correction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Controlling CFR & U.S. Code Reference Material</span>
            <div className="space-y-2">
              {selectedArea.citations.map((cite, idx) => (
                <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{cite.citation}</span>
                      <AuthorityBadge level={cite.level} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">{cite.relevance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button 
              onClick={() => setActiveTab( (selectedArea.id === 'counselor_delay' || selectedArea.id === 'tuition_unpaid') ? 'timeline' : 'evidence' )}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <span>{ (selectedArea.id === 'counselor_delay' || selectedArea.id === 'tuition_unpaid') ? 'Next: Log Contact Timeline' : 'Next: Evaluate Evidence' }</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CONTACT TIMELINE LOG */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Interactive Counselor Contact timeline Log</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              If your VRC has delayed authorizing benefits, your contact timeline is key evidence of their failure. Enter your email, call, or appointment attempts below.
            </p>

            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-950/40 p-4 border border-slate-850 rounded-lg">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={newContact.date}
                  onChange={(e) => setNewContact({...newContact, date: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Method</label>
                <select
                  value={newContact.method}
                  onChange={(e) => setNewContact({...newContact, method: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  aria-label="Contact method"
                >
                  <option value="Email">Email</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Office Visit">Office Visit</option>
                  <option value="Tungsten Msg">Tungsten Msg</option>
                  <option value="Vera Request">Vera Request</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Details of Request</label>
                <input
                  type="text"
                  placeholder="e.g. Emailed syllabus and quote for supplies request"
                  value={newContact.request}
                  onChange={(e) => setNewContact({...newContact, request: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <button
                  onClick={handleAddContact}
                  className="w-full btn btn-primary flex justify-center items-center gap-1 h-9"
                >
                  <Plus size={14} />
                  <span>Add Log</span>
                </button>
              </div>
            </div>

            {/* List log items */}
            {contactsLog.length > 0 ? (
              <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-1">
                {contactsLog.map((log) => (
                  <div key={log.id} className="flex justify-between items-center bg-slate-950/20 border border-slate-850 rounded-lg p-3 text-xs">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <span className="font-mono text-indigo-400 font-semibold">{log.date}</span>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded font-semibold">{log.method}</span>
                      <span className="text-slate-200">{log.request}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteContact(log.id)}
                      className="text-red-400 hover:text-red-300 p-1 shrink-0"
                      title="Delete log item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-850 rounded-lg text-[11px] text-slate-500 font-semibold">
                No contact attempts logged. Enter attempts above to automatically add a formatted timeline inside your strategic packets.
              </div>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setActiveTab('analyzer')}
              className="btn btn-secondary"
            >
              Back
            </button>
            <button 
              onClick={() => setActiveTab('evidence')}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <span>Next: Evaluate Evidence</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE SUFFICIENCY & GAP ANALYSIS */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Checklist */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xs font-bold text-slate-200">Interactive Evidence Checklist</h3>
              <div className="space-y-3">
                {selectedArea.evidenceChecklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleEvidence(item.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition select-none flex items-start gap-3.5 ${
                      checkedEvidence[item.id]
                        ? 'bg-emerald-500/5 border-emerald-800/80'
                        : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedEvidence[item.id]}
                      onChange={() => {}}
                      className="mt-0.5 pointer-events-none accent-emerald-500"
                      aria-label={item.text}
                    />
                    <div className="flex-1 flex justify-between items-center gap-4">
                      <span className="text-xs text-slate-200 leading-relaxed">{item.text}</span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 border border-slate-800 rounded font-mono text-emerald-400 shrink-0">
                        +{item.weight} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score & Gap analysis panel */}
            <div className="lg:col-span-4 space-y-4 h-fit">
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sufficiency Index</span>
                  <h4 className="text-xs font-bold text-slate-250">Evidence Strength Meter</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400">Current Weight:</span>
                    <span className="font-bold text-slate-200">{evidenceScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-850 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        evidenceScore >= 75 ? 'bg-emerald-500' : evidenceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${evidenceScore}%` }}
                    />
                  </div>
                </div>

                <div className={`p-4 border rounded-xl ${scoreRating.bg} ${scoreRating.border}`}>
                  <div className="flex items-center gap-1.5">
                    <BarChart2 size={16} className={scoreRating.color} />
                    <span className={`text-xs font-bold ${scoreRating.color}`}>{scoreRating.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                    {evidenceScore >= 75 
                      ? 'Your evidence package is extremely strong and complies fully with C.F.R. regulations. You have minimized VRC pushback opportunities.'
                      : evidenceScore >= 50
                      ? 'Your package is decent, but VRCs may argue lack of necessity. It is highly recommended to append a detailed personal statement or therapist letter.'
                      : 'Your evidence is insufficient. Filing appeals with this score has a high probability of denial. Gather required curriculum syllabi or policy letters before escalation.'
                    }
                  </p>
                </div>
              </div>

              {/* Evidence Gap Analysis Panel */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Evidence Gap Analysis</span>
                {missingEvidence.length > 0 ? (
                  <div className="space-y-2.5">
                    {missingEvidence.map(e => (
                      <div key={e.id} className="flex gap-2 items-start text-[10px] text-slate-400 bg-slate-950/20 p-2.5 border border-slate-850 rounded">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-350 block">Missing: {e.text}</strong>
                          <span className="leading-relaxed block mt-0.5">Gathering this prevents counselor claims of lack of necessity or feasibility.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2 items-center text-[10px] text-emerald-400 bg-slate-950/20 p-3 border border-emerald-900/30 rounded">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>Evidence package fully assembled! Zero gaps detected.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setActiveTab( (selectedArea.id === 'counselor_delay' || selectedArea.id === 'tuition_unpaid') ? 'timeline' : 'analyzer' )}
              className="btn btn-secondary"
            >
              Back
            </button>
            <button 
              onClick={() => setActiveTab('brief')}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <span>Next: Construct Rebuttal</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: REBUTTAL BUILDER */}
      {activeTab === 'brief' && (
        <div className="space-y-5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rebuttal Argument Brief Details</span>

          <div className="bg-slate-950/20 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 block mb-1">Veteran Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={userFacts.veteranName}
                  onChange={(e) => handleTextChange('veteranName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 block mb-1">VA Claim Number / SSN</label>
                <input
                  type="text"
                  placeholder="123-45-6789"
                  value={userFacts.claimNumber}
                  onChange={(e) => handleTextChange('claimNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 block mb-1">Program of Study or Requested Supplies</label>
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
                <label className="block text-[10px] font-bold text-slate-400 block mb-1">What specifically did the VRC state during denial?</label>
                <textarea
                  placeholder="VRC stated there is a flat $500 computer limit."
                  value={userFacts.counselorArgument}
                  onChange={(e) => handleTextChange('counselorArgument', e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 block mb-1">State why this is necessary to achieve your vocational goal</label>
                <textarea
                  placeholder="Explain orthopedic conditions requiring adaptions, or software prerequisites required of all peers."
                  value={userFacts.personalContext}
                  onChange={(e) => handleTextChange('personalContext', e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Adjust Citations Included in Brief</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedArea.citations.map((cite, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCitation(idx)}
                  className={`border rounded-lg p-3 cursor-pointer transition select-none flex items-start gap-2.5 ${
                    selectedCitations[idx]
                      ? 'bg-emerald-500/5 border-emerald-800/80'
                      : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedCitations[idx]}
                    onChange={() => {}}
                    className="mt-0.5 pointer-events-none accent-emerald-500"
                    aria-label={cite.citation}
                  />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-250">{cite.citation}</span>
                    <p className="text-[10px] text-slate-400 leading-normal">{cite.relevance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setActiveTab('evidence')}
              className="btn btn-secondary"
            >
              Back
            </button>
            <button 
              onClick={() => setActiveTab('packet')}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <span>Next: Compile Packet</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: OBJECTIONS PACKET & PUSHBACK GUIDE */}
      {activeTab === 'packet' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between bg-slate-950/30 border border-slate-800 rounded-xl p-4 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-305 font-semibold">Objections Packet Assembled</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="btn btn-sm btn-secondary inline-flex items-center gap-1.5 h-8">
                {copySuccess ? <Check size={14} className="text-emerald-400" /> : <FileText size={14} />}
                <span>{copySuccess ? 'Copied Brief' : 'Copy Brief'}</span>
              </button>
              <button onClick={handlePrint} className="btn btn-sm btn-primary inline-flex items-center gap-1.5 h-8">
                <Printer size={14} />
                <span>Print Packet Bundle</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Packet Previews */}
            <div className="lg:col-span-8 bg-slate-950/40 border border-slate-800 rounded-xl p-6 overflow-y-auto max-h-[500px]">
              <pre className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                {compileBrief()}
              </pre>
            </div>

            {/* Submissions & Pushback Guide */}
            <div className="lg:col-span-4 space-y-4 h-fit">
              {/* Pushback & Rebuttal Guide */}
              {selectedArea.rebuttalPushback && (
                <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-5 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">VA Pushback & Rebuttal Strategy</span>
                  <p className="text-[10.5px] text-slate-300 leading-relaxed italic">
                    {selectedArea.rebuttalPushback}
                  </p>
                </div>
              )}

              {/* Submissions Guideline */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">How to File Your Packet</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Follow this procedure to formalize the record.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex gap-2.5 items-start">
                    <span className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-bold text-slate-300">Attach Evidence Items</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Print the strategic brief and attach all items you checked in the Evidence Checklist.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-bold text-slate-300">File via VA QuickSubmit</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Log in to AccessVA and upload your packet under the VR&E document category. This guarantees a date-stamped legal record of receipt.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-bold text-slate-300">Email Regional Office VREO</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Send a copy of the QuickSubmit confirmation and the brief to the local VR&E Officer (VREO) for supervisory administrative correction.</p>
                    </div>
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

export default DisputeHubView;

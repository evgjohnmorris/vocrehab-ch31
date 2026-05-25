import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Scale, Printer, 
  ChevronRight, BarChart2, Plus, Trash2, 
  AlertTriangle, Check, FileText
} from 'lucide-react';
import AuthorityBadge from '../components/AuthorityBadge';

import DISPUTE_AREAS from '../data/dispute-areas.json';
import { renderTemplate } from '../utils/templateRenderer.js';


function DisputeHubView({ 
  reduceMotion,
  userMode = 'veteran',
  currentCaseStage = 'not_applied'
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

  function handleAreaChange(area) {
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

  // Export Counselor Contact Timeline (local JSON file download)
  const handleExportTimeline = () => {
    try {
      const blob = new Blob([JSON.stringify(contactsLog, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = `vre_contact_timeline_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error exporting timeline: " + err.message);
    }
  };

  // Import Counselor Contact Timeline (local JSON file upload)
  const handleImportTimeline = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          alert('Invalid file format. The imported timeline must be a JSON array.');
          return;
        }
        const validated = parsed.filter(item => {
          return item && typeof item === 'object' && 'date' in item && 'method' in item && 'request' in item;
        }).map(item => ({
          id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
          date: item.date || '',
          method: item.method || 'Email',
          person: item.person || 'VRC Counselor',
          request: item.request || '',
          response: item.response || 'No response'
        }));
        if (validated.length === 0) {
          alert('No valid contact log entries found in the file.');
          return;
        }
        setContactsLog(validated);
        sessionStorage.setItem('m28c_contacts_log', JSON.stringify(validated));
      } catch (err) {
        alert('Failed to parse timeline file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
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

const BRIEF_TEMPLATE = `VETERAN READINESS AND EMPLOYMENT (VR&E) STRATEGIC DISPUTE BRIEF
DISPUTE TYPE: {{disputeType}}
DATE: {{date}}
VETERAN: {{veteranName}}
CLAIM NUMBER: {{claimNumber}}
ACTIVE USER MODE: {{userMode}}

============================================================
1. STATEMENT OF FACTS & GOAL DETAILS
The Veteran requested services or supplies regarding: {{schoolOrProgram}}.
Active Case Stage: {{caseStage}}
Counselor Argument / Reason Given: "{{counselorArgument}}"

Veteran Rationale & Accommodation Statement:
{{personalContext}}
{{timelineText}}
============================================================
2. CORE REGULATORY DEFICIENCIES & ERRORS
The VRC's argument is refuted by the following corrective authorities:
* Error Assertion: {{errorAssertion}}
  Legal Correction: {{legalCorrection}}

============================================================
3. BINDING LEGAL AUTHORITY
The Veteran asserts the following regulations govern this dispute:
{{citationsText}}

============================================================
4. EVIDENCE PACKET INCLUDED
The following corroborating documentation is attached to support this dispute:
{{evidenceText}}

============================================================
5. ACTION REQUESTED
The Veteran formally requests:
1. Immediate administrative review of the VRC's decision under 38 C.F.R. § 21.416 / § 21.94 guidelines.
2. A formal written decision notice (VA Form 20-0998) detailing the specific regulatory citations utilized for the denial as required by 38 U.S.C. § 5104.
3. Referral of this dispute package to the Regional VR&E Officer (VREO) for administrative correction.

*** CONFIDENTIALITY NOTE: Private document compiled locally in session storage. Confirmed by claimant. ***`;

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

    const citationsText = activeCitations.map(c => `* ${c.citation}: ${c.relevance}`).join('\n');
    const evidenceText = [
      ...activeEvidence.map(e => `[x] Attached: ${e.text}`),
      ...selectedArea.evidenceChecklist.filter(e => !checkedEvidence[e.id]).map(e => `[ ] Pending: ${e.text}`)
    ].join('\n');

    const variables = {
      disputeType: selectedArea.name,
      date: new Date().toLocaleDateString(),
      veteranName: userFacts.veteranName || '[VETERAN NAME]',
      claimNumber: userFacts.claimNumber || '[CLAIM NUMBER]',
      userMode: userMode.toUpperCase(),
      schoolOrProgram: userFacts.schoolOrProgram || '[SCHOOL/PROGRAM/ITEMS REQUESTED]',
      caseStage: currentCaseStage.toUpperCase().replace(/_/g, ' '),
      counselorArgument: userFacts.counselorArgument || selectedArg?.label || '[VRC STATE NOTICE]',
      personalContext: userFacts.personalContext || '[EXPLAIN HOW DISABILITY RESTRICTS YOUR PROGRESS AND WHY THIS IS REQUIRED FOR THE IWRP OUTCOMES]',
      timelineText,
      errorAssertion: selectedArg?.label || '[VRC REASON]',
      legalCorrection: selectedArg?.correction || '[REGULATORY CORRECTION]',
      citationsText,
      evidenceText
    };

    return renderTemplate(BRIEF_TEMPLATE, variables);
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

            <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-300 block">Backup Timeline Records</span>
                <span className="text-[9px] text-slate-450 block">Save or restore your communication log history locally.</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="import-timeline-upload"
                  accept=".json"
                  onChange={handleImportTimeline}
                  className="sr-only"
                  aria-label="Upload contact timeline JSON backup file"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('import-timeline-upload').click()}
                  className="btn btn-sm btn-secondary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5 h-8"
                  aria-label="Import contact timeline from a local JSON file"
                >
                  <Plus size={12} />
                  <span>Import JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportTimeline}
                  className="btn btn-sm btn-secondary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5 h-8"
                  aria-label="Export contact timeline to a local JSON file"
                >
                  <FileText size={12} />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

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

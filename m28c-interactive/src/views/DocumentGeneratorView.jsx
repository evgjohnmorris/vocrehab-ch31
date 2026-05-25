import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Copy, Printer, RotateCcw, User, CreditCard, 
  MapPin, Calendar, Check, AlertCircle, FilePlus, ChevronRight 
} from 'lucide-react';
import * as generators from '../utils/letterGenerators';

const LETTER_TEMPLATES = [
  { id: 'ipe_amendment', name: 'IPE Amendment Request', citation: '38 CFR § 21.94', fn: 'generateIpeAmendment' },
  { id: 'computer_request', name: 'Computer & Supplies Request', citation: '38 CFR §§ 21.210, 21.212', fn: 'generateComputerSuppliesRequest' },
  { id: 'escalation', name: 'Counselor Escalation Notice', citation: 'M28C Guidelines', fn: 'generateNonresponseEscalation' },
  { id: 'written_rationale', name: 'Written Rationale Request', citation: '38 U.S.C. § 5104', fn: 'generateWrittenRationaleRequest' },
  { id: 'hlr_brief', name: 'HLR Appeal Argument Brief', citation: '38 U.S.C. § 5104B', fn: 'generateHlrBrief' },
  { id: 'supplemental_claim', name: 'Supplemental Claim Evidence', citation: '38 U.S.C. § 5108', fn: 'generateSupplementalClaim' },
  { id: 'foia_request', name: 'FOIA C-File Request', citation: '38 CFR § 1.577', fn: 'generateFoiaRequest' },
  { id: 'il_justification', name: 'Independent Living Justification', citation: '38 U.S.C. § 3120', fn: 'generateIlJustification' },
  { id: 'seh_extension', name: 'SEH & Entitlement Extension', citation: '38 CFR §§ 21.44, 21.78', fn: 'generateSehExtension' },
  { id: 'feasibility_rebuttal', name: 'Feasibility Rebuttal', citation: '38 CFR § 21.53', fn: 'generateFeasibilityRebuttal' },
  { id: 'program_change', name: 'Vocational Goal Justification', citation: '38 CFR § 21.94', fn: 'generateJustificationLetter' },
  { id: 'self_employment', name: 'Self-Employment Track Request', citation: '38 CFR § 21.258', fn: 'generateSelfEmploymentLetter' }
];

function DocumentGeneratorView({ reduceMotion, plainLanguageMode }) {
  const [selectedTemplate, setSelectedTemplate] = useState('ipe_amendment');
  const [copySuccess, setCopySuccess] = useState(false);
  const previewRef = useRef(null);

  // Common Fields
  const [commonFields, setCommonFields] = useState({
    dateStr: new Date().toLocaleDateString(),
    veteranName: '',
    claimNumber: '',
    address: '',
    emailPhone: '',
    counselorName: '',
    regionalOffice: ''
  });

  // Letter Specific Fields
  const [specificFields, setSpecificFields] = useState({
    // IPE Amendment
    currentGoal: '',
    proposedGoal: '',
    amendmentReason: '',
    medicalEvidenceEnclosed: false,
    
    // Computer/Supplies
    trainingProgram: '',
    institutionName: '',
    itemsRequested: 'High-performance laptop, operating system, productivity office software suite, external backup drive.',
    specificNeedJustification: 'Required for programming courses and remote lectures as part of curriculum requirements.',
    syllabusEnclosed: false,

    // Nonresponse Escalation
    escalationTarget: 'VR&E Officer',
    datesOfAttempts: '',
    pendingRequestDetails: '',
    daysElapsed: '30',

    // Written Rationale
    verbalDecisionDescription: '',
    verbalDecisionDate: '',

    // HLR Brief
    decisionDate: '',
    issueAppealed: '',
    errorArguments: '',

    // Supplemental Claim
    originalDecisionDate: '',
    claimIssue: '',
    newEvidenceList: '',

    // IL Justification
    dailyLivingLimitations: '',
    proposedIlServices: '',
    rehabPotentialJustification: '',

    // SEH Extension
    disabilityEffects: '',
    extensionNeedReason: '',

    // Feasibility Rebuttal
    unfeasibilityAssertion: '',
    rebuttalArguments: '',
    doctorStatementEnclosed: false,

    // Self Employment (for backwards compatibility & completeness)
    selfChecklist1: false,
    selfChecklist2: false,
    selfChecklist3: false,
    selfChecklist4: false,
    selfBizName: '',
    selfBizType: 'LLC',
    selfBizIndustry: '',
    selfBizConcept: '',
    selfFundingCategory: 'II'
  });

  // Custom text edited by the user in the preview pane
  const [editedText, setEditedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load preselected letter type from localStorage (set by VA Error Spotter)
  useEffect(() => {
    const preselected = localStorage.getItem('m28c_preselected_letter');
    if (preselected) {
      const match = LETTER_TEMPLATES.find(t => t.id === preselected || t.id.includes(preselected));
      if (match) {
        setSelectedTemplate(match.id);
      }
      localStorage.removeItem('m28c_preselected_letter');
    }
  }, []);

  // Recalculate preview text when fields change (unless user is manually typing in the editor)
  useEffect(() => {
    if (!isEditing) {
      compileDocument();
    }
  }, [commonFields, specificFields, selectedTemplate, isEditing]);

  const compileDocument = () => {
    const template = LETTER_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    const generatorFn = generators[template.fn];
    if (typeof generatorFn !== 'function') {
      setEditedText('Error: Template generator function not found.');
      return;
    }

    let payload = {
      ...commonFields,
      ...specificFields
    };

    // Special mappings for existing templates
    if (selectedTemplate === 'program_change') {
      payload.career = {
        title: specificFields.proposedGoal || "[Proposed Career]",
        soc: "[SOC Code]",
        dot: "[DOT Code]",
        sic: "[SIC Code]",
        outlook: "Stable",
        medianPay: 75000,
        svp: "7",
        physicalDemand: "Light",
        education: "Bachelor's Degree",
        duties: specificFields.amendmentReason || "[Career Duties]"
      };
      payload.justReason = 'disability_worsened';
      payload.justCurrentGoal = specificFields.currentGoal;
      payload.justPhysicalImpact = specificFields.amendmentReason;
      payload.justMedicalEvidence = specificFields.medicalEvidenceEnclosed;
    }

    const text = generatorFn(payload);
    setEditedText(text);
  };

  const handleCommonFieldChange = (e) => {
    const { name, value } = e.target;
    setCommonFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecificFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSpecificFields(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Document</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 40px;
              white-space: pre-wrap;
              color: #000;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>${editedText}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleReset = () => {
    setCommonFields({
      dateStr: new Date().toLocaleDateString(),
      veteranName: '',
      claimNumber: '',
      address: '',
      emailPhone: '',
      counselorName: '',
      regionalOffice: ''
    });
    setSpecificFields({
      currentGoal: '',
      proposedGoal: '',
      amendmentReason: '',
      medicalEvidenceEnclosed: false,
      trainingProgram: '',
      institutionName: '',
      itemsRequested: 'High-performance laptop, operating system, productivity office software suite, external backup drive.',
      specificNeedJustification: 'Required for programming courses and remote lectures as part of curriculum requirements.',
      syllabusEnclosed: false,
      escalationTarget: 'VR&E Officer',
      datesOfAttempts: '',
      pendingRequestDetails: '',
      daysElapsed: '30',
      verbalDecisionDescription: '',
      verbalDecisionDate: '',
      decisionDate: '',
      issueAppealed: '',
      errorArguments: '',
      originalDecisionDate: '',
      claimIssue: '',
      newEvidenceList: '',
      dailyLivingLimitations: '',
      proposedIlServices: '',
      rehabPotentialJustification: '',
      disabilityEffects: '',
      extensionNeedReason: '',
      unfeasibilityAssertion: '',
      rebuttalArguments: '',
      doctorStatementEnclosed: false,
      selfChecklist1: false,
      selfChecklist2: false,
      selfChecklist3: false,
      selfChecklist4: false,
      selfBizName: '',
      selfBizType: 'LLC',
      selfBizIndustry: '',
      selfBizConcept: '',
      selfFundingCategory: 'II'
    });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto">
      {/* LEFT COLUMN: Controls & Form */}
      <div className="flex-1 space-y-6">
        {/* Navigation & Title Card */}
        <div className="doc-card p-6 mb-0">
          <span className="doc-tag bg-blue-500/20 text-blue-400 border border-blue-500/30">Veteran Advocacy Tool</span>
          <h2 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2 mt-1">
            <FilePlus className="text-blue-500" size={28} />
            Document Generator
          </h2>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            Quickly draft formal correspondence, program changes, technology supplies requests, or higher-level review briefs to send to your counselor. All letters include mandatory legal citations under 38 CFR Part 21.
          </p>
        </div>

        {/* Form Container */}
        <div className="doc-card p-6 space-y-6">
          {/* Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Advocacy Document Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => { setSelectedTemplate(e.target.value); setIsEditing(false); }}
              className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LETTER_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.citation})</option>
              ))}
            </select>
          </div>

          <hr className="border-slate-800" />

          {/* Form Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">1. Common Case Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Veteran Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="text"
                    name="veteranName"
                    value={commonFields.veteranName}
                    onChange={handleCommonFieldChange}
                    placeholder="e.g. John Doe"
                    className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">VA Claim Number / Last 4 SSN</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="text"
                    name="claimNumber"
                    value={commonFields.claimNumber}
                    onChange={handleCommonFieldChange}
                    placeholder="e.g. XXX-XX-1234"
                    className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Email & Phone Number</label>
                <input
                  type="text"
                  name="emailPhone"
                  value={commonFields.emailPhone}
                  onChange={handleCommonFieldChange}
                  placeholder="e.g. john.doe@email.com / 555-555-5555"
                  className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="text"
                    name="dateStr"
                    value={commonFields.dateStr}
                    onChange={handleCommonFieldChange}
                    className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 font-semibold mb-1">Mailing Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="text"
                    name="address"
                    value={commonFields.address}
                    onChange={handleCommonFieldChange}
                    placeholder="e.g. 123 Main St, Anytown, ST 12345"
                    className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">VRC Counselor Name</label>
                <input
                  type="text"
                  name="counselorName"
                  value={commonFields.counselorName}
                  onChange={handleCommonFieldChange}
                  placeholder="e.g. Counselor Smith"
                  className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">VA Regional Office Location</label>
                <input
                  type="text"
                  name="regionalOffice"
                  value={commonFields.regionalOffice}
                  onChange={handleCommonFieldChange}
                  placeholder="e.g. St. Petersburg RO"
                  className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Letter Specific Input Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">2. Document Specific Details</h3>
            
            {/* IPE Amendment (ipe_amendment) / Vocational Goal Justification (program_change) */}
            {(selectedTemplate === 'ipe_amendment' || selectedTemplate === 'program_change') && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Current Vocational Goal</label>
                    <input
                      type="text"
                      name="currentGoal"
                      value={specificFields.currentGoal}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. Accountant"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Proposed Vocational Goal</label>
                    <input
                      type="text"
                      name="proposedGoal"
                      value={specificFields.proposedGoal}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. Software Engineer"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Justification Reason</label>
                  <textarea
                    name="amendmentReason"
                    value={specificFields.amendmentReason}
                    onChange={handleSpecificFieldChange}
                    placeholder="Provide details about why the change is needed (e.g., orthopedic conditions prevent standing required for previous goal, software engineering offers sedentary placement)..."
                    className="w-full h-24 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="medicalEvidenceEnclosed"
                    name="medicalEvidenceEnclosed"
                    checked={specificFields.medicalEvidenceEnclosed}
                    onChange={handleSpecificFieldChange}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                  <label htmlFor="medicalEvidenceEnclosed" className="text-xs text-slate-300 select-none">Enclosing medical evidence / physician recommendations</label>
                </div>
              </div>
            )}

            {/* Computer/Supplies (computer_request) */}
            {selectedTemplate === 'computer_request' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Training Program / Major</label>
                    <input
                      type="text"
                      name="trainingProgram"
                      value={specificFields.trainingProgram}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Institution Name</label>
                    <input
                      type="text"
                      name="institutionName"
                      value={specificFields.institutionName}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. Florida State University"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Specific Items Requested</label>
                  <input
                    type="text"
                    name="itemsRequested"
                    value={specificFields.itemsRequested}
                    onChange={handleSpecificFieldChange}
                    className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Specific Need Justification</label>
                  <textarea
                    name="specificNeedJustification"
                    value={specificFields.specificNeedJustification}
                    onChange={handleSpecificFieldChange}
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="syllabusEnclosed"
                    name="syllabusEnclosed"
                    checked={specificFields.syllabusEnclosed}
                    onChange={handleSpecificFieldChange}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                  <label htmlFor="syllabusEnclosed" className="text-xs text-slate-300 select-none">Enclosing official syllabus / technology recommendation list</label>
                </div>
              </div>
            )}

            {/* Nonresponse Escalation (escalation) */}
            {selectedTemplate === 'escalation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Escalation Target</label>
                    <input
                      type="text"
                      name="escalationTarget"
                      value={specificFields.escalationTarget}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. VR&E Officer / Assistant VREO"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Days Elapsed Without Response</label>
                    <input
                      type="number"
                      name="daysElapsed"
                      value={specificFields.daysElapsed}
                      onChange={handleSpecificFieldChange}
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Dates and Details of Contact Attempts</label>
                  <input
                    type="text"
                    name="datesOfAttempts"
                    value={specificFields.datesOfAttempts}
                    onChange={handleSpecificFieldChange}
                    placeholder="e.g. Emails sent on April 2nd and 14th; Voicemail left on April 20th"
                    className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Pending Request Details</label>
                  <textarea
                    name="pendingRequestDetails"
                    value={specificFields.pendingRequestDetails}
                    onChange={handleSpecificFieldChange}
                    placeholder="e.g. Requesting book and supply vouchers for the Summer term, which begins in 10 days, to prevent course drops..."
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Written Rationale Request (written_rationale) */}
            {selectedTemplate === 'written_rationale' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Date of Verbal Decision</label>
                    <input
                      type="text"
                      name="verbalDecisionDate"
                      value={specificFields.verbalDecisionDate}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. May 10, 2026"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Verbal Decision Description</label>
                    <input
                      type="text"
                      name="verbalDecisionDescription"
                      value={specificFields.verbalDecisionDescription}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. Verbal denial of technology laptop upgrade"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HLR Appeal Argument Brief (hlr_brief) */}
            {selectedTemplate === 'hlr_brief' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Original Decision Date</label>
                    <input
                      type="text"
                      name="decisionDate"
                      value={specificFields.decisionDate}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. March 15, 2026"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Issue Appealed</label>
                    <input
                      type="text"
                      name="issueAppealed"
                      value={specificFields.issueAppealed}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. Denial of entitlement to vocational services"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Factual/Legal Errors Asserted</label>
                  <textarea
                    name="errorArguments"
                    value={specificFields.errorArguments}
                    onChange={handleSpecificFieldChange}
                    placeholder="Detail the errors in the VRC decision (e.g., counselor failed to assess Serious Employment Handicap under 38 CFR 21.44, counselor ignored enclosed orthopedic evaluations indicating inability to lift)..."
                    className="w-full h-24 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Supplemental Claim (supplemental_claim) */}
            {selectedTemplate === 'supplemental_claim' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Original Denial Date</label>
                    <input
                      type="text"
                      name="originalDecisionDate"
                      value={specificFields.originalDecisionDate}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. April 5, 2026"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Claim Issue to Reopen</label>
                    <input
                      type="text"
                      name="claimIssue"
                      value={specificFields.claimIssue}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. Approval of graduate training program"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">New & Relevant Evidence Submitted</label>
                  <textarea
                    name="newEvidenceList"
                    value={specificFields.newEvidenceList}
                    onChange={handleSpecificFieldChange}
                    placeholder="List the new evidence (e.g., 1. Job market analysis from state labor commission. 2. Medical clearance from Dr. Green dated May 1st)..."
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Independent Living Justification (il_justification) */}
            {selectedTemplate === 'il_justification' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Limitations in Activities of Daily Living</label>
                  <textarea
                    name="dailyLivingLimitations"
                    value={specificFields.dailyLivingLimitations}
                    onChange={handleSpecificFieldChange}
                    placeholder="List daily challenges (e.g. severe spinal stenosis restricts standing or sitting for more than 15 minutes, PTSD causes severe agoraphobia and social isolation)..."
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Requested IL Services / Adaptive Devices</label>
                  <textarea
                    name="proposedIlServices"
                    value={specificFields.proposedIlServices}
                    onChange={handleSpecificFieldChange}
                    placeholder="List items/services requested (e.g. home office ergonomic chair, therapeutic mattress, grab bars for bathroom, mental health support check-ins)..."
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Rehabilitation Rationale & Potential</label>
                  <textarea
                    name="rehabPotentialJustification"
                    value={specificFields.rehabPotentialJustification}
                    onChange={handleSpecificFieldChange}
                    placeholder="Explain how these improvements will facilitate daily independence..."
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* SEH & Entitlement Extension (seh_extension) */}
            {selectedTemplate === 'seh_extension' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Disability Effects on Employment</label>
                  <textarea
                    name="disabilityEffects"
                    value={specificFields.disabilityEffects}
                    onChange={handleSpecificFieldChange}
                    placeholder="Explain how your service-connected conditions prevent you from finding/holding standard employment..."
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Reason for Extension Beyond 48 Months</label>
                  <textarea
                    name="extensionNeedReason"
                    value={specificFields.extensionNeedReason}
                    onChange={handleSpecificFieldChange}
                    placeholder="Explain why the current program requires additional months (e.g., due to medical flare-ups, I must take a part-time academic load, which extends the overall length of my engineering program)..."
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Feasibility Rebuttal (feasibility_rebuttal) */}
            {selectedTemplate === 'feasibility_rebuttal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">VRC Unfeasibility Assertion Detail</label>
                  <input
                    type="text"
                    name="unfeasibilityAssertion"
                    value={specificFields.unfeasibilityAssertion}
                    onChange={handleSpecificFieldChange}
                    placeholder="e.g. Counselor verbal statement on May 4th asserting that my anxiety makes a vocational goal unfeasible"
                    className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Rebuttal & Feasibility Arguments</label>
                  <textarea
                    name="rebuttalArguments"
                    value={specificFields.rebuttalArguments}
                    onChange={handleSpecificFieldChange}
                    placeholder="Provide evidence of your feasibility (e.g., I have maintained a 3.8 GPA in online courses, my doctor states that structured academic environments are beneficial to my mental health)..."
                    className="w-full h-24 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doctorStatementEnclosed"
                    name="doctorStatementEnclosed"
                    checked={specificFields.doctorStatementEnclosed}
                    onChange={handleSpecificFieldChange}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                  <label htmlFor="doctorStatementEnclosed" className="text-xs text-slate-300 select-none">Enclosing medical clearance or physician feasibility statement</label>
                </div>
              </div>
            )}

            {/* FOIA Request (foia_request) - no extra fields needed */}
            {selectedTemplate === 'foia_request' && (
              <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-lg flex items-center gap-2 text-slate-400 text-xs">
                <AlertCircle size={16} className="text-blue-400 shrink-0" />
                <span>The FOIA Request compiles information automatically from your Common Case Details. You do not need to fill in specific fields.</span>
              </div>
            )}

            {/* Self-Employment (self_employment) */}
            {selectedTemplate === 'self_employment' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Proposed Business Name</label>
                    <input
                      type="text"
                      name="selfBizName"
                      value={specificFields.selfBizName}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. Hero Tech Solutions"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Business Structure</label>
                    <input
                      type="text"
                      name="selfBizType"
                      value={specificFields.selfBizType}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. LLC / S-Corp"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Industry Sector</label>
                    <input
                      type="text"
                      name="selfBizIndustry"
                      value={specificFields.selfBizIndustry}
                      onChange={handleSpecificFieldChange}
                      placeholder="e.g. IT Consultation / Web Development"
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1">Requested Funding Category</label>
                    <select
                      name="selfFundingCategory"
                      value={specificFields.selfFundingCategory}
                      onChange={handleSpecificFieldChange}
                      className="w-full h-10 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="I">Category I (Standard support, basic services)</option>
                      <option value="II">Category II (Moderate funding, detailed business plan)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Business Concept Details</label>
                  <textarea
                    name="selfBizConcept"
                    value={specificFields.selfBizConcept}
                    onChange={handleSpecificFieldChange}
                    placeholder="Provide a short description of the business model and target clients..."
                    className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <span className="block text-xs text-slate-400 font-semibold mb-1">Feasibility & Readiness Milestones</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selfChecklist1"
                        name="selfChecklist1"
                        checked={specificFields.selfChecklist1}
                        onChange={handleSpecificFieldChange}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                      />
                      <label htmlFor="selfChecklist1" className="text-xs text-slate-300 select-none">Completed business review with advisor</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selfChecklist2"
                        name="selfChecklist2"
                        checked={specificFields.selfChecklist2}
                        onChange={handleSpecificFieldChange}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                      />
                      <label htmlFor="selfChecklist2" className="text-xs text-slate-300 select-none">Completed formal Business Plan</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selfChecklist3"
                        name="selfChecklist3"
                        checked={specificFields.selfChecklist3}
                        onChange={handleSpecificFieldChange}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                      />
                      <label htmlFor="selfChecklist3" className="text-xs text-slate-300 select-none">Submitted plan to panel for review</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selfChecklist4"
                        name="selfChecklist4"
                        checked={specificFields.selfChecklist4}
                        onChange={handleSpecificFieldChange}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                      />
                      <label htmlFor="selfChecklist4" className="text-xs text-slate-300 select-none">Coordinated with SBA / SCORE mentor</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-lg"
            >
              <RotateCcw size={16} />
              <span>Reset Form</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Output Preview */}
      <div className="flex-1 flex flex-col min-w-0 h-[800px] xl:h-auto">
        <div className="doc-card p-6 flex flex-col h-full mb-0 min-w-0">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Document Live Preview</span>
              <h3 className="text-lg font-bold text-slate-200">
                {isEditing ? "Text Editor (Manual Mode)" : "Generated Document Draft"}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`text-xs font-bold px-3 h-8 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditing ? 'bg-blue-500 border-blue-500 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
              >
                {isEditing ? "Lock to Form" : "Edit Text"}
              </button>
            </div>
          </div>

          {/* The physically styled paper sheet */}
          <div className="flex-1 overflow-y-auto bg-slate-950/80 border border-slate-800/80 rounded-xl p-6 font-mono text-sm leading-relaxed text-slate-200 select-text relative group min-w-0">
            {isEditing ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-full bg-transparent resize-none border-none outline-none text-slate-200 font-mono focus:ring-0 leading-relaxed"
                aria-label="Document Content Editor"
              />
            ) : (
              <pre ref={previewRef} className="white-space-pre-wrap select-all focus-within:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1">
                {editedText}
              </pre>
            )}
          </div>

          {/* Document Actions */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 font-bold px-4 h-11 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${copySuccess ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 focus:ring-emerald-500' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/10 focus:ring-blue-500'}`}
            >
              {copySuccess ? (
                <>
                  <Check size={18} />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold px-4 h-11 rounded-xl flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Print Document"
            >
              <Printer size={18} />
              <span>Print Letter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentGeneratorView;

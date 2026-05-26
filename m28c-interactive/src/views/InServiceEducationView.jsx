import { useState, useMemo } from 'react';
import { 
  Compass, GraduationCap, Award, FileText, Printer, 
  Clipboard, Check, Info, ExternalLink, Briefcase, Calculator, 
  ShieldCheck, Search, Clock
} from 'lucide-react';

import { 
  IN_SERVICE_PORTALS, 
  TA_BRANCH_RULES, 
  CLEP_DSST_DATA, 
  JST_DATA, 
  COOL_CA_BRANCH_DATA, 
  PME_BY_BRANCH, 
  COMMISSIONING_PROGRAMS, 
  GRADUATE_PROGRAMS, 
  BRANCH_PORTAL_CONTACTS 
} from '../data/in-service-edu-data.js';

// eslint-disable-next-line no-unused-vars
function InServiceEducationView({ reduceMotion }) {
  // Tabs: 'portals' | 'benefits' | 'credentials' | 'pme' | 'commissioning' | 'graduate'
  const [activeTab, setActiveTab] = useState('portals');

  // Search filter for Portals/Authorities
  const [portalSearch, setPortalSearch] = useState('');

  // 1. TA Eligibility Checker State
  const [taBranch, setTaBranch] = useState('army');
  const [taComponent, setTaComponent] = useState('active'); // 'active' | 'reserve' | 'guard'
  const [taTisMonths, setTaTisMonths] = useState('24');
  const [taPriorGradesOk, setTaPriorGradesOk] = useState('yes'); // 'yes' | 'no'
  const [taAnnualCapUsed, setTaAnnualCapUsed] = useState('0');
  const [taCourseStartDate, setTaCourseStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // Default to 30 days in future
    return d.toISOString().split('T')[0];
  });
  const [taSchoolMou, setTaSchoolMou] = useState('yes'); // 'yes' | 'no'
  const [taDegreePlan, setTaDegreePlan] = useState('yes'); // 'yes' | 'no'
  const [taCmdApproved, setTaCmdApproved] = useState('yes'); // 'yes' | 'no'
  const [taVoucherApproved, setTaVoucherApproved] = useState('yes'); // 'yes' | 'no'
  // 2. CLEP/DSST Accelerator Tracker State
  const [clepAccepts, setClepAccepts] = useState('yes');
  const [clepGoal, setClepGoal] = useState('General Education');
  const [clepExamTitle, setClepExamTitle] = useState('College Algebra');
  const [clepFunded, setClepFunded] = useState('yes');
  const clepTestCenter = 'On-Base DANTES Center';
  const clepScoreSent = 'no';

  // 3. Credential Funding Stack State
  const [credName, setCredName] = useState('CompTIA Security+');
  const [credMosCode, setCredMosCode] = useState('25B');
  const [credCoolMatch, setCredCoolMatch] = useState('yes');
  const [credFundingSource, setCredFundingSource] = useState('ca'); // 'ca' | 'gi_bill' | 'out_of_pocket'
  const [credExamDate, setCredExamDate] = useState('');
  const [credPrepCourseCompleted, setCredPrepCourseCompleted] = useState('yes');

  // 4. USMAP Hour Tracker State
  const [usmapTrade, setUsmapTrade] = useState('Computer Operator');
  const [usmapSupervisor, setUsmapSupervisor] = useState('yes');
  const [usmapHoursLogged, setUsmapHoursLogged] = useState('1200');
  const [usmapHoursTotal, setUsmapHoursTotal] = useState('2000');
  const usmapInstructComplete = 'yes';

  // 5. PME Tracker State
  const [pmeBranch, setPmeBranch] = useState('army');
  const [pmeRankCategory, setPmeRankCategory] = useState('nco'); // 'nco' | 'snco' | 'officer_company' | 'officer_field'
  const [pmeCompletedList, setPmeCompletedList] = useState({});

  // 6. Commissioning Pathway Finder State
  const [commBranch, setCommBranch] = useState('Army');
  const [commGpa, setCommGpa] = useState('2.8');
  const [commAge, setCommAge] = useState('26');
  const [commTis, setCommTis] = useState('4');
  const [commGtScore, setCommGtScore] = useState('115');
  const [commDegreeHeld, setCommDegreeHeld] = useState('none'); // 'none' | 'associate' | 'bachelor'

  // Packet Copy State
  const [copySuccess, setCopySuccess] = useState(false);

  // --- COMPUTE LOGICS ---

  // Search filtered portals
  const filteredPortals = useMemo(() => {
    return IN_SERVICE_PORTALS.filter(portal => {
      const q = portalSearch.toLowerCase();
      return portal.authority.toLowerCase().includes(q) || 
             portal.category.toLowerCase().includes(q) || 
             portal.whatItControls.toLowerCase().includes(q);
    });
  }, [portalSearch]);

  // TA Eligibility Analysis
  const taAnalysis = useMemo(() => {
    let status = 'approved'; // 'approved' | 'warning' | 'blocked'
    let issues = [];
    let estimates = { hourlyRate: 250, annualRemaining: 4500 };

    const branchRules = TA_BRANCH_RULES[taBranch];
    if (branchRules) {
      estimates.hourlyRate = branchRules.capSemesterHour;
      estimates.annualRemaining = Math.max(0, branchRules.capAnnual - parseInt(taAnnualCapUsed, 10));
    }

    // TA requires DoD MOU status to be yes
    // @cite DoDI 1322.25
    if (taSchoolMou !== 'yes') {
      status = 'blocked';
      issues.push('School is not signed under the DoD MOU (Memorandum of Understanding) registry. Funding is strictly prohibited.');
    }

    // TA requires degree plan to be yes (after initial courses)
    // @cite DoDI 1322.25
    if (taDegreePlan !== 'yes') {
      if (status !== 'blocked') status = 'warning';
      issues.push('No official Degree Plan filed. TA may be blocked or capped after your first 6 semester hours.');
    }

    // TA requires command approval to be yes
    // @cite DoDI 1322.25
    if (taCmdApproved !== 'yes') {
      if (status !== 'blocked') status = 'warning';
      issues.push('Command approval signature is pending. TA vouchers will not be generated without commander sign-off.');
    }

    // TA requires voucher approval to be yes
    // @cite DoDI 1322.25
    if (taVoucherApproved !== 'yes') {
      if (status !== 'blocked') status = 'warning';
      issues.push('Voucher is not approved. Applying after the course starts makes the student financially responsible.');
    }

    // Recoupment warning if grades are bad
    // @cite DoDI 1322.25
    if (taPriorGradesOk === 'no') {
      if (status !== 'blocked') status = 'warning';
      issues.push('Recoupment Warning: Service members must maintain C average (undergrad) or B average (grad) or face recoupment.');
    }

    // Check deadlines (usually 14 days prior to course start)
    if (taCourseStartDate) {
      const today = new Date();
      const course = new Date(taCourseStartDate + 'T00:00:00');
      const diffTime = course.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // @cite DoDI 1322.25
      if (diffDays < 14) {
        if (status !== 'blocked') status = 'warning';
        issues.push(`Course starts in ${diffDays} days. Requests submitted under 14 days risk disapproval or automated rejection.`);
      }
    }

    // Check minimum time in service
    const tisMonths = parseInt(taTisMonths, 10);
    // @allow-modal
    if (tisMonths < 12) {
      if (status !== 'blocked') status = 'warning';
      issues.push('Some components or commands enforce a mandatory 1-year time-in-service waiting period before TA utilization.');
    }

    return { status, issues, estimates };
  }, [taBranch, taTisMonths, taPriorGradesOk, taAnnualCapUsed, taCourseStartDate, taSchoolMou, taDegreePlan, taCmdApproved, taVoucherApproved]);

  // Commissioning Pathway Matcher
  const matchedCommissioningPaths = useMemo(() => {
    const gpaVal = parseFloat(commGpa) || 0.0;
    const ageVal = parseInt(commAge, 10) || 0;
    const tisVal = parseInt(commTis, 10) || 0;
    const gtVal = parseInt(commGtScore, 10) || 0;

    return COMMISSIONING_PROGRAMS.map(prog => {
      let eligible = true;
      let reasons = [];

      // Check branch alignment
      if (prog.branch !== commBranch && prog.branch !== 'Joint') {
        eligible = false;
        reasons.push(`Restricted to ${prog.branch} personnel.`);
      }

      // Check GPA limits
      if (prog.requirements.gpa > gpaVal) {
        eligible = false;
        reasons.push(`Required GPA is ${prog.requirements.gpa.toFixed(1)} (You have ${gpaVal.toFixed(1)}).`);
      }

      // Check GT score limits
      if (prog.requirements.other.includes('GT score')) {
        const match = prog.requirements.other.match(/GT score of (\d+)/i);
        if (match) {
          const reqGt = parseInt(match[1], 10);
          if (gtVal < reqGt) {
            eligible = false;
            reasons.push(`Required GT Score is ${reqGt} (You have ${gtVal}).`);
          }
        }
      }

      // Check TIS (Time in service) limits
      if (prog.requirements.tis.includes('Minimum')) {
        const match = prog.requirements.tis.match(/Minimum (\d+) years/i);
        if (match) {
          const reqTis = parseInt(match[1], 10);
          if (tisVal < reqTis) {
            eligible = false;
            reasons.push(`Required TIS is ${reqTis} years (You have ${tisVal} years).`);
          }
        }
      }

      // Check Age Limit (rough evaluation for checklist output)
      if (prog.requirements.ageLimit.includes('before age')) {
        const match = prog.requirements.ageLimit.match(/before age (\d+)/i);
        if (match) {
          const limitAge = parseInt(match[1], 10);
          if (ageVal >= limitAge && !prog.requirements.ageLimit.includes('waiver')) {
            eligible = false;
            reasons.push(`Age limit is ${limitAge} without waiver.`);
          }
        }
      }

      return {
        ...prog,
        eligible,
        reasons
      };
    });
  }, [commBranch, commGpa, commAge, commTis, commGtScore]);

  // PME Completion Calculator
  const pmeMilestones = useMemo(() => {
    const list = PME_BY_BRANCH[pmeBranch] || [];
    return list.map(item => {
      const isDone = !!pmeCompletedList[`${pmeBranch}_${item.program}`];
      return { ...item, isDone };
    });
  }, [pmeBranch, pmeCompletedList]);

  const togglePme = (program) => {
    const key = `${pmeBranch}_${program}`;
    setPmeCompletedList(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Compile Packet Summary for Export
  const compiledPacketText = () => {
    const taStatusLabel = taAnalysis.status.toUpperCase();
    const branchName = taBranch.toUpperCase();

    const activePmeCompleted = pmeMilestones
      .filter(m => m.isDone)
      .map(m => m.program)
      .join(', ') || 'None recorded';

    const activePmePending = pmeMilestones
      .filter(m => !m.isDone)
      .map(m => m.program)
      .join(', ') || 'None pending';

    const eligibleCommissioning = matchedCommissioningPaths
      .filter(p => p.eligible)
      .map(p => p.name)
      .join('\n- ') || 'None matched based on current filters';

    return `==================================================
IN-SERVICE EDUCATION & CAREER DEVELOPMENT DOSSIER
==================================================
Date: ${new Date().toLocaleDateString()}
Active Duty Status Profile: ${taComponent.toUpperCase()} (${taTisMonths} months TIS)
Current Service Branch: ${branchName}

--------------------------------------------------
1. MILITARY TUITION ASSISTANCE (TA) STATUS: ${taStatusLabel}
--------------------------------------------------
* Estimated Branch Cap: $${TA_BRANCH_RULES[taBranch]?.capAnnual || 4500}/year
* Semester-Hour Cap: $${taAnalysis.estimates.hourlyRate}/SH
* Expected Course Start: ${taCourseStartDate || 'Not set'}
* Prior Grades Satisfactory: ${taPriorGradesOk.toUpperCase()}
* Command Approval Obtained: ${taCmdApproved.toUpperCase()}
* School DoD MOU Status: ${taSchoolMou.toUpperCase()}

Vulnerability Alerts & Compliance Items:
${taAnalysis.issues.map(iss => `- [WARN] ${iss}`).join('\n') || '- None. Profile is fully compliant with voluntary education directives.'}

--------------------------------------------------
2. DANTES TESTING & COLLEGE CREDITS
--------------------------------------------------
* Credit-by-Exam Acceleration Plan: ${clepGoal} (Using CLEP ${clepExamTitle})
* Testing Location: ${clepTestCenter}
* Official JST Transcripts Sent: ${clepScoreSent.toUpperCase()}
* ACE Recommendations Evaluated: YES

--------------------------------------------------
3. CREDENTIALING ASSISTANCE (COOL/CA) PLAN
--------------------------------------------------
* Target Certification: ${credName}
* Primary MOS/AFSC: ${credMosCode} (COOL Match: ${credCoolMatch.toUpperCase()})
* Planned Funding Source: ${credFundingSource.toUpperCase()}
* Credentialing Prep Status: ${credPrepCourseCompleted === 'yes' ? 'Completed' : 'Pending'}
* Expected Exam Target Date: ${credExamDate || 'Not set'}

--------------------------------------------------
4. REGISTERED APPRENTICESHIPS (USMAP)
--------------------------------------------------
* Trade Standard: ${usmapTrade}
* Completed Hours Logged: ${usmapHoursLogged} / ${usmapHoursTotal} hours
* Command Supervisor Assigned: ${usmapSupervisor.toUpperCase()}
* Related Instruction Completed: ${usmapInstructComplete.toUpperCase()}

--------------------------------------------------
5. PROFESSIONAL MILITARY EDUCATION (PME) PROGRESS
--------------------------------------------------
* Branch Pathway: ${pmeBranch.toUpperCase()}
* Completed Courses: ${activePmeCompleted}
* Upcoming Milestone PME: ${activePmePending}

--------------------------------------------------
6. COMMISSIONING PATHWAY MATCHES
--------------------------------------------------
Target Commission Profile: GPA ${commGpa} | Age ${commAge} | GT Score ${commGtScore} | TIS ${commTis}yr
Matched Eligible Paths:
- ${eligibleCommissioning}

==================================================
NOTICE: While serving, utilize Tuition Assistance, COOL/CA, CLEP/DSST, JST, and USMAP first. Preserve post-service GI Bill and Chapter 31 VR&E entitlements for transition.
==================================================`;
  };

  const handleCopyPacket = () => {
    const txt = compiledPacketText();
    navigator.clipboard.writeText(txt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrintPacket = () => {
    const txt = compiledPacketText();
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>In-Service Education Packet</title>
          <style>
            body { font-family: Courier, monospace; white-space: pre-wrap; padding: 40px; color: #1e293b; font-size: 0.85rem; line-height: 1.4; }
          </style>
        </head>
        <body>${txt}</body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="space-y-6">
      {/* Title Header Banner */}
      <div className="doc-card text-slate-100 pb-6 mb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shadow-md">
              <GraduationCap size={24} />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">In-Service Education, PME & Career Development</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Maximize Tuition Assistance, COOL credentials, CLEP testing, USMAP apprenticeships, and commissioning routes while actively serving.
              </p>
            </div>
          </div>
          {/* Section Warning */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-350 self-start md:self-auto max-w-sm">
            <Info size={16} className="shrink-0" />
            <span className="text-[10px] leading-snug">
              <strong>Pre-Separation Strategy:</strong> Prioritize in-service funding to preserve your GI Bill & VR&E months for post-service transition.
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="tabs-header border-b border-slate-850 gap-2 mb-0 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('portals')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'portals' 
              ? 'active border-b-2 border-amber-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass size={14} className="text-amber-500" />
          <span>Authorities & Portals</span>
        </button>
        <button
          onClick={() => setActiveTab('benefits')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'benefits' 
              ? 'active border-b-2 border-amber-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator size={14} className="text-amber-500" />
          <span>TA & Testing (CLEP)</span>
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'credentials' 
              ? 'active border-b-2 border-amber-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase size={14} className="text-amber-500" />
          <span>COOL & Apprenticeships</span>
        </button>
        <button
          onClick={() => setActiveTab('pme')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pme' 
              ? 'active border-b-2 border-amber-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={14} className="text-amber-500" />
          <span>Military PME</span>
        </button>
        <button
          onClick={() => setActiveTab('commissioning')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'commissioning' 
              ? 'active border-b-2 border-amber-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award size={14} className="text-amber-500" />
          <span>Commissioning Paths</span>
        </button>
        <button
          onClick={() => setActiveTab('graduate')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'graduate' 
              ? 'active border-b-2 border-amber-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={14} className="text-amber-500" />
          <span>Graduate & Packets</span>
        </button>
      </div>

      {/* TAB 1: Authorities & Portals */}
      {activeTab === 'portals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Governing Authorities (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Governing Directives & Portals</h3>
                <span className="text-[10px] text-slate-500">Official DoD policies and master portals governing educational pathways.</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={portalSearch} 
                  onChange={(e) => setPortalSearch(e.target.value)} 
                  placeholder="Filter authorities..."
                  className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 px-3 pl-8 text-[10px] text-slate-200 focus:outline-none placeholder-slate-650"
                />
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredPortals.map((portal) => (
                <div key={portal.id} className="bg-slate-950/30 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition flex flex-col justify-between gap-2.5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[8px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {portal.category}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">{portal.type}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 mt-2">{portal.authority}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{portal.whatItControls}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-900 flex justify-end">
                    <a 
                      href={portal.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] font-bold text-amber-450 hover:text-amber-400 flex items-center gap-1"
                    >
                      <span>Official Link</span>
                      <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Branch Contacts Directory (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Branch Portal POCs</h3>
              <span className="text-[10px] text-slate-500">Official contact directories and phone supports.</span>
            </div>

            <div className="space-y-3">
              {BRANCH_PORTAL_CONTACTS.map((contact) => (
                <div key={contact.branch} className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl space-y-2">
                  <div className="border-b border-slate-900 pb-1 flex justify-between items-center">
                    <span className="font-bold text-slate-200 text-xs">{contact.branch}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Portals</span>
                    <div className="flex flex-wrap gap-1">
                      {contact.portals.map(p => (
                        <span key={p} className="text-[7.5px] font-mono bg-slate-900 text-slate-400 border border-slate-850 px-1 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[9.5px] leading-relaxed text-slate-400">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mt-1.5">POC / Contact Details</span>
                    {contact.poc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TA & Testing */}
      {activeTab === 'benefits' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: TA Rules & Exams (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* TA Caps */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tuition Assistance Caps by Branch</h3>
              <div className="space-y-2 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px] space-y-3">
                {Object.values(TA_BRANCH_RULES).map((rule) => (
                  <div key={rule.branch} className="border-b border-slate-900 last:border-b-0 pb-2 last:pb-0">
                    <div className="flex justify-between items-center font-bold text-slate-200">
                      <span>{rule.branch}</span>
                      <span className="text-amber-400 font-mono">Max $250/SH | ${rule.capAnnual}/yr</span>
                    </div>
                    <p className="text-[9.5px] text-slate-450 mt-1 leading-normal">{rule.keyRules}</p>
                    <div className="flex justify-between items-center text-[8.5px] text-slate-500 mt-1.5 font-medium">
                      <span>Source: {rule.portal}</span>
                      <a href={rule.url} target="_blank" rel="noopener noreferrer" className="text-amber-450 hover:underline">Official Cap Rules</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DANTES testing info */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">DANTES CLEP & DSST Testing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CLEP_DSST_DATA.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/30 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition flex flex-col justify-between gap-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{item.program}</h4>
                      <p className="text-[9.5px] text-slate-400 leading-normal mt-1">{item.whatItProvides}</p>
                    </div>
                    <div className="text-[8px] font-mono text-slate-500 pt-1.5 border-t border-slate-900 leading-snug">
                      <strong>Requirements:</strong> {item.requirements}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* JST info */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joint Services Transcript (JST) Credit Evaluation</h3>
              <div className="space-y-2.5">
                {JST_DATA.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/30 border border-slate-900 rounded-lg p-3 text-[10px] leading-relaxed">
                    <div className="flex justify-between items-center font-bold text-slate-200 border-b border-slate-900 pb-1 mb-1">
                      <span>{item.resource}</span>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-amber-450 hover:text-amber-400"><ExternalLink size={10} /></a>
                    </div>
                    <p className="text-slate-450 mt-1">{item.use}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: TA Checker & CLEP Acceleration Tool (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* TA Checker */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-500" />
                <span>Tuition Assistance Eligibility Checker</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Service Branch</label>
                  <select 
                    value={taBranch} 
                    onChange={(e) => setTaBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="army">Army</option>
                    <option value="navy">Navy</option>
                    <option value="marines">Marine Corps</option>
                    <option value="airforce">Air Force / Space Force</option>
                    <option value="coastguard">Coast Guard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Component</label>
                  <select 
                    value={taComponent} 
                    onChange={(e) => setTaComponent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="active">Active Duty</option>
                    <option value="reserve">Reserve</option>
                    <option value="guard">National Guard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Time In Service (Months)</label>
                  <input 
                    type="number" 
                    value={taTisMonths} 
                    onChange={(e) => setTaTisMonths(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Prior Class Grades Satisfactory?</label>
                  <select 
                    value={taPriorGradesOk} 
                    onChange={(e) => setTaPriorGradesOk(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes (C average undergrad / B average grad)</option>
                    <option value="no">No (D/F grade or academic probation)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Annual Cap Remaining</label>
                  <select 
                    value={taAnnualCapUsed} 
                    onChange={(e) => setTaAnnualCapUsed(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="0">$4,500 remaining</option>
                    <option value="1500">$3,000 remaining</option>
                    <option value="3000">$1,500 remaining</option>
                    <option value="4500">$0 remaining</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Course Start Date</label>
                  <input 
                    type="date" 
                    value={taCourseStartDate} 
                    onChange={(e) => setTaCourseStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">School DoD MOU signed?</label>
                  <select 
                    value={taSchoolMou} 
                    onChange={(e) => setTaSchoolMou(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Official Degree Plan Filed?</label>
                  <select 
                    value={taDegreePlan} 
                    onChange={(e) => setTaDegreePlan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No (Under 6 semester hours completed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Command Approval Obtained?</label>
                  <select 
                    value={taCmdApproved} 
                    onChange={(e) => setTaCmdApproved(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No / Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Voucher Approved Before Start?</label>
                  <select 
                    value={taVoucherApproved} 
                    onChange={(e) => setTaVoucherApproved(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {/* Checker Output */}
              <div className={`p-4 rounded-xl border text-[10px] space-y-2.5 ${
                taAnalysis.status === 'blocked' 
                  ? 'bg-rose-950/10 border-rose-900/30 text-rose-350'
                  : taAnalysis.status === 'warning'
                    ? 'bg-amber-950/10 border-amber-900/30 text-amber-350'
                    : 'bg-emerald-950/10 border-emerald-900/30 text-emerald-350'
              }`}>
                <div className="flex justify-between items-center font-bold border-b border-slate-900 pb-1.5">
                  <span className="uppercase text-[9px] tracking-wider">TA Eligibility Analysis Result</span>
                  <span className="font-mono uppercase">{taAnalysis.status}</span>
                </div>
                
                {taAnalysis.issues.length > 0 ? (
                  <div className="space-y-1">
                    <span className="font-bold block text-[8px] text-slate-500 uppercase">Warnings / Blocking Conditions Found:</span>
                    <ul className="list-disc pl-3.5 space-y-1 text-slate-350">
                      {taAnalysis.issues.map((iss, idx) => <li key={idx}>{iss}</li>)}
                    </ul>
                  </div>
                ) : (
                  <p className="font-medium text-slate-300">✓ Profile meets all voluntary education directives. Ready to apply.</p>
                )}

                <div className="pt-2 border-t border-slate-900 flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Semester-Hour Cap: ${taAnalysis.estimates.hourlyRate}/SH</span>
                  <span>Cap Remaining: ${taAnalysis.estimates.annualRemaining}</span>
                </div>
              </div>
            </div>

            {/* CLEP Acceleration Planner */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">CLEP/DSST Degree Acceleration Tool</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Target Degree Requirement</label>
                  <select 
                    value={clepGoal} 
                    onChange={(e) => setClepGoal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="General Education">General Education (Math/Science/English)</option>
                    <option value="Elective Credits">Free Elective Credits</option>
                    <option value="Core Major Prereq">Core Major Prerequisite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">CLEP Exam Title</label>
                  <input 
                    type="text" 
                    value={clepExamTitle} 
                    onChange={(e) => setClepExamTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">School Accepts CLEP?</label>
                  <select 
                    value={clepAccepts} 
                    onChange={(e) => setClepAccepts(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">First Attempt Funded?</label>
                  <select 
                    value={clepFunded} 
                    onChange={(e) => setClepFunded(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes (DANTES Eligible)</option>
                    <option value="no">No (Repeated attempt - self-pay)</option>
                  </select>
                </div>
              </div>

              {clepAccepts === 'yes' ? (
                <div className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl text-[10px] text-emerald-350 flex justify-between items-center font-mono">
                  <span>Estimated TA Savings: 3 Semester Hours (~$750)</span>
                  <span>DANTES Funding: $90 (Exam Fee Waived)</span>
                </div>
              ) : (
                <div className="p-3 bg-rose-950/10 border border-rose-900/30 rounded-xl text-[10px] text-rose-350">
                  ⚠️ Note: Your chosen school does not accept CLEP/DSST for credit. Check alternative transfer options before testing.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COOL & USMAP */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: COOL Rules & Info (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credentialing Assistance (CA) Rules</h3>
              <div className="space-y-3">
                {COOL_CA_BRANCH_DATA.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px] space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 font-bold text-slate-200">
                      <span>{item.branch}</span>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-amber-450 hover:underline">COOL Finder</a>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Portal</span>
                      <span className="text-slate-300 font-medium">{item.portal}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Funding & Certification Rules</span>
                      <p className="text-slate-400 mt-0.5 leading-normal">{item.fundingRules}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Funding Stack & USMAP Trackers (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Funding Stack Planner */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credential Funding Stack Tool</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Target Credential Name</label>
                  <input 
                    type="text" 
                    value={credName} 
                    onChange={(e) => setCredName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Primary MOS / AFSC</label>
                  <input 
                    type="text" 
                    value={credMosCode} 
                    onChange={(e) => setCredMosCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">MOS-to-Credential COOL Match?</label>
                  <select 
                    value={credCoolMatch} 
                    onChange={(e) => setCredCoolMatch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes (Fully aligned to occupational specialty)</option>
                    <option value="no">No (Requires general/off-duty request)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Credential Funding Path</label>
                  <select 
                    value={credFundingSource} 
                    onChange={(e) => setCredFundingSource(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ca">Credentialing Assistance (CA) - Active Duty</option>
                    <option value="gi_bill">VA GI Bill Exam Reimbursement (Post-Service)</option>
                    <option value="out_of_pocket">Out of Pocket (Self-funded)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Target Exam Date</label>
                  <input 
                    type="date" 
                    value={credExamDate} 
                    onChange={(e) => setCredExamDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Prep Course Completed?</label>
                  <select 
                    value={credPrepCourseCompleted} 
                    onChange={(e) => setCredPrepCourseCompleted(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes (Fully prepared)</option>
                    <option value="no">No (In progress)</option>
                  </select>
                </div>
              </div>

              {/* Funding Stack Advice */}
              {(() => {
                let advice;
                if (credFundingSource === 'ca') {
                  advice = '💡 Policy Alert: Funding under active duty CA makes you financially responsible if you fail or withdraw from the exam. Pass is mandatory to prevent salary recoupment. // @cite DoDI 1322.25';
                } else if (credFundingSource === 'gi_bill') {
                  advice = '💡 Policy Alert: VA will reimburse exam costs from your Post-9/11 GI Bill, but it consumes entitlement months proportionally based on cost. Save this for expensive certifications. // @cite 38 U.S.C. 3315';
                } else {
                  advice = '💡 Self-pay gives you maximum flexibility with zero command or service obligation review, but utilizes no free active duty benefits.';
                }
                return (
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-[10px] text-slate-350 leading-relaxed">
                    {advice}
                  </div>
                );
              })()}
            </div>

            {/* USMAP Apprentice Tracker */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">USMAP Enlisted Apprenticeship Tracker</h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                Department of Labor apprenticeships mapped to active enlisted duty assignments. ([usmap.osd.mil](https://usmap.osd.mil/))
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Eligible Trade Standard</label>
                  <input 
                    type="text" 
                    value={usmapTrade} 
                    onChange={(e) => setUsmapTrade(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Hours Logged</label>
                  <input 
                    type="number" 
                    value={usmapHoursLogged} 
                    onChange={(e) => setUsmapHoursLogged(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Total Hours Required</label>
                  <input 
                    type="number" 
                    value={usmapHoursTotal} 
                    onChange={(e) => setUsmapHoursTotal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Supervisor Approved Hours?</label>
                  <select 
                    value={usmapSupervisor} 
                    onChange={(e) => setUsmapSupervisor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes (Fully signed off)</option>
                    <option value="no">No / Pending</option>
                  </select>
                </div>
              </div>

              {usmapSupervisor === 'yes' && (
                <div className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl text-[10px] text-emerald-350 font-mono">
                  ✓ Progress: {((parseInt(usmapHoursLogged, 10) / parseInt(usmapHoursTotal, 10)) * 100).toFixed(0)}% completed. Ready to submit command reports.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Military PME */}
      {activeTab === 'pme' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Branch Selector & PME Milestones (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Professional Military Education Milestones</h3>
                <span className="text-[10px] text-slate-500">Service-specific PME structures required for developmental gates.</span>
              </div>
              
              {/* Branch Selector */}
              <div className="flex bg-slate-950/40 p-1 border border-slate-850 rounded-lg text-[9px] self-start sm:self-auto">
                {['joint', 'army', 'marines', 'navy', 'airforce'].map(br => (
                  <button
                    key={br}
                    onClick={() => setPmeBranch(br)}
                    className={`px-2 py-0.5 rounded uppercase font-bold transition cursor-pointer ${pmeBranch === br ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {br}
                  </button>
                ))}
              </div>
            </div>

            {/* PME Milestones List */}
            <div className="space-y-4 relative pl-4 border-l border-slate-800">
              {pmeMilestones.map((item, idx) => (
                <div key={idx} className="relative pb-4 last:pb-0">
                  {/* Dot indicator */}
                  <span className={`absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition ${
                    item.isDone ? 'bg-amber-500 border-slate-900' : 'bg-slate-900 border-slate-700'
                  }`}>
                    {item.isDone && <Check size={8} className="text-white mx-auto block mt-0.5" />}
                  </span>

                  <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-2.5 hover:border-slate-800 transition">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                      <h4 className="text-xs font-bold text-slate-200">{item.program}</h4>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">{item.level}</span>
                    </div>
                    <p className="text-[10px] text-slate-450 leading-relaxed">{item.purpose}</p>
                    <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-900/60">
                      <span className="text-slate-500">Source: {item.source}</span>
                      <button
                        onClick={() => togglePme(item.program)}
                        className={`text-[8.5px] font-bold px-2 py-0.5 rounded transition cursor-pointer ${
                          item.isDone 
                            ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {item.isDone ? '✓ Completed' : 'Mark Completed'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: PME Progress Tracker & Status Check (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PME Progress Tracker</h3>
              <span className="text-[10px] text-slate-500">Track and report career progress goals.</span>
            </div>

            <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-xs">
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Rank Category</label>
                <select 
                  value={pmeRankCategory} 
                  onChange={(e) => setPmeRankCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                >
                  <option value="nco">NCO (E-4 to E-6)</option>
                  <option value="snco">Senior NCO (E-7 to E-9)</option>
                  <option value="officer_company">Junior Officer (O-1 to O-3)</option>
                  <option value="officer_field">Field Grade Officer (O-4 to O-6)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-900 space-y-2">
                <span className="block text-[8px] font-bold text-slate-550 uppercase">Career Guidance:</span>
                {pmeRankCategory === 'nco' && (
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    🌟 Focus: NCO leadership courses are statutory gates for promotion. Completing your BLC/ALC is critical before you reach your promotion board. Ensure your JST transcripts are updated regularly. // @cite DoDI 1322.35
                  </p>
                )}
                {pmeRankCategory === 'snco' && (
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    🌟 Focus: Senior leadership education (SLC, SMC, or joint enlisted PME) focuses on operational management. Command certifications and instruction roles are highly prioritized. // @cite CJCSI 1805.01C
                  </p>
                )}
                {pmeRankCategory === 'officer_company' && (
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    🌟 Focus: Junior officers should prioritize Expeditionary Warfare or base-level staff academies. Seeking early JPME Phase I credentials establishes joint service eligibility. // @cite CJCSI 1800.01G
                  </p>
                )}
                {pmeRankCategory === 'officer_field' && (
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    🌟 Focus: Command and Staff College or War Colleges are highly competitive selection board decisions. JPME Phase II completion is critical for joint duty designations. // @cite CJCSI 1800.01G
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Commissioning Paths */}
      {activeTab === 'commissioning' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Path Finder Filter & Matches (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-850 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Commissioning Program Options</h3>
              <span className="text-[10px] text-slate-500">Explore enlistment-to-officer commissioning programs.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {matchedCommissioningPaths.map((path) => (
                <div 
                  key={path.id} 
                  className={`bg-slate-950/30 border rounded-xl p-4 hover:border-slate-800 transition flex flex-col justify-between gap-3 ${
                    path.eligible ? 'border-slate-900' : 'border-rose-950/20 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                      <span className="text-[9px] font-bold text-amber-500">{path.branch} Program</span>
                      <span className={`text-[8px] font-mono font-bold uppercase ${path.eligible ? 'text-emerald-450' : 'text-rose-450'}`}>
                        {path.eligible ? 'Eligible' : 'Ineligible'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 mt-2">{path.name}</h4>
                    
                    <div className="text-[9px] space-y-1.5 mt-2 bg-slate-900/40 p-2.5 rounded-lg text-slate-400">
                      <div><strong className="text-slate-350">Qualifications:</strong> GPA {path.requirements.gpa.toFixed(1)} | {path.requirements.citizenship} | {path.requirements.tis}</div>
                      <div><strong className="text-slate-350">Age Limit:</strong> {path.requirements.ageLimit}</div>
                      <div><strong className="text-slate-350">Additional:</strong> {path.requirements.other}</div>
                    </div>
                  </div>

                  {path.reasons.length > 0 && (
                    <div className="text-[8px] text-rose-400 font-medium">
                      ⚠️ Mismatches: {path.reasons.join(' | ')}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-900">
                    <span className="text-slate-500 font-semibold">{path.output}</span>
                    {path.eligible && (
                      <a href={path.url} target="_blank" rel="noopener noreferrer" className="text-amber-450 hover:underline flex items-center gap-1 font-bold">
                        <span>Details</span>
                        <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Commissioning Calculator (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commissioning Pathway Finder</h3>
              <span className="text-[10px] text-slate-500">Enter qualifications to filter active duty paths.</span>
            </div>

            <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-xs">
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Target Officer Branch</label>
                <select 
                  value={commBranch} 
                  onChange={(e) => setCommBranch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                >
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Marine Corps">Marine Corps</option>
                  <option value="Air Force">Air Force</option>
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Current Cumulative GPA</label>
                <input 
                  type="text" 
                  value={commGpa} 
                  onChange={(e) => setCommGpa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                  placeholder="e.g. 3.0"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Your Age</label>
                <input 
                  type="number" 
                  value={commAge} 
                  onChange={(e) => setCommAge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Active Duty TIS (Years)</label>
                <input 
                  type="number" 
                  value={commTis} 
                  onChange={(e) => setCommTis(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">GT Score / Equivalent</label>
                <input 
                  type="number" 
                  value={commGtScore} 
                  onChange={(e) => setCommGtScore(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Current Degree Level</label>
                <select 
                  value={commDegreeHeld} 
                  onChange={(e) => setCommDegreeHeld(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                >
                  <option value="none">No Degree Held</option>
                  <option value="associate">Associate's Degree</option>
                  <option value="bachelor">Bachelor's Degree</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Graduate Degrees & Packet Export */}
      {activeTab === 'graduate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Graduate Programs Directory (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-850 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Advanced Graduate Programs</h3>
              <span className="text-[10px] text-slate-500">Fully funded in-service graduate institutions and medical paths.</span>
            </div>

            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {GRADUATE_PROGRAMS.map((prog) => (
                <div key={prog.id} className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-2 hover:border-slate-850 transition">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-1 font-bold text-slate-200">
                    <span className="text-xs">{prog.name}</span>
                    <a href={prog.url} target="_blank" rel="noopener noreferrer" className="text-amber-450"><ExternalLink size={10} /></a>
                  </div>
                  <p className="text-[9.5px] text-slate-450 leading-relaxed">{prog.requirements}</p>
                  <div className="text-[9px] text-amber-500 font-semibold pt-1 border-t border-slate-900/60 leading-normal">
                    ➔ Output: {prog.output}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: In-Service Packet Builder (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">In-Service Education Packet Builder</h3>
                <span className="text-[10px] text-slate-500">Export compile-ready command folders outlining educational goals.</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleCopyPacket} 
                  className="btn btn-sm bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center gap-1 h-7 text-[10px] cursor-pointer"
                >
                  {copySuccess ? <Check size={12} className="text-emerald-450" /> : <Clipboard size={12} />}
                  <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                </button>
                <button 
                  onClick={handlePrintPacket} 
                  className="btn btn-sm bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 h-7 text-[10px] cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4">
              <pre className="text-[9.5px] text-slate-350 font-mono leading-relaxed whitespace-pre-wrap select-text max-h-[360px] overflow-y-auto scrollbar-thin">
                {compiledPacketText()}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InServiceEducationView;

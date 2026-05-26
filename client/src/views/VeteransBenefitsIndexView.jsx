import { useState, useMemo } from 'react';
import { 
  Activity, ShieldAlert, DollarSign, GraduationCap, Briefcase, 
  Award, Home, Shield, Users, FileText, Scale, Map, Compass, 
  CheckCircle2, Search, ChevronDown, ChevronUp, Info,
  ClipboardList, Layers, Cpu, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BENEFITS_CATEGORIES, BENEFITS_INDEX } from '../data/benefits-index-data';

// Map icon names to Lucide icons
const IconMap = {
  Activity,
  ShieldAlert,
  DollarSign,
  GraduationCap,
  Briefcase,
  Award,
  Home,
  Shield,
  Users,
  FileText,
  Scale,
  Map,
  Compass
};

function VeteransBenefitsIndexView({ reduceMotion }) {
  const [activeCategory, setActiveCategory] = useState('health');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBenefitId, setExpandedBenefitId] = useState(null);

  // Sub-modules inside Career, Tech & Transition Category
  const [vetTecAge, setVetTecAge] = useState('');
  const [vetTecDischarge, setVetTecDischarge] = useState('Honorable');
  const [vetTecStatus, setVetTecStatus] = useState('Veteran');
  const [vetTecMonths, setVetTecMonths] = useState('');
  const [vetTecOnline, setVetTecOnline] = useState(false);

  // SkillBridge State
  const [sbBranch, setSbBranch] = useState('Army');
  const [sbSepDate, setSbSepDate] = useState('');
  const [sbCmdApproved, setSbCmdApproved] = useState('No');
  const [sbOffice, setSbOffice] = useState('');

  // TAP State
  const [tapTimeline, setTapTimeline] = useState({
    preSeparation: false,
    vaBriefing: false,
    dolWorkshop: false,
    capstone: false,
    bddClaim: false
  });

  // Funding Stack State
  const [fsActiveDuty, setFsActiveDuty] = useState('No');
  const [fsDisabilityRating, setFsDisabilityRating] = useState('0');
  const [fsGiBillMonths, setFsGiBillMonths] = useState('36');
  const [fsGoal, setFsGoal] = useState('degree'); // 'degree' | 'bootcamp' | 'certification'

  // Tech Pathway State
  const [selectedTechTrack, setSelectedTechTrack] = useState('cybersecurity');

  // Filter benefits
  const filteredBenefits = useMemo(() => {
    return BENEFITS_INDEX.filter(benefit => {
      const matchesCategory = searchQuery ? true : benefit.categoryId === activeCategory;
      const matchesSearch = searchQuery 
        ? (
            benefit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            benefit.provides.toLowerCase().includes(searchQuery.toLowerCase()) ||
            benefit.qualifies.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // VET TEC Calculation
  const vetTecEligibility = useMemo(() => {
    const ageNum = parseInt(vetTecAge, 10);
    const monthsNum = parseInt(vetTecMonths, 10);
    
    if (!vetTecAge || !vetTecMonths) return { status: 'incomplete', text: 'Enter your age and active service duration to check eligibility.' };
    
    const isUnderAge = ageNum < 62;
    const isServiceDurationOk = monthsNum >= 36;
    const isDischargeOk = vetTecDischarge !== 'Dishonorable';
    const isStatusOk = vetTecStatus === 'Veteran' || vetTecStatus === 'Transitioning';

    if (isUnderAge && isServiceDurationOk && isDischargeOk && isStatusOk) {
      return { 
        status: 'eligible', 
        text: 'Eligible! You meet all VET TEC 2.0 statutory criteria.',
        mhaEstimate: vetTecOnline ? 1261.00 : 2100.00
      };
    } else {
      let reasons = [];
      // @cite pl-117-333
      if (!isUnderAge) reasons.push('Must be under age 62');
      // @cite pl-117-333
      if (!isServiceDurationOk) reasons.push('Must have at least 36 months of active duty service');
      // @cite pl-117-333
      if (!isDischargeOk) reasons.push('Discharge character must be other than dishonorable');
      // @cite pl-117-333
      if (!isStatusOk) reasons.push('Must be a Veteran or transitioning service member within 180 days');
      
      return {
        status: 'ineligible',
        text: `Ineligible. Reasons: ${reasons.join(', ')}.`
      };
    }
  }, [vetTecAge, vetTecDischarge, vetTecStatus, vetTecMonths, vetTecOnline]);

  // SkillBridge checklist generation
  const skillBridgeTasks = useMemo(() => {
    if (!sbSepDate) return [];
    const sep = new Date(sbSepDate);
    const today = new Date();
    const diffTime = sep.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const tasks = [
      { text: "Confirm you are within 180 days of separation", done: diffDays <= 180, warning: diffDays > 180 ? `You are ${diffDays} days away. SkillBridge participation is restricted to the final 180 days of service.` : null },
      { text: "Locate an approved SkillBridge Industry Partner on the official DoD Directory", done: false },
      { text: `Contact local installation transition office (${sbOffice || 'not specified'})`, done: sbOffice !== '' },
      { text: "Complete mandatory pre-separation TAP counseling", done: false },
      { text: "Submit Command Approval package to your commander", done: sbCmdApproved === 'Yes' }
    ];
    return tasks;
  }, [sbSepDate, sbCmdApproved, sbOffice]);

  // Funding Stack Recommendation
  const fundingRecommendation = useMemo(() => {
    const isAD = fsActiveDuty === 'Yes';
    const rating = parseInt(fsDisabilityRating, 10);
    const gib = parseInt(fsGiBillMonths, 10);

    if (isAD) {
      return {
        primary: "DoD SkillBridge",
        primaryDesc: "Since you are still on active duty, prioritize using DoD SkillBridge to gain civilian training and career placement during your final 180 days of service, paid for by the military.",
        secondary: "COOL (Credentialing Opportunities On-Line)",
        secondaryDesc: "Use branch-specific Credentialing Assistance to fund professional certification exams and prep courses at no personal cost while still on active status."
      };
    }

    if (rating >= 20) {
      return {
        primary: "VR&E Chapter 31 (Veteran Readiness & Employment)",
        primaryDesc: "With a service-connected rating of 20% or higher, VR&E is your most powerful tool. It provides full tuition, fees, books, supplies, laptop packages, and a monthly subsistence allowance, without draining your GI Bill entitlement if managed correctly.",
        secondary: "VET TEC 2.0 / Post-9/11 GI Bill",
        secondaryDesc: "Use VET TEC for quick high-tech bootcamps first, reserving your remaining Post-9/11 GI Bill months for standard degree programs later."
      };
    }

    if (gib > 0 && fsGoal === 'degree') {
      return {
        primary: "Post-9/11 GI Bill (Chapter 33)",
        primaryDesc: "Your best path is using your Post-9/11 GI Bill to fund your academic degree. It covers full public tuition/fees, a book stipend, and a monthly housing allowance.",
        secondary: "State-level Tuition Waivers",
        secondaryDesc: "Check state-specific benefits (like Texas Hazlewood or California College Fee Waiver) to supplement or preserve your GI Bill entitlement."
      };
    }

    return {
      primary: "VET TEC 2.0 (High-Tech Bootcamps)",
      primaryDesc: "If you seek coding, cloud, or cybersecurity training and have remaining GI Bill entitlement, VET TEC 2.0 is highly recommended. It pays for your bootcamp and housing allowance without consuming your GI Bill months.",
      secondary: "WIOA / State Workforce Training Grants",
      secondaryDesc: "Visit your local American Job Center (AJC) to apply for federally-funded training vouchers for certified career pathways."
    };
  }, [fsActiveDuty, fsDisabilityRating, fsGiBillMonths, fsGoal]);

  // Tech Tracks Data
  const techTracks = {
    cybersecurity: {
      title: "Cybersecurity & Information Security",
      jobs: "SOC Analyst, Cybersecurity Specialist, Penetration Tester, GRC Assessor",
      certs: "CompTIA Security+, CySA+, ISC2 CISSP (Advanced), Certified Ethical Hacker (CEH)",
      funding: "VET TEC 2.0 coding/security bootcamps; VR&E long-term services track for Cyber Security degrees; GI Bill certification reimbursement for exam vouchers.",
      associations: "ISACA, ISC2, Cloud Security Alliance (CSA), Women in CyberSecurity (WiCyS)"
    },
    cloud: {
      title: "Cloud Computing & Engineering",
      jobs: "Cloud Support Associate, SysOps Administrator, Cloud Architect, DevOps Engineer",
      certs: "AWS Certified Cloud Practitioner, AWS SysOps Administrator, Microsoft Azure Fundamentals (AZ-900), Azure Administrator (AZ-104)",
      funding: "AWS re/Start program (free training/hiring); VET TEC approved cloud academies; branch COOL funding for exam vouchers.",
      associations: "IEEE Computer Society, Association for Computing Machinery (ACM)"
    },
    software_dev: {
      title: "Software Engineering & Web Development",
      jobs: "Frontend Developer, Full-Stack Engineer, QA Automation Engineer, Application Developer",
      certs: "AWS Certified Developer, Certified Scrum Developer, Oracle Certified Java Associate",
      funding: "VET TEC 2.0 immersive coding bootcamps; VR&E vocational training track; custom state workforce development grants.",
      associations: "IEEE, ACM, local software engineer meetups"
    },
    project_mgmt: {
      title: "IT Project & Product Management",
      jobs: "IT Project Manager, Scrum Master, Product Owner, Program Manager",
      certs: "PMI Project Management Professional (PMP), Certified ScrumMaster (CSM), PMI Agile Certified Practitioner (PMI-ACP)",
      funding: "Onward to Opportunity (O2O) free certification training; GI Bill exam reimbursement; VR&E professional coaching support.",
      associations: "Project Management Institute (PMI), Scrum Alliance, Product Development and Management Association"
    }
  };

  const handleBenefitClick = (id) => {
    setExpandedBenefitId(expandedBenefitId === id ? null : id);
  };

  return (
    <motion.div 
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card"
    >
      <span className="doc-tag font-bold text-amber-500 uppercase tracking-wider">Master Directory</span>
      <h1 className="doc-title mt-1.5 mb-1.5 text-2xl font-black text-slate-100">
        Veterans Benefits, Rights & Opportunities Index
      </h1>
      <p className="doc-subtitle text-xs text-slate-400">
        Interactive reference taxonomy detailing potential benefits, access points, statutory authorities, and transition tools.
      </p>
      <div className="doc-divider mb-6 mt-4"></div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-500" />
        </div>
        <input 
          type="text" 
          placeholder="Search all benefits, authorities, qualifiers, and program guidelines..." 
          className="form-control w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-slate-200 text-xs focus:border-amber-500 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Sidebar Categories */}
        {!searchQuery && (
          <div className="lg:col-span-4 space-y-1">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-3">
              Categories
            </h4>
            <div className="max-h-[600px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {BENEFITS_CATEGORIES.map(cat => {
                const CatIcon = IconMap[cat.icon] || Info;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setExpandedBenefitId(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-all ${
                      isActive 
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold' 
                        : 'bg-transparent border border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                    }`}
                  >
                    <CatIcon size={14} className={isActive ? 'text-amber-500' : 'text-slate-500'} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Side: Category Benefit Cards & Interactive Tools */}
        <div className={searchQuery ? 'lg:col-span-12 space-y-4' : 'lg:col-span-8 space-y-4'}>
          {searchQuery && (
            <h3 className="text-xs font-semibold text-slate-300 mb-2">
              Search Results ({filteredBenefits.length} match{filteredBenefits.length === 1 ? '' : 'es'})
            </h3>
          )}

          {/* Render category-specific submodules if activeCategory is 'career_tech' and not in search mode */}
          {!searchQuery && activeCategory === 'career_tech' && (
            <div className="space-y-6 mb-6">
              {/* VET TEC 2.0 Checker */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
                <h4 className="text-xs font-bold text-amber-500 mb-3 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                  <Cpu size={14} />
                  VET TEC 2.0 Eligibility Checker
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Age</label>
                    <input 
                      type="number" 
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      placeholder="e.g. 35"
                      value={vetTecAge}
                      onChange={(e) => setVetTecAge(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Character of Service</label>
                    <select
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      value={vetTecDischarge}
                      onChange={(e) => setVetTecDischarge(e.target.value)}
                    >
                      <option value="Honorable">Honorable</option>
                      <option value="General">General Under Honorable Conditions</option>
                      <option value="Other">Other Than Honorable</option>
                      <option value="Dishonorable">Dishonorable</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Duty Status</label>
                    <select
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      value={vetTecStatus}
                      onChange={(e) => setVetTecStatus(e.target.value)}
                    >
                      <option value="Veteran">Veteran (Already Discharged)</option>
                      <option value="Transitioning">Transitioning (Discharging in &lt;180 days)</option>
                      <option value="Active">Active Duty (&gt;180 days remaining)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Service Duration (Months)</label>
                    <input 
                      type="number" 
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      placeholder="e.g. 36"
                      value={vetTecMonths}
                      onChange={(e) => setVetTecMonths(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info size={16} className={vetTecEligibility.status === 'eligible' ? 'text-emerald-400' : 'text-slate-400'} />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-200">{vetTecEligibility.text}</p>
                      {vetTecEligibility.status === 'eligible' && (
                        <div className="pt-2 border-t border-slate-800 mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                            <input 
                              type="checkbox" 
                              checked={vetTecOnline} 
                              onChange={(e) => setVetTecOnline(e.target.checked)} 
                            />
                            <span>Online-Only Course (Reduces MHA to national average)</span>
                          </label>
                          <p className="text-[11px] text-slate-400">
                            Estimated Monthly Housing Allowance (MHA): <span className="font-bold text-amber-500 font-mono">${vetTecEligibility.mhaEstimate}/mo</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SkillBridge & Command Approval Planner */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
                <h4 className="text-xs font-bold text-amber-500 mb-3 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                  <Calendar size={14} />
                  DoD SkillBridge & Command Approval Planner
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Service Branch</label>
                    <select
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      value={sbBranch}
                      onChange={(e) => setSbBranch(e.target.value)}
                    >
                      <option value="Army">Army</option>
                      <option value="Navy">Navy</option>
                      <option value="MarineCorps">Marine Corps</option>
                      <option value="AirForce">Air Force</option>
                      <option value="CoastGuard">Coast Guard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Separation/Retirement Date</label>
                    <input 
                      type="date" 
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      value={sbSepDate}
                      onChange={(e) => setSbSepDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Commander Verbal Approval?</label>
                    <select
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      value={sbCmdApproved}
                      onChange={(e) => setSbCmdApproved(e.target.value)}
                    >
                      <option value="No">No / Under Review</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Installation Transition Office Name</label>
                    <input 
                      type="text" 
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      placeholder="e.g. Fort Liberty Transition Office"
                      value={sbOffice}
                      onChange={(e) => setSbOffice(e.target.value)}
                    />
                  </div>
                </div>

                {sbSepDate ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-xs space-y-3">
                    <span className="font-bold text-slate-200 block">Command Request Action Plan:</span>
                    <ul className="space-y-2">
                      {skillBridgeTasks.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-400">
                          {t.done ? (
                            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 border border-slate-700 rounded mt-0.5 shrink-0" />
                          )}
                          <div className="space-y-0.5">
                            <span className={t.done ? 'text-slate-300 font-medium' : 'text-slate-400'}>{t.text}</span>
                            {t.warning && <span className="text-[10px] text-amber-500 block font-semibold">{t.warning}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic text-center py-2">
                    Select a separation date to generate your custom timeline and command request checklist.
                  </p>
                )}
              </div>

              {/* TAP Timeline Completion Tracker */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
                <h4 className="text-xs font-bold text-amber-500 mb-3 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                  <ClipboardList size={14} />
                  Transition Assistance Program (TAP) Completion Tracker
                </h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Preparation guidelines under 10 U.S.C. Chapter 58. Check completed milestones below to calculate your transition readiness:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {Object.entries({
                    preSeparation: "1. Pre-Separation Counseling (Mandatory: 365+ days prior)",
                    vaBriefing: "2. VA Benefits Briefings completed",
                    dolWorkshop: "3. DOL Employment Workshop completed",
                    capstone: "4. Capstone Validation signed by Commander",
                    bddClaim: "5. Benefits Delivery at Discharge (BDD) claim filed (180 to 90 days prior)"
                  }).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTapTimeline(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`text-left p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                        tapTimeline[key] 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium' 
                          : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <CheckCircle2 size={14} className={tapTimeline[key] ? 'text-emerald-400' : 'text-slate-600'} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Career Funding Stack Tool */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
                <h4 className="text-xs font-bold text-amber-500 mb-3 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                  <Layers size={14} />
                  Career Funding Stack Decision Tool
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Still on Active Duty?</label>
                    <select
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      value={fsActiveDuty}
                      onChange={(e) => setFsActiveDuty(e.target.value)}
                    >
                      <option value="No">No (Already Separated/Veteran)</option>
                      <option value="Yes">Yes (Transitioning/Active)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Disability Rating (%)</label>
                    <select
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      value={fsDisabilityRating}
                      onChange={(e) => setFsDisabilityRating(e.target.value)}
                    >
                      <option value="0">0% (None/Non-service connected)</option>
                      <option value="10">10%</option>
                      <option value="20">20% or higher</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">GI Bill Entitlement Remaining (Months)</label>
                    <input 
                      type="number" 
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      placeholder="e.g. 36"
                      value={fsGiBillMonths}
                      onChange={(e) => setFsGiBillMonths(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Educational Goal</label>
                    <select
                      className="form-control w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                      value={fsGoal}
                      onChange={(e) => setFsGoal(e.target.value)}
                    >
                      <option value="degree">Academic Degree (Bachelor's / Master's)</option>
                      <option value="bootcamp">High-Tech Coding/Cyber Bootcamp</option>
                      <option value="certification">Professional Certification/Licensure Exam</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs border-b border-slate-850 pb-2">
                    <span className="font-bold text-amber-500 uppercase tracking-wider text-[10px] block mb-1">Recommended Primary Funding:</span>
                    <span className="font-bold text-slate-200 block text-sm">{fundingRecommendation.primary}</span>
                    <p className="text-slate-400 mt-1 leading-relaxed">{fundingRecommendation.primaryDesc}</p>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Recommended Secondary Funding:</span>
                    <span className="font-bold text-slate-300 block">{fundingRecommendation.secondary}</span>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">{fundingRecommendation.secondaryDesc}</p>
                  </div>
                </div>
              </div>

              {/* Tech Career Pathways Advisor */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
                <h4 className="text-xs font-bold text-amber-500 mb-3 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                  <Compass size={14} />
                  Tech Career Pathways Advisor
                </h4>
                <div className="form-group mb-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Tech Track</label>
                  <select
                    className="form-control w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 text-xs focus:border-amber-500"
                    value={selectedTechTrack}
                    onChange={(e) => setSelectedTechTrack(e.target.value)}
                  >
                    <option value="cybersecurity">Cybersecurity & GRC</option>
                    <option value="cloud">Cloud Computing & DevOps</option>
                    <option value="software_dev">Software Development</option>
                    <option value="project_mgmt">IT Project Management</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-xs space-y-3">
                  <h5 className="font-bold text-slate-200 text-sm border-b border-slate-850 pb-1">
                    {techTracks[selectedTechTrack].title}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Careers:</span>
                      <p className="text-slate-300 mt-0.5">{techTracks[selectedTechTrack].jobs}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Key Certifications:</span>
                      <p className="text-slate-300 mt-0.5">{techTracks[selectedTechTrack].certs}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Approved Funding Strategy:</span>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">{techTracks[selectedTechTrack].funding}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Professional Networks & Societies:</span>
                    <p className="text-slate-400 mt-0.5 font-semibold text-amber-500/90">{techTracks[selectedTechTrack].associations}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefit Cards List */}
          <div className="space-y-4">
            {filteredBenefits.length > 0 ? (
              filteredBenefits.map(benefit => {
                const isExpanded = expandedBenefitId === benefit.id;
                return (
                  <div 
                    key={benefit.id}
                    className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all duration-300"
                  >
                    <div 
                      onClick={() => handleBenefitClick(benefit.id)}
                      className="flex justify-between items-start gap-4 cursor-pointer"
                    >
                      <div>
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                          {BENEFITS_CATEGORIES.find(c => c.id === benefit.categoryId)?.name || 'Benefit'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 mt-1">{benefit.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {benefit.provides}
                        </p>
                      </div>
                      <button className="text-slate-500 hover:text-slate-300 shrink-0 p-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-850 text-xs space-y-3 leading-relaxed">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Source Authority:</span>
                          <span className="text-slate-300 font-mono">{benefit.authority}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Who May Qualify:</span>
                          <p className="text-slate-300">{benefit.qualifies}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">What It Provides:</span>
                          <p className="text-slate-300">{benefit.provides}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Form or Portal:</span>
                            <p className="text-amber-500 font-semibold">{benefit.formOrPortal}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Needed:</span>
                            <p className="text-slate-300">{benefit.evidence}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deadlines / Timing:</span>
                            <p className="text-slate-300">{benefit.deadlines}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Common Denial Reason:</span>
                            <p className="text-red-400 font-semibold">{benefit.denialReason}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Best Next Action:</span>
                          <p className="text-slate-300 font-semibold text-emerald-400">{benefit.nextAction}</p>
                        </div>
                        {benefit.warning && (
                          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-500/90 text-[11px] leading-relaxed flex gap-2">
                            <Info size={14} className="shrink-0 mt-0.5" />
                            <p><strong>State/Local Variation Warning:</strong> {benefit.warning}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-8">
                No benefits matches found for your search query. Try searching for synonyms or general terms.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default VeteransBenefitsIndexView;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Calendar, Clipboard, Check, FileText, 
  ExternalLink, ShieldCheck, Award, Printer, Search, 
  Heart, Users, HelpCircle, GraduationCap, Briefcase, 
  Flame, MapPin, Tag, RefreshCw, Info, AlertTriangle, PhoneCall
} from 'lucide-react';

import { TAPS_BRANCHES, TAPS_TIMELINE_CHECKPOINTS, TAPS_MOC_CROSSWALK, TAPS_ITP_TEMPLATES } from '../data/taps-data.js';
import { TAP_ECOSYSTEM, TAPS_ECOSYSTEM, TAPS_MEMORIAL_ECOSYSTEM, ALL_RESOURCES } from '../data/tap-taps-index/index.js';
import { renderTemplate } from '../utils/templateRenderer.js';

function TapsModuleView({ reduceMotion }) {
  // Main Tab Navigation
  const [activeTab, setActiveTab] = useState('tap'); // 'tap' | 'taps' | 'memorial'
  
  // Questionnaire / Persona State
  const [personaFilter, setPersonaFilter] = useState(null);
  
  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Timeline Calculator State
  const [selectedBranch, setSelectedBranch] = useState('army');
  const [separationDate, setSeparationDate] = useState(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  });
  const [isRetirement, setIsRetirement] = useState(false);
  const [completedMilestones, setCompletedMilestones] = useState(() => {
    const saved = localStorage.getItem('taps_completed_milestones');
    if (saved) {
      try { return JSON.parse(saved); } catch { return {}; }
    }
    return {};
  });

  // CRS Checklist State
  const [completedCrs, setCompletedCrs] = useState(() => {
    const saved = localStorage.getItem('taps_completed_crs');
    if (saved) {
      try { return JSON.parse(saved); } catch { return {}; }
    }
    return {};
  });

  // MOC Crosswalk State
  const [selectedMocCategory, setSelectedMocCategory] = useState(TAPS_MOC_CROSSWALK[0].category);

  // Command Letter Memo State
  const [selectedTemplate, setSelectedTemplate] = useState(TAPS_ITP_TEMPLATES[0]);
  const [userName, setUserName] = useState('');
  const [rank, setRank] = useState('');
  const [unitName, setUnitName] = useState('');
  const [civilianEmployer, setCivilianEmployer] = useState('');
  const [civilianJob, setCivilianJob] = useState('');
  const [handOffName, setHandOffName] = useState('');
  const [handOffDate, setHandOffDate] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // TAPS Event Filters State
  const [eventFilters, setEventFilters] = useState({
    eventType: '',
    region: '',
    lossType: '',
    relationship: '',
    programType: ''
  });

  // Memorial Audio Mock State
  const [playingAudio, setPlayingAudio] = useState(false);

  // TAP Directory and Tool States
  const [activeDirectoryTab, setActiveDirectoryTab] = useState('national'); // 'national' | 'dol' | 'va' | 'sba'
  const [selectedCourseArea, setSelectedCourseArea] = useState('tap'); // 'tap' | 'yyrp' | 'esgr' | 'skillbridge'
  const [vreHasRating, setVreHasRating] = useState(null); // null | 'yes_20' | 'yes_10' | 'no'
  const [vreHasBarrier, setVreHasBarrier] = useState(null); // null | 'yes' | 'no'

  // Base constants
  const activeBranch = TAPS_BRANCHES[selectedBranch] || TAPS_BRANCHES.army;
  const today = new Date();

  // Personas mapping for the routing questionnaire
  const PERSONAS = [
    { id: 'transitioning', label: 'Transitioning Service Member', icon: Award, tab: 'tap', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-950/20' },
    { id: 'spouse-caregiver', label: 'Military Spouse or Caregiver', icon: Users, tab: 'tap', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20' },
    { id: 'survivor', label: 'Survivor / Grieving Loved One', icon: Heart, tab: 'taps', color: 'border-rose-500/30 text-rose-400 bg-rose-950/20' },
    { id: 'survivor-helper', label: 'Helping a Survivor', icon: HelpCircle, tab: 'taps', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' },
    { id: 'education-career', label: 'Seeking Education/Career Options', icon: GraduationCap, tab: 'tap', color: 'border-purple-500/30 text-purple-400 bg-purple-950/20' },
    { id: 'grief-casework', label: 'Needs Grief support or Casework', icon: FileText, tab: 'taps', color: 'border-amber-500/30 text-amber-400 bg-amber-950/20' },
    { id: 'memorial', label: 'Needs Funeral / Memorial Info', icon: Flame, tab: 'memorial', color: 'border-red-500/30 text-red-400 bg-red-950/20' }
  ];

  // Checklist items for Capstone & CRS Tracker under 10 U.S.C. 1142
  const CRS_CHECKLIST_ITEMS = [
    { id: 'dd2648', text: 'Initiate eForm DD-2648 on milConnect (Pre-Separation counseling form)', required: true }, // @cite 10 U.S.C. 1142
    { id: 'budget', text: 'Complete a viable 12-month post-transition budget outline', required: true }, // @cite 10 U.S.C. 1142
    { id: 'gap_analysis', text: 'Perform a detailed Career Gap Analysis or vocational assessment', required: true }, // @cite 10 U.S.C. 1142
    { id: 'resume', text: 'Construct a tailored civilian resume or verified employment portfolio', required: true }, // @cite 10 U.S.C. 1142
    { id: 'vagov', text: 'Register for a personal login on VA.gov and enroll in healthcare', required: true }, // @cite 10 U.S.C. 1142
    { id: 'tracks', text: 'Complete your chosen two-day TAP Track (Education, Vocational, SBA, etc.)', required: false }, // @cite 10 U.S.C. 1144
    { id: 'capstone', text: 'Conduct Capstone review with command transition counselor', required: true } // @cite 10 U.S.C. 1142
  ];

  const handleToggleMilestone = (id) => {
    const updated = { ...completedMilestones, [id]: !completedMilestones[id] };
    setCompletedMilestones(updated);
    localStorage.setItem('taps_completed_milestones', JSON.stringify(updated));
  };

  const handleToggleCrs = (id) => {
    const updated = { ...completedCrs, [id]: !completedCrs[id] };
    setCompletedCrs(updated);
    localStorage.setItem('taps_completed_crs', JSON.stringify(updated));
  };

  const getCalculatedDate = (daysRemaining) => {
    const sep = new Date(separationDate + 'T00:00:00');
    sep.setDate(sep.getDate() - daysRemaining);
    return sep;
  };

  const formatTargetDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCheckpointStatus = (daysRemaining) => {
    const targetDate = getCalculatedDate(daysRemaining);
    const msDiff = targetDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return { label: 'Past Target', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    } else if (daysDiff <= 30) {
      return { label: `Due in ${daysDiff} days`, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold' };
    } else {
      return { label: `Due in ${daysDiff} days`, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
  };

  const compileLetterText = () => {
    const calculatedStart = getCalculatedDate(180);
    const duration = Math.round((new Date(separationDate).getTime() - calculatedStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const variables = {
      userName: userName || '[SERVICE MEMBER NAME]',
      rank: rank || '[RANK]',
      unitName: unitName || '[MILITARY UNIT]',
      civilianEmployer: civilianEmployer || '[CIVILIAN COMPANY]',
      civilianJob: civilianJob || '[TARGET CIVILIAN JOB/ROLE]',
      serviceBranch: activeBranch.name,
      skillbridgeStart: formatTargetDate(calculatedStart),
      separationDate: formatTargetDate(new Date(separationDate + 'T00:00:00')),
      durationDays: duration.toString(),
      handOffName: handOffName || '[HANDOFF PERSONNEL]',
      handOffDate: handOffDate || '[HANDOFF DEADLINE]',
      date: today.toLocaleDateString()
    };
    return renderTemplate(selectedTemplate.template, variables);
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
          <title>${selectedTemplate.name}</title>
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

  // Handle routing questionnaire selection
  const handlePersonaSelect = (persona) => {
    setPersonaFilter(persona.id);
    setActiveTab(persona.tab);
  };

  const clearFilters = () => {
    setPersonaFilter(null);
    setSearchQuery('');
    setEventFilters({
      eventType: '',
      region: '',
      lossType: '',
      relationship: '',
      programType: ''
    });
  };

  // Perform search & persona filtering
  const filteredResources = ALL_RESOURCES.filter(resource => {
    // 1. Audience filter (Questionnaire)
    if (personaFilter) {
      if (!resource.audience.includes(personaFilter)) {
        return false;
      }
    }
    
    // 2. Search Query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = resource.name.toLowerCase().includes(q);
      const categoryMatch = resource.category.toLowerCase().includes(q);
      const providesMatch = resource.whatItProvides.toLowerCase().includes(q);
      
      return nameMatch || categoryMatch || providesMatch;
    }
    
    return true;
  });

  // Filter mock events based on eventFilters state
  const matchingEvents = TAPS_ECOSYSTEM.events.mockEvents.filter(evt => {
    if (eventFilters.eventType && evt.eventType !== eventFilters.eventType) return false;
    if (eventFilters.region && evt.region !== eventFilters.region) return false;
    if (eventFilters.lossType && evt.lossType !== eventFilters.lossType) return false;
    if (eventFilters.relationship && evt.relationship !== eventFilters.relationship) return false;
    if (eventFilters.programType && evt.programType !== eventFilters.programType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="doc-card text-slate-100 pb-6 mb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-md">
              <Compass size={24} />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">TAP / TAPS Transition & Support Guide</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Separate portals for military transition programs (TAP), tragedy assistance survivor services (TAPS), and ceremonial bugle resources (Taps).
              </p>
            </div>
          </div>
          {/* Quick Support Badge */}
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-350 self-start md:self-auto">
            <PhoneCall size={18} className="animate-pulse" />
            <div className="text-left">
              <span className="block text-[8px] font-bold uppercase tracking-wider text-rose-400">TAPS Survivor Helpline</span>
              <span className="text-xs font-mono font-bold">1-800-959-TAPS (8277)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Interactive Routing Questionnaire (Hero Banner) */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Users size={14} className="text-indigo-400" />
          <span>Interactive Router — Select Your Needs Profile</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {PERSONAS.map((p) => {
            const isSelected = personaFilter === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => handlePersonaSelect(p)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer select-none gap-2 hover:border-slate-600 hover:scale-[1.02] ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200 shadow-md shadow-indigo-500/5'
                    : 'bg-slate-950/30 border-slate-900 text-slate-400'
                }`}
              >
                <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : p.color}`}>
                  <Icon size={16} />
                </span>
                <span className="text-[10px] font-semibold leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Profile indicator & Clear filter */}
        {(personaFilter || searchQuery) && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 border border-slate-850 p-2.5 px-4 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
              <span className="text-slate-350">
                Active Filter Profile: <strong className="text-indigo-300">
                  {personaFilter ? PERSONAS.find(p => p.id === personaFilter)?.label : 'Search Keywords'}
                </strong>
                {searchQuery && <> | Keywords: <strong className="text-indigo-300">"{searchQuery}"</strong></>}
              </span>
            </div>
            <button 
              onClick={clearFilters} 
              className="text-[10px] font-bold text-rose-400 hover:text-rose-350 flex items-center gap-1 hover:underline bg-slate-900 border border-slate-800 p-1 px-2.5 rounded-lg"
            >
              <RefreshCw size={10} />
              <span>Clear Filter Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Resource Directory Search */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Search size={14} className="text-indigo-400" />
          <span>Search the Unified TAP / TAPS Ecosystem Index</span>
        </h2>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type search terms... (e.g. 'SkillBridge', 'casework', 'scholarship', 'funeral')"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 pl-11 text-xs text-slate-200 focus:border-slate-700 focus:outline-none placeholder-slate-600 focus:shadow-md focus:shadow-indigo-500/5"
          />
        </div>

        {/* Display filtered results if filtering or searching is active */}
        {(searchQuery || personaFilter) && (
          <div className="space-y-3 pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Filtered Results ({filteredResources.length} matches)</span>
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredResources.map((res) => (
                  <div key={res.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:border-slate-800 transition">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-950/20 border border-indigo-900/40 px-2 py-0.5 rounded">
                          {res.section}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">{res.sourceName}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-1.5">{res.name}</h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1">{res.whatItProvides}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
                      <div className="flex flex-wrap gap-1">
                        {res.audience.map(aud => (
                          <span key={aud} className="text-[7.5px] font-mono bg-slate-900 text-slate-500 border border-slate-850 px-1 rounded">
                            {aud}
                          </span>
                        ))}
                      </div>
                      <a
                        href={res.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                      >
                        <span>Official Site</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-950/20 border border-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-500 block">No matching resources found. Try adjusting filters or search queries.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Category Tabs */}
      <div className="tabs-header border-b border-slate-850 gap-2 mb-0">
        <button
          onClick={() => { setActiveTab('tap'); clearFilters(); }}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-2 ${
            activeTab === 'tap' 
              ? 'active border-b-2 border-indigo-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award size={16} className="text-indigo-400" />
          <span>1. TAP Ecosystem (Transition)</span>
        </button>
        <button
          onClick={() => { setActiveTab('taps'); clearFilters(); }}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-2 ${
            activeTab === 'taps' 
              ? 'active border-b-2 border-indigo-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart size={16} className="text-rose-400" />
          <span>2. TAPS Ecosystem (Survivors)</span>
        </button>
        <button
          onClick={() => { setActiveTab('memorial'); clearFilters(); }}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-2 ${
            activeTab === 'memorial' 
              ? 'active border-b-2 border-indigo-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame size={16} className="text-amber-500" />
          <span>3. Ceremonial Taps & Funeral Honors</span>
        </button>
      </div>

      {/* TAB 1: TAP Ecosystem */}
      {activeTab === 'tap' && (
        <div className="space-y-6">
          {/* Top segment: Branch details & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Interactive Timeline Calculator (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Branch Selector */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Choose Service Branch</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.values(TAPS_BRANCHES).map((branch) => {
                    const isSelected = selectedBranch === branch.id;
                    return (
                      <button
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch.id)}
                        className={`py-2 px-3 rounded-lg border text-center transition text-xs font-semibold select-none cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-800 text-slate-100 border-slate-600'
                            : 'bg-slate-950/20 border-slate-900 hover:border-slate-700/60 text-slate-400'
                        }`}
                        style={isSelected ? { borderLeft: `3px solid ${branch.colorTheme.secondary}` } : {}}
                      >
                        {branch.name}
                      </button>
                    );
                  })}
                </div>

                <div className="doc-divider"></div>

                <div className="space-y-5">
                  <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400" />
                    <span>TAP Timeline Planner (10 U.S.C. § 1142)</span>
                  </h2>

                  {/* Date Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Expected Separation Date</label>
                      <input 
                        type="date" 
                        value={separationDate} 
                        onChange={(e) => setSeparationDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:border-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5 sm:pt-6">
                      <input
                        type="checkbox"
                        id="retirement-toggle"
                        checked={isRetirement}
                        onChange={(e) => setIsRetirement(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="retirement-toggle" className="text-xs text-slate-350 select-none cursor-pointer">
                        Separating due to 20+ Year Retirement (24mo window)
                      </label>
                    </div>
                  </div>

                  {/* Checklist Timeline */}
                  <div className="space-y-4 relative pl-4 border-l border-slate-800 mt-2">
                    {TAPS_TIMELINE_CHECKPOINTS
                      .filter(cp => isRetirement || cp.daysRemaining <= 365)
                      .map((cp) => {
                        const targetDate = getCalculatedDate(cp.daysRemaining);
                        const isChecked = !!completedMilestones[cp.daysRemaining];
                        const status = getCheckpointStatus(cp.daysRemaining);
                        
                        return (
                          <div key={cp.daysRemaining} className="relative pb-6 last:pb-0">
                            {/* Timeline dot */}
                            <span className={`absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition ${
                              isChecked 
                                ? 'bg-indigo-500 border-slate-900' 
                                : 'bg-slate-900 border-slate-700'
                            }`}>
                              {isChecked && <Check size={8} className="text-white mx-auto block mt-0.5" />}
                            </span>

                            <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-2 hover:border-slate-800 transition">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                                <h3 className="text-xs font-bold text-slate-200">{cp.title}</h3>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] px-2 py-0.5 border rounded font-semibold ${status.color}`}>
                                    {status.label}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    Target: {formatTargetDate(targetDate)}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-[10px] text-slate-400 leading-relaxed">{cp.description}</p>

                              {/* Checklist actions */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                {cp.requirements.map((req, rIdx) => (
                                  <div key={rIdx} className="flex items-center gap-1.5 text-[9px] text-slate-350">
                                    <ShieldCheck size={12} className="text-indigo-400 flex-shrink-0" />
                                    <span>{req}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-end pt-1.5 border-t border-slate-900/60 mt-1">
                                <button
                                  onClick={() => handleToggleMilestone(cp.daysRemaining)}
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded transition cursor-pointer ${
                                    isChecked 
                                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                  }`}
                                >
                                  {isChecked ? '✓ Milestone Completed' : 'Mark as Completed'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Branch Info & CRS Checklist (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Branch Details */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Award size={16} className="text-indigo-400" />
                  <span>{activeBranch.program}</span>
                </h2>
                <div className="text-[10px] text-slate-400 space-y-2 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Support Hotline</span>
                    <span className="text-slate-200 font-mono font-bold">{activeBranch.supportPhone}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Official Portal</span>
                    <a 
                      href={activeBranch.portalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Go to Portal</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Official Resources</span>
                  {activeBranch.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-950/30 border border-slate-900 rounded-lg p-2.5 flex items-center justify-between text-[10px] hover:border-slate-700 transition"
                    >
                      <span className="text-slate-300 font-medium">{res.name}</span>
                      <ExternalLink size={12} className="text-slate-500" />
                    </a>
                  ))}
                </div>
              </div>

              {/* CRS & Capstone Checklist Tracker */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-indigo-400" />
                  <span>Capstone & CRS Tracker</span>
                </h2>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Commanders require verification of Career Readiness Standards (CRS) to sign off your separation eForm DD-2648. Track your deliverables:
                </p>
                <div className="space-y-2 bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                  {CRS_CHECKLIST_ITEMS.map((item) => {
                    const isChecked = !!completedCrs[item.id];
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-start gap-2.5 text-[10px] leading-relaxed text-slate-300 cursor-pointer select-none"
                        onClick={() => handleToggleCrs(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="rounded border-slate-800 bg-slate-900 text-indigo-500 focus:ring-0 mt-0.5 cursor-pointer"
                        />
                        <span className={isChecked ? 'line-through text-slate-500' : ''}>
                          {item.text} {item.required && <span className="text-rose-400 font-bold">*</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1 text-[8.5px] text-slate-500">
                  <span className="text-rose-400 font-bold">*</span>
                  <span>Indicates statutory mandatory requirement.</span>
                </div>
              </div>

              {/* MOC Crosswalk Helper */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Compass size={16} className="text-indigo-400" />
                  <span>MOC Resume Crosswalk</span>
                </h2>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Select your military field to copy high-impact resume keyword translations:
                </p>

                <div className="grid grid-cols-2 gap-1.5">
                  {TAPS_MOC_CROSSWALK.map((moc) => (
                    <button
                      key={moc.category}
                      onClick={() => setSelectedMocCategory(moc.category)}
                      className={`p-2 rounded-lg text-center border text-[9px] font-semibold transition truncate cursor-pointer ${
                        selectedMocCategory === moc.category
                          ? 'bg-indigo-500/5 border-indigo-800 text-indigo-450'
                          : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      {moc.category.split('&')[0].trim()}
                    </button>
                  ))}
                </div>

                {TAPS_MOC_CROSSWALK.filter(m => m.category === selectedMocCategory).map((moc) => (
                  <div key={moc.category} className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px]">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase">Branches & Codes</span>
                      <div className="text-slate-350 mt-0.5 leading-snug">{moc.branches.join(' | ')}</div>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase">Civilian Equivalents</span>
                      <div className="text-slate-200 font-bold mt-0.5">{moc.civilianEquivalent}</div>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase mb-1">High-Impact Resumes Keywords</span>
                      <div className="space-y-1 font-mono text-[9px]">
                        {moc.keywords.map((kw, kwIdx) => (
                          <div 
                            key={kwIdx}
                            onClick={() => {
                              navigator.clipboard.writeText(kw);
                              alert('Keyword copied to clipboard!');
                            }}
                            className="p-1.5 bg-slate-900 border border-slate-850 rounded hover:border-slate-700 cursor-pointer text-slate-400 hover:text-slate-200"
                          >
                            • {kw}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* New Section: TAP Directories Explorer */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Compass size={18} className="text-indigo-400" />
                  <span>TAP Resources Directories</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Explore the statutory national, employment, benefits, and entrepreneurship databases within the TAP ecosystem.</p>
              </div>
              
              {/* Directory inner tabs */}
              <div className="flex bg-slate-950/40 p-1 border border-slate-850 rounded-lg text-[10px] self-start sm:self-auto">
                <button
                  onClick={() => setActiveDirectoryTab('national')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer font-semibold ${activeDirectoryTab === 'national' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  DoD National
                </button>
                <button
                  onClick={() => setActiveDirectoryTab('dol')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer font-semibold ${activeDirectoryTab === 'dol' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  DOL Employment
                </button>
                <button
                  onClick={() => setActiveDirectoryTab('va')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer font-semibold ${activeDirectoryTab === 'va' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  VA Benefits
                </button>
                <button
                  onClick={() => setActiveDirectoryTab('sba')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer font-semibold ${activeDirectoryTab === 'sba' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'}`}
                >
                  SBA Business
                </button>
              </div>
            </div>

            {/* List directory items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[300px] overflow-y-auto pr-1 pt-1">
              {(TAP_ECOSYSTEM[activeDirectoryTab] || []).filter(item => !personaFilter || item.audience.includes(personaFilter)).length > 0 ? (
                (TAP_ECOSYSTEM[activeDirectoryTab] || []).filter(item => !personaFilter || item.audience.includes(personaFilter)).map((item) => (
                  <div key={item.id} className="bg-slate-950/30 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between gap-3 hover:border-slate-800 transition">
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-1.5">
                        <h3 className="text-xs font-bold text-slate-200">{item.name}</h3>
                        <span className="text-[7.5px] font-semibold text-slate-500 uppercase tracking-wider">{item.category || activeDirectoryTab}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal mt-2">{item.whatItProvides}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900/60">
                      <div className="flex gap-1">
                        {item.audience.map(aud => (
                          <span key={aud} className="text-[7.5px] font-mono bg-slate-900 text-slate-500 border border-slate-850 px-1 rounded">
                            {aud}
                          </span>
                        ))}
                      </div>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <span>Official Page</span>
                        <ExternalLink size={9} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-6 text-center bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">No directory items match your active profile filter. Try resetting filters.</span>
                </div>
              )}
            </div>
          </div>

          {/* New Segment: Interactive Course Finder & VR&E Diagnostic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: TAP Course Finder Shortcut */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Compass size={18} className="text-indigo-400" />
                <span>TAP Course Finder Shortcut</span>
              </h2>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Shortcut filters to locate and read specific transition course information:
              </p>

              {/* Course selector tabs */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'tap', name: 'TAP Courses', use: 'Core Curriculum', desc: 'Mandatory transition tracks covering DoD Transition Day, VA Benefits and Services, and DOL employment workshops.', url: 'https://tapevents.mil/courses' },
                  { id: 'yyrp', name: 'YRRP Courses', use: 'Yellow Ribbon Reintegration', desc: 'Yellow Ribbon Reintegration Program events designed to support National Guard and Reserve members and their families.', url: 'https://tapevents.mil/courses' },
                  { id: 'esgr', name: 'ESGR Courses', use: 'Employer Support of Guard/Reserve', desc: 'Employer Support of the Guard and Reserve resources. Advises Guard/Reserve members and civilian employers on employment rights.', url: 'https://tapevents.mil/courses' },
                  { id: 'skillbridge', name: 'SkillBridge Courses', use: 'SkillBridge/CSP Program Info', desc: 'SkillBridge-specific course/training details and application guidelines for active-duty transition pathways.', url: 'https://tapevents.mil/courses' }
                ].map((value) => {
                  const isSelected = selectedCourseArea === value.id;
                  return (
                    <button
                      key={value.id}
                      onClick={() => setSelectedCourseArea(value.id)}
                      className={`p-2 rounded-lg border text-center text-[9px] font-bold transition truncate cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/5 border-indigo-800 text-indigo-400'
                          : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      {value.name}
                    </button>
                  );
                })}
              </div>

              {/* Course detail card */}
              {(() => {
                const list = [
                  { id: 'tap', name: 'TAP Courses', use: 'Core Curriculum', desc: 'Mandatory transition tracks covering DoD Transition Day, VA Benefits and Services, and DOL employment workshops.', url: 'https://tapevents.mil/courses' },
                  { id: 'yyrp', name: 'YRRP Courses', use: 'Yellow Ribbon Reintegration', desc: 'Yellow Ribbon Reintegration Program events designed to support National Guard and Reserve members and their families.', url: 'https://tapevents.mil/courses' },
                  { id: 'esgr', name: 'ESGR Courses', use: 'Employer Support of Guard/Reserve', desc: 'Employer Support of the Guard and Reserve resources. Advises Guard/Reserve members and civilian employers on employment rights.', url: 'https://tapevents.mil/courses' },
                  { id: 'skillbridge', name: 'SkillBridge Courses', use: 'SkillBridge/CSP Program Info', desc: 'SkillBridge-specific course/training details and application guidelines for active-duty transition pathways.', url: 'https://tapevents.mil/courses' }
                ];
                const area = list.find(l => l.id === selectedCourseArea) || list[0];
                return (
                  <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px] space-y-2.5">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase">Usage</span>
                      <div className="text-slate-200 font-bold mt-0.5">{area.use}</div>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase">Description</span>
                      <div className="text-slate-355 mt-0.5 leading-relaxed">{area.desc}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-900 flex justify-end">
                      <a
                        href={area.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                      >
                        <span>Schedule on TAPevents.mil</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Box: TAP-to-VR&E Bridge Diagnostic */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-400" />
                <span>TAP-to-VR&E Bridge Diagnostic</span>
              </h2>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Answer these diagnostic questions to check eligibility for Chapter 31 VR&E services:
              </p>

              <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px]">
                {/* Q1 */}
                <div className="space-y-1.5">
                  <span className="text-slate-300 block">1. Do you have (or expect to receive) a VA service-connected disability rating?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVreHasRating('yes_20')}
                      className={`px-3 py-1 rounded border text-[9px] font-bold cursor-pointer transition ${vreHasRating === 'yes_20' ? 'bg-indigo-600 border-indigo-650 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      Yes, 20% or more
                    </button>
                    <button
                      onClick={() => setVreHasRating('yes_10')}
                      className={`px-3 py-1 rounded border text-[9px] font-bold cursor-pointer transition ${vreHasRating === 'yes_10' ? 'bg-indigo-600 border-indigo-650 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      Yes, 10%
                    </button>
                    <button
                      onClick={() => { setVreHasRating('no'); setVreHasBarrier(null); }}
                      className={`px-3 py-1 rounded border text-[9px] font-bold cursor-pointer transition ${vreHasRating === 'no' ? 'bg-indigo-600 border-indigo-650 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Q2 */}
                {vreHasRating && vreHasRating !== 'no' && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
                    <span className="text-slate-300 block">2. Does this service-connected condition make it hard to get or keep a job?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVreHasBarrier('yes')}
                        className={`px-3 py-1 rounded border text-[9px] font-bold cursor-pointer transition ${vreHasBarrier === 'yes' ? 'bg-indigo-600 border-indigo-650 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setVreHasBarrier('no')}
                        className={`px-3 py-1 rounded border text-[9px] font-bold cursor-pointer transition ${vreHasBarrier === 'no' ? 'bg-indigo-600 border-indigo-650 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {/* Diagnostic Advice Output */}
                {(() => {
                  let advice = null;
                  if (vreHasRating === 'no') {
                    // @cite 38 U.S.C. 3102
                    advice = {
                      type: 'ineligible',
                      text: 'VA VR&E (Chapter 31) requires a service-connected disability rating of 10% or higher. Since you do not have or expect a rating, consider utilizing the Post-9/11 GI Bill or other standard educational tracks.',
                      actionLabel: 'Explore GI Bill Options',
                      actionUrl: 'https://www.va.gov/education/'
                    };
                  } else if (vreHasRating && vreHasBarrier === 'no') {
                    // @cite 38 U.S.C. 3102
                    advice = {
                      type: 'conditional',
                      text: 'You have a qualifying disability rating, but VR&E requires an "employment barrier" to qualify. If your service-connected conditions limit your ability to find or keep a job in your trained field, you should document this barrier and apply.',
                      actionLabel: 'Apply on VA.gov',
                      actionUrl: 'https://www.va.gov/careers-employment/vocational-rehabilitation/how-to-apply/'
                    };
                  } else if ((vreHasRating === 'yes_20' || vreHasRating === 'yes_10') && vreHasBarrier === 'yes') {
                    const seriousness = vreHasRating === 'yes_10' ? 'serious employment handicap' : 'employment handicap';
                    // @cite 38 U.S.C. 3102
                    advice = {
                      type: 'eligible',
                      text: `You meet the primary criteria for Chapter 31. Your rating and employment barrier indicate a qualifying ${seriousness}. You should apply early during your transition window (up to 12 months before separation) or as soon as your rating is issued.`,
                      actionLabel: 'Apply on VA.gov',
                      actionUrl: 'https://www.va.gov/careers-employment/vocational-rehabilitation/how-to-apply/'
                    };
                  }

                  if (!advice) return null;
                  return (
                    <div className={`mt-3 p-3 rounded-lg border text-[9px] leading-relaxed space-y-2 ${
                      advice.type === 'eligible' 
                        ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-350'
                        : advice.type === 'conditional'
                          ? 'bg-amber-950/10 border-amber-900/30 text-amber-350'
                          : 'bg-rose-950/10 border-rose-900/30 text-rose-350'
                    }`}>
                      <p>{advice.text}</p>
                      <div className="flex justify-end pt-1">
                        <a
                          href={advice.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9.5px] font-bold underline flex items-center gap-1.5"
                        >
                          <span>{advice.actionLabel}</span>
                          <ExternalLink size={9.5} />
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>

          {/* TAP Opportunity Cards segment */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <GraduationCap size={18} className="text-indigo-400" />
              <span>TAP Transition Opportunities Index</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TAP_ECOSYSTEM.opportunities.map((opp) => (
                <div key={opp.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-850 transition">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[8px] font-semibold text-indigo-400 bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-900/40">
                        {opp.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 mt-2">{opp.name}</h3>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1">{opp.whatItProvides}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900">
                    <span className="text-[8px] font-mono text-slate-500">
                      Audience: {opp.audience.join(', ')}
                    </span>
                    <a
                      href={opp.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Program Link</span>
                      <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Memo Generator Segment */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" />
              <span>DoD SkillBridge & Terminal Leave Command Memo Builders</span>
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Draft and compile print-ready commander rationale memos. Completing these details helps justify command authorization.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-5 space-y-4">
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {TAPS_ITP_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer select-none ${
                        selectedTemplate.id === tpl.id
                          ? 'bg-indigo-500/5 border-indigo-800 text-slate-100'
                          : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      {tpl.name.split(' ')[1]} Memo
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Service Member Name</label>
                    <input 
                      type="text" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)} 
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Military Rank</label>
                    <input 
                      type="text" 
                      value={rank} 
                      onChange={(e) => setRank(e.target.value)} 
                      placeholder="e.g. SGT / LT"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Unit Name</label>
                    <input 
                      type="text" 
                      value={unitName} 
                      onChange={(e) => setUnitName(e.target.value)} 
                      placeholder="e.g. 2nd Bn, 5th Marines"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Civilian Employer</label>
                    <input 
                      type="text" 
                      value={civilianEmployer} 
                      onChange={(e) => setCivilianEmployer(e.target.value)} 
                      placeholder="e.g. Amazon Web Services"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Target Civilian Job</label>
                    <input 
                      type="text" 
                      value={civilianJob} 
                      onChange={(e) => setCivilianJob(e.target.value)} 
                      placeholder="e.g. Cloud Engineer"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Handoff Personnel Name</label>
                    <input 
                      type="text" 
                      value={handOffName} 
                      onChange={(e) => setHandOffName(e.target.value)} 
                      placeholder="e.g. CPL Smith"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Handoff Date</label>
                    <input 
                      type="text" 
                      value={handOffDate} 
                      onChange={(e) => setHandOffDate(e.target.value)} 
                      placeholder="e.g. June 15, 2026"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Renders Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">{selectedTemplate.name}</h3>
                      <span className="text-[8px] text-slate-500 block">Completing Career Readiness Standards</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCopy} className="btn btn-sm btn-secondary flex items-center gap-1 h-7 text-[10px] cursor-pointer">
                        {copySuccess ? <Check size={12} className="text-emerald-400" /> : <Clipboard size={12} />}
                        <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button onClick={handlePrint} className="btn btn-sm btn-primary flex items-center gap-1 h-7 text-[10px] cursor-pointer">
                        <Printer size={12} />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 overflow-y-auto max-h-[220px]">
                    <pre className="text-[10px] text-slate-350 font-mono leading-relaxed whitespace-pre-wrap select-text">
                      {compileLetterText()}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAPS Ecosystem (Survivor Support) */}
      {activeTab === 'taps' && (
        <div className="space-y-6">
          {/* Top banner warning */}
          <div className="bg-rose-950/15 border border-rose-900/40 rounded-xl p-4 flex items-start gap-3">
            <span className="p-1 bg-rose-500/10 text-rose-400 rounded-lg">
              <Info size={18} />
            </span>
            <div className="text-xs text-rose-350 leading-relaxed">
              <strong>About TAPS:</strong> Tragedy Assistance Program for Survivors is a national nonprofit organization (independent from federal agencies) providing grief care, casework support, and seminars free of charge to anyone grieving the loss of a military service member or veteran.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: TAPS Services & Resources (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* TAPS Core Services Index */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Heart size={16} className="text-rose-450" />
                  <span>TAPS Support Directory</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {TAPS_ECOSYSTEM.survivorResources.map((svc) => (
                    <div key={svc.id} className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 hover:border-slate-800 transition flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2">
                          <h3 className="text-xs font-bold text-slate-200">{svc.name}</h3>
                          <span className="text-[8px] font-mono text-slate-500 uppercase">{svc.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal mt-2">{svc.whatItProvides}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900/60">
                        <div className="flex gap-1">
                          {svc.audience.map(aud => (
                            <span key={aud} className="text-[7.5px] font-mono bg-slate-900 text-slate-500 border border-slate-850 px-1 rounded">
                              {aud}
                            </span>
                          ))}
                        </div>
                        <a
                          href={svc.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <span>Access Portal</span>
                          <ExternalLink size={9} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TAPS Programs Index */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Users size={16} className="text-rose-450" />
                  <span>Survivor Programs & Camps</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {TAPS_ECOSYSTEM.programs.map((prog) => (
                    <div key={prog.id} className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 hover:border-slate-850 transition flex flex-col justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-200 border-b border-slate-900 pb-2">{prog.name}</h3>
                        <p className="text-[10px] text-slate-400 leading-normal mt-2">{prog.whatItProvides}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900/60">
                        <span className="text-[8px] font-mono text-slate-500">Audience: {prog.audience.join(', ')}</span>
                        <a
                          href={prog.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <span>Learn More</span>
                          <ExternalLink size={9} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Events Filter Tool & Partners (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* TAPS Events Filter Widget */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Calendar size={16} className="text-rose-450" />
                  <span>Interactive Events Filter</span>
                </h2>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Filter simulated mock TAPS seminars, camps, and webinars to find resources matching your profile:
                </p>

                {/* Filter dropdowns */}
                <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-xs">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase mb-1">Event Type</label>
                    <select
                      value={eventFilters.eventType}
                      onChange={(e) => setEventFilters(prev => ({ ...prev, eventType: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                    >
                      <option value="">-- All Event Types --</option>
                      {TAPS_ECOSYSTEM.events.filters.eventType.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase mb-1">Loss Type</label>
                    <select
                      value={eventFilters.lossType}
                      onChange={(e) => setEventFilters(prev => ({ ...prev, lossType: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                    >
                      <option value="">-- All Loss Types --</option>
                      {TAPS_ECOSYSTEM.events.filters.lossType.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase mb-1">Relationship</label>
                    <select
                      value={eventFilters.relationship}
                      onChange={(e) => setEventFilters(prev => ({ ...prev, relationship: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                    >
                      <option value="">-- All Relationships --</option>
                      {TAPS_ECOSYSTEM.events.filters.relationship.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase mb-1">Region</label>
                    <select
                      value={eventFilters.region}
                      onChange={(e) => setEventFilters(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none"
                    >
                      <option value="">-- All Regions --</option>
                      {TAPS_ECOSYSTEM.events.filters.region.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Filter Output */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Matching Events ({matchingEvents.length})</span>
                  {matchingEvents.length > 0 ? (
                    matchingEvents.map(evt => (
                      <div key={evt.id} className="bg-slate-950/50 border border-slate-900 rounded-xl p-3 text-[10px] space-y-1.5">
                        <div className="flex items-center justify-between gap-1 font-bold text-slate-200">
                          <span>{evt.name}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed">{evt.description}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900/60 pt-1.5 text-[8px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <MapPin size={9} />
                            {evt.location} ({evt.region})
                          </span>
                          <span className="font-mono">{evt.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center bg-slate-950/20 border border-slate-900 rounded-xl text-[9px] text-slate-500">
                      No matching events found. Try widening filters.
                    </div>
                  )}
                </div>
              </div>

              {/* TAPS Partners, Sponsors, and Volunteer Info */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Award size={16} className="text-rose-455" />
                  <span>Sponsors & Engagement</span>
                </h2>
                
                {/* Volunteer pathways */}
                <div className="space-y-2.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Volunteer Channels</span>
                  {TAPS_ECOSYSTEM.volunteer.slice(0, 3).map((v) => (
                    <div key={v.id} className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5 text-[9px] leading-relaxed">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1 font-bold text-slate-200">
                        <span>{v.name}</span>
                        <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400"><ExternalLink size={9} /></a>
                      </div>
                      <p className="text-slate-400 mt-1">{v.whatItProvides}</p>
                    </div>
                  ))}
                </div>

                {/* Partners info */}
                <div className="space-y-2.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Strategic Sponsors</span>
                  {TAPS_ECOSYSTEM.partners.slice(0, 2).map((p) => (
                    <div key={p.id} className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5 text-[9px] leading-relaxed">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1 font-bold text-slate-200">
                        <span>{p.name}</span>
                        <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400"><ExternalLink size={9} /></a>
                      </div>
                      <p className="text-slate-400 mt-1">{p.whatItProvides}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TAPS Legislative Advocacy */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-rose-455" />
                  <span>Advocacy & VA Affiliation</span>
                </h2>
                <div className="space-y-2 bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-[9px] leading-relaxed">
                  {TAPS_ECOSYSTEM.advocacy.map((adv) => (
                    <div key={adv.id} className="border-b border-slate-900 last:border-b-0 pb-2 last:pb-0 mb-2 last:mb-0">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{adv.name}</span>
                        <a href={adv.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400"><ExternalLink size={8} /></a>
                      </div>
                      <p className="text-slate-400 mt-1 leading-normal">{adv.whatItProvides}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Ceremonial Taps & Memorials */}
      {activeTab === 'memorial' && (
        <div className="space-y-6">
          {/* Visual Warning to distinguish from transition/survivor programs */}
          <div className="bg-amber-950/15 border border-amber-900/40 rounded-xl p-4 flex items-start gap-3">
            <span className="p-1 bg-amber-500/10 text-amber-400 rounded-lg">
              <AlertTriangle size={18} />
            </span>
            <div className="text-xs text-amber-350 leading-relaxed">
              <strong>Notice:</strong> This section contains historical, ceremonial, and burial resources regarding the 24-note military bugle call "Taps". This is distinct from transition counseling programs (DoD TAP) or survivor grief groups (TAPS).
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left column: Historical and Ceremonial details (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-6">
              
              {/* Bugle Call "Taps" history */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Flame size={16} className="text-amber-550" />
                    <span>Ceremonial Music: History of "Taps"</span>
                  </h3>
                  <a 
                    href={TAPS_MEMORIAL_ECOSYSTEM[0].sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-indigo-400 flex items-center gap-1"
                  >
                    <span>Taps Bugler Hub</span>
                    <ExternalLink size={9} />
                  </a>
                </div>
                <p className="text-xs text-slate-350 leading-relaxed">
                  {TAPS_MEMORIAL_ECOSYSTEM[0].whatItProvides}
                </p>

                {/* Interactive Audio Player Simulation */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="text-left text-xs">
                    <span className="block font-bold text-slate-200">Official 24-Note Ceremonial Taps</span>
                    <span className="text-[10px] text-slate-500 font-mono">Standard Military Version (0:52)</span>
                  </div>
                  <button 
                    onClick={() => {
                      setPlayingAudio(!playingAudio);
                      if (!playingAudio) {
                        alert("Mock audio: Playing Taps bugle call standard rendering.");
                      }
                    }}
                    className={`p-2 px-4 rounded-lg font-bold text-[10px] cursor-pointer transition select-none ${
                      playingAudio 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {playingAudio ? '■ Stop Audio' : '▶ Play Mock Audio'}
                  </button>
                </div>
              </div>

              {/* Taps Across America */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Users size={16} className="text-amber-550" />
                    <span>Taps Across America Initiative</span>
                  </h3>
                  <a 
                    href={TAPS_MEMORIAL_ECOSYSTEM[1].sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-indigo-400 flex items-center gap-1"
                  >
                    <span>Register / Participate</span>
                    <ExternalLink size={9} />
                  </a>
                </div>
                <p className="text-xs text-slate-355 leading-relaxed">
                  {TAPS_MEMORIAL_ECOSYSTEM[1].whatItProvides}
                </p>
              </div>

              {/* Military Funeral Honors Coordination */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Clipboard size={16} className="text-amber-550" />
                    <span>Military Funeral Honors Coordination Guide</span>
                  </h3>
                  <a 
                    href={TAPS_MEMORIAL_ECOSYSTEM[2].sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-indigo-400 flex items-center gap-1"
                  >
                    <span>Military OneSource Directory</span>
                    <ExternalLink size={9} />
                  </a>
                </div>
                <p className="text-xs text-slate-355 leading-relaxed">
                  {TAPS_MEMORIAL_ECOSYSTEM[2].whatItProvides}
                </p>
              </div>

            </div>

            {/* Right column: Funeral Packets and Burial Benefits (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileText size={16} className="text-amber-550" />
                <span>Burial & Memorial Packets</span>
              </h2>
              <p className="text-[10px] text-slate-400 leading-normal">
                Transitioning families and survivors are entitled to burial support. Review statutory federal benefits:
              </p>

              <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px]">
                <div className="border-b border-slate-900 pb-2">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Burial Flags</span>
                    <a 
                      href={TAPS_MEMORIAL_ECOSYSTEM[3].sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-400"
                    >
                      <ExternalLink size={9} />
                    </a>
                  </div>
                  <p className="text-slate-400 mt-1 leading-normal">
                    VA provides a United States flag to drape the casket or accompany the urn of a deceased veteran who served honorably.
                  </p>
                </div>

                <div className="border-b border-slate-900 pb-2">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Government Headstones & Markers</span>
                    <a 
                      href={TAPS_MEMORIAL_ECOSYSTEM[3].sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-400"
                    >
                      <ExternalLink size={9} />
                    </a>
                  </div>
                  <p className="text-slate-400 mt-1 leading-normal">
                    VA headstones, flat bronze/granite/marble markers, and wall medallions are provided free of charge for eligible graves worldwide.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Presidential Memorial Certificates</span>
                    <a 
                      href={TAPS_MEMORIAL_ECOSYSTEM[3].sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-400"
                    >
                      <ExternalLink size={9} />
                    </a>
                  </div>
                  <p className="text-slate-400 mt-1 leading-normal">
                    An engraved paper certificate signed by the current President to honor the memory of honorably discharged deceased veterans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TapsModuleView;

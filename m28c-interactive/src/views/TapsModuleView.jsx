import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, Calendar, ChevronRight, Clipboard, Check, FileText, 
  Phone, ExternalLink, ShieldCheck, Award, Info, AlertTriangle, Printer
} from 'lucide-react';
import { TAPS_BRANCHES, TAPS_TIMELINE_CHECKPOINTS, TAPS_MOC_CROSSWALK, TAPS_ITP_TEMPLATES } from '../data/taps-data.js';
import { renderTemplate } from '../utils/templateRenderer.js';

function TapsModuleView({ reduceMotion }) {
  const [selectedBranch, setSelectedBranch] = useState('army');
  const [separationDate, setSeparationDate] = useState(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  });
  const [isRetirement, setIsRetirement] = useState(false);
  const [completedMilestones, setCompletedMilestones] = useState({});
  const [selectedMocCategory, setSelectedMocCategory] = useState(TAPS_MOC_CROSSWALK[0].category);
  const [selectedTemplate, setSelectedTemplate] = useState(TAPS_ITP_TEMPLATES[0]);
  
  // Custom Letter Form Fields
  const [userName, setUserName] = useState('');
  const [rank, setRank] = useState('');
  const [unitName, setUnitName] = useState('');
  const [civilianEmployer, setCivilianEmployer] = useState('');
  const [civilianJob, setCivilianJob] = useState('');
  const [handOffName, setHandOffName] = useState('');
  const [handOffDate, setHandOffDate] = useState('');
  
  const [copySuccess, setCopySuccess] = useState(false);

  const activeBranch = TAPS_BRANCHES[selectedBranch];
  const today = new Date();

  // Load completed milestones from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taps_completed_milestones');
    if (saved) {
      try {
        setCompletedMilestones(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleToggleMilestone = (id) => {
    const updated = { ...completedMilestones, [id]: !completedMilestones[id] };
    setCompletedMilestones(updated);
    localStorage.setItem('taps_completed_milestones', JSON.stringify(updated));
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

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      {/* Header section */}
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <Compass size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Military Transition Assistance (TAP) Guide</h1>
          <p className="text-[11px] text-slate-400">Map branch-specific checkpoints, calculate SkillBridge eligibility windows, and translate MOC skills to civilian careers.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* Branch Tabs Selector */}
      <div className="mb-6">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Select Service Branch</span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.values(TAPS_BRANCHES).map((branch) => {
            const isSelected = selectedBranch === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`py-2 px-3 rounded-lg border text-center transition text-xs font-semibold select-none ${
                  isSelected 
                    ? 'bg-slate-800 text-slate-100 border-slate-600'
                    : 'bg-slate-950/20 border-slate-850 hover:border-slate-700/60 text-slate-400'
                }`}
                style={isSelected ? { borderLeft: `3px solid ${branch.colorTheme.secondary}` } : {}}
              >
                {branch.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout: Timeline + Interactive Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline Calculator (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-5">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-400" />
              <span>Separation Timeline Calculator</span>
            </h2>

            {/* Inputs block */}
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
                  className="rounded border-slate-800 bg-slate-900 text-indigo-500 focus:ring-0"
                />
                <label htmlFor="retirement-toggle" className="text-xs text-slate-350 select-none">
                  Separating due to 20+ Year Retirement
                </label>
              </div>
            </div>

            {/* Timeline display */}
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
                      <span className={`absolute -left-[22px] top-1.5 w-3.5 height-3.5 rounded-full border-2 transition ${
                        isChecked 
                          ? 'bg-indigo-500 border-slate-900' 
                          : 'bg-slate-900 border-slate-700'
                      }`}>
                        {isChecked && <Check size={8} className="text-white mx-auto block" />}
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

                        {/* List requirements */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {cp.requirements.map((req, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-1.5 text-[9px] text-slate-350">
                              <ShieldCheck size={12} className="text-indigo-400 flex-shrink-0" />
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>

                        {/* Complete action */}
                        <div className="flex justify-end pt-1.5 border-t border-slate-900/60 mt-1">
                          <button
                            onClick={() => handleToggleMilestone(cp.daysRemaining)}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded transition ${
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

        {/* Right Column: Resources & Builders (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Branch-specific Info Box */}
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

            {/* Guides and PDF links */}
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

          {/* MOC Skills Crosswalk Assistant */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Compass size={16} className="text-indigo-400" />
              <span>MOC Skills Crosswalk</span>
            </h2>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Select your occupational field to translate military roles into resume keywords.
            </p>

            {/* MOC selector buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {TAPS_MOC_CROSSWALK.map((moc) => (
                <button
                  key={moc.category}
                  onClick={() => setSelectedMocCategory(moc.category)}
                  className={`p-2 rounded-lg text-center border text-[9px] font-semibold transition truncate select-none ${
                    selectedMocCategory === moc.category
                      ? 'bg-indigo-500/5 border-indigo-800 text-indigo-400'
                      : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  {moc.category.split('&')[0].trim()}
                </button>
              ))}
            </div>

            {/* Category details */}
            {TAPS_MOC_CROSSWALK.filter(m => m.category === selectedMocCategory).map((moc) => (
              <div key={moc.category} className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px] leading-relaxed">
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Branch Examples</span>
                  <div className="text-slate-300 font-medium mt-0.5">{moc.branches.join(' | ')}</div>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Civilian Equivalents</span>
                  <div className="text-slate-200 font-bold mt-0.5">{moc.civilianEquivalent}</div>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Resume Keywords (Copyable)</span>
                  <div className="space-y-1 mt-1 font-mono text-[9px]">
                    {moc.keywords.map((kw, kwIdx) => (
                      <div 
                        key={kwIdx}
                        onClick={() => {
                          navigator.clipboard.writeText(kw);
                          alert('Keyword copied to clipboard!');
                        }}
                        className="p-1 bg-slate-900 border border-slate-850 rounded hover:border-slate-700 cursor-pointer text-slate-400 select-all hover:text-slate-200"
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

      {/* Segment 3: Custom Letter Builders */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 mt-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <FileText size={16} className="text-indigo-400" />
          <span>DoD SkillBridge & Terminal Leave Letter Builders</span>
        </h2>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Draft and compile print-ready command rationales. Completing these justifies command approval for internships up to 180 days before separation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {TAPS_ITP_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-2 rounded-lg border text-center text-xs font-semibold transition select-none ${
                    selectedTemplate.id === tpl.id
                      ? 'bg-indigo-500/5 border-indigo-800 text-slate-100'
                      : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  {tpl.name.split(' ')[1]} Template
                </button>
              ))}
            </div>

            {/* Inputs block */}
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
                  <button onClick={handleCopy} className="btn btn-sm btn-secondary flex items-center gap-1 h-7 text-[10px]">
                    {copySuccess ? <Check size={12} className="text-emerald-400" /> : <Clipboard size={12} />}
                    <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button onClick={handlePrint} className="btn btn-sm btn-primary flex items-center gap-1 h-7 text-[10px]">
                    <Printer size={12} />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Text Area Output */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 overflow-y-auto max-h-[220px]">
                <pre className="text-[10px] text-slate-350 font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {compileLetterText()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TapsModuleView;

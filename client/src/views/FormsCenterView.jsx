import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Printer, Clipboard, Check, RotateCcw, ChevronRight 
} from 'lucide-react';
import { FORMS_CATEGORIES, FORMS_DIRECTORY } from '../data/forms-data.js';
import { renderTemplate } from '../utils/templateRenderer.js';

function FormsCenterView({ reduceMotion }) {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [selectedLetter, setSelectedLetter] = useState(null);
  
  // Custom Letter Form Fields
  const [userName, setUserName] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [programName, setProgramName] = useState('');
  const [serviceConnectedConditions, setServiceConnectedConditions] = useState('');
  const [workLimitations, setWorkLimitations] = useState('');
  const [workHistoryProblems, setWorkHistoryProblems] = useState('');
  
  const [copySuccess, setCopySuccess] = useState(false);

  // Filter forms by category
  const activeForms = FORMS_DIRECTORY.filter(f => f.category === selectedCategory);

  const handleSelectLetter = (letter) => {
    setSelectedLetter(letter);
    setCopySuccess(false);
  };

  const compileLetterText = () => {
    if (!selectedLetter) return '';
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

  const resetLetterForm = () => {
    setUserName('');
    setClaimNumber('');
    setProgramName('');
    setServiceConnectedConditions('');
    setWorkLimitations('');
    setWorkHistoryProblems('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'current':
        return <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">Current Version</span>;
      case 'verify':
        return <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">Verify Source</span>;
      case 'internal-use':
        return <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">Strategic Tool</span>;
      default:
        return <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">{status}</span>;
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <FileText size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Forms & Packets Center</h1>
          <p className="text-[11px] text-slate-400">Access official VA forms and generate customized letters across all rehabilitation stages.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* Grid Layout: Sidebar Filter + Forms List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Tabs (3 Columns) */}
        <div className="lg:col-span-3 space-y-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-2">Folders / Stages</span>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0">
            {FORMS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSelectedLetter(null); }}
                className={`py-2 px-3 rounded-lg border text-left text-[11px] font-semibold transition shrink-0 lg:shrink select-none ${
                  selectedCategory === cat.id
                    ? 'bg-slate-850 border-slate-700 text-indigo-400 font-bold'
                    : 'bg-slate-950/20 border-slate-900/60 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Forms Cards / Letter Builders (9 Columns) */}
        <div className="lg:col-span-9 space-y-6">
          {selectedLetter ? (
            /* Custom Letter Builder Panel */
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-205">{selectedLetter.name}</h3>
                  <span className="text-[9px] text-slate-450 block">Authority: <strong>{selectedLetter.authority}</strong></span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedLetter(null)} className="btn btn-sm btn-secondary text-[10px] h-8 px-2.5">
                    &larr; Back to Directory
                  </button>
                  <button onClick={resetLetterForm} className="btn btn-sm btn-secondary flex items-center gap-1.5 h-8">
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
                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Veteran Name</label>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">VA Claim Number</label>
                  <input 
                    type="text" 
                    value={claimNumber} 
                    onChange={(e) => setClaimNumber(e.target.value)} 
                    placeholder="e.g. XXX-XX-1234"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Target Program / Goal / Item</label>
                  <input 
                    type="text" 
                    value={programName} 
                    onChange={(e) => setProgramName(e.target.value)} 
                    placeholder="e.g. BS in Computer Science"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Rated Service-Connected Conditions</label>
                  <input 
                    type="text" 
                    value={serviceConnectedConditions} 
                    onChange={(e) => setServiceConnectedConditions(e.target.value)} 
                    placeholder="e.g. PTSD, Degenerative disc disease"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Physical / Cognitive Limitations</label>
                  <input 
                    type="text" 
                    value={workLimitations} 
                    onChange={(e) => setWorkLimitations(e.target.value)} 
                    placeholder="e.g. Cannot sit/stand for more than 30 mins"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Dates / Specific Contact Attempts / History</label>
                  <input 
                    type="text" 
                    value={workHistoryProblems} 
                    onChange={(e) => setWorkHistoryProblems(e.target.value)} 
                    placeholder="e.g. Emailed on April 5th and 12th"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-202 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rendered Text Preview */}
              <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-5 overflow-y-auto max-h-[300px]">
                <pre className="text-[11px] text-slate-350 font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {compileLetterText()}
                </pre>
              </div>
            </motion.div>
          ) : (
            /* Directory display */
            <div className="grid grid-cols-1 gap-4">
              {activeForms.length > 0 ? (
                activeForms.map((form) => (
                  <div 
                    key={form.id}
                    className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 hover:border-slate-750 transition space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4 border-b border-slate-900 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-indigo-400">{form.number}</span>
                          {getStatusBadge(form.status)}
                          <span className="text-[9px] bg-slate-950/60 border border-slate-850 px-2 py-0.5 rounded text-slate-400">
                            {form.type === 'official' ? 'Official PDF' : 'Custom Template'}
                          </span>
                        </div>
                        <h2 className="text-xs font-bold text-slate-200 mt-1 leading-snug">{form.name}</h2>
                      </div>
                      
                      {form.revDate && (
                        <span className="text-[9px] font-mono text-slate-500 shrink-0">
                          Rev: {form.revDate}
                        </span>
                      )}
                    </div>

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-400">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-500 uppercase">Who uses it</span>
                        <span className="text-slate-300 mt-0.5 block">{form.whoUses || 'Claimant / Veteran'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-500 uppercase">When to use</span>
                        <span className="text-slate-300 mt-0.5 block">{form.whenToUse}</span>
                      </div>
                      {form.whenNotToUse && (
                        <div>
                          <span className="block text-[8px] font-bold text-slate-500 uppercase">When NOT to use</span>
                          <span className="text-slate-300 mt-0.5 block">{form.whenNotToUse}</span>
                        </div>
                      )}
                      {form.whatToAttach && (
                        <div>
                          <span className="block text-[8px] font-bold text-slate-500 uppercase">What to attach / Enclosures</span>
                          <span className="text-slate-300 mt-0.5 block">{form.whatToAttach}</span>
                        </div>
                      )}
                    </div>

                    {/* Form Action */}
                    <div className="pt-3 border-t border-slate-900/60 flex justify-end">
                      {form.type === 'official' ? (
                        <a 
                          href={form.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary inline-flex items-center gap-1.5 py-1.5 px-3 text-[11px]"
                        >
                          <Download size={14} />
                          <span>Download from VA.gov</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => handleSelectLetter(form)}
                          className="btn btn-sm btn-primary inline-flex items-center gap-1.5 py-1.5 px-3 text-[11px]"
                        >
                          <span>Generate Custom Letter</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-850 rounded-xl text-xs text-slate-500 font-semibold">
                  No forms preloaded in this category folder yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default FormsCenterView;

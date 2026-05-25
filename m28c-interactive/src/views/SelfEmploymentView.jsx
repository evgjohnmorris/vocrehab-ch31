import { useState } from 'react';
import { Briefcase, ShieldCheck, FileText, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateSelfEmploymentLetter } from '../utils/letterGenerators';

function SelfEmploymentView({ reduceMotion }) {
  // Localized Self-Employment Track states
  const [selfBizName, setSelfBizName] = useState('Valiant Tech Solutions');
  const [selfBizType, setSelfBizType] = useState('LLC');
  const [selfBizIndustry, setSelfBizIndustry] = useState('IT Consulting & Cyber Security');
  const [selfBizConcept, setSelfBizConcept] = useState(
    'Provide specialized cybersecurity audits and network setup services for local small businesses and government sub-contractors.'
  );
  const [selfFundingCategory, setSelfFundingCategory] = useState('Category I');
  
  const [selfChecklist1, setSelfChecklist1] = useState(false);
  const [selfChecklist2, setSelfChecklist2] = useState(false);
  const [selfChecklist3, setSelfChecklist3] = useState(false);
  const [selfChecklist4, setSelfChecklist4] = useState(false);

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const selfGeneratedLetter = generateSelfEmploymentLetter({
    dateStr,
    selfChecklist1,
    selfChecklist2,
    selfChecklist3,
    selfChecklist4,
    selfBizName,
    selfBizType,
    selfBizIndustry,
    selfBizConcept,
    selfFundingCategory
  });

  return (
    <motion.div 
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? {} : { opacity: 0, y: -15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="doc-card"
    >
      <span className="doc-tag font-bold text-cyan-400 uppercase tracking-wider">Self-Employment Track (38 CFR § 21.258)</span>
      <h1 className="doc-title mt-1.5 mb-1.5 text-2xl font-black text-slate-100">Self-Employment Venture & Startup Strategist</h1>
      <p className="doc-subtitle text-xs text-slate-400">Configure your business plan, evaluate regulatory startup categories, and generate a formal request letter.</p>
      <div className="doc-divider mb-6 mt-4"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form & SBDC Milestones */}
        <div className="lg:col-span-7 space-y-6">
          {/* Venture Profile */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-cyan-400 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2 relative z-10">
              <Briefcase size={16} />
              Startup Venture Profile Builder
            </h4>
            
            <div className="space-y-4 relative z-10">
              <div className="form-group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Proposed Business Name</label>
                <input
                  type="text"
                  className="form-control w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 text-xs focus:border-cyan-500 transition-all"
                  value={selfBizName}
                  onChange={(e) => setSelfBizName(e.target.value)}
                  placeholder="e.g. Valiant Tech Solutions"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Legal Entity Structure</label>
                  <select
                    className="form-control w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 text-xs focus:border-cyan-500 transition-all"
                    value={selfBizType}
                    onChange={(e) => setSelfBizType(e.target.value)}
                  >
                    <option value="LLC">Limited Liability Company (LLC)</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="S-Corporation">S-Corporation</option>
                    <option value="C-Corporation">C-Corporation</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Requested Assistance Category</label>
                  <select
                    className="form-control w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 text-xs focus:border-cyan-500 transition-all"
                    value={selfFundingCategory}
                    onChange={(e) => setSelfFundingCategory(e.target.value)}
                  >
                    <option value="Category I">Category I (Serious Employment Handicap)</option>
                    <option value="Category II">Category II (Employment Handicap)</option>
                    <option value="Category III">Category III (Reemployment)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Target Industry Sector</label>
                <input
                  type="text"
                  className="form-control w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 text-xs focus:border-cyan-500 transition-all"
                  value={selfBizIndustry}
                  onChange={(e) => setSelfBizIndustry(e.target.value)}
                  placeholder="e.g. Cybersecurity & IT Consulting"
                />
              </div>

              <div className="form-group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Business Concept Statement</label>
                <textarea
                  className="form-control w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 text-xs focus:border-cyan-500 transition-all h-24 resize-none"
                  value={selfBizConcept}
                  onChange={(e) => setSelfBizConcept(e.target.value)}
                  placeholder="Describe what services/products your venture provides..."
                />
              </div>
            </div>
          </div>

          {/* SBDC Readiness Checklist */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-cyan-400 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2 relative z-10">
              <ShieldCheck size={16} />
              SBDC / SCORE Feasibility Checklist
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed relative z-10">
              The VA requires documented proof of venture feasibility before authorizing funds under 38 CFR § 21.258. Complete these milestones with a certified advisor:
            </p>
            
            <div className="space-y-3 relative z-10">
              {[
                { label: "Completed business feasibility review with certified SBDC/SCORE advisor", checked: selfChecklist1, set: selfChecklist1 ? () => setSelfChecklist1(false) : () => setSelfChecklist1(true) },
                { label: "Completed and drafted formal Business Plan document", checked: selfChecklist2, set: selfChecklist2 ? () => setSelfChecklist2(false) : () => setSelfChecklist2(true) },
                { label: "Submitted Business Plan to VRC for Regional Office panel review", checked: selfChecklist3, set: selfChecklist3 ? () => setSelfChecklist3(false) : () => setSelfChecklist3(true) },
                { label: "SCORE/SBA mentor assigned for ongoing post-launch support", checked: selfChecklist4, set: selfChecklist4 ? () => setSelfChecklist4(false) : () => setSelfChecklist4(true) }
              ].map((item, index) => (
                <label key={index} className="flex items-start gap-3 p-3 bg-slate-950/40 border border-slate-800 rounded-xl cursor-pointer select-none hover:border-slate-700 transition-all">
                  <input
                    type="checkbox"
                    className="accent-cyan-500 mt-0.5"
                    checked={item.checked}
                    onChange={item.set}
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output Letter & Regulatory Rules */}
        <div className="lg:col-span-5 space-y-6">
          {/* Letter Output */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2 relative z-10">
              <FileText size={16} className="text-cyan-500" />
              Request Letter under 38 CFR § 21.258
            </h4>
            <div className="space-y-3 relative z-10">
              <textarea
                readOnly
                value={selfGeneratedLetter}
                className="w-full h-80 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono resize-none leading-relaxed"
              />
              <button
                type="button"
                className="btn btn-primary w-full text-xs font-semibold py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-none"
                onClick={() => {
                  navigator.clipboard.writeText(selfGeneratedLetter);
                  alert("Formal self-employment request letter copied to clipboard!");
                }}
              >
                Copy Letter to Clipboard
              </button>
            </div>
          </div>

          {/* Regulatory Rules Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2 relative z-10">
              <Info size={16} className="text-cyan-500" />
              Funding & Supply Categories
            </h4>
            <div className="space-y-3 text-[11px] text-slate-400 leading-relaxed relative z-10">
              <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                <strong className="text-slate-200 block mb-1">Category I (SEH)</strong>
                Full scope of services including business license fees, specialized workspace setup, tools, equipment, and up to a 60-day inventory of startup supplies.
              </div>
              <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                <strong className="text-slate-200 block mb-1">Category II (Employment Handicap)</strong>
                Limited to basic startup supplies and standard licensing required to begin working. Does not fund heavy capital equipment or extensive supply inventory.
              </div>
              <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                <strong className="text-slate-200 block mb-1">Category III (Reemployment)</strong>
                Only specialized ergonomic equipment, vehicle adjustments, or adaptive workplace accommodations to help the veteran maintain pre-existing self-employment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SelfEmploymentView;

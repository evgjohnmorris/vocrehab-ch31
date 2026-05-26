import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Scale } from 'lucide-react';
import caseStatuses from '../data/workflows/caseStatuses.json';

function CaseStatusGuideView({ reduceMotion }) {
  const [selectedStatus, setSelectedStatus] = useState(caseStatuses[0]);

  const handleSelectStatus = (status) => {
    setSelectedStatus(status);
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <Scale size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Official VR&E Case Status Guide</h1>
          <p className="text-[11px] text-slate-400">Master the 10 administrative stages of your Chapter 31 case, understand the rules, and guard against closures.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Status List */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Case Status Levels</span>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {caseStatuses.map((status) => (
              <button
                key={status.id}
                onClick={() => handleSelectStatus(status)}
                className={`w-full text-left p-3 rounded-lg border transition select-none flex items-center justify-between text-xs ${
                  selectedStatus.id === status.id
                    ? 'bg-indigo-500/5 border-indigo-800/80 text-slate-100'
                    : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80 text-slate-350'
                }`}
              >
                <div className="font-semibold">{status.name}</div>
                <span className="text-[9px] font-mono text-indigo-400 border border-indigo-900/30 px-1.5 py-0.5 rounded bg-indigo-950/20">
                  {status.regulation.split('§')[1] ? '§' + status.regulation.split('§')[1].trim() : status.regulation}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Status Details */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800/60 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200">{selectedStatus.name}</h2>
                <span className="text-[10px] text-slate-400 block mt-0.5">Governing Regulation: <strong>{selectedStatus.regulation}</strong></span>
              </div>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800 rounded font-mono text-indigo-400">
                Active Status
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedStatus.description}</p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Administrative Details</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedStatus.details}</p>
              </div>

              {/* Risks Warning Panel */}
              <div className="p-4 bg-red-950/5 border border-red-900/20 rounded-lg space-y-1">
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block flex items-center gap-1">
                  <ShieldAlert size={12} />
                  Case Closure & Interruption Risks
                </span>
                <p className="text-xs text-slate-350 leading-relaxed">{selectedStatus.risks}</p>
              </div>

              {/* Advocacy Checklist */}
              <div className="p-4 bg-emerald-950/5 border border-emerald-900/20 rounded-lg space-y-1">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                  <CheckCircle size={12} />
                  Strategic Advocacy Guidelines
                </span>
                <p className="text-xs text-slate-350 leading-relaxed">{selectedStatus.advocacy}</p>
              </div>
            </div>
          </div>

          {/* Quick FAQ info */}
          <div className="bg-slate-950/20 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">Common Status Questions</h4>
            <div className="space-y-3">
              <div>
                <strong className="text-[11px] text-slate-300 block">Q: Can my counselor stop my payments without warning?</strong>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  No. Under 38 C.F.R. § 21.197, they must place your case in Interrupted Status and issue a 30-day warning letter outlining corrective actions before discontinuing.
                </p>
              </div>
              <div>
                <strong className="text-[11px] text-slate-300 block">Q: How do I re-enter after my case is discontinued?</strong>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  You can re-apply via VA Form 28-1900. Under 38 C.F.R. § 21.284, you must demonstrate either that your conditions have deteriorated or that the previous closure was administrative.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CaseStatusGuideView;
